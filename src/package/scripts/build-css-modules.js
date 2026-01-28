const fs = require('fs');
const path = require('path');
const { transform } = require('lightningcss');

const srcDir = path.join(__dirname, '../css');
const distDir = path.join(__dirname, '../dist/styles');

// Device family mappings
const deviceFamilies = {
  iphones: ['iphone8', 'iphone8plus', 'iphone-x', 'iphone17'],
  android: ['pixel10', 'galaxy-s25'],
  tablets: ['ipad', 'ipad-pro'],
  laptops: ['macbook', 'macbook-pro'],
};

// Create a regex to match device blocks
function createDeviceRegex(deviceClass) {
  // Match &.devicename{ ... } including nested content
  return new RegExp(`\\s*&\\.${deviceClass}\\s*\\{`, 'g');
}

// Extract a balanced block starting from a position after an opening brace
function extractBlock(css, startPos) {
  let depth = 1;
  let pos = startPos;

  while (pos < css.length && depth > 0) {
    if (css[pos] === '{') depth++;
    else if (css[pos] === '}') depth--;
    pos++;
  }

  return pos;
}

// Parse CSS and extract device blocks
function parseDeviceBlocks(css) {
  const blocks = {};
  const deviceClasses = Object.values(deviceFamilies).flat();

  for (const deviceClass of deviceClasses) {
    const regex = new RegExp(`(\\s*&\\.${deviceClass}\\s*\\{)`, 'g');
    let match;

    while ((match = regex.exec(css)) !== null) {
      const blockStart = match.index;
      const contentStart = match.index + match[0].length;
      const blockEnd = extractBlock(css, contentStart);

      if (!blocks[deviceClass]) {
        blocks[deviceClass] = [];
      }

      blocks[deviceClass].push({
        start: blockStart,
        end: blockEnd,
        content: css.slice(blockStart, blockEnd),
      });
    }
  }

  return blocks;
}

// Extract base styles (everything before first device block and common elements)
function extractBaseStyles(css, blocks) {
  // Find the position of the first device block
  let firstBlockStart = css.length;
  for (const deviceBlocks of Object.values(blocks)) {
    for (const block of deviceBlocks) {
      if (block.start < firstBlockStart) {
        firstBlockStart = block.start;
      }
    }
  }

  // Get base styles
  return css.slice(0, firstBlockStart);
}

// Generate a family CSS file
function generateFamilyCSS(baseStyles, blocks, familyDevices) {
  let familyContent = baseStyles;

  for (const deviceClass of familyDevices) {
    if (blocks[deviceClass]) {
      for (const block of blocks[deviceClass]) {
        familyContent += block.content;
      }
    }
  }

  // Close the .mockframe block
  familyContent += '\n}\n';

  return familyContent;
}

// Process and write CSS file
function processAndWriteCSS(name, css) {
  // Process expanded version
  const expanded = transform({
    filename: `${name}.css`,
    code: Buffer.from(css),
    minify: false,
    targets: {
      chrome: 95 << 16,
      firefox: 95 << 16,
      safari: 15 << 16,
    },
    drafts: {
      customMedia: true,
    },
  });

  fs.writeFileSync(path.join(distDir, `${name}.css`), expanded.code);
  console.log(`Built: ${name}.css`);

  // Process minified version
  const minified = transform({
    filename: `${name}.css`,
    code: Buffer.from(css),
    minify: true,
    targets: {
      chrome: 95 << 16,
      firefox: 95 << 16,
      safari: 15 << 16,
    },
    drafts: {
      customMedia: true,
    },
  });

  fs.writeFileSync(path.join(distDir, `${name}.min.css`), minified.code);
  console.log(`Built: ${name}.min.css`);
}

// Main build function
function buildModularCSS() {
  // Ensure dist directory exists
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  // Read main CSS file
  const mainCSS = fs.readFileSync(path.join(srcDir, 'mockframe.css'), 'utf8');

  // Parse device blocks
  const blocks = parseDeviceBlocks(mainCSS);

  // Extract base styles
  const baseStyles = extractBaseStyles(mainCSS, blocks);

  // Generate family-specific CSS files
  for (const [familyName, familyDevices] of Object.entries(deviceFamilies)) {
    const familyCSS = generateFamilyCSS(baseStyles, blocks, familyDevices);
    processAndWriteCSS(`mockframe-${familyName}`, familyCSS);
  }

  console.log('\nModular CSS build complete!');
  console.log('Available bundles:');
  console.log('  - mockframe-iphones.css (iPhone 8, 8 Plus, X, 17)');
  console.log('  - mockframe-android.css (Pixel 10, Galaxy S25)');
  console.log('  - mockframe-tablets.css (iPad Mini, iPad Pro)');
  console.log('  - mockframe-laptops.css (MacBook Pro 2020, MacBook Pro)');
}

buildModularCSS();
