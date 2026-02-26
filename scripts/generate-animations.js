const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const animationsDir = path.join(repoRoot, 'animations');
const dataFile = path.join(repoRoot, 'src', 'data', 'animations.ts');
const backupFile = dataFile + '.bak';

function titleFromName(name) {
  // remove extension
  let base = name.replace(/\.html$/i, '');
  // remove leading numbers and separators
  base = base.replace(/^\d+[-_\s]*/, '');
  // replace non alpha with space, split, capitalize
  return base
    .replace(/[\-_]+/g, ' ')
    .split(' ')
    .map(s => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ');
}

function idFromName(name) {
  const base = name.replace(/\.html$/i, '');
  return 'auto-' + base.replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase();
}

function chooseRenderer(name) {
  const n = name.toLowerCase();
  const threejsKeywords = ['3d', 'cube', 'globe', 'tesseract', 'rubiks', 'dna', 'torus', 'kaleidoscope'];
  return threejsKeywords.some(k => n.includes(k)) ? 'threejs' : 'webgl';
}

if (!fs.existsSync(animationsDir)) {
  console.error('Animations folder not found:', animationsDir);
  process.exit(1);
}
if (!fs.existsSync(dataFile)) {
  console.error('Data file not found:', dataFile);
  process.exit(1);
}

const files = fs.readdirSync(animationsDir).filter(f => f.toLowerCase().endsWith('.html'));
let content = fs.readFileSync(dataFile, 'utf8');

// find existing html paths referenced in the data file
const existing = new Set();
const htmlMatches = content.match(/\/animations\/[^'"\s)]+\.html/g) || [];
htmlMatches.forEach(m => existing.add(path.posix.basename(m)));

const toAdd = files.filter(f => !existing.has(f));
if (toAdd.length === 0) {
  console.log('No new animation files to add.');
  process.exit(0);
}

// Build entries
const entries = toAdd.map(f => {
  const id = idFromName(f);
  const title = titleFromName(f);
  const renderer = chooseRenderer(f);
  return `  {
    id: '${id}',
    title: '${title}',
    description: 'Auto-imported from ${f}',
    renderer: '${renderer}',
    previewType: 'iframe',
    previewSrc: '/animations/${f}',
    htmlFile: '/animations/${f}',
    tags: [],
    dependencies: [],
    difficulty: 'beginner',
    performanceScore: 4,
    price: 10,
    features: [],
  },\n`;
}).join('');

// backup
fs.copyFileSync(dataFile, backupFile);

// insert before final closing of array (the last occurrence of "\n];\n" or "];")
const idx = content.lastIndexOf('\n];');
if (idx === -1) {
  console.error('Could not find array closing in', dataFile);
  process.exit(1);
}

const newContent = content.slice(0, idx) + '\n' + entries + content.slice(idx);
fs.writeFileSync(dataFile, newContent, 'utf8');

console.log(`Added ${toAdd.length} animations to ${dataFile}`);
console.log('Files added:', toAdd.join(', '));
console.log('Backup created at', backupFile);
