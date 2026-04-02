'use client';

import { useState } from 'react';
import { X, Send, Loader2, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { useProviderStore } from '@/store/providerStore';

interface ProviderTestPanelProps {
  providerId: string;
  onClose: () => void;
}

export function ProviderTestPanel({ providerId, onClose }: ProviderTestPanelProps) {
  const provider = useProviderStore((s) => s.getProviderById(providerId));
  const [prompt, setPrompt] = useState('Hello! Please respond with a short greeting.');
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<{
    status: 'idle' | 'success' | 'error';
    latency?: number;
    response?: string;
    error?: string;
  }>({ status: 'idle' });

  if (!provider) return null;

  const handleTest = () => {
    setTesting(true);
    setResult({ status: 'idle' });
    const startTime = Date.now();
    setTimeout(() => {
      const latency = Date.now() - startTime;
      if (provider.enabled) {
        setResult({
          status: 'success',
          latency,
          response: `Hello! I'm responding via ${provider.name}. This is a simulated test response to verify connectivity.`,
        });
      } else {
        setResult({
          status: 'error',
          latency,
          error: `Provider "${provider.name}" is currently disabled. Enable it to test connectivity.`,
        });
      }
      setTesting(false);
    }, 800 + Math.random() * 1200);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-lg w-full max-w-lg">
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <h2 className="text-lg font-semibold text-slate-100">Test: {provider.name}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200"><X size={18} /></button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Test Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          <button
            onClick={handleTest}
            disabled={testing || !prompt.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white text-sm font-medium rounded transition-colors"
          >
            {testing ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            {testing ? 'Testing...' : 'Send Test'}
          </button>

          {/* Result */}
          {result.status !== 'idle' && (
            <div className={`rounded-lg border p-4 animate-fade-in ${
              result.status === 'success'
                ? 'bg-green-500/5 border-green-500/20'
                : 'bg-red-500/5 border-red-500/20'
            }`}>
              <div className="flex items-center gap-3 mb-3">
                {result.status === 'success' ? (
                  <CheckCircle size={16} className="text-green-400" />
                ) : (
                  <AlertTriangle size={16} className="text-red-400" />
                )}
                <span className={`text-sm font-medium ${
                  result.status === 'success' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {result.status === 'success' ? 'Connection Successful' : 'Connection Failed'}
                </span>
                {result.latency && (
                  <span className="flex items-center gap-1 text-xs text-slate-500 ml-auto">
                    <Clock size={10} />
                    {result.latency}ms
                  </span>
                )}
              </div>
              {result.response && (
                <div className="bg-slate-800/50 rounded p-3">
                  <p className="text-xs text-slate-500 mb-1">Response:</p>
                  <p className="text-sm text-slate-300">{result.response}</p>
                </div>
              )}
              {result.error && (
                <p className="text-sm text-red-300">{result.error}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
