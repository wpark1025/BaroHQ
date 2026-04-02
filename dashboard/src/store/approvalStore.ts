import { create } from 'zustand';
import { Approval, ApprovalStatus } from '@/lib/types';

const MOCK_APPROVALS: Approval[] = [
  {
    id: 'appr-1', action: 'deploy.production', description: 'Deploy v2.2.0 to production',
    requester: 'agent-1', approver: '', status: ApprovalStatus.Pending,
    context: { type: 'deployment', resourceId: 'deploy-v2.2.0', environment: 'production', changes: 14 },
    options: [
      { label: 'Approve', value: 'approve' },
      { label: 'Approve with conditions', value: 'approve_conditional' },
      { label: 'Reject', value: 'reject', destructive: true },
    ],
    createdAt: '2026-04-01T10:00:00Z', resolvedAt: '', resolvedBy: '', comment: '',
  },
  {
    id: 'appr-2', action: 'budget.override', description: 'Override budget limit for Security Audit project',
    requester: 'agent-4', approver: '', status: ApprovalStatus.Pending,
    context: { type: 'budget', resourceId: 'proj-4', currentSpend: 5650, limit: 5000, requestedLimit: 7500 },
    options: [
      { label: 'Approve override', value: 'approve' },
      { label: 'Reject', value: 'reject', destructive: true },
    ],
    createdAt: '2026-03-31T16:00:00Z', resolvedAt: '', resolvedBy: '', comment: '',
  },
  {
    id: 'appr-3', action: 'rule.override', description: 'Override "Code Review Required" for hotfix PR #145',
    requester: 'agent-2', approver: '', status: ApprovalStatus.Pending,
    context: { type: 'governance', resourceId: 'rule-1', pr: '#145', reason: 'Critical hotfix for auth bug' },
    options: [
      { label: 'Allow override', value: 'approve' },
      { label: 'Deny', value: 'reject', destructive: true },
    ],
    createdAt: '2026-04-01T08:00:00Z', resolvedAt: '', resolvedBy: '', comment: '',
  },
  {
    id: 'appr-4', action: 'deploy.production', description: 'Deploy v2.1.0 to production',
    requester: 'agent-1', approver: 'agent-ceo', status: ApprovalStatus.Approved,
    context: { type: 'deployment', resourceId: 'deploy-v2.1.0', environment: 'production', changes: 8 },
    options: [],
    createdAt: '2026-03-29T09:00:00Z', resolvedAt: '2026-03-29T11:00:00Z', resolvedBy: 'agent-ceo',
    comment: 'Looks good. Proceed with deployment.',
  },
  {
    id: 'appr-5', action: 'agent.create', description: 'Create new QA agent for team-eng',
    requester: 'agent-1', approver: 'agent-ceo', status: ApprovalStatus.Rejected,
    context: { type: 'agent', resourceId: 'new-qa-agent', team: 'team-eng', reason: 'Need automated testing' },
    options: [],
    createdAt: '2026-03-25T14:00:00Z', resolvedAt: '2026-03-26T09:00:00Z', resolvedBy: 'agent-ceo',
    comment: 'Budget constraints. Revisit next quarter.',
  },
];

interface ApprovalStore {
  approvals: Approval[];
  selectedApprovalId: string | null;
  filterStatus: ApprovalStatus | 'all';
  filterAction: string;
  filterRequester: string;
  setSelectedApproval: (id: string | null) => void;
  setFilterStatus: (s: ApprovalStatus | 'all') => void;
  setFilterAction: (a: string) => void;
  setFilterRequester: (r: string) => void;
  resolveApproval: (id: string, decision: 'approved' | 'rejected', comment: string) => void;
  batchResolve: (ids: string[], decision: 'approved' | 'rejected', comment: string) => void;
  getPendingCount: () => number;
  getFilteredApprovals: () => Approval[];
  getApprovalById: (id: string) => Approval | undefined;
}

export const useApprovalStore = create<ApprovalStore>((set, get) => ({
  approvals: MOCK_APPROVALS,
  selectedApprovalId: null,
  filterStatus: 'all',
  filterAction: 'all',
  filterRequester: 'all',
  setSelectedApproval: (id) => set({ selectedApprovalId: id }),
  setFilterStatus: (s) => set({ filterStatus: s }),
  setFilterAction: (a) => set({ filterAction: a }),
  setFilterRequester: (r) => set({ filterRequester: r }),
  resolveApproval: (id, decision, comment) =>
    set((state) => ({
      approvals: state.approvals.map((a) =>
        a.id === id
          ? {
              ...a,
              status: decision === 'approved' ? ApprovalStatus.Approved : ApprovalStatus.Rejected,
              resolvedAt: new Date().toISOString(),
              resolvedBy: 'current-user',
              comment,
            }
          : a
      ),
    })),
  batchResolve: (ids, decision, comment) =>
    set((state) => ({
      approvals: state.approvals.map((a) =>
        ids.includes(a.id) && a.status === ApprovalStatus.Pending
          ? {
              ...a,
              status: decision === 'approved' ? ApprovalStatus.Approved : ApprovalStatus.Rejected,
              resolvedAt: new Date().toISOString(),
              resolvedBy: 'current-user',
              comment,
            }
          : a
      ),
    })),
  getPendingCount: () => get().approvals.filter((a) => a.status === ApprovalStatus.Pending).length,
  getFilteredApprovals: () => {
    const { approvals, filterStatus, filterAction, filterRequester } = get();
    let result = [...approvals];
    if (filterStatus !== 'all') result = result.filter((a) => a.status === filterStatus);
    if (filterAction !== 'all') result = result.filter((a) => a.action.startsWith(filterAction));
    if (filterRequester !== 'all') result = result.filter((a) => a.requester === filterRequester);
    return result;
  },
  getApprovalById: (id) => get().approvals.find((a) => a.id === id),
}));
