'use client';

import { useState } from 'react';
import { X, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { useMcpStore } from '@/store/useMcpStore';
import { McpConnectionStatus, McpPreset } from '@/lib/types';
import { McpPresetGallery } from '@/components/mcp/McpPresetGallery';
import { McpTestPanel } from '@/components/mcp/McpTestPanel';

interface AddMcpModalProps {
  onClose: () => void;
}

export function AddMcpModal({ onClose }: AddMcpModalProps) {
  const addConnection = useMcpStore((s) => s.addConnection);
  const [mode, setMode] = useState<'preset' | 'custom'>('preset');
  const [selectedPreset, setSelectedPreset] = useState<McpPreset | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [transport, setTransport] = useState<'sse' | 'stdio' | 'streamable-http'>('sse');
  const [url, setUrl] = useState('');
  const [command, setCommand] = useState('');
  const [authType, setAuthType] = useState<'none' | 'api_key' | 'oauth'>('none');
  const [authToken, setAuthToken] = useState('');
  const [scope, setScope] = useState<'global' | 'team' | 'agent'>('global');

  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'idle' | 'success' | 'error'>('idle');

  const handlePresetSelect = (preset: McpPreset) => {
    setSelectedPreset(preset);
    setName(preset.name);
    setDescription(preset.description);
    setTransport(preset.defaultTransport);
    setUrl(preset.defaultUrl);
    setAuthType(preset.authType === 'api_key' ? 'api_key' : preset.authType === 'oauth' ? 'oauth' : 'none');
    setMode('custom');
  };

  const handleTest = () => {
    setTesting(true);
    setTimeout(() => {
      setTesting(false);
      setTestResult(url || command ? 'success' : 'error');
    }, 1200);
  };

  const handleSubmit = () => {
    if (!name) return;
    addConnection({
      id: `mcp-${Date.now()}`,
      preset: selectedPreset?.id || '',
      name,
      description,
      status: McpConnectionStatus.Connected,
      transport,
      config: transport === 'stdio' ? { command, args: [] } : { url },
      tools: [],
      scope,
      lastHealthCheck: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <h2 className="text-lg font-semibold text-slate-100">Add MCP Connection</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200"><X size={18} /></button>
        </div>

        <div className="p-5 space-y-5">
          {/* Mode tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setMode('preset')}
              className={`px-3 py-1.5 text-sm rounded transition-colors ${
                mode === 'preset' ? 'bg-slate-800 text-slate-200' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Presets
            </button>
            <button
              onClick={() => setMode('custom')}
              className={`px-3 py-1.5 text-sm rounded transition-colors ${
                mode === 'custom' ? 'bg-slate-800 text-slate-200' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Custom
            </button>
          </div>

          {mode === 'preset' && (
            <McpPresetGallery onSelect={handlePresetSelect} />
          )}

          {mode === 'custom' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Transport</label>
                  <select
                    value={transport}
                    onChange={(e) => setTransport(e.target.value as typeof transport)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="sse">SSE</option>
                    <option value="stdio">Stdio</option>
                    <option value="streamable-http">Streamable HTTP</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              {transport !== 'stdio' ? (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">URL</label>
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://mcp.example.com/sse"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Command</label>
                  <input
                    type="text"
                    value={command}
                    onChange={(e) => setCommand(e.target.value)}
                    placeholder="node mcp-server.js"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Auth Type</label>
                  <select
                    value={authType}
                    onChange={(e) => setAuthType(e.target.value as typeof authType)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="none">None</option>
                    <option value="api_key">API Key</option>
                    <option value="oauth">OAuth</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Scope</label>
                  <select
                    value={scope}
                    onChange={(e) => setScope(e.target.value as typeof scope)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="global">Global</option>
                    <option value="team">Team</option>
                    <option value="agent">Agent</option>
                  </select>
                </div>
              </div>

              {authType !== 'none' && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    {authType === 'api_key' ? 'API Key' : 'OAuth Token'}
                  </label>
                  <input
                    type="password"
                    value={authToken}
                    onChange={(e) => setAuthToken(e.target.value)}
                    placeholder={authType === 'api_key' ? 'Your API key' : 'OAuth token'}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                  {selectedPreset?.authInstructions && (
                    <p className="text-xs text-slate-500 mt-1">{selectedPreset.authInstructions}</p>
                  )}
                </div>
              )}

              {/* Test */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleTest}
                  disabled={testing}
                  className="flex items-center gap-2 px-3 py-1.5 border border-slate-700 text-slate-300 hover:border-slate-600 text-sm rounded transition-colors disabled:opacity-50"
                >
                  {testing && <Loader2 size={14} className="animate-spin" />}
                  Test Connection
                </button>
                {testResult === 'success' && (
                  <span className="flex items-center gap-1 text-xs text-green-400"><CheckCircle size={12} /> Connected</span>
                )}
                {testResult === 'error' && (
                  <span className="flex items-center gap-1 text-xs text-red-400"><AlertTriangle size={12} /> Failed</span>
                )}
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 p-5 border-t border-slate-800">
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200">Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={!name || mode === 'preset'}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white text-sm font-medium rounded transition-colors"
          >
            Add Connection
          </button>
        </div>
      </div>
    </div>
  );
}
