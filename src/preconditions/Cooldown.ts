import { BucketType, Command, Identifiers, Precondition, PreconditionContext, PreconditionResult } from '@sapphire/framework';
import { Bucket } from '@sapphire/ratelimits';
import type { Message } from 'discord.js';

export interface CooldownContext extends PreconditionContext {
	bucketType?: BucketType;
	delay?: number;
	limit?: number;
}

export default class extends Precondition {
	public buckets = new WeakMap<Command, Bucket<string>>();

	// eslint-disable-next-line prettier/prettier
	public override run(message: Message, command: Command, context: CooldownContext): PreconditionResult {
		if (context.external) return this.ok();

		if (!context.delay) return this.ok();

		const bucket = this.getBucket(command, context);

		const remaining = bucket.take(this.getID(message, context));

		return remaining === 0
			? this.ok()
			: this.error({
					identifier: Identifiers.PreconditionCooldown,
					message: `You have just used this command. Try again in ${Math.ceil(remaining / 1000)} second${remaining > 1000 ? 's' : ''}.`,
					context: { remaining }
			  });
	}

	private getID(message: Message, context: CooldownContext): string {
		switch (context.bucketType) {
			case BucketType.Global:
				return 'global';
			case BucketType.Channel:
				return message.channel.id;
			case BucketType.Guild:
				return message.guild!.id;
			default:
				return message.author.id;
		}
	}

	private getBucket(command: Command, context: CooldownContext): Bucket<string> {
		let bucket = this.buckets.get(command);
		if (!bucket) {
			bucket = new Bucket();
			if ((context.limit ?? 1) <= 1) bucket.setDelay(context.delay!);
			else bucket.setLimit({ timespan: context.delay!, maximum: context.limit! });
			this.buckets.set(command, bucket);
		}
		return bucket;
	}
}
