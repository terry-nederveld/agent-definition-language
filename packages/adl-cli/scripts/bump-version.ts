#!/usr/bin/env bun

/**
 * Bump the package version and sync it across package.json, bun.lock, and src/index.ts.
 *
 * Usage:
 *   bun run scripts/bump-version.ts <major|minor|patch>
 *   bun run scripts/bump-version.ts 1.2.3
 */

import { $ } from "bun";
import * as path from "node:path";
import * as fs from "node:fs";

const ROOT = path.resolve(import.meta.dir, "..");
const PKG_PATH = path.join(ROOT, "package.json");
const INDEX_PATH = path.join(ROOT, "src/index.ts");

function parseVersion(version: string): [number, number, number] {
  const parts = version.split(".").map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) {
    throw new Error(`Invalid version: ${version}`);
  }
  return parts as [number, number, number];
}

function bump(current: string, type: string): string {
  const [major, minor, patch] = parseVersion(current);
  switch (type) {
    case "major":
      return `${major + 1}.0.0`;
    case "minor":
      return `${major}.${minor + 1}.0`;
    case "patch":
      return `${major}.${minor}.${patch + 1}`;
    default:
      // Treat as explicit version
      parseVersion(type); // validate
      return type;
  }
}

async function main() {
  const arg = process.argv[2];
  if (!arg) {
    console.error("Usage: bump-version.ts <major|minor|patch|x.y.z>");
    process.exit(1);
  }

  // Read current version from package.json
  const pkg = JSON.parse(fs.readFileSync(PKG_PATH, "utf-8"));
  const current = pkg.version;
  const next = bump(current, arg);

  if (current === next) {
    console.log(`Version is already ${current}, nothing to do.`);
    return;
  }

  console.log(`Bumping ${current} → ${next}\n`);

  // 1. Update package.json
  pkg.version = next;
  fs.writeFileSync(PKG_PATH, JSON.stringify(pkg, null, 2) + "\n");
  console.log(`  ✓ package.json`);

  // 2. Update .version() in src/index.ts
  const indexSrc = fs.readFileSync(INDEX_PATH, "utf-8");
  const updated = indexSrc.replace(
    `.version("${current}")`,
    `.version("${next}")`
  );
  if (updated === indexSrc) {
    console.error(`  ✗ src/index.ts: could not find .version("${current}")`);
    process.exit(1);
  }
  fs.writeFileSync(INDEX_PATH, updated);
  console.log(`  ✓ src/index.ts`);

  // 3. Sync bun.lock
  await $`bun install --frozen-lockfile`.quiet().catch(async () => {
    // If frozen fails (version changed), do a regular install to update the lock
    await $`bun install`.quiet();
  });
  console.log(`  ✓ bun.lock`);

  console.log(`\nDone. Version is now ${next}.`);
}

main();
