const sharp = require('sharp');
const path = require('path');

const ASSETS_DIR = path.join(__dirname, '..', 'assets');

// Colors
const BG = '#0A0A0A';
const CYAN = '#00E5FF';
const CYAN_DIM = 'rgba(0, 229, 255, 0.3)';
const WHITE = '#FFFFFF';

/**
 * Generate the main 1024x1024 app icon.
 * Design: Dark background, minimalist front-facing face outline in cyan
 * with facial analysis grid lines / measurement markers.
 */
function createIconSVG(size) {
  const s = size;
  const cx = s / 2;
  const cy = s / 2;

  // Scale factor relative to 1024
  const f = s / 1024;

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
  <!-- Background -->
  <rect width="${s}" height="${s}" fill="${BG}" rx="${Math.round(s * 0.18)}"/>

  <!-- Subtle grid lines (analysis effect) -->
  <g stroke="${CYAN_DIM}" stroke-width="${f * 1}" opacity="0.4">
    <line x1="${cx}" y1="${s * 0.15}" x2="${cx}" y2="${s * 0.85}"/>
    <line x1="${s * 0.2}" y1="${cy - s * 0.05}" x2="${s * 0.8}" y2="${cy - s * 0.05}"/>
    <line x1="${s * 0.25}" y1="${cy + s * 0.12}" x2="${s * 0.75}" y2="${cy + s * 0.12}"/>
  </g>

  <!-- Face oval outline -->
  <ellipse cx="${cx}" cy="${cy - s * 0.02}" rx="${s * 0.26}" ry="${s * 0.33}"
    fill="none" stroke="${CYAN}" stroke-width="${f * 6}" opacity="0.9"/>

  <!-- Jawline (sharper V-shape overlaid on lower oval) -->
  <path d="M ${cx - s * 0.22} ${cy + s * 0.05}
           Q ${cx - s * 0.18} ${cy + s * 0.25} ${cx} ${cy + s * 0.32}
           Q ${cx + s * 0.18} ${cy + s * 0.25} ${cx + s * 0.22} ${cy + s * 0.05}"
    fill="none" stroke="${CYAN}" stroke-width="${f * 5}" stroke-linecap="round"/>

  <!-- Left eye -->
  <ellipse cx="${cx - s * 0.1}" cy="${cy - s * 0.08}" rx="${s * 0.065}" ry="${s * 0.028}"
    fill="none" stroke="${CYAN}" stroke-width="${f * 4}"/>

  <!-- Right eye -->
  <ellipse cx="${cx + s * 0.1}" cy="${cy - s * 0.08}" rx="${s * 0.065}" ry="${s * 0.028}"
    fill="none" stroke="${CYAN}" stroke-width="${f * 4}"/>

  <!-- Nose bridge line -->
  <line x1="${cx}" y1="${cy - s * 0.04}" x2="${cx}" y2="${cy + s * 0.06}"
    stroke="${CYAN}" stroke-width="${f * 3}" stroke-linecap="round" opacity="0.7"/>

  <!-- Nose bottom -->
  <path d="M ${cx - s * 0.03} ${cy + s * 0.06} Q ${cx} ${cy + s * 0.08} ${cx + s * 0.03} ${cy + s * 0.06}"
    fill="none" stroke="${CYAN}" stroke-width="${f * 3}" stroke-linecap="round" opacity="0.7"/>

  <!-- Lips -->
  <path d="M ${cx - s * 0.07} ${cy + s * 0.13}
           Q ${cx - s * 0.02} ${cy + s * 0.11} ${cx} ${cy + s * 0.12}
           Q ${cx + s * 0.02} ${cy + s * 0.11} ${cx + s * 0.07} ${cy + s * 0.13}"
    fill="none" stroke="${CYAN}" stroke-width="${f * 3}" stroke-linecap="round"/>
  <path d="M ${cx - s * 0.07} ${cy + s * 0.13}
           Q ${cx} ${cy + s * 0.17} ${cx + s * 0.07} ${cy + s * 0.13}"
    fill="none" stroke="${CYAN}" stroke-width="${f * 3}" stroke-linecap="round"/>

  <!-- Measurement markers (small crosshairs at key points) -->
  <g stroke="${CYAN}" stroke-width="${f * 2}" opacity="0.5">
    <!-- Left eye marker -->
    <line x1="${cx - s * 0.1 - s * 0.015}" y1="${cy - s * 0.08}" x2="${cx - s * 0.1 + s * 0.015}" y2="${cy - s * 0.08}"/>
    <line x1="${cx - s * 0.1}" y1="${cy - s * 0.08 - s * 0.015}" x2="${cx - s * 0.1}" y2="${cy - s * 0.08 + s * 0.015}"/>
    <!-- Right eye marker -->
    <line x1="${cx + s * 0.1 - s * 0.015}" y1="${cy - s * 0.08}" x2="${cx + s * 0.1 + s * 0.015}" y2="${cy - s * 0.08}"/>
    <line x1="${cx + s * 0.1}" y1="${cy - s * 0.08 - s * 0.015}" x2="${cx + s * 0.1}" y2="${cy - s * 0.08 + s * 0.015}"/>
    <!-- Chin marker -->
    <line x1="${cx - s * 0.015}" y1="${cy + s * 0.32}" x2="${cx + s * 0.015}" y2="${cy + s * 0.32}"/>
    <line x1="${cx}" y1="${cy + s * 0.32 - s * 0.015}" x2="${cx}" y2="${cy + s * 0.32 + s * 0.015}"/>
    <!-- Cheek markers -->
    <line x1="${cx - s * 0.24}" y1="${cy}" x2="${cx - s * 0.21}" y2="${cy}"/>
    <line x1="${cx + s * 0.24}" y1="${cy}" x2="${cx + s * 0.21}" y2="${cy}"/>
  </g>

  <!-- Corner brackets (scan/analysis UI effect) -->
  <g stroke="${CYAN}" stroke-width="${f * 4}" fill="none" stroke-linecap="round" opacity="0.6">
    <!-- Top-left -->
    <path d="M ${s * 0.12} ${s * 0.18} L ${s * 0.12} ${s * 0.12} L ${s * 0.18} ${s * 0.12}"/>
    <!-- Top-right -->
    <path d="M ${s * 0.82} ${s * 0.12} L ${s * 0.88} ${s * 0.12} L ${s * 0.88} ${s * 0.18}"/>
    <!-- Bottom-left -->
    <path d="M ${s * 0.12} ${s * 0.82} L ${s * 0.12} ${s * 0.88} L ${s * 0.18} ${s * 0.88}"/>
    <!-- Bottom-right -->
    <path d="M ${s * 0.82} ${s * 0.88} L ${s * 0.88} ${s * 0.88} L ${s * 0.88} ${s * 0.82}"/>
  </g>
</svg>`;
}

/**
 * Create the Android adaptive icon foreground (with padding).
 * Android adaptive icons use a 108dp canvas with 72dp visible area (centered).
 * The outer 18dp on each side may be masked, so keep content in the center 66%.
 */
function createForegroundSVG(size) {
  const s = size;
  // Content area: center 66% of the canvas
  const contentSize = s * 0.66;
  const offset = (s - contentSize) / 2;
  const cx = s / 2;
  const cy = s / 2;
  const f = contentSize / 1024;

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
  <!-- Transparent background (the adaptive icon system provides the background) -->

  <!-- Face oval outline -->
  <ellipse cx="${cx}" cy="${cy - contentSize * 0.02}" rx="${contentSize * 0.26}" ry="${contentSize * 0.33}"
    fill="none" stroke="${CYAN}" stroke-width="${f * 7}" opacity="0.9"/>

  <!-- Jawline -->
  <path d="M ${cx - contentSize * 0.22} ${cy + contentSize * 0.05}
           Q ${cx - contentSize * 0.18} ${cy + contentSize * 0.25} ${cx} ${cy + contentSize * 0.32}
           Q ${cx + contentSize * 0.18} ${cy + contentSize * 0.25} ${cx + contentSize * 0.22} ${cy + contentSize * 0.05}"
    fill="none" stroke="${CYAN}" stroke-width="${f * 6}" stroke-linecap="round"/>

  <!-- Eyes -->
  <ellipse cx="${cx - contentSize * 0.1}" cy="${cy - contentSize * 0.08}" rx="${contentSize * 0.065}" ry="${contentSize * 0.028}"
    fill="none" stroke="${CYAN}" stroke-width="${f * 5}"/>
  <ellipse cx="${cx + contentSize * 0.1}" cy="${cy - contentSize * 0.08}" rx="${contentSize * 0.065}" ry="${contentSize * 0.028}"
    fill="none" stroke="${CYAN}" stroke-width="${f * 5}"/>

  <!-- Nose -->
  <line x1="${cx}" y1="${cy - contentSize * 0.04}" x2="${cx}" y2="${cy + contentSize * 0.06}"
    stroke="${CYAN}" stroke-width="${f * 4}" stroke-linecap="round" opacity="0.7"/>
  <path d="M ${cx - contentSize * 0.03} ${cy + contentSize * 0.06} Q ${cx} ${cy + contentSize * 0.08} ${cx + contentSize * 0.03} ${cy + contentSize * 0.06}"
    fill="none" stroke="${CYAN}" stroke-width="${f * 4}" stroke-linecap="round" opacity="0.7"/>

  <!-- Lips -->
  <path d="M ${cx - contentSize * 0.07} ${cy + contentSize * 0.13}
           Q ${cx - contentSize * 0.02} ${cy + contentSize * 0.11} ${cx} ${cy + contentSize * 0.12}
           Q ${cx + contentSize * 0.02} ${cy + contentSize * 0.11} ${cx + contentSize * 0.07} ${cy + contentSize * 0.13}"
    fill="none" stroke="${CYAN}" stroke-width="${f * 4}" stroke-linecap="round"/>
  <path d="M ${cx - contentSize * 0.07} ${cy + contentSize * 0.13}
           Q ${cx} ${cy + contentSize * 0.17} ${cx + contentSize * 0.07} ${cy + contentSize * 0.13}"
    fill="none" stroke="${CYAN}" stroke-width="${f * 4}" stroke-linecap="round"/>

  <!-- Corner brackets -->
  <g stroke="${CYAN}" stroke-width="${f * 5}" fill="none" stroke-linecap="round" opacity="0.6">
    <path d="M ${offset + contentSize * 0.05} ${offset + contentSize * 0.12} L ${offset + contentSize * 0.05} ${offset + contentSize * 0.05} L ${offset + contentSize * 0.12} ${offset + contentSize * 0.05}"/>
    <path d="M ${offset + contentSize * 0.88} ${offset + contentSize * 0.05} L ${offset + contentSize * 0.95} ${offset + contentSize * 0.05} L ${offset + contentSize * 0.95} ${offset + contentSize * 0.12}"/>
    <path d="M ${offset + contentSize * 0.05} ${offset + contentSize * 0.88} L ${offset + contentSize * 0.05} ${offset + contentSize * 0.95} L ${offset + contentSize * 0.12} ${offset + contentSize * 0.95}"/>
    <path d="M ${offset + contentSize * 0.88} ${offset + contentSize * 0.95} L ${offset + contentSize * 0.95} ${offset + contentSize * 0.95} L ${offset + contentSize * 0.95} ${offset + contentSize * 0.88}"/>
  </g>
</svg>`;
}

