import { readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { rm } from 'node:fs/promises';

const root = process.cwd();

async function findNodeModules(dir: string): Promise<string[]> {
  const results: string[] = [];

  let entries;

  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return results;
  }

  for (const entry of entries) {
    // Don't go inside node_modules.
    if (entry.name === 'node_modules') {
      results.push(path.join(dir, entry.name));
      continue;
    }

    // Skip common directories that shouldn't be searched.
    if (
      entry.name === '.git' ||
      entry.name === '.expo' ||
      entry.name === '.next' ||
      entry.name === 'dist' ||
      entry.name === 'build'
    ) {
      continue;
    }

    if (entry.isDirectory()) {
      results.push(...(await findNodeModules(path.join(dir, entry.name))));
    }
  }

  return results;
}

async function main() {
  console.log(`🧹 Searching from:\n${root}\n`);

  const nodeModules = await findNodeModules(root);

  if (nodeModules.length === 0) {
    console.log('✅ No node_modules directories found.');
    return;
  }

  console.log(`Found ${nodeModules.length} node_modules directories:\n`);

  for (const dir of nodeModules) {
    console.log(`🗑️  ${dir}`);
  }

  console.log('\nRemoving...\n');

  for (const dir of nodeModules) {
    if (existsSync(dir)) {
      await rm(dir, {
        recursive: true,
        force: true,
      });
    }
  }

  console.log('✅ All node_modules directories removed.');
}

main().catch((error) => {
  console.error('❌ Cleanup failed:');
  console.error(error);
  process.exit(1);
});
