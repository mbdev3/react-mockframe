const fs = require('fs');
const path = require('path');
const { transform } = require('lightningcss');

const srcDir = path.join(__dirname, '../css');
const distDir = path.join(__dirname, '../dist/styles');

// Ensure dist directory exists
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Get all CSS files
const cssFiles = fs.readdirSync(srcDir).filter(file => file.endsWith('.css'));

for (const file of cssFiles) {
  const inputPath = path.join(srcDir, file);
  const code = fs.readFileSync(inputPath);
  const baseName = path.basename(file, '.css');

  // Process expanded (non-minified) version
  const expanded = transform({
    filename: file,
    code,
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

  fs.writeFileSync(path.join(distDir, `${baseName}.css`), expanded.code);
  console.log(`Built: ${baseName}.css`);

  // Process minified version
  const minified = transform({
    filename: file,
    code,
    minify: true,
    targets: {
      chrome: 95 << 16,
      firefox: 95 << 16,
      safari: 15 << 16,
    },
    drafts: {
      customMedia: true,
    },
    sourceMap: true,
  });

  fs.writeFileSync(path.join(distDir, `${baseName}.min.css`), minified.code);
  if (minified.map) {
    fs.writeFileSync(path.join(distDir, `${baseName}.min.css.map`), minified.map);
  }
  console.log(`Built: ${baseName}.min.css`);
}

console.log('CSS build complete!');
