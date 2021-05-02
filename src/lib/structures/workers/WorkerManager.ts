import { cpus } from 'node:os';
import type { IncomingPayload, NoId, OutgoingPayload } from './types.js';
import { WorkerHandler } from './WorkerHandler.js';

export class WorkerManager {
	public readonly workers: WorkerHandler[] = [];

	public constructor(amount = cpus().length) {
		for (let i = 0; i < amount; i++) {
			this.workers.push(new WorkerHandler());
		}
	}

	private get idealWorker(): WorkerHandler {
		return this.workers.reduce((best, worker): WorkerHandler => (best.remaining > worker.remaining ? worker : best));
	}

	public async start() {
		await Promise.all(this.workers.map((worker): Promise<void> => worker.start()));
	}

	public async destroy(): Promise<void> {
		await Promise.all(this.workers.map((worker): Promise<number> => worker.destroy()))
	}

	public async send(data: NoId<IncomingPayload>, delay?: number | null): Promise<OutgoingPayload> {
		return this.idealWorker.send(data, delay);
	}
}
