import { create } from 'zustand';
import type { McpConnection, McpPreset } from '@/lib/types';

interface McpStore {
  connections: McpConnection[];
  presets: McpPreset[];
  selectedConnection: McpConnection | null;

  setConnections: (connections: McpConnection[]) => void;
  addConnection: (connection: McpConnection) => void;
  updateConnection: (id: string, updates: Partial<McpConnection>) => void;
  removeConnection: (id: string) => void;
  selectConnection: (connection: McpConnection | null) => void;
  setPresets: (presets: McpPreset[]) => void;

  toggleTool: (connectionId: string, toolName: string) => void;
  toggleAllTools: (connectionId: string, enabled: boolean) => void;
  assignToAgent: (connectionId: string, agentId: string) => void;
  unassignFromAgent: (connectionId: string, agentId: string) => void;

  getConnectionsByScope: (scope: McpConnection['scope']) => McpConnection[];
  getConnectionById: (id: string) => McpConnection | undefined;
}

export const useMcpStore = create<McpStore>((set, get) => ({
  connections: [],
  presets: [],
  selectedConnection: null,

  setConnections: (connections) => set({ connections }),

  addConnection: (connection) =>
    set((state) => ({ connections: [...state.connections, connection] })),

  updateConnection: (id, updates) =>
    set((state) => ({
      connections: state.connections.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
      selectedConnection:
        state.selectedConnection?.id === id
          ? { ...state.selectedConnection, ...updates }
          : state.selectedConnection,
    })),

  removeConnection: (id) =>
    set((state) => ({
      connections: state.connections.filter((c) => c.id !== id),
      selectedConnection:
        state.selectedConnection?.id === id ? null : state.selectedConnection,
    })),

  selectConnection: (connection) => set({ selectedConnection: connection }),

  setPresets: (presets) => set({ presets }),

  toggleTool: (connectionId, toolName) =>
    set((state) => ({
      connections: state.connections.map((c) =>
        c.id === connectionId
          ? {
              ...c,
              tools: c.tools.map((t) =>
                t.name === toolName ? { ...t, enabled: !t.enabled } : t
              ),
            }
          : c
      ),
    })),

  toggleAllTools: (connectionId, enabled) =>
    set((state) => ({
      connections: state.connections.map((c) =>
        c.id === connectionId
          ? {
              ...c,
              tools: c.tools.map((t) => ({ ...t, enabled })),
            }
          : c
      ),
    })),

  assignToAgent: (_connectionId, _agentId) => {
    // This would typically be handled via the agent store
    // updating the agent's mcpConnections array
  },

  unassignFromAgent: (_connectionId, _agentId) => {
    // This would typically be handled via the agent store
  },

  getConnectionsByScope: (scope) =>
    get().connections.filter((c) => c.scope === scope),

  getConnectionById: (id) =>
    get().connections.find((c) => c.id === id),
}));
