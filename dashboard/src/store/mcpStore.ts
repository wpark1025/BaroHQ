import { create } from 'zustand';
import { McpConnection, McpConnectionStatus, McpPreset } from '@/lib/types';

const MOCK_CONNECTIONS: McpConnection[] = [
  {
    id: 'mcp-1', preset: 'preset-github', name: 'GitHub', description: 'GitHub repository management',
    status: McpConnectionStatus.Connected, transport: 'sse',
    config: { url: 'https://mcp.github.com/sse' },
    tools: [
      { name: 'create_issue', description: 'Create a GitHub issue', enabled: true },
      { name: 'list_repos', description: 'List repositories', enabled: true },
      { name: 'create_pr', description: 'Create a pull request', enabled: true },
      { name: 'review_pr', description: 'Review a pull request', enabled: true },
    ],
    scope: 'global', lastHealthCheck: '2026-04-01T12:00:00Z',
    createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-04-01T12:00:00Z',
  },
  {
    id: 'mcp-2', preset: 'preset-slack', name: 'Slack', description: 'Slack messaging integration',
    status: McpConnectionStatus.Connected, transport: 'sse',
    config: { url: 'https://mcp.slack.com/sse' },
    tools: [
      { name: 'send_message', description: 'Send a Slack message', enabled: true },
      { name: 'create_channel', description: 'Create a channel', enabled: true },
    ],
    scope: 'global', lastHealthCheck: '2026-04-01T12:00:00Z',
    createdAt: '2026-01-05T00:00:00Z', updatedAt: '2026-04-01T12:00:00Z',
  },
  {
    id: 'mcp-3', preset: 'preset-jira', name: 'Jira', description: 'Jira project tracking',
    status: McpConnectionStatus.Disconnected, transport: 'sse',
    config: { url: 'https://mcp.atlassian.com/jira/sse' },
    tools: [
      { name: 'create_ticket', description: 'Create a Jira ticket', enabled: true },
      { name: 'update_ticket', description: 'Update a ticket', enabled: true },
    ],
    scope: 'team', lastHealthCheck: '2026-03-28T10:00:00Z',
    createdAt: '2026-02-01T00:00:00Z', updatedAt: '2026-03-28T10:00:00Z',
  },
  {
    id: 'mcp-4', preset: '', name: 'Internal DB', description: 'Internal database access via custom MCP',
    status: McpConnectionStatus.Connected, transport: 'stdio',
    config: { command: 'node', args: ['mcp-db-server.js'] },
    tools: [
      { name: 'query', description: 'Run a read-only SQL query', enabled: true },
      { name: 'schema', description: 'Get database schema', enabled: true },
    ],
    scope: 'agent', lastHealthCheck: '2026-04-01T12:00:00Z',
    createdAt: '2026-03-01T00:00:00Z', updatedAt: '2026-04-01T12:00:00Z',
  },
];

