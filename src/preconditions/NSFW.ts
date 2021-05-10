import { Identifiers, Precondition, PreconditionResult } from '@sapphire/framework';
import type { Message } from 'discord.js';

export default class extends Precondition {
	public run(message: Message): PreconditionResult {
		return Reflect.get(message.channel, 'nsfw') === true
			? this.ok()
			: this.error({ identifier: Identifiers.PreconditionNSFW, message: 'You cannot run this command outside NSFW channels.' });
	}
}
