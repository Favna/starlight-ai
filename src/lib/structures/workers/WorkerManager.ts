import { cpus } from 'os';
import type { IncomingPayload, NoId, OutgoingPayload } from './types.js';
import { WorkerHandler } from './WorkerHandler';
import { Store } from '@sapphire/framework';

export class WorkerManager {
	public readonly workers: WorkerHandler[] = [];

	public constructor(amount = Store.injectedContext.env.parseInteger('WORKER_COUNT', cpus().length)) {
		for (let i = 0; i < amount; i++) {
			this.workers.push(new WorkerHandler());
		}
	}

	private get idealWorker(): WorkerHandler {
		return this.workers.reduce((best, worker): WorkerHandler => (best.remaining > worker.remaining ? worker : best));
	}

	public async start(): Promise<void> {
		await Promise.all(this.workers.map((worker): Promise<void> => worker.start()));
	}

	public async restart(): Promise<void> {
		await Promise.all(this.workers.map((worker): Promise<void> => worker.restart()));
	}

	public async destroy(): Promise<void> {
		await Promise.all(this.workers.map((worker): Promise<void> => worker.destroy()));
	}

	public async send(data: NoId<IncomingPayload>, delay?: number | null): Promise<OutgoingPayload> {
		return this.idealWorker.send(data, delay);
	}
}
