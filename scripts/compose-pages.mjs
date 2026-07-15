import { cp, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const pagesDirectory = resolve('docs/.vitepress/dist');
const playgroundDirectory = resolve(pagesDirectory, 'playground');

await mkdir(playgroundDirectory, { recursive: true });
await cp(resolve('playground/dist'), playgroundDirectory, { recursive: true });
