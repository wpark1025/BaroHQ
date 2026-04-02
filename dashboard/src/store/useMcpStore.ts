import { create } from 'zustand';
import type { McpConnection, McpPreset } from '@/lib/types';
import { McpConnectionStatus } from '@/lib/types';

interface McpStore {
  connections: McpConnection[];
  presets: McpPreset[];
  selectedConnection: McpConnection | null;
  selectedConnectionId: string | null;
  filterCategory: string;
  searchQuery: string;
  testResult: { status: 'idle' | 'testing' | 'success' | 'error'; tools?: string[]; error?: string };

  setConnections: (connections: McpConnection[]) => void;
  addConnection: (connection: McpConnection) => void;
  updateConnection: (id: string, updates: Partial<McpConnection>) => void;
  removeConnection: (id: string) => void;
  selectConnection: (connection: McpConnection | null) => void;
  setSelectedConnection: (id: string | null) => void;
  setPresets: (presets: McpPreset[]) => void;
  setFilterCategory: (c: string) => void;
  setSearchQuery: (q: string) => void;
  setTestResult: (r: McpStore['testResult']) => void;

  toggleConnection: (id: string) => void;
  toggleTool: (connectionId: string, toolName: string) => void;
  toggleAllTools: (connectionId: string, enabled: boolean) => void;
  assignToAgent: (connectionId: string, agentId: string) => void;
  unassignFromAgent: (connectionId: string, agentId: string) => void;

  getConnectionsByScope: (scope: McpConnection['scope']) => McpConnection[];
  getConnectionById: (id: string) => McpConnection | undefined;
  getFilteredConnections: () => McpConnection[];
  getAllTools: () => { tool: McpConnection['tools'][0]; connectionName: string; connectionId: string }[];
}

export const useMcpStore = create<McpStore>((set, get) => ({
  connections: [],
  presets: [],
  selectedConnection: null,
  selectedConnectionId: null,
  filterCategory: 'all',
  searchQuery: '',
  testResult: { status: 'idle' },

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

  setSelectedConnection: (id) => set({ selectedConnectionId: id }),

  setPresets: (presets) => set({ presets }),

  setFilterCategory: (c) => set({ filterCategory: c }),

  setSearchQuery: (q) => set({ searchQuery: q }),

  setTestResult: (r) => set({ testResult: r }),

  toggleConnection: (id) =>
    set((state) => ({
      connections: state.connections.map((c) =>
        c.id === id
          ? {
              ...c,
              status:
                c.status === McpConnectionStatus.Connected
                  ? McpConnectionStatus.Disconnected
                  : McpConnectionStatus.Connected,
            }
          : c
      ),
    })),

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
  },

  unassignFromAgent: (_connectionId, _agentId) => {
    // This would typically be handled via the agent store
  },

  getConnectionsByScope: (scope) =>
    get().connections.filter((c) => c.scope === scope),

  getConnectionById: (id) =>
    get().connections.find((c) => c.id === id),

  getFilteredConnections: () => {
    const { connections, filterCategory, searchQuery } = get();
    let result = [...connections];
    if (filterCategory !== 'all') {
      const preset = get().presets;
      const presetIds = preset.filter((p) => p.category === filterCategory).map((p) => p.id);
      result = result.filter((c) => presetIds.includes(c.preset) || (!c.preset && filterCategory === 'Custom'));
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((c) => c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q));
    }
    return result;
  },

  getAllTools: () => {
    const { connections } = get();
    return connections.flatMap((c) =>
      c.tools.map((t) => ({ tool: t, connectionName: c.name, connectionId: c.id }))
    );
  },
}));