const MOCK_PRESETS: McpPreset[] = [
  { id: 'preset-github', name: 'GitHub', icon: 'github', category: 'Development', description: 'Connect to GitHub for repo and issue management', defaultTransport: 'sse', defaultUrl: 'https://mcp.github.com/sse', authType: 'api_key', authInstructions: 'Create a personal access token at github.com/settings/tokens', docsUrl: 'https://docs.github.com/mcp', requiredScopes: ['repo', 'issues'], popular: true },
  { id: 'preset-slack', name: 'Slack', icon: 'message-square', category: 'Communication', description: 'Send messages and manage channels via Slack', defaultTransport: 'sse', defaultUrl: 'https://mcp.slack.com/sse', authType: 'oauth', authInstructions: 'Authorize via Slack OAuth flow', docsUrl: 'https://api.slack.com/mcp', requiredScopes: ['chat:write', 'channels:manage'], popular: true },
  { id: 'preset-jira', name: 'Jira', icon: 'ticket', category: 'Project Management', description: 'Manage Jira issues and projects', defaultTransport: 'sse', defaultUrl: 'https://mcp.atlassian.com/jira/sse', authType: 'api_key', authInstructions: 'Create an API token at id.atlassian.com', docsUrl: 'https://developer.atlassian.com/mcp', requiredScopes: ['read:jira-work', 'write:jira-work'], popular: true },
  { id: 'preset-linear', name: 'Linear', icon: 'layers', category: 'Project Management', description: 'Issue tracking with Linear', defaultTransport: 'sse', defaultUrl: 'https://mcp.linear.app/sse', authType: 'api_key', authInstructions: 'Create API key in Linear settings', docsUrl: 'https://linear.app/docs/mcp', requiredScopes: [], popular: false },
  { id: 'preset-figma', name: 'Figma', icon: 'pen-tool', category: 'Design', description: 'Access Figma design files and components', defaultTransport: 'sse', defaultUrl: 'https://mcp.figma.com/sse', authType: 'api_key', authInstructions: 'Create a personal access token in Figma', docsUrl: 'https://www.figma.com/developers/mcp', requiredScopes: [], popular: true },
  { id: 'preset-notion', name: 'Notion', icon: 'book-open', category: 'Knowledge', description: 'Access Notion pages and databases', defaultTransport: 'sse', defaultUrl: 'https://mcp.notion.so/sse', authType: 'api_key', authInstructions: 'Create an integration at notion.so/my-integrations', docsUrl: 'https://developers.notion.com/mcp', requiredScopes: [], popular: true },
  { id: 'preset-postgres', name: 'PostgreSQL', icon: 'database', category: 'Database', description: 'Query PostgreSQL databases', defaultTransport: 'stdio', defaultUrl: '', authType: 'none', authInstructions: 'Configure connection string', docsUrl: '', requiredScopes: [], popular: false },
  { id: 'preset-sentry', name: 'Sentry', icon: 'shield-alert', category: 'Monitoring', description: 'Error tracking and performance monitoring', defaultTransport: 'sse', defaultUrl: 'https://mcp.sentry.io/sse', authType: 'api_key', authInstructions: 'Create an auth token at sentry.io', docsUrl: 'https://docs.sentry.io/mcp', requiredScopes: [], popular: false },
];

interface McpStore {
  connections: McpConnection[];
  presets: McpPreset[];
  selectedConnectionId: string | null;
  filterCategory: string;
  searchQuery: string;
  testResult: { status: 'idle' | 'testing' | 'success' | 'error'; tools?: string[]; error?: string };
  setSelectedConnection: (id: string | null) => void;
  setFilterCategory: (c: string) => void;
  setSearchQuery: (q: string) => void;
  addConnection: (c: McpConnection) => void;
  updateConnection: (id: string, updates: Partial<McpConnection>) => void;
  removeConnection: (id: string) => void;
  toggleConnection: (id: string) => void;
  setTestResult: (r: McpStore['testResult']) => void;
  getConnectionById: (id: string) => McpConnection | undefined;
  getFilteredConnections: () => McpConnection[];
  getAllTools: () => { tool: McpConnection['tools'][0]; connectionName: string; connectionId: string }[];
}

export const useMcpStore = create<McpStore>((set, get) => ({
  connections: MOCK_CONNECTIONS,
  presets: MOCK_PRESETS,
  selectedConnectionId: null,
  filterCategory: 'all',
  searchQuery: '',
  testResult: { status: 'idle' },
  setSelectedConnection: (id) => set({ selectedConnectionId: id }),
  setFilterCategory: (c) => set({ filterCategory: c }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  addConnection: (c) => set((state) => ({ connections: [...state.connections, c] })),
  updateConnection: (id, updates) =>
    set((state) => ({
      connections: state.connections.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    })),
  removeConnection: (id) => set((state) => ({ connections: state.connections.filter((c) => c.id !== id) })),
  toggleConnection: (id) =>
    set((state) => ({
      connections: state.connections.map((c) =>
        c.id === id
          ? {
              ...c,
              status: c.status === McpConnectionStatus.Connected ? McpConnectionStatus.Disconnected : McpConnectionStatus.Connected,
            }
          : c
      ),
    })),
  setTestResult: (r) => set({ testResult: r }),
  getConnectionById: (id) => get().connections.find((c) => c.id === id),
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
