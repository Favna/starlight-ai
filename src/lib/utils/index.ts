import type { PostProcessorModule } from 'i18next';
import { join } from 'path';
import type { ReferredPromise } from './types';

export * from './EnvLoader';
export * from './types';

export const noop = (): null => null;

export const filterArray = <V>(array: V[]): V[] => [...new Set(array)];

export const rootFolder = join(__dirname, '..', '..', '..');

export const helpUsagePostProcessor: PostProcessorModule = {
	type: 'postProcessor',
	name: 'helpUsagePostProcessor',
	process(value, [key]): string {
		return value === key ? '' : value;
	}
};

export function createReferPromise<T>(): ReferredPromise<T> {
	let resolve: ((value: T) => void) | undefined = undefined;
	let reject: ((error?: Error) => void) | undefined = undefined;
	const promise: Promise<T> = new Promise((res, rej) => {
		resolve = res;
		reject = rej;
	});

	// noinspection JSUnusedAssignment
	return { promise, resolve: resolve!, reject: reject! };
}
