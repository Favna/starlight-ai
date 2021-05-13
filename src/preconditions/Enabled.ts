import { ApplyOptions } from '@sapphire/decorators';
import { Command, Identifiers, Precondition, PreconditionContext, PreconditionOptions, PreconditionResult } from '@sapphire/framework';
import type { Message } from 'discord.js';

@ApplyOptions<PreconditionOptions>({
	position: 10
})
export default class extends Precondition {
	// eslint-disable-next-line prettier/prettier
	public override run(_: Message, command: Command, context: PreconditionContext): PreconditionResult {
		return command.enabled ? this.ok() : this.error({ identifier: Identifiers.CommandDisabled, message: 'This command is disabled.', context });
	}
}
