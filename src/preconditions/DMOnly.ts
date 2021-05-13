import { Identifiers, Precondition, PreconditionResult } from '@sapphire/framework';
import type { Message } from 'discord.js';

export default class extends Precondition {
	// eslint-disable-next-line prettier/prettier
	public override run(message: Message): PreconditionResult {
		return message.guild === null
			? this.ok()
			: this.error({ identifier: Identifiers.PreconditionDMOnly, message: 'You cannot run this command outside DMs.' });
	}
}
