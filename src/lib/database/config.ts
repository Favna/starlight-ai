import '../preload';
import { rootFolder } from '../utils';
import { join } from 'path';
import { config as dotenvConfig } from 'dotenv';
import * as TypeORM from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { Store } from '@sapphire/framework';

dotenvConfig();

export const dbFolder = __dirname;

export const config: TypeORM.ConnectionOptions = {
	type: 'better-sqlite3',
	database: join(rootFolder, 'cwd', 'database.sql'),
	entities: [join(dbFolder, 'entities/*Entity.js')],
	migrations: [join(dbFolder, 'migrations/*.js')],
	cli: {
		entitiesDir: 'src/lib/database/entities',
		migrationsDir: 'src/lib/database/migrations',
		subscribersDir: 'src/lib/database/subscribers'
	},
	namingStrategy: new SnakeNamingStrategy(),
	logging: Store.injectedContext.env.parseBoolean('TYPEORM_DEBUG_LOGS', true)
};

export const connect = (): Promise<TypeORM.Connection> => {
	try {
		return Promise.resolve(TypeORM.getConnection());
	} catch {
		return TypeORM.createConnection(config);
	}
};
