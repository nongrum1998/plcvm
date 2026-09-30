const fs = require('fs');
const path = require('path');
const readline = require('readline');

const BASE_PATH = path.join(process.cwd(), 'src', 'features');

const FOLDERS = [
  'components',
  'hooks',
  'screens',
  'store',
  'types',
  'utils',
  'utils/constants',
  'validators',
];

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log('📁 Created:', dirPath);
  }
}

function createKeepFile(dirPath) {
  const keepFile = path.join(dirPath, '.keep');
  if (!fs.existsSync(keepFile)) {
    fs.writeFileSync(keepFile, '');
    console.log('📄 .keep added:', keepFile);
  }
}

function createIndexFile(featurePath) {
  const indexFile = path.join(featurePath, 'index.ts');
  if (!fs.existsSync(indexFile)) {
    fs.writeFileSync(indexFile, '// public exports\n');
    console.log('📄 index.ts created:', indexFile);
  }
}

function createFeature(feature) {
  const featurePath = path.join(BASE_PATH, feature);

  if (fs.existsSync(featurePath)) {
    console.log(`⚠️ Feature "${feature}" already exists. Skipping...\n`);
    return;
  }

  ensureDir(featurePath);

  FOLDERS.forEach((folder) => {
    const folderPath = path.join(featurePath, folder);
    ensureDir(folderPath);
    createKeepFile(folderPath);
  });

  createIndexFile(featurePath);

  console.log(`\n✅ Feature "${feature}" created successfully!\n`);
}

function startCLI() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('🚀 Enter feature name (comma separated for multiple): ', (input) => {
    const features = input
      .split(',')
      .map((f) => f.trim())
      .filter(Boolean);

    if (features.length === 0) {
      console.log('❌ No feature provided.');
      rl.close();
      return;
    }

    features.forEach(createFeature);

    console.log('🎉 Done!');
    rl.close();
  });
}

startCLI();
