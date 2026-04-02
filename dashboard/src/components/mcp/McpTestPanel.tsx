'use client';

import { useState } from 'react';
import { Loader2, CheckCircle, AlertTriangle, Wrench } from 'lucide-react';

interface McpTestPanelProps {
  connectionId: string;
  connectionName: string;
  onClose?: () => void;
}

export function McpTestPanel({ connectionId, connectionName }: McpTestPanelProps) {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<{
    status: 'idle' | 'success' | 'error';
    tools?: string[];
    latencyMs?: number;
    error?: string;
  }>({ status: 'idle' });

  const handleTest = async () => {
    setTesting(true);
    setResult({ status: 'idle' });
    const startTime = Date.now();

    try {
      const response = await fetch(`/api/mcp/${connectionId}/discover`, {
        method: 'POST',
      });
      const latencyMs = Date.now() - startTime;

      if (response.ok) {
        const data = await response.json();
        setResult({
          status: 'success',
          tools: data.tools || [],
          latencyMs,
        });
      } else {
        setResult({
          status: 'error',
          latencyMs,
          error: `Discovery failed with status ${response.status}.`,
        });
      }
    } catch {
      setResult({
        status: 'error',
        error: 'Bridge not connected — unable to discover tools. Start the bridge server first.',
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-slate-200 mb-3">
        Test Connection: {connectionName}
      </h3>

      <button
        onClick={handleTest}
        disabled={testing}
        className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white text-xs rounded transition-colors"
      >
        {testing ? <Loader2 size={12} className="animate-spin" /> : <Wrench size={12} />}
        {testing ? 'Discovering...' : 'Run Discovery'}
      </button>

      {result.status !== 'idle' && (
        <div className={`mt-4 p-3 rounded border animate-fade-in ${
          result.status === 'success'
            ? 'bg-green-500/5 border-green-500/20'
            : 'bg-red-500/5 border-red-500/20'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            {result.status === 'success' ? (
              <CheckCircle size={14} className="text-green-400" />
            ) : (
              <AlertTriangle size={14} className="text-red-400" />
            )}
            <span className={`text-xs font-medium ${
              result.status === 'success' ? 'text-green-400' : 'text-red-400'
            }`}>
              {result.status === 'success' ? 'Discovery Successful' : 'Discovery Failed'}
            </span>
            {result.latencyMs && (
              <span className="text-[10px] text-slate-500 ml-auto">{result.latencyMs}ms</span>
            )}
          </div>

          {result.tools && (
            <div className="space-y-1">
              <p className="text-[10px] text-slate-500">Discovered tools:</p>
              {result.tools.map((tool) => (
                <div key={tool} className="flex items-center gap-2 p-1.5 bg-slate-800/50 rounded">
                  <Wrench size={10} className="text-slate-400" />
                  <span className="text-xs text-slate-300 font-mono">{tool}</span>
                </div>
              ))}
            </div>
          )}

          {result.error && (
            <p className="text-xs text-red-300">{result.error}</p>
          )}
        </div>
      )}
    </div>
  );
}
