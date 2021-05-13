import { Command, Identifiers, Precondition, PreconditionContext, PreconditionResult } from '@sapphire/framework';
import { Permissions, Message, TextChannel, NewsChannel, PermissionString } from 'discord.js';

const readablePermissions: Record<PermissionString, string> = {
	ADMINISTRATOR: 'Administrator',
	VIEW_AUDIT_LOG: 'View Audit Log',
	MANAGE_GUILD: 'Manage Server',
	MANAGE_ROLES: 'Manage Roles',
	MANAGE_CHANNELS: 'Manage Channels',
	KICK_MEMBERS: 'Kick Members',
	BAN_MEMBERS: 'Ban Members',
	CREATE_INSTANT_INVITE: 'Create Instant Invite',
	CHANGE_NICKNAME: 'Change Nickname',
	MANAGE_NICKNAMES: 'Manage Nicknames',
	MANAGE_EMOJIS: 'Manage Emojis',
	MANAGE_WEBHOOKS: 'Manage Webhooks',
	VIEW_CHANNEL: 'Read Messages',
	SEND_MESSAGES: 'Send Messages',
	SEND_TTS_MESSAGES: 'Send TTS Messages',
	MANAGE_MESSAGES: 'Manage Messages',
	EMBED_LINKS: 'Embed Links',
	ATTACH_FILES: 'Attach Files',
	READ_MESSAGE_HISTORY: 'Read Message History',
	MENTION_EVERYONE: 'Mention Everyone',
	USE_EXTERNAL_EMOJIS: 'Use External Emojis',
	ADD_REACTIONS: 'Add Reactions',
	CONNECT: 'Connect',
	SPEAK: 'Speak',
	STREAM: 'Stream',
	MUTE_MEMBERS: 'Mute Members',
	DEAFEN_MEMBERS: 'Deafen Members',
	MOVE_MEMBERS: 'Move Members',
	USE_VAD: 'Use Voice Activity',
	PRIORITY_SPEAKER: 'Priority Speaker',
	VIEW_GUILD_INSIGHTS: 'View Guild Insights',
	REQUEST_TO_SPEAK: 'Request to Speak',
	USE_APPLICATION_COMMANDS: 'Use slashies'
};

export default class CorePrecondition extends Precondition {
	private readonly dmChannelPermissions = new Permissions([
		Permissions.FLAGS.VIEW_CHANNEL,
		Permissions.FLAGS.SEND_MESSAGES,
		Permissions.FLAGS.SEND_TTS_MESSAGES,
		Permissions.FLAGS.EMBED_LINKS,
		Permissions.FLAGS.ATTACH_FILES,
		Permissions.FLAGS.READ_MESSAGE_HISTORY,
		Permissions.FLAGS.MENTION_EVERYONE,
		Permissions.FLAGS.USE_EXTERNAL_EMOJIS,
		Permissions.FLAGS.ADD_REACTIONS
	]).freeze();

	// eslint-disable-next-line prettier/prettier
	public override run(message: Message, _: Command, context: PreconditionContext): PreconditionResult {
		const required = (context.permissions as Permissions) ?? new Permissions(0n);
		const permissions = message.guild
			? (message.channel as TextChannel | NewsChannel).permissionsFor(message.client.id!)!
			: this.dmChannelPermissions;
		const missing = permissions.missing(required);
		return missing.length === 0
			? this.ok()
			: this.error({
					identifier: Identifiers.PreconditionPermissions,
					message: `I am missing the following permissions to run this command: ${missing
						.map((perm): string => readablePermissions[perm])
						.join(', ')}`,
					context: { missing }
			  });
	}
}
