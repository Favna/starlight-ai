import esbuild from 'esbuild';
import { opendir, writeFile, readdir, mkdir, copyFile } from 'fs/promises';
import { join, extname, dirname, basename } from 'path';
import { fileURLToPath } from 'url';
import { esbuildDecorators } from '@anatine/esbuild-decorators';

const PROD_OPTIONS = {
	minify: true,
	sourcesContent: true
}

const DEV_OPTIONS = {
	minify: false,
	sourcesContent: false
}

const BUNDLE_OPTIONS = {
	bundle: true,
	external: ['url', 'worker_threads', 'os', 'path', 'events', 'fs/promises', 'util', 'ffmpeg-static']
}

async function* scan(path, cb) {
	const dir = await opendir(path);
	for await (const item of dir) {
		const file = join(dir.path, item.name);
		if (item.isFile()) {
			if (cb(file)) yield file;
		} else if (item.isDirectory()) {
			yield* scan(file, cb);
		}
	}
}

async function copyLanguages(base) {
	for await (const file of scan(base, (fi) => extname(fi) === '.json')) {
		if (basename(file) === 'tsconfig.json') continue;
		const fileDirName = dirname(file).replace(/src/g, 'dist');
		try {
			await readdir(fileDirName)
		} catch {
			await mkdir(fileDirName, { recursive: true });
		}
		await copyFile(file, file.replace(/src/g, 'dist'));
	}
}

const rootFolder = fileURLToPath(new URL('../../', import.meta.url));

const DIST = join(rootFolder, 'dist');
const SRC = join(rootFolder, 'src');

const folder = SRC;
const regexp = /\.(?:t|j)s?$/;
const cb = (path) => regexp.test(path);

export default async function minify(env) {
	const files = [];
	console.time('scan');
	for await (const path of scan(folder, cb)) {
		if (!path.endsWith('.d.ts')) {
			files.push(path);
		}
	}
	console.timeEnd('scan');
	let buildOptions = {
		entryPoints: files,
		format: 'cjs',
		write: true,
		outdir: DIST,
		platform: 'node',
		tsconfig: join(SRC, 'tsconfig.json'),
		sourcemap: true,
		metafile: true,
		plugins: [
			esbuildDecorators({ tsx: true })
		]
	};
	switch (env) {
		case 'production': {
			buildOptions = { ...buildOptions, ...PROD_OPTIONS };
			break;
		}
		case 'development': {
			buildOptions = { ...buildOptions, ...DEV_OPTIONS };
			break;
		}
		case 'bundle': {
			buildOptions = { ...buildOptions, ...BUNDLE_OPTIONS };
			break;
		}
		default: throw new Error('Unreachable');
	};
	console.time('build');
	const result = await esbuild.build(buildOptions);
	console.timeEnd('build');
	console.time('languageCopy');
	await copyLanguages(SRC);
	console.timeEnd('languageCopy');
	console.time('meta');
	await writeFile(join(DIST, `meta-${env}.json`), JSON.stringify(result.metafile, null, 4));
	console.timeEnd('meta');
}
