import { readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const manifest = JSON.parse(
  await readFile(new URL('../package.json', import.meta.url), 'utf8'),
);

// Node imports and requires use the same CJS module graph. Other runtimes
// and browser bundlers retain native ESM through the default import condition.
for (const entry of Object.values(manifest.exports)) {
  if (typeof entry === 'string') continue;
  const commonjs = new URL(`../${entry.require.default}`, import.meta.url);
  const names = Object.keys(require(fileURLToPath(commonjs)));
  const declaration = new URL(`../${entry.node.import.types}`, import.meta.url);
  await writeFile(
    declaration,
    `export * from './${basename(fileURLToPath(commonjs))}';\n`,
  );
  const wrapper = new URL(`../${entry.node.import.default}`, import.meta.url);
  await writeFile(
    wrapper,
    `import entry from './${basename(fileURLToPath(commonjs))}';\nexport const { ${names.join(', ')} } = entry;\n`,
  );
}
