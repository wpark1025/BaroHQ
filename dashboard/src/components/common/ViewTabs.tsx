'use client';

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: number;
}

interface ViewTabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
}

export default function ViewTabs({ tabs, activeTab, onChange }: ViewTabsProps) {
  return (
    <div className="flex items-center gap-0.5 bg-slate-900 rounded-lg p-0.5 w-fit">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all
              ${
                isActive
                  ? 'bg-slate-800 text-slate-100 shadow-sm'
                  : 'text-slate-500 hover:text-slate-300'
              }
            `}
          >
            {tab.icon}
            {tab.label}
            {tab.badge !== undefined && tab.badge > 0 && (
              <span className="min-w-[16px] h-4 bg-blue-600 rounded-full text-[9px] text-white font-bold flex items-center justify-center px-1">
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
