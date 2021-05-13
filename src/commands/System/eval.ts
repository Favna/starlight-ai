import { ApplyOptions } from '@sapphire/decorators';
import type { CommandOptions } from '@sapphire/framework';
import { Message, MessageAttachment } from 'discord.js';
import { LightCommand } from '../../lib/structures/commands/LightCommand';
import { Stopwatch } from '@sapphire/stopwatch';
import { Type } from '@sapphire/type';
import { isThenable, codeBlock } from '@sapphire/utilities';
import { inspect } from 'util';

@ApplyOptions<CommandOptions>({
	aliases: ['ev'],
	description: 'Evaluates arbitrary JavaScript. Reserved for bot owner.',
	preconditions: ['OwnerOnly']
})
export default class extends LightCommand {
	// eslint-disable-next-line prettier/prettier
	public override async run(message: Message, args: LightCommand.Args): Promise<Message> {
		const code = await args.pick('string');
		const { result, type, time, success } = await this.eval(message, code);

		const out = success
			? `**Output**:${codeBlock('js', result)}\n**Type**:${codeBlock('ts', type)}\n${time}`
			: `**Error**:${codeBlock('js', result)}\n**Type**:${codeBlock('ts', type)}\n${time}`;

		return message.send(out.length > 2000 ? await this.getHaste(out).catch(() => new MessageAttachment(Buffer.from(out), 'output.txt')) : out);
	}

	private async eval(
		message: Message,
		code: string
	): Promise<{
		success: boolean;
		type: Type;
		time: string;
		result: string;
	}> {
		const stopwatch = new Stopwatch();
		let success: boolean | undefined = undefined;
		let syncTime: string | undefined = undefined;
		let asyncTime: string | undefined = undefined;
		let result: unknown | undefined = undefined;
		let thenable = false;
		let type: Type | undefined = undefined;
		try {
			// @ts-expect-error 6133
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const msg = message;
			// eslint-disable-next-line no-eval
			result = eval(code);
			syncTime = stopwatch.toString();
			type = new Type(result);
			if (isThenable(result)) {
				thenable = true;
				stopwatch.restart();
				result = await result;
				asyncTime = stopwatch.toString();
			}
			success = true;
		} catch (error) {
			if (!syncTime) syncTime = stopwatch.toString();
			if (thenable && !asyncTime) asyncTime = stopwatch.toString();
			if (!type) type = new Type(error);
			result = error;
			success = false;
		}

		stopwatch.stop();
		if (typeof result !== 'string') {
			result = result instanceof Error ? result.stack : inspect(result, { depth: 1 });
		}
		return { success, type: type!, time: this.formatTime(syncTime, asyncTime ?? ''), result: result as string };
	}

	private formatTime(syncTime: string, asyncTime: string): string {
		return asyncTime ? `⏱ ${asyncTime}<${syncTime}>` : `⏱ ${syncTime}`;
	}

	private async getHaste(result: string): Promise<string> {
		const { key } = (
			await this.context.client.fetch.acquire('https://hastebin.skyra.pw/documents').setOptions({ method: 'POST', body: result }).fetch()
		).data<{ key: string }>()!;
		return `https://hastebin.skyra.pw/${key}.js`;
	}
}
