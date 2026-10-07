const fs = require('fs');
const path = require('path');
const { transform } = require('lightningcss');

const srcDir = path.join(__dirname, '../css');
const distDir = path.join(__dirname, '../dist/styles');

// Device family mappings (values are the `device` CSS classes from src/DeviceOptions.ts)
const deviceFamilies = {
  iphones: ['iphone8', 'iphone8plus', 'iphone-x', 'iphone17', 'iphone18pro'],
  android: ['pixel10', 'galaxy-s25'],
  tablets: ['ipad', 'ipad-pro'],
  laptops: ['macbook', 'macbook-pro'],
};
const allDevices = Object.values(deviceFamilies).flat();

// Fail loudly when a device is added to DeviceOptions but not to a family:
// otherwise its styles would be missing from every per-family bundle.
const optionsSrc = fs.readFileSync(path.join(__dirname, '../src/DeviceOptions.ts'), 'utf8');
const declared = [...optionsSrc.matchAll(/device:\s*'([^']+)'/g)].map((m) => m[1]);
const orphans = declared.filter((d) => !allDevices.includes(d));
if (orphans.length) {
  throw new Error(`build-css-modules: add these device classes to a family: ${orphans.join(', ')}`);
}

const classPattern = (deviceClass) =>
  new RegExp(`\\.${deviceClass.replace(/[-]/g, '\\-')}(?![\\w-])`);

// Split the body of the root `.mockframe { ... }` rule into its top-level items
// (declarations and nested rules, each with the comments that precede it).
function parseRoot(css) {
  const open = css.indexOf('{', css.indexOf('.mockframe'));
  const items = [];
  let i = open + 1;
  let start = i;
  let depth = 0;

  while (i < css.length) {
    if (css.startsWith('/*', i)) {
      i = css.indexOf('*/', i) + 2;
      continue;
    }
    const ch = css[i];
    if (ch === '{') {
      depth++;
    } else if (ch === '}') {
      if (depth === 0) break; // closing brace of .mockframe
      depth--;
      if (depth === 0) {
        items.push(css.slice(start, i + 1));
        start = i + 1;
      }
    } else if (ch === ';' && depth === 0) {
      items.push(css.slice(start, i + 1));
      start = i + 1;
    }
    i++;
  }

  return {
    prefix: css.slice(0, open + 1),
    items,
    // whitespace/comments before the closing brace, the brace, and anything after it
    suffix: css.slice(start),
  };
}

// Device classes referenced by an item's selector (empty for shared items)
function devicesOf(item) {
  const brace = item.indexOf('{');
  if (brace === -1) return [];
  const selector = item.slice(0, brace).replace(/\/\*[\s\S]*?\*\//g, '');
  return allDevices.filter((d) => classPattern(d).test(selector));
}

function generateFamilyCSS({ prefix, items, suffix }, familyDevices) {
  const kept = items.filter((item) => {
    const devices = devicesOf(item);
    return devices.length === 0 || devices.some((d) => familyDevices.includes(d));
  });
  return prefix + kept.join('') + suffix;
}

// Process and write CSS file
function processAndWriteCSS(name, css) {
  const options = {
    filename: `${name}.css`,
    code: Buffer.from(css),
    targets: {
      chrome: 95 << 16,
      firefox: 95 << 16,
      safari: 15 << 16,
    },
    drafts: {
      customMedia: true,
    },
  };

  const expanded = transform({ ...options, minify: false });
  fs.writeFileSync(path.join(distDir, `${name}.css`), expanded.code);
  console.log(`Built: ${name}.css`);

  const minified = transform({ ...options, minify: true });
  fs.writeFileSync(path.join(distDir, `${name}.min.css`), minified.code);
  console.log(`Built: ${name}.min.css`);
}

function buildModularCSS() {
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  const mainCSS = fs.readFileSync(path.join(srcDir, 'mockframe.css'), 'utf8');
  const root = parseRoot(mainCSS);

  // Every family device must have styles, or its bundle would silently ship without it
  const styled = new Set(root.items.flatMap(devicesOf));
  const unstyled = allDevices.filter((d) => !styled.has(d));
  if (unstyled.length) {
    throw new Error(`build-css-modules: no CSS block found for: ${unstyled.join(', ')}`);
  }

  for (const [familyName, familyDevices] of Object.entries(deviceFamilies)) {
    processAndWriteCSS(`mockframe-${familyName}`, generateFamilyCSS(root, familyDevices));
  }

  console.log('\nModular CSS build complete!');
  console.log('Available bundles:');
  console.log('  - mockframe-iphones.css (iPhone 8, 8 Plus, X, 17, 18 Pro)');
  console.log('  - mockframe-android.css (Pixel 10, Galaxy S25)');
  console.log('  - mockframe-tablets.css (iPad Mini, iPad Pro)');
  console.log('  - mockframe-laptops.css (MacBook Pro 2020, MacBook Pro)');
}

buildModularCSS();
