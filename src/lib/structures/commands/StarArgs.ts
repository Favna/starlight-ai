import { Args, CommandContext, isOk, Result, UserError } from '@sapphire/framework';
import type { Message } from 'discord.js';
import type { TFunction } from 'i18next';
import type { Args as LexureArgs } from 'lexure';
import type { LightCommand } from './LightCommand';

export class StarArgs extends Args {
	// @ts-expect-error (4114) This should not get override
	public t: TFunction;

	public constructor(message: Message, command: LightCommand, args: LexureArgs, context: CommandContext, t: TFunction) {
		super(message, command, args, context);
		this.t = t;
	}

	public nextSplitResult({ delimiter = ',', times = Infinity }: StarArgs.NextSplitOptions = {}): Result<string[], UserError> {
		if (this.parser.finished) return this.missingArguments();

		const values: string[] = [];
		const parts = this.parser
			.many()
			.reduce((acc, token): string => `${acc}${token.value}${token.trailing}`, '')
			.split(delimiter);

		for (const part of parts) {
			const trimmed = part.trim();
			if (trimmed.length === 0) continue;

			values.push(trimmed);
			if (values.length === times) break;
		}

		return values.length > 0 ? Args.ok(values) : this.missingArguments();
	}

	public nextSplit(options?: StarArgs.NextSplitOptions): string[] {
		const result = this.nextSplitResult(options);
		if (isOk(result)) return result.value;
		throw result.error;
	}
}

export namespace StarArgs {
	export interface NextSplitOptions {
		delimiter?: string;
		times?: number;
	}
}

declare module '@sapphire/framework' {
	interface Args {
		t: TFunction;
	}
}
