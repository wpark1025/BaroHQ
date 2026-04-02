import { create } from 'zustand';
import type { Channel, Message } from '@/lib/types';

interface ChatStore {
  channels: Channel[];
  messages: Record<string, Message[]>;
  selectedChannelId: string | null;

  setChannels: (channels: Channel[]) => void;
  addChannel: (channel: Channel) => void;
  removeChannel: (id: string) => void;
  setSelectedChannelId: (id: string | null) => void;

  addMessage: (channelId: string, message: Message) => void;
  setMessages: (channelId: string, messages: Message[]) => void;
  setAllMessages: (messages: Record<string, Message[]>) => void;

  getChannelById: (id: string) => Channel | undefined;
  getMessagesForChannel: (channelId: string) => Message[];
}

export const useChatStore = create<ChatStore>((set, get) => ({
  channels: [],
  messages: {},
  selectedChannelId: null,

  setChannels: (channels) => set({ channels }),

  addChannel: (channel) =>
    set((state) => ({ channels: [...state.channels, channel] })),

  removeChannel: (id) =>
    set((state) => ({
      channels: state.channels.filter((c) => c.id !== id),
      selectedChannelId: state.selectedChannelId === id ? null : state.selectedChannelId,
    })),

  setSelectedChannelId: (id) => set({ selectedChannelId: id }),

  addMessage: (channelId, message) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [channelId]: [...(state.messages[channelId] ?? []), message],
      },
    })),

  setMessages: (channelId, messages) =>
    set((state) => ({
      messages: { ...state.messages, [channelId]: messages },
    })),

  setAllMessages: (messages) => set({ messages }),

  getChannelById: (id) => get().channels.find((c) => c.id === id),

  getMessagesForChannel: (channelId) => get().messages[channelId] ?? [],
}));
