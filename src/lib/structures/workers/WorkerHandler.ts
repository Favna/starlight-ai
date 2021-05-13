import { AsyncQueue } from '@sapphire/async-queue';
import { Worker } from 'worker_threads';
import { ResponseHandler } from './ResponseHandler';
import { cyan, yellow, green, red } from 'colorette';
import { Store } from '@sapphire/framework';
import { once } from 'events';
import { IncomingPayload, NoId, OutgoingPayload, OutgoingType } from './types';
import { join } from 'path';

export class WorkerHandler {
	public lastHeartBeat!: number;
	private worker!: Worker;
	private online!: boolean;
	private id = 0;
	private threadID = -1;
	private queue: AsyncQueue = new AsyncQueue();
	private response: ResponseHandler = new ResponseHandler();

	public constructor() {
		this.spawn();
	}

	public get remaining(): number {
		return this.queue.remaining;
	}

	public async send(data: NoId<IncomingPayload>, delay: number | null = null): Promise<OutgoingPayload> {
		await this.queue.wait();

		try {
			const id = this.generateID();
			this.worker.postMessage({ id, ...data });

			const promise = this.response.define(id);
			this.response.timeout(delay);

			return await promise;
		} catch (error) {
			await this.restart();
			throw error;
		} finally {
			this.queue.shift();
		}
	}

	public async restart(): Promise<void> {
		await this.destroy();
		await this.spawn().start();
	}

	public spawn(): this {
		this.online = false;
		this.lastHeartBeat = 0;
		this.worker = new Worker(WorkerHandler.filename)
			.on('message', (message: OutgoingPayload): void => this.handleMessage(message))
			.once('online', (): void => this.handleOnline())
			.once('exit', (code): void => this.handleExit(code));
		return this;
	}

	public async start(): Promise<void> {
		if (!this.online) await once(this.worker, 'online');
	}

	public async destroy(): Promise<void> {
		await this.worker.terminate();
	}

	private handleMessage(message: OutgoingPayload): void {
		if (message.type === OutgoingType.Heartbeat) {
			this.lastHeartBeat = Date.now();
			return;
		}

		this.response.resolve(message.id, message);
	}

	private generateID(): number {
		if (this.id === WorkerHandler.maximumID) {
			return (this.id = 0);
		}

		return this.id++;
	}

	private handleExit(code: number): void {
		this.online = false;
		this.worker.removeAllListeners();
		const worker = `[${yellow('W')}]`;
		const thread = cyan(this.threadID.toString(16));
		const exit = code === 0 ? green('0') : red(code.toString());
		Store.injectedContext.logger.warn(`${worker} - Thread ${thread} closed with code ${exit}.`);
	}

	private handleOnline(): void {
		this.online = true;
		this.threadID = this.worker.threadId;
		const worker = `[${cyan('W')}]`;
		const thread = cyan(this.threadID.toString(16));
		Store.injectedContext.logger.info(`${worker} - Thread ${thread} is now ready.`);
	}

	private static filename = join(__dirname, 'worker.js');
	private static maximumID = Number.MAX_SAFE_INTEGER;
}
