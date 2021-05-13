import { rm } from 'fs/promises';

const distFolder = new URL('../../dist', import.meta.url);

const cwdFolder = new URL('../../cwd', import.meta.url);

const options = { recursive: true, force: true };

console.time('clean');
await Promise.all([rm(distFolder, options), rm(cwdFolder, options)]);
console.timeEnd('clean');
