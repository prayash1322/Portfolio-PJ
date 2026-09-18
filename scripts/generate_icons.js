const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const outDir = path.join(__dirname, '..', 'public', 'stack');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const icons = [
  { id: 'react', name: 'react' },
  { id: 'nextdotjs', name: 'nextdotjs' },
  { id: 'typescript', name: 'typescript' },
  { id: 'javascript', name: 'javascript' },
  { id: 'nodedotjs', name: 'nodedotjs' },
  { id: 'postgresql', name: 'postgresql' },
  { id: 'redis', name: 'redis' },
  { id: 'docker', name: 'docker' },
  { id: 'github', name: 'github' },
  { id: 'greensock', name: 'greensock' },
  { id: 'tailwindcss', name: 'tailwindcss' },
  { id: 'nestjs', name: 'nestjs' },
];

async function generate() {
  for (const item of icons) {
    const url = `https://cdn.simpleicons.org/${item.id}/f0ece4`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch ${url}: ${res.status}`);
    }
    let svgText = await res.text();
    if (!svgText.includes('width=')) {
      svgText = svgText.replace('<svg ', '<svg width="512" height="512" ');
    }
    const svgBuffer = Buffer.from(svgText);
    const outPath = path.join(outDir, `${item.name}.png`);

    const resizedLogo = await sharp(svgBuffer)
      .resize(340, 340, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toBuffer();

    await sharp({
      create: {
        width: 512,
        height: 512,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    })
    .composite([{ input: resizedLogo, gravity: 'centre' }])
    .png()
    .toFile(outPath);

    console.log(`Generated: ${item.name}.png (${fs.statSync(outPath).size} bytes)`);
  }
}

generate().catch(err => {
  console.error(err);
  process.exit(1);
});
