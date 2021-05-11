import { ApplyOptions } from '@sapphire/decorators';
import { Event, EventOptions, Events } from '@sapphire/framework';

@ApplyOptions<EventOptions>({
	event: Events.Debug
})
export default class extends Event {
	public run(...args: unknown[]): void {
		this.context.client.logger.debug(...args);
	}
}
