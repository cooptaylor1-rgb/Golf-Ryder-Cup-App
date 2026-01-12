/**
 * Script to generate PWA icons from SVG
 * Run with: node scripts/generate-icons.js
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const ICONS_DIR = path.join(__dirname, '../public/icons');

// SVG source for golf ball icon
const svgIcon = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <!-- Background -->
  <rect width="512" height="512" rx="64" fill="#036635"/>

  <!-- Golf ball -->
  <circle cx="256" cy="200" r="90" fill="white"/>
  <circle cx="230" cy="175" r="4" fill="#e5e7eb"/>
  <circle cx="250" cy="180" r="4" fill="#e5e7eb"/>
  <circle cx="270" cy="175" r="4" fill="#e5e7eb"/>
  <circle cx="240" cy="195" r="4" fill="#e5e7eb"/>
  <circle cx="260" cy="200" r="4" fill="#e5e7eb"/>
  <circle cx="280" cy="195" r="4" fill="#e5e7eb"/>
  <circle cx="245" cy="215" r="4" fill="#e5e7eb"/>
  <circle cx="265" cy="220" r="4" fill="#e5e7eb"/>

  <!-- Green hill -->
  <ellipse cx="256" cy="380" rx="180" ry="80" fill="#4ade80"/>

  <!-- Flag -->
  <line x1="256" y1="320" x2="256" y2="420" stroke="#1e293b" stroke-width="6"/>
  <path d="M260 320 L320 340 L260 360 Z" fill="#dc2626"/>

  <!-- Cup text -->
  <text x="256" y="470" font-family="Arial, sans-serif" font-size="40" font-weight="bold" fill="white" text-anchor="middle">RYDER CUP</text>
</svg>
`;

const sizes = [16, 32, 180, 192, 512];

async function generateIcons() {
    // Ensure directory exists
    if (!fs.existsSync(ICONS_DIR)) {
        fs.mkdirSync(ICONS_DIR, { recursive: true });
    }

    console.log('Generating PWA icons...');

    for (const size of sizes) {
        const outputPath = path.join(ICONS_DIR, `icon-${size}.png`);

        await sharp(Buffer.from(svgIcon))
            .resize(size, size)
            .png()
            .toFile(outputPath);

        console.log(`  ✓ Generated icon-${size}.png`);
    }

    console.log('Done!');
}

generateIcons().catch(console.error);
