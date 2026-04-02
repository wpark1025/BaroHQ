import { create } from 'zustand';
import { AuditEntry, RunRecord, ProviderType } from '@/lib/types';

const MOCK_AUDIT: AuditEntry[] = [
  { id: 'ae-1', action: 'project.created', actor: 'agent-ceo', target: 'Platform V2', details: 'Created project with slug platform-v2', timestamp: '2026-01-10T10:00:00Z' },
  { id: 'ae-2', action: 'rule.updated', actor: 'admin', target: 'Code Review Required', details: 'Updated to version 3, added branch requirement', timestamp: '2026-03-01T09:00:00Z' },
  { id: 'ae-3', action: 'provider.added', actor: 'admin', target: 'Gemini', details: 'Added Gemini provider with pro model mapping', timestamp: '2026-02-01T14:00:00Z' },
  { id: 'ae-4', action: 'task.status_changed', actor: 'agent-1', target: 'PROJ-1', details: 'Status: todo -> in_progress', timestamp: '2026-03-10T09:00:00Z' },
  { id: 'ae-5', action: 'mcp.connected', actor: 'system', target: 'GitHub', details: 'MCP connection established, 4 tools discovered', timestamp: '2026-01-01T12:00:00Z' },
  { id: 'ae-6', action: 'agent.created', actor: 'admin', target: 'agent-4', details: 'Created security agent with Claude Code provider', timestamp: '2026-01-05T08:00:00Z' },
  { id: 'ae-7', action: 'budget.alert', actor: 'system', target: 'Security Audit', details: 'Budget exceeded: $5,650 / $5,000 limit', timestamp: '2026-03-28T14:00:00Z' },
  { id: 'ae-8', action: 'approval.approved', actor: 'agent-ceo', target: 'Deploy v2.1.0', details: 'Approved production deployment', timestamp: '2026-03-29T11:00:00Z' },
  { id: 'ae-9', action: 'sprint.started', actor: 'agent-1', target: 'Sprint 1', details: 'Started sprint with 4 tasks, 42 story points', timestamp: '2026-03-15T09:00:00Z' },
  { id: 'ae-10', action: 'governance.enforcement', actor: 'agent-security', target: 'PR #142', details: 'Blocked: No Hardcoded Secrets rule violation detected', timestamp: '2026-03-30T15:00:00Z' },
];

const MOCK_RUNS: RunRecord[] = [
  {
    id: 'run-1', agentId: 'agent-1', team: 'team-eng', provider: 'Claude Code',
    providerType: ProviderType.ClaudeCode, model: 'claude-opus-4-6', modelTier: 'opus',
    prompt: 'Implement OAuth2 callback handler...', output: 'Here is the implementation...',
    usage: { inputTokens: 2400, outputTokens: 3200, totalTokens: 5600, cost: 0.276 },
    durationMs: 8500, status: 'success', errorMessage: '', projectId: 'proj-1', taskId: 'task-2',
    autoIssueCreated: false, mcpToolsUsed: ['create_pr'], timestamp: '2026-03-30T14:30:00Z',
  },
  {
    id: 'run-2', agentId: 'agent-2', team: 'team-eng', provider: 'Claude Code',
    providerType: ProviderType.ClaudeCode, model: 'claude-sonnet-4-20250514', modelTier: 'sonnet',
    prompt: 'Write unit tests for session manager...', output: 'Test suite created...',
    usage: { inputTokens: 1800, outputTokens: 4500, totalTokens: 6300, cost: 0.364 },
    durationMs: 12300, status: 'success', errorMessage: '', projectId: 'proj-1', taskId: 'task-3',
    autoIssueCreated: false, mcpToolsUsed: [], timestamp: '2026-03-30T15:00:00Z',
  },
  {
    id: 'run-3', agentId: 'agent-3', team: 'team-design', provider: 'Gemini',
    providerType: ProviderType.Gemini, model: 'gemini-2.5-pro', modelTier: 'opus',
    prompt: 'Generate color token documentation...', output: '',
    usage: { inputTokens: 800, outputTokens: 0, totalTokens: 800, cost: 0.006 },
    durationMs: 30000, status: 'timeout', errorMessage: 'Request timed out after 30s',
    projectId: 'proj-3', taskId: 'task-5',
    autoIssueCreated: true, mcpToolsUsed: ['figma_export'], timestamp: '2026-03-30T16:00:00Z',
  },
  {
    id: 'run-4', agentId: 'agent-1', team: 'team-eng', provider: 'Claude API',
    providerType: ProviderType.ClaudeAPI, model: 'claude-sonnet-4-20250514', modelTier: 'sonnet',
    prompt: 'Review pull request #138...', output: 'Review complete. 3 issues found...',
    usage: { inputTokens: 5200, outputTokens: 1200, totalTokens: 6400, cost: 0.168 },
    durationMs: 6200, status: 'success', errorMessage: '', projectId: 'proj-1', taskId: 'task-2',
    autoIssueCreated: false, mcpToolsUsed: ['review_pr'], timestamp: '2026-03-31T09:00:00Z',
  },
  {
    id: 'run-5', agentId: 'agent-4', team: 'team-eng', provider: 'Claude Code',
    providerType: ProviderType.ClaudeCode, model: 'claude-opus-4-6', modelTier: 'opus',
    prompt: 'Scan codebase for hardcoded secrets...', output: 'Found 2 potential issues...',
    usage: { inputTokens: 12000, outputTokens: 800, totalTokens: 12800, cost: 0.24 },
    durationMs: 4500, status: 'success', errorMessage: '', projectId: 'proj-1', taskId: '',
    autoIssueCreated: false, mcpToolsUsed: ['query'], timestamp: '2026-03-31T10:00:00Z',
  },
];

interface AuditStore {
  entries: AuditEntry[];
  runs: RunRecord[];
  searchQuery: string;
  filterAction: string;
  filterActor: string;
  selectedRunId: string | null;
  setSearchQuery: (q: string) => void;
  setFilterAction: (a: string) => void;
  setFilterActor: (a: string) => void;
  setSelectedRun: (id: string | null) => void;
  getFilteredEntries: () => AuditEntry[];
  getRunById: (id: string) => RunRecord | undefined;
}

export const useAuditStore = create<AuditStore>((set, get) => ({
  entries: MOCK_AUDIT,
  runs: MOCK_RUNS,
  searchQuery: '',
  filterAction: 'all',
  filterActor: 'all',
  selectedRunId: null,
  setSearchQuery: (q) => set({ searchQuery: q }),
  setFilterAction: (a) => set({ filterAction: a }),
  setFilterActor: (a) => set({ filterActor: a }),
  setSelectedRun: (id) => set({ selectedRunId: id }),
  getFilteredEntries: () => {
    const { entries, searchQuery, filterAction, filterActor } = get();
    let result = [...entries];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          e.action.toLowerCase().includes(q) ||
          e.actor.toLowerCase().includes(q) ||
          e.target.toLowerCase().includes(q) ||
          e.details.toLowerCase().includes(q)
      );
    }
    if (filterAction !== 'all') result = result.filter((e) => e.action.startsWith(filterAction));
    if (filterActor !== 'all') result = result.filter((e) => e.actor === filterActor);
    return result;
  },
  getRunById: (id) => get().runs.find((r) => r.id === id),
}));
