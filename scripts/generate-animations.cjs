const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const animationsDir = path.join(repoRoot, 'animations');
const dataFile = path.join(repoRoot, 'src', 'data', 'animations.ts');
const backupFile = dataFile + '.bak';

function titleFromName(name) {
  let base = name.replace(/\.html$/i, '');
  base = base.replace(/^\d+[-_\s]*/, '');
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

const existing = new Set();
const htmlMatches = content.match(/\/animations\/[^'"\s)]+\.html/g) || [];
htmlMatches.forEach(m => existing.add(path.posix.basename(m)));

const toAdd = files.filter(f => !existing.has(f));
if (toAdd.length === 0) {
  console.log('No new animation files to add.');
  process.exit(0);
}

const entries = toAdd.map(f => {
  const id = idFromName(f);
  const title = titleFromName(f);
  const renderer = chooseRenderer(f);
  return `  {\n    id: '${id}',\n    title: '${title}',\n    description: 'Auto-imported from ${f}',\n    renderer: '${renderer}',\n    previewType: 'iframe',\n    previewSrc: '/animations/${f}',\n    htmlFile: '/animations/${f}',\n    tags: [],\n    dependencies: [],\n    difficulty: 'beginner',\n    performanceScore: 4,\n    price: 10,\n    features: [],\n  },\\n`;
}).join('');

fs.copyFileSync(dataFile, backupFile);

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
