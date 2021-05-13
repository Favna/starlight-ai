import { Awaited, CommandContext, PieceContext, UserError } from '@sapphire/framework';
import { SubCommandPluginCommand, SubCommandPluginCommandOptions } from '@sapphire/plugin-subcommands';
import { StarArgs } from './StarArgs';
import { sep } from 'path';
import type { Message } from 'discord.js';
import * as Lexure from 'lexure';

export abstract class LightCommand extends SubCommandPluginCommand<LightCommand.Args, LightCommand> {
	public readonly guarded: boolean;
	public readonly hidden: boolean;
	public readonly fullCategory: readonly string[];

	public constructor(context: PieceContext, options: LightCommand.Options) {
		super(context, options);
		this.guarded = options.guarded ?? false;
		this.hidden = options.hidden ?? false;

		const paths = context.path.split(sep);
		this.fullCategory = paths.slice(paths.indexOf('commands') + 1, -1);
	}

	public get category(): string {
		return this.fullCategory.length > 0 ? this.fullCategory[0] : 'General';
	}

	public get subCategory(): string {
		return this.fullCategory.length > 0 ? this.fullCategory[1] : 'General';
	}

	// eslint-disable-next-line prettier/prettier
	public override async preParse(message: Message, parameters: string, context: CommandContext): Promise<LightCommand.Args> {
		const parser = new Lexure.Parser(this.lexer.setInput(parameters).lex()).setUnorderedStrategy(this.strategy);
		const args = new Lexure.Args(parser.parse());
		return new StarArgs(message, this, args, context, await message.fetchT());
	}

	public override run(message: Message, args: LightCommand.Args, context: CommandContext): Awaited<unknown> {
		if (!this.subCommands) throw new Error(`The command ${this.name} does not have a 'run' method and does not support sub-commands.`);
		return this.subCommands.run({ message, args, context, command: this });
	}

	protected error(identifier: string | UserError, context?: unknown): never {
		throw typeof identifier === 'string' ? new UserError({ identifier, context }) : identifier;
	}
}

export namespace LightCommand {
	export type RunInOption = 'dm' | 'news' | 'text';

	export type Options = SubCommandPluginCommandOptions & {
		bucket?: number;
		cooldown?: number;
		guarded?: boolean;
		hidden?: boolean;
		nsfw?: boolean;
		runIn?: RunInOption[];
	};

	export type Args = StarArgs;
}
