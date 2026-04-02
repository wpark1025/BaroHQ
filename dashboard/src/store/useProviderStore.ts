import { create } from 'zustand';
import type { Provider } from '@/lib/types';
import { ProviderStatus } from '@/lib/types';

interface RoutingConfig {
  strategy: 'priority' | 'round_robin' | 'cost_optimized' | 'latency';
  fallbackEnabled: boolean;
  fallbackOrder: string[];
  maxRetries: number;
}

interface ProviderStore {
  providers: Provider[];
  routing: RoutingConfig;
  healthStatus: Record<string, ProviderStatus>;

  setProviders: (providers: Provider[]) => void;
  addProvider: (provider: Provider) => void;
  updateProvider: (id: string, updates: Partial<Provider>) => void;
  removeProvider: (id: string) => void;
  toggleProvider: (id: string) => void;
  setRouting: (routing: Partial<RoutingConfig>) => void;
  setHealthStatus: (providerId: string, status: ProviderStatus) => void;
  testProvider: (id: string) => Promise<boolean>;
  setFallbackOrder: (order: string[]) => void;

  getEnabledProviders: () => Provider[];
  getProviderById: (id: string) => Provider | undefined;
}

export const useProviderStore = create<ProviderStore>((set, get) => ({
  providers: [],
  routing: {
    strategy: 'priority',
    fallbackEnabled: true,
    fallbackOrder: [],
    maxRetries: 2,
  },
  healthStatus: {},

  setProviders: (providers) => set({ providers }),

  addProvider: (provider) =>
    set((state) => ({ providers: [...state.providers, provider] })),

  updateProvider: (id, updates) =>
    set((state) => ({
      providers: state.providers.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    })),

  removeProvider: (id) =>
    set((state) => ({
      providers: state.providers.filter((p) => p.id !== id),
    })),

  toggleProvider: (id) =>
    set((state) => ({
      providers: state.providers.map((p) =>
        p.id === id ? { ...p, enabled: !p.enabled } : p
      ),
    })),

  setRouting: (routing) =>
    set((state) => ({
      routing: { ...state.routing, ...routing },
    })),

  setHealthStatus: (providerId, status) =>
    set((state) => ({
      healthStatus: { ...state.healthStatus, [providerId]: status },
    })),

  testProvider: async (id) => {
    const provider = get().providers.find((p) => p.id === id);
    if (!provider) return false;

    try {
      const response = await fetch(`/api/providers/${id}/test`, {
        method: 'POST',
      });
      const result = await response.json();
      const status = result.success ? ProviderStatus.Active : ProviderStatus.Down;
      set((state) => ({
        healthStatus: { ...state.healthStatus, [id]: status },
        providers: state.providers.map((p) =>
          p.id === id
            ? { ...p, status, lastHealthCheck: new Date().toISOString() }
            : p
        ),
      }));
      return result.success;
    } catch {
      set((state) => ({
        healthStatus: { ...state.healthStatus, [id]: ProviderStatus.Down },
      }));
      return false;
    }
  },

  setFallbackOrder: (order) =>
    set((state) => ({
      routing: { ...state.routing, fallbackOrder: order },
    })),

  getEnabledProviders: () => get().providers.filter((p) => p.enabled),

  getProviderById: (id) => get().providers.find((p) => p.id === id),
}));
