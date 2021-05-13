import { TimerManager } from '@sapphire/time-utilities';
import { parentPort, isMainThread, MessagePort } from 'worker_threads';
import { IncomingPayload, OutgoingPayload, OutgoingType } from './types';

function checkParentPort(port: unknown): asserts port is MessagePort {
	if (isMainThread || port === null) throw new Error('The Worker may only be ran via the worker_threads fork method!');
}

function post(message: OutgoingPayload): void {
	return parentPort!.postMessage(message);
}

checkParentPort(parentPort);

TimerManager.setInterval((): void => post({ type: OutgoingType.Heartbeat }), 30000);

parentPort!.on('message', async (message: IncomingPayload): Promise<void> => post(await handleMessage(message)));

function handleMessage(message: IncomingPayload): Promise<OutgoingPayload> {
	switch (message.type) {
		default:
			return Promise.resolve({ id: message.id, type: OutgoingType.UnknownCommand });
	}
}
