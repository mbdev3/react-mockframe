const { watch } = require('chokidar');
const { execSync } = require('child_process');
const path = require('path');

const srcDir = path.join(__dirname, '../css');

console.log(`Watching ${srcDir} for changes...`);

const watcher = watch(path.join(srcDir, '**/*.css'), {
  ignoreInitial: false,
});

function build() {
  console.log('Rebuilding CSS...');
  try {
    execSync('node scripts/build-css.js', {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit',
    });
  } catch (error) {
    console.error('Build failed:', error.message);
  }
}

watcher.on('add', build);
watcher.on('change', build);
