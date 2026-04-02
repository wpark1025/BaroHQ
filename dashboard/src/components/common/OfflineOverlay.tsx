'use client';

import { useState, useEffect } from 'react';
import { WifiOff, Loader2 } from 'lucide-react';

export default function OfflineOverlay() {
  const [retryCount, setRetryCount] = useState(0);
  const [dots, setDots] = useState('');

  useEffect(() => {
    const dotInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);

    const retryInterval = setInterval(() => {
      setRetryCount((prev) => prev + 1);
    }, 5000);

    return () => {
      clearInterval(dotInterval);
      clearInterval(retryInterval);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-[100] flex items-center justify-center">
      <div className="text-center space-y-4 max-w-sm">
        <div className="w-16 h-16 bg-slate-800 rounded-lg flex items-center justify-center mx-auto">
          <WifiOff className="w-8 h-8 text-slate-500" />
        </div>

        <div>
          <h2 className="text-lg font-bold text-slate-200">
            Connection Lost
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Unable to connect to the BaroHQ bridge server.
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 text-slate-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">
            Reconnecting{dots}
          </span>
        </div>

        <p className="text-[11px] text-slate-600">
          Attempt {retryCount + 1} - Make sure the bridge is running on port
          3001
        </p>

        <div className="pt-2">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-sm text-slate-300 transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    </div>
  );
}
