const fs = require('fs');
const path = require('path');

const dataFile = path.join(__dirname, '..', 'src', 'data', 'animations.ts');
const backup = dataFile + '.bak2';

if (!fs.existsSync(dataFile)) {
  console.error('data file not found', dataFile);
  process.exit(1);
}
const raw = fs.readFileSync(dataFile, 'utf8');
if (!raw.includes('\\n')) {
  console.log('No literal \\\\n sequences found.');
  process.exit(0);
}
fs.copyFileSync(dataFile, backup);
const fixed = raw.split('\\n').join('\n');
fs.writeFileSync(dataFile, fixed, 'utf8');
console.log('Replaced literal \\\\n with real newlines. Backup at', backup);