/**
 * Monochrome variant for Android (single color, white on transparent).
 */
function createMonochromeSVG(size) {
  const svg = createForegroundSVG(size);
  // Replace cyan with white for monochrome
  return svg.replace(new RegExp(CYAN, 'g'), '#FFFFFF')
            .replace(/opacity="0\.\d+"/g, 'opacity="1"');
}

/**
 * Splash screen icon (just the face, smaller, for centering on splash).
 */
function createSplashIconSVG(size) {
  return createIconSVG(size);
}

/**
 * Full splash screen with icon + text.
 */
function createSplashSVG(width, height) {
  const iconSize = Math.min(width, height) * 0.3;
  const iconX = (width - iconSize) / 2;
  const iconY = height * 0.28;
  const cx = width / 2;

  // Inline the face design at the icon position
  const icx = iconX + iconSize / 2;
  const icy = iconY + iconSize / 2;
  const f = iconSize / 1024;

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="${width}" height="${height}" fill="${BG}"/>

  <!-- Face icon (centered) -->
  <g>
    <ellipse cx="${icx}" cy="${icy - iconSize * 0.02}" rx="${iconSize * 0.26}" ry="${iconSize * 0.33}"
      fill="none" stroke="${CYAN}" stroke-width="${f * 6}" opacity="0.9"/>
    <path d="M ${icx - iconSize * 0.22} ${icy + iconSize * 0.05}
             Q ${icx - iconSize * 0.18} ${icy + iconSize * 0.25} ${icx} ${icy + iconSize * 0.32}
             Q ${icx + iconSize * 0.18} ${icy + iconSize * 0.25} ${icx + iconSize * 0.22} ${icy + iconSize * 0.05}"
      fill="none" stroke="${CYAN}" stroke-width="${f * 5}" stroke-linecap="round"/>
    <ellipse cx="${icx - iconSize * 0.1}" cy="${icy - iconSize * 0.08}" rx="${iconSize * 0.065}" ry="${iconSize * 0.028}"
      fill="none" stroke="${CYAN}" stroke-width="${f * 4}"/>
    <ellipse cx="${icx + iconSize * 0.1}" cy="${icy - iconSize * 0.08}" rx="${iconSize * 0.065}" ry="${iconSize * 0.028}"
      fill="none" stroke="${CYAN}" stroke-width="${f * 4}"/>
    <line x1="${icx}" y1="${icy - iconSize * 0.04}" x2="${icx}" y2="${icy + iconSize * 0.06}"
      stroke="${CYAN}" stroke-width="${f * 3}" stroke-linecap="round" opacity="0.7"/>
    <path d="M ${icx - iconSize * 0.03} ${icy + iconSize * 0.06} Q ${icx} ${icy + iconSize * 0.08} ${icx + iconSize * 0.03} ${icy + iconSize * 0.06}"
      fill="none" stroke="${CYAN}" stroke-width="${f * 3}" stroke-linecap="round" opacity="0.7"/>
    <path d="M ${icx - iconSize * 0.07} ${icy + iconSize * 0.13}
             Q ${icx - iconSize * 0.02} ${icy + iconSize * 0.11} ${icx} ${icy + iconSize * 0.12}
             Q ${icx + iconSize * 0.02} ${icy + iconSize * 0.11} ${icx + iconSize * 0.07} ${icy + iconSize * 0.13}"
      fill="none" stroke="${CYAN}" stroke-width="${f * 3}" stroke-linecap="round"/>
    <path d="M ${icx - iconSize * 0.07} ${icy + iconSize * 0.13}
             Q ${icx} ${icy + iconSize * 0.17} ${icx + iconSize * 0.07} ${icy + iconSize * 0.13}"
      fill="none" stroke="${CYAN}" stroke-width="${f * 3}" stroke-linecap="round"/>
    <!-- Corner brackets -->
    <g stroke="${CYAN}" stroke-width="${f * 4}" fill="none" stroke-linecap="round" opacity="0.6">
      <path d="M ${icx - iconSize * 0.35} ${icy - iconSize * 0.33} L ${icx - iconSize * 0.35} ${icy - iconSize * 0.40} L ${icx - iconSize * 0.28} ${icy - iconSize * 0.40}"/>
      <path d="M ${icx + iconSize * 0.28} ${icy - iconSize * 0.40} L ${icx + iconSize * 0.35} ${icy - iconSize * 0.40} L ${icx + iconSize * 0.35} ${icy - iconSize * 0.33}"/>
      <path d="M ${icx - iconSize * 0.35} ${icy + iconSize * 0.33} L ${icx - iconSize * 0.35} ${icy + iconSize * 0.40} L ${icx - iconSize * 0.28} ${icy + iconSize * 0.40}"/>
      <path d="M ${icx + iconSize * 0.28} ${icy + iconSize * 0.40} L ${icx + iconSize * 0.35} ${icy + iconSize * 0.40} L ${icx + iconSize * 0.35} ${icy + iconSize * 0.33}"/>
    </g>
  </g>

  <!-- App name -->
  <text x="${cx}" y="${iconY + iconSize + height * 0.08}" text-anchor="middle"
    font-family="Arial, Helvetica, sans-serif" font-weight="800" font-size="${height * 0.045}"
    fill="${WHITE}" letter-spacing="6">LOCK IN AI</text>

  <!-- Tagline -->
  <text x="${cx}" y="${iconY + iconSize + height * 0.12}" text-anchor="middle"
    font-family="Arial, Helvetica, sans-serif" font-weight="400" font-size="${height * 0.018}"
    fill="${CYAN}" letter-spacing="1">Become the version of you that turns heads</text>
</svg>`;
}

async function generateAll() {
  console.log('Generating app icon (1024x1024)...');
  await sharp(Buffer.from(createIconSVG(1024)))
    .png()
    .toFile(path.join(ASSETS_DIR, 'icon.png'));

  console.log('Generating favicon (48x48)...');
  await sharp(Buffer.from(createIconSVG(48)))
    .png()
    .toFile(path.join(ASSETS_DIR, 'favicon.png'));

  console.log('Generating Android foreground (1024x1024)...');
  await sharp(Buffer.from(createForegroundSVG(1024)))
    .png()
    .toFile(path.join(ASSETS_DIR, 'android-icon-foreground.png'));

  console.log('Generating Android background (1024x1024)...');
  // Solid dark background
  await sharp({
    create: {
      width: 1024,
      height: 1024,
      channels: 4,
      background: { r: 10, g: 10, b: 10, alpha: 1 },
    },
  })
    .png()
    .toFile(path.join(ASSETS_DIR, 'android-icon-background.png'));

  console.log('Generating Android monochrome (1024x1024)...');
  await sharp(Buffer.from(createMonochromeSVG(1024)))
    .png()
    .toFile(path.join(ASSETS_DIR, 'android-icon-monochrome.png'));

  console.log('Generating splash icon (200x200)...');
  await sharp(Buffer.from(createSplashIconSVG(200)))
    .png()
    .toFile(path.join(ASSETS_DIR, 'splash-icon.png'));

  console.log('Generating splash screen (1284x2778)...');
  await sharp(Buffer.from(createSplashSVG(1284, 2778)))
    .png()
    .toFile(path.join(ASSETS_DIR, 'splash.png'));

  console.log('All assets generated successfully!');
}

generateAll().catch((err) => {
  console.error('Error generating assets:', err);
  process.exit(1);
});
