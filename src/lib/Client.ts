import { SapphireClient, Store } from '@sapphire/framework';
import { FetchManager } from './structures/FetchManager';
import type { ClientOptions } from 'discord.js';
import { WorkerManager } from './structures/workers/WorkerManager';
import { EnvLoader } from './utils';
import type { PieceContextExtras } from '@sapphire/pieces';
import type { DbManager } from './database/util/DbManager';

export class StarlightClient extends SapphireClient {
	// @ts-expect-error (4114) This should not get override
	public fetch: FetchManager = new FetchManager(this);

	public constructor(options: ClientOptions) {
		super(options);

		this.context.workers = new WorkerManager();
	}

	// eslint-disable-next-line prettier/prettier
	public override get context(): PieceContextExtras {
		return Store.injectedContext;
	}

	// @ts-expect-error (4114) This should not get override
	public fetchLanguage = (): string => 'en-US';
}

declare module 'discord.js' {
	interface Client {
		fetch: FetchManager;
		readonly context: PieceContextExtras;
	}
}

declare module '@sapphire/pieces' {
	interface PieceContextExtras {
		workers: WorkerManager;
		env: EnvLoader;
		db: DbManager;
	}
}
