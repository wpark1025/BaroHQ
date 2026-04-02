'use client';

import { useProviderStore } from '@/store/useProviderStore';
import { ProviderStatus } from '@/lib/types';

const STATUS_CONFIG: Record<
  ProviderStatus,
  { color: string; label: string }
> = {
  [ProviderStatus.Active]: { color: 'bg-emerald-500', label: 'Active' },
  [ProviderStatus.Degraded]: { color: 'bg-amber-500', label: 'Degraded' },
  [ProviderStatus.Down]: { color: 'bg-red-500', label: 'Down' },
  [ProviderStatus.Disabled]: { color: 'bg-slate-600', label: 'Disabled' },
};

export default function AdapterStatus() {
  const { providers, healthStatus } = useProviderStore();

  // Use demo data if no providers configured
  const statusItems =
    providers.length > 0
      ? providers
          .filter((p) => p.enabled)
          .map((p) => ({
            id: p.id,
            name: p.name,
            status: healthStatus[p.id] || p.status,
          }))
      : [
          { id: 'claude', name: 'Claude', status: ProviderStatus.Active },
          { id: 'openai', name: 'OpenAI', status: ProviderStatus.Active },
          { id: 'gemini', name: 'Gemini', status: ProviderStatus.Degraded },
        ];

  return (
    <div className="flex items-center gap-1" title="Provider Health">
      {statusItems.map((item) => {
        const config = STATUS_CONFIG[item.status];
        return (
          <div
            key={item.id}
            title={`${item.name}: ${config.label}`}
            className={`w-2 h-2 rounded-full ${config.color} ${
              item.status === ProviderStatus.Active
                ? ''
                : item.status === ProviderStatus.Degraded
                ? 'animate-pulse-dot'
                : ''
            }`}
          />
        );
      })}
    </div>
  );
}
