#!/usr/bin/env ts-node

import fs from 'fs';
import path from 'path';
import { register } from 'ts-node';

// Register ts-node to allow importing .ts extensions in ESM
register({ compilerOptions: { module: 'esnext', allowImportingTsExtensions: true }, transpileOnly: true });

// Resolve directory in ESM context
const __dirname = path.dirname(new URL(import.meta.url).pathname);

async function collectTestFiles(dir: string, files: string[] = []): Promise<string[]> {
  for (const entry of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, entry);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (entry === 'e2e') continue; // skip Playwright E2E tests
      await collectTestFiles(fullPath, files);
    } else if (entry.endsWith('.spec.ts')) {
      files.push(fullPath);
    }
  }
  return files;
}

(async () => {
  const rootDir = path.resolve(__dirname, '../src/testing');
  if (!fs.existsSync(rootDir)) {
    console.error('Testing directory not found:', rootDir);
    process.exit(1);
  }

  const testFiles = await collectTestFiles(rootDir);
  console.log(`Found ${testFiles.length} test file(s)\n`);
  let failures = 0;

  for (const file of testFiles) {
    try {
      console.log(`▶ Running ${file}`);
      await import(file);
    } catch (err) {
      failures++;
      console.error(`❌ Test failed: ${file}`);
      console.error(err);
    }
  }

  if (failures > 0) {
    console.error(`\n${failures} test(s) failed.`);
    process.exit(1);
  }

  console.log('\n✅ All tests passed');
})(); 