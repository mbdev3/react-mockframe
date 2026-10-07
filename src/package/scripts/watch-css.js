const { watch } = require('chokidar');
const { execSync } = require('child_process');
const path = require('path');

const srcDir = path.join(__dirname, '../css');

console.log(`Watching ${srcDir} for changes...`);

// chokidar 4 dropped glob support, so watch the directory and filter by extension
const watcher = watch(srcDir, {
  ignoreInitial: false,
});

function build(file) {
  if (!file.endsWith('.css')) return;
  console.log('Rebuilding CSS...');
  try {
    // Both the full stylesheet and the per-family bundles
    execSync('node scripts/build-css.js && node scripts/build-css-modules.js', {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit',
    });
  } catch (error) {
    console.error('Build failed:', error.message);
  }
}

watcher.on('add', build);
watcher.on('change', build);
