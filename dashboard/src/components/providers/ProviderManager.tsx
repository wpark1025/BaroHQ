'use client';

import { useState } from 'react';
import { Plus, Activity, AlertTriangle, CheckCircle } from 'lucide-react';
import { useProviderStore } from '@/store/providerStore';
import { ProviderCard } from '@/components/providers/ProviderCard';
import { AddProviderModal } from '@/components/providers/AddProviderModal';
import { ProviderTestPanel } from '@/components/providers/ProviderTestPanel';
import { ProviderStatus } from '@/lib/types';

export function ProviderManager() {
  const providers = useProviderStore((s) => s.providers);
  const [showAdd, setShowAdd] = useState(false);
  const [testProviderId, setTestProviderId] = useState<string | null>(null);

  const activeCount = providers.filter((p) => p.status === ProviderStatus.Active).length;
  const degradedCount = providers.filter((p) => p.status === ProviderStatus.Degraded).length;
  const downCount = providers.filter((p) => p.status === ProviderStatus.Down).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-200">Providers</h2>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded transition-colors"
        >
          <Plus size={14} />
          Add Provider
        </button>
      </div>

      {/* Health overview */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <Activity size={14} className="text-slate-400" />
            <span className="text-xs text-slate-500">Total</span>
          </div>
          <p className="text-xl font-bold text-slate-100">{providers.length}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle size={14} className="text-green-400" />
            <span className="text-xs text-slate-500">Active</span>
          </div>
          <p className="text-xl font-bold text-green-400">{activeCount}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle size={14} className="text-yellow-400" />
            <span className="text-xs text-slate-500">Degraded</span>
          </div>
          <p className="text-xl font-bold text-yellow-400">{degradedCount}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle size={14} className="text-red-400" />
            <span className="text-xs text-slate-500">Down</span>
          </div>
          <p className="text-xl font-bold text-red-400">{downCount}</p>
        </div>
      </div>

      {/* Provider cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {providers.map((provider) => (
          <ProviderCard
            key={provider.id}
            provider={provider}
            onTest={() => setTestProviderId(provider.id)}
          />
        ))}
      </div>

      {showAdd && <AddProviderModal onClose={() => setShowAdd(false)} />}
      {testProviderId && (
        <ProviderTestPanel
          providerId={testProviderId}
          onClose={() => setTestProviderId(null)}
        />
      )}
    </div>
  );
}
