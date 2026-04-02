'use client';

import { useState } from 'react';
import { BookOpen, Search, Upload, FileText, Code, Image, File } from 'lucide-react';

interface LibraryItem {
  id: string;
  name: string;
  type: 'document' | 'template' | 'snippet' | 'asset';
  sourceTeam: string;
  updatedAt: string;
  description: string;
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  document: <FileText className="w-3.5 h-3.5 text-blue-400" />,
  template: <Code className="w-3.5 h-3.5 text-emerald-400" />,
  snippet: <Code className="w-3.5 h-3.5 text-purple-400" />,
  asset: <Image className="w-3.5 h-3.5 text-amber-400" />,
};

const DEMO_ITEMS: LibraryItem[] = [
  {
    id: '1',
    name: 'API Design Guidelines',
    type: 'document',
    sourceTeam: 'Engineering',
    updatedAt: '2 hours ago',
    description: 'Standard API design patterns and conventions.',
  },
  {
    id: '2',
    name: 'React Component Template',
    type: 'template',
    sourceTeam: 'Engineering',
    updatedAt: '1 day ago',
    description: 'Base template for new React components with tests.',
  },
  {
    id: '3',
    name: 'Error Handling Snippet',
    type: 'snippet',
    sourceTeam: 'Engineering',
    updatedAt: '3 days ago',
    description: 'Standard error handling pattern for API routes.',
  },
  {
    id: '4',
    name: 'Brand Color Palette',
    type: 'asset',
    sourceTeam: 'Design',
    updatedAt: '1 week ago',
    description: 'Official brand colors with hex and HSL values.',
  },
];

export default function LibraryView() {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const filteredItems = DEMO_ITEMS.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'all' || item.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg font-bold text-slate-100">Shared Library</h2>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-sm transition-colors">
          <Upload className="w-3 h-3" />
          Publish
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search library..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex gap-1">
          {['all', 'document', 'template', 'snippet', 'asset'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors capitalize ${
                filterType === type
                  ? 'bg-slate-800 text-slate-200'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Items List */}
      <div className="space-y-2">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="flex items-start gap-3 p-3 bg-slate-900/50 border border-slate-800 rounded-lg hover:bg-slate-800/50 cursor-pointer transition-colors"
          >
            <div className="mt-0.5">
              {TYPE_ICONS[item.type] || (
                <File className="w-3.5 h-3.5 text-slate-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200">{item.name}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {item.description}
              </p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[10px] bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded capitalize">
                  {item.type}
                </span>
                <span className="text-[10px] text-slate-600">
                  {item.sourceTeam}
                </span>
                <span className="text-[10px] text-slate-700">
                  {item.updatedAt}
                </span>
              </div>
            </div>
          </div>
        ))}

        {filteredItems.length === 0 && (
          <div className="p-8 text-center text-sm text-slate-600">
            No items found.
          </div>
        )}
      </div>
    </div>
  );
}
