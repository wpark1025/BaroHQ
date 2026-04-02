import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import {
  Channel,
  Message,
  Manager,
} from './types';
import {
  getChannelsFile,
  getMessagesDir,
  readJson,
  writeJsonAtomic,
  ensureDir,
  listFiles,
} from './persistence';
import { BroadcastFn } from './auditLogger';

const MAX_MESSAGES_PER_FILE = 10000;

export class ChannelManager implements Manager {
  private channelsFile: string;
  private messagesDir: string;
  private broadcast: BroadcastFn | null = null;

  constructor() {
    this.channelsFile = getChannelsFile();
    this.messagesDir = getMessagesDir();
  }

  setBroadcast(fn: BroadcastFn): void {
    this.broadcast = fn;
  }

  async init(): Promise<void> {
    console.log('[channels] Channel manager initialized.');
  }

  /**
   * Get the current history file for a channel (handles rotation).
   */
  private async currentHistoryFile(channelId: string): Promise<string> {
    await ensureDir(this.messagesDir);
    const files = await listFiles(this.messagesDir);
    const channelFiles = files
      .filter((f) => f.startsWith(`${channelId}-`) && f.endsWith('.json'))
      .sort();

    if (channelFiles.length === 0) {
      return path.join(this.messagesDir, `${channelId}-001.json`);
    }

    const lastFile = channelFiles[channelFiles.length - 1];
    const lastPath = path.join(this.messagesDir, lastFile);
    const data = await readJson<{ messages: Message[] }>(lastPath, { messages: [] });

    if (data.messages.length >= MAX_MESSAGES_PER_FILE) {
      // Rotate: create next file
      const match = lastFile.match(/-(\d+)\.json$/);
      const nextNum = match ? parseInt(match[1], 10) + 1 : 2;
      return path.join(this.messagesDir, `${channelId}-${String(nextNum).padStart(3, '0')}.json`);
    }

    return lastPath;
  }

  // ===== Channel CRUD =====

  /**
   * List channels for a team.
   */
  async listChannels(teamId: string): Promise<Channel[]> {
    const channels = await readJson<Channel[]>(this.channelsFile, []);
    return channels.filter((c) => c.teamId === teamId);
  }

  /**
   * Create a channel in a team.
   */
  async createChannel(teamId: string, input: Partial<Channel>): Promise<Channel> {
    const channels = await readJson<Channel[]>(this.channelsFile, []);

    const channel: Channel = {
      id: input.id || uuidv4(),
      name: input.name || 'general',
      type: input.type || 'team',
      members: input.members || [],
      teamId,
      unread: 0,
    };

    channels.push(channel);
    await writeJsonAtomic(this.channelsFile, channels);

    if (this.broadcast) {
      this.broadcast('channel_created', { teamDir: teamId, channel });
    }

    return channel;
  }

  /**
   * Update a channel.
   */
  async updateChannel(teamId: string, channelId: string, updates: Partial<Channel>): Promise<Channel | null> {
    const channels = await readJson<Channel[]>(this.channelsFile, []);
    const idx = channels.findIndex((c) => c.id === channelId && c.teamId === teamId);
    if (idx === -1) return null;

    const channel = { ...channels[idx], ...updates, id: channelId, teamId };
    channels[idx] = channel;
    await writeJsonAtomic(this.channelsFile, channels);

    if (this.broadcast) {
      this.broadcast('channel_updated', { teamDir: teamId, channel });
    }

    return channel;
  }

  // ===== Messaging =====

  /**
   * Send a message to a channel.
   */
  async sendMessage(_teamId: string, channelId: string, input: Partial<Message>): Promise<Message> {
    const message: Message = {
      id: input.id || uuidv4(),
      channelId,
      author: input.author || 'system',
      text: input.text || '',
      timestamp: input.timestamp || new Date().toISOString(),
      reactions: input.reactions || [],
      thread: input.thread || [],
    };

    const historyFile = await this.currentHistoryFile(channelId);
    const data = await readJson<{ messages: Message[] }>(historyFile, { messages: [] });
    data.messages.push(message);
    await writeJsonAtomic(historyFile, data);

    // Increment unread
    const channels = await readJson<Channel[]>(this.channelsFile, []);
    const chIdx = channels.findIndex((c) => c.id === channelId);
    if (chIdx !== -1) {
      channels[chIdx].unread += 1;
      await writeJsonAtomic(this.channelsFile, channels);
    }

    if (this.broadcast) {
      this.broadcast('message', { teamDir: _teamId, channelId, message });
    }

    return message;
  }

  /**
   * Send a direct message (DM). Uses a special DM channel.
   */
  async sendDm(teamId: string, fromAgent: string, toAgent: string, text: string): Promise<Message> {
    // Create or find DM channel
    const dmChannelId = [fromAgent, toAgent].sort().join('_dm_');
    const channels = await readJson<Channel[]>(this.channelsFile, []);

    let channel = channels.find((c) => c.id === dmChannelId);
    if (!channel) {
      channel = {
        id: dmChannelId,
        name: `DM: ${fromAgent} & ${toAgent}`,
        type: 'direct' as const,
        members: [fromAgent, toAgent],
        teamId,
        unread: 0,
      };
      channels.push(channel);
      await writeJsonAtomic(this.channelsFile, channels);
    }

    const message = await this.sendMessage(teamId, dmChannelId, {
      author: fromAgent,
      text,
    });

    if (this.broadcast) {
      this.broadcast('dm_message', { teamDir: teamId, from: fromAgent, to: toAgent, message });
    }

    return message;
  }

  /**
   * Get message history for a channel.
   */
  async getMessages(_teamId: string, channelId: string, options?: {
    limit?: number;
    before?: string;
  }): Promise<Message[]> {
    const files = await listFiles(this.messagesDir);
    const channelFiles = files
      .filter((f) => f.startsWith(`${channelId}-`) && f.endsWith('.json'))
      .sort();

    const allMessages: Message[] = [];
    // Read from newest file backward
    for (let i = channelFiles.length - 1; i >= 0; i--) {
      const data = await readJson<{ messages: Message[] }>(
        path.join(this.messagesDir, channelFiles[i]),
        { messages: [] }
      );
      allMessages.unshift(...data.messages);

      if (options?.limit && allMessages.length >= options.limit) {
        break;
      }
    }

    let result = allMessages;

    if (options?.before) {
      result = result.filter((m) => m.timestamp < options.before!);
    }

    if (options?.limit) {
      result = result.slice(-options.limit);
    }

    return result;
  }

  /**
   * Mark a channel as read (reset unread to 0).
   */
  async markRead(_teamId: string, channelId: string): Promise<void> {
    const channels = await readJson<Channel[]>(this.channelsFile, []);
    const idx = channels.findIndex((c) => c.id === channelId);
    if (idx !== -1) {
      channels[idx].unread = 0;
      await writeJsonAtomic(this.channelsFile, channels);
    }
  }

  async shutdown(): Promise<void> {
    console.log('[channels] Channel manager shut down.');
  }
}
