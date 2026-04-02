import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import {
  Channel,
  Message,
  Manager,
} from './types';
import {
  getTeamsDir,
  readJson,
  writeJsonAtomic,
  ensureDir,
  listFiles,
} from './persistence';
import { BroadcastFn } from './auditLogger';

interface ChannelsFile {
  channels: Channel[];
}

const MAX_MESSAGES_PER_FILE = 10000;

export class ChannelManager implements Manager {
  private teamsDir: string;
  private broadcast: BroadcastFn | null = null;

  constructor() {
    this.teamsDir = getTeamsDir();
  }

  setBroadcast(fn: BroadcastFn): void {
    this.broadcast = fn;
  }

  async init(): Promise<void> {
    console.log('[channels] Channel manager initialized.');
  }

  private channelsPath(teamDir: string): string {
    return path.join(this.teamsDir, teamDir, 'messages', 'channels.json');
  }

  private historyDir(teamDir: string): string {
    return path.join(this.teamsDir, teamDir, 'messages', 'history');
  }

  /**
   * Get the current history file for a channel (handles rotation).
   */
  private async currentHistoryFile(teamDir: string, channelId: string): Promise<string> {
    const dir = this.historyDir(teamDir);
    await ensureDir(dir);
    const files = await listFiles(dir);
    const channelFiles = files
      .filter((f) => f.startsWith(`${channelId}-`) && f.endsWith('.json'))
      .sort();

    if (channelFiles.length === 0) {
      return path.join(dir, `${channelId}-001.json`);
    }

    const lastFile = channelFiles[channelFiles.length - 1];
    const lastPath = path.join(dir, lastFile);
    const data = await readJson<{ messages: Message[] }>(lastPath, { messages: [] });

    if (data.messages.length >= MAX_MESSAGES_PER_FILE) {
      // Rotate: create next file
      const match = lastFile.match(/-(\d+)\.json$/);
      const nextNum = match ? parseInt(match[1], 10) + 1 : 2;
      return path.join(dir, `${channelId}-${String(nextNum).padStart(3, '0')}.json`);
    }

    return lastPath;
  }

  // ===== Channel CRUD =====

  /**
   * List channels for a team.
   */
  async listChannels(teamDir: string): Promise<Channel[]> {
    const data = await readJson<ChannelsFile>(this.channelsPath(teamDir), { channels: [] });
    return data.channels;
  }

  /**
   * Create a channel in a team.
   */
  async createChannel(teamDir: string, input: Partial<Channel>): Promise<Channel> {
    const channelsFile = this.channelsPath(teamDir);
    await ensureDir(path.dirname(channelsFile));
    const data = await readJson<ChannelsFile>(channelsFile, { channels: [] });

    const channel: Channel = {
      id: input.id || uuidv4(),
      name: input.name || 'general',
      type: input.type || 'team',
      members: input.members || [],
      teamId: teamDir,
      unread: 0,
    };

    data.channels.push(channel);
    await writeJsonAtomic(channelsFile, data);

    if (this.broadcast) {
      this.broadcast('channel_created', { teamDir, channel });
    }

    return channel;
  }

  /**
   * Update a channel.
   */
  async updateChannel(teamDir: string, channelId: string, updates: Partial<Channel>): Promise<Channel | null> {
    const channelsFile = this.channelsPath(teamDir);
    const data = await readJson<ChannelsFile>(channelsFile, { channels: [] });
    const idx = data.channels.findIndex((c) => c.id === channelId);
    if (idx === -1) return null;

    const channel = { ...data.channels[idx], ...updates, id: channelId, teamId: teamDir };
    data.channels[idx] = channel;
    await writeJsonAtomic(channelsFile, data);

    if (this.broadcast) {
      this.broadcast('channel_updated', { teamDir, channel });
    }

    return channel;
  }

  // ===== Messaging =====

  /**
   * Send a message to a channel.
   */
  async sendMessage(teamDir: string, channelId: string, input: Partial<Message>): Promise<Message> {
    const message: Message = {
      id: input.id || uuidv4(),
      channelId,
      author: input.author || 'system',
      text: input.text || '',
      timestamp: input.timestamp || new Date().toISOString(),
      reactions: input.reactions || [],
      thread: input.thread || [],
    };

    const historyFile = await this.currentHistoryFile(teamDir, channelId);
    const data = await readJson<{ messages: Message[] }>(historyFile, { messages: [] });
    data.messages.push(message);
    await writeJsonAtomic(historyFile, data);

    // Increment unread for other members
    const channelsFile = this.channelsPath(teamDir);
    const channelsData = await readJson<ChannelsFile>(channelsFile, { channels: [] });
    const chIdx = channelsData.channels.findIndex((c) => c.id === channelId);
    if (chIdx !== -1) {
      channelsData.channels[chIdx].unread += 1;
      await writeJsonAtomic(channelsFile, channelsData);
    }

    if (this.broadcast) {
      this.broadcast('message', { teamDir, channelId, message });
    }

    return message;
  }

  /**
   * Send a direct message (DM). Uses a special DM channel.
   */
  async sendDm(teamDir: string, fromAgent: string, toAgent: string, text: string): Promise<Message> {
    // Create or find DM channel
    const dmChannelId = [fromAgent, toAgent].sort().join('_dm_');
    const channelsFile = this.channelsPath(teamDir);
    const channelsData = await readJson<ChannelsFile>(channelsFile, { channels: [] });

    let channel = channelsData.channels.find((c) => c.id === dmChannelId);
    if (!channel) {
      channel = {
        id: dmChannelId,
        name: `DM: ${fromAgent} & ${toAgent}`,
        type: 'direct' as const,
        members: [fromAgent, toAgent],
        teamId: teamDir,
        unread: 0,
      };
      channelsData.channels.push(channel);
      await writeJsonAtomic(channelsFile, channelsData);
    }

    const message = await this.sendMessage(teamDir, dmChannelId, {
      author: fromAgent,
      text,
    });

    if (this.broadcast) {
      this.broadcast('dm_message', { teamDir, from: fromAgent, to: toAgent, message });
    }

    return message;
  }

  /**
   * Get message history for a channel.
   */
  async getMessages(teamDir: string, channelId: string, options?: {
    limit?: number;
    before?: string;
  }): Promise<Message[]> {
    const dir = this.historyDir(teamDir);
    const files = await listFiles(dir);
    const channelFiles = files
      .filter((f) => f.startsWith(`${channelId}-`) && f.endsWith('.json'))
      .sort();

    const allMessages: Message[] = [];
    // Read from newest file backward
    for (let i = channelFiles.length - 1; i >= 0; i--) {
      const data = await readJson<{ messages: Message[] }>(
        path.join(dir, channelFiles[i]),
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
  async markRead(teamDir: string, channelId: string): Promise<void> {
    const channelsFile = this.channelsPath(teamDir);
    const data = await readJson<ChannelsFile>(channelsFile, { channels: [] });
    const idx = data.channels.findIndex((c) => c.id === channelId);
    if (idx !== -1) {
      data.channels[idx].unread = 0;
      await writeJsonAtomic(channelsFile, data);
    }
  }

  async shutdown(): Promise<void> {
    console.log('[channels] Channel manager shut down.');
  }
}
