#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const publicDir = path.join(root, 'public', 'animations-preview');
const dataFile = path.join(root, 'src', 'data', 'animations.ts');

if (!fs.existsSync(publicDir)) {
  console.error('public/animations-preview not found');
  process.exit(1);
}
if (!fs.existsSync(dataFile)) {
  console.error('src/data/animations.ts not found');
  process.exit(1);
}

const files = fs.readdirSync(publicDir).filter(f => /\.(png|jpg|jpeg|webp|gif)$/i.test(f));
const byBase = new Map();
for (const f of files) {
  byBase.set(path.basename(f, path.extname(f)), f);
}

let text = fs.readFileSync(dataFile, 'utf8');
fs.writeFileSync(dataFile + '.bak', text, 'utf8');

const idRegex = /id:\s*'([^']+)'/g;
let match;
let edits = 0;
const seen = new Set();

while ((match = idRegex.exec(text)) !== null) {
  const id = match[1];
  if (seen.has(match.index)) continue;
  // Find opening brace for this object (nearest '{' before index)
  const openIdx = text.lastIndexOf('{', match.index);
  if (openIdx === -1) continue;
  // Find matching closing brace
  let depth = 0;
  let closeIdx = -1;
  for (let i = openIdx; i < text.length; i++) {
    const ch = text[i];
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) {
        closeIdx = i;
        break;
      }
    }
  }
  if (closeIdx === -1) continue;
  const objText = text.slice(openIdx, closeIdx + 1);
  // Skip if previewImageUrl already present
  if (/previewImageUrl\s*:/i.test(objText)) continue;

  // Try candidate basenames
  const slug = id.replace(/^\//, '').replace(/^anim-/, '');
  const candidates = [];
  candidates.push(slug);
  candidates.push(id);
  const m = slug.match(/^0*([0-9]+)-(.*)$/);
  if (m) {
    const num = m[1];
    const rest = m[2];
    candidates.push(`${Number(num)}-${rest}`);
    candidates.push(`${String(Number(num)).padStart(2,'0')}-${rest}`);
    candidates.push(`${String(Number(num)).padStart(3,'0')}-${rest}`);
    candidates.push(rest);
  }

  let found = null;
  for (const c of candidates) {
    if (!c) continue;
    if (byBase.has(c)) {
      found = byBase.get(c);
      break;
    }
  }
  if (!found) {
    for (const [base, fname] of byBase.entries()) {
      if (base.includes(slug) || slug.includes(base)) {
        found = fname; break;
      }
    }
  }
  if (!found) continue;

  const rel = `/animations-preview/${found}`;

  const previewSrcIdx = objText.search(/previewSrc\s*:/);
  let insertPosInObj = -1;
  if (previewSrcIdx !== -1) {
    const after = objText.indexOf('\n', previewSrcIdx);
    insertPosInObj = after !== -1 ? after + 1 : objText.length - 1;
  } else {
    insertPosInObj = objText.length - 1;
  }

  const toInsert = `\n    previewImageUrl: '${rel}',`;
  const newObjText = objText.slice(0, insertPosInObj) + toInsert + objText.slice(insertPosInObj);

  text = text.slice(0, openIdx) + newObjText + text.slice(closeIdx + 1);
  idRegex.lastIndex = openIdx + newObjText.length;
  edits++;
  seen.add(openIdx);
}

if (edits > 0) {
  fs.writeFileSync(dataFile, text, 'utf8');
  console.log(`Inserted previewImageUrl for ${edits} animations.`);
  process.exit(0);
} else {
  console.log('No insertions made (all objects already had previewImageUrl or no matching thumbnails found).');
  process.exit(0);
}
