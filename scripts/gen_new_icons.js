const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const outDir = path.join(__dirname, '..', 'public', 'stack');

// css3 maps to 'css' slug in simpleicons
const icons = [
  { id: 'python', name: 'python' },
  { id: 'html5', name: 'html5' },
  { id: 'css', name: 'css3' },        // css3 slug is 'css'
  { id: 'express', name: 'express' },
  { id: 'mongodb', name: 'mongodb' },
  { id: 'mysql', name: 'mysql' },
];

async function gen() {
  for (const item of icons) {
    const url = `https://cdn.simpleicons.org/${item.id}/f0ece4`;
    const res = await fetch(url);
    if (!res.ok) { console.error('SKIP', item.id, res.status); continue; }
    let svg = await res.text();
    if (!svg || svg.length < 10) { console.error('EMPTY', item.id); continue; }
    if (!svg.includes('width=')) svg = svg.replace('<svg ', '<svg width="512" height="512" ');
    const logo = await sharp(Buffer.from(svg)).resize(340, 340, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).toBuffer();
    const out = path.join(outDir, item.name + '.png');
    await sharp({ create: { width: 512, height: 512, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
      .composite([{ input: logo, gravity: 'centre' }]).png().toFile(out);
    console.log('OK', item.name);
  }
}
gen().catch(e => { console.error(e); process.exit(1); });
