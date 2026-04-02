import { create } from 'zustand';
import { Approval, ApprovalStatus } from '@/lib/types';

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
  approvals: [],
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
