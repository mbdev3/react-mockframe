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

// The MIT license (ours and Marvel's) must ship inside the npm tarball
const rootLicensePath = path.join(__dirname, '../../../LICENSE');
const packageLicensePath = path.join(__dirname, '../LICENSE');

if (fs.existsSync(rootLicensePath)) {
  fs.copyFileSync(rootLicensePath, packageLicensePath);
  console.log('Copied root LICENSE to package directory');
} else {
  throw new Error('Root LICENSE not found; refusing to build a package without it');
}

console.log('README generation complete!');
