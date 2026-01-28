const fs = require('fs');
const path = require('path');

// Copy root README.md to package directory
// The README is now manually maintained at the root level

const rootReadmePath = path.join(__dirname, '../../../README.md');
const packageReadmePath = path.join(__dirname, '../README.md');

if (fs.existsSync(rootReadmePath)) {
  fs.copyFileSync(rootReadmePath, packageReadmePath);
  console.log('Copied root README.md to package directory');
} else {
  console.log('No root README.md found, skipping copy');
}

console.log('README generation complete!');
