import { create } from 'zustand';
import { Provider, ProviderType, ProviderStatus } from '@/lib/types';

const MOCK_PROVIDERS: Provider[] = [
  {
    id: 'prov-1', type: ProviderType.ClaudeCode, name: 'Claude Code (Primary)',
    enabled: true, priority: 1, status: ProviderStatus.Active,
    config: { baseUrl: 'https://api.anthropic.com', maxConcurrent: 10, timeout: 120000 },
    modelMapping: { opus: 'claude-opus-4-6', sonnet: 'claude-sonnet-4-20250514', haiku: 'claude-haiku-3-5-20241022' },
    pricing: { inputPer1k: 0.015, outputPer1k: 0.075, currency: 'USD' },
    lastHealthCheck: '2026-04-01T12:00:00Z', createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'prov-2', type: ProviderType.ClaudeAPI, name: 'Claude API (Backup)',
    enabled: true, priority: 2, status: ProviderStatus.Active,
    config: { baseUrl: 'https://api.anthropic.com', maxConcurrent: 5, timeout: 60000 },
    modelMapping: { opus: 'claude-opus-4-6', sonnet: 'claude-sonnet-4-20250514' },
    pricing: { inputPer1k: 0.015, outputPer1k: 0.075, currency: 'USD' },
    lastHealthCheck: '2026-04-01T12:00:00Z', createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'prov-3', type: ProviderType.OpenAI, name: 'OpenAI',
    enabled: false, priority: 3, status: ProviderStatus.Disabled,
    config: { baseUrl: 'https://api.openai.com/v1', maxConcurrent: 5, timeout: 60000 },
    modelMapping: { opus: 'gpt-4o', sonnet: 'gpt-4o-mini', haiku: 'gpt-4o-mini' },
    pricing: { inputPer1k: 0.005, outputPer1k: 0.015, currency: 'USD' },
    lastHealthCheck: '2026-03-20T12:00:00Z', createdAt: '2026-01-15T00:00:00Z',
  },
  {
    id: 'prov-4', type: ProviderType.Gemini, name: 'Gemini',
    enabled: true, priority: 4, status: ProviderStatus.Degraded,
    config: { baseUrl: 'https://generativelanguage.googleapis.com', maxConcurrent: 3, timeout: 90000 },
    modelMapping: { opus: 'gemini-2.5-pro', sonnet: 'gemini-2.5-flash' },
    pricing: { inputPer1k: 0.007, outputPer1k: 0.021, currency: 'USD' },
    lastHealthCheck: '2026-04-01T11:55:00Z', createdAt: '2026-02-01T00:00:00Z',
  },
];

interface ProviderStore {
  providers: Provider[];
  selectedProviderId: string | null;
  testResult: { status: 'idle' | 'testing' | 'success' | 'error'; latency?: number; response?: string; error?: string };
  setSelectedProvider: (id: string | null) => void;
  addProvider: (p: Provider) => void;
  updateProvider: (id: string, updates: Partial<Provider>) => void;
  removeProvider: (id: string) => void;
  toggleProvider: (id: string) => void;
  setTestResult: (r: ProviderStore['testResult']) => void;
  getProviderById: (id: string) => Provider | undefined;
}

export const useProviderStore = create<ProviderStore>((set, get) => ({
  providers: MOCK_PROVIDERS,
  selectedProviderId: null,
  testResult: { status: 'idle' },
  setSelectedProvider: (id) => set({ selectedProviderId: id }),
  addProvider: (p) => set((state) => ({ providers: [...state.providers, p] })),
  updateProvider: (id, updates) =>
    set((state) => ({
      providers: state.providers.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    })),
  removeProvider: (id) => set((state) => ({ providers: state.providers.filter((p) => p.id !== id) })),
  toggleProvider: (id) =>
    set((state) => ({
      providers: state.providers.map((p) =>
        p.id === id ? { ...p, enabled: !p.enabled, status: !p.enabled ? ProviderStatus.Active : ProviderStatus.Disabled } : p
      ),
    })),
  setTestResult: (r) => set({ testResult: r }),
  getProviderById: (id) => get().providers.find((p) => p.id === id),
}));
