import { ApplyOptions } from '@sapphire/decorators';
import type { CommandOptions } from '@sapphire/framework';
import type { Message } from 'discord.js';
import { LightCommand } from '../../lib/structures/commands/LightCommand';

@ApplyOptions<CommandOptions>({
	description: 'ping pong',
	enabled: true
})
export default class extends LightCommand {
	// eslint-disable-next-line prettier/prettier
	public override async run(message: Message): Promise<Message> {
		const msg = await message.channel.send('Ping?');
		return msg.edit(
			`Pong! Bot Latency ${Math.round(this.context.client.ws.ping)}ms. API Latency ${msg.createdTimestamp - message.createdTimestamp}ms.`
		);
	}
}
