import { ProviderType } from './types';

// ============================================================
// Waypoint Graph for Office Pathfinding
// ============================================================

export interface WaypointNode {
  id: string;
  x: number;
  y: number;
  label: string;
}

export interface WaypointEdge {
  from: string;
  to: string;
}

export const NODE_POSITIONS: WaypointNode[] = [
  // Entrance & Hallway
  { id: 'entrance', x: 400, y: 580, label: 'Entrance' },
  { id: 'hallway_1', x: 400, y: 500, label: 'Hallway Near Entrance' },
  { id: 'hallway_2', x: 400, y: 400, label: 'Main Hallway' },
  { id: 'hallway_3', x: 400, y: 300, label: 'Upper Hallway' },
  { id: 'hallway_4', x: 400, y: 200, label: 'Top Hallway' },
  { id: 'hallway_left', x: 200, y: 400, label: 'Left Corridor' },
  { id: 'hallway_right', x: 600, y: 400, label: 'Right Corridor' },

  // Desk Positions (left side)
  { id: 'desk_1', x: 100, y: 300, label: 'Desk 1' },
  { id: 'desk_2', x: 100, y: 400, label: 'Desk 2' },
  { id: 'desk_3', x: 100, y: 500, label: 'Desk 3' },
  { id: 'desk_4', x: 200, y: 300, label: 'Desk 4' },

  // Desk Positions (right side)
  { id: 'desk_5', x: 600, y: 300, label: 'Desk 5' },
  { id: 'desk_6', x: 700, y: 300, label: 'Desk 6' },
  { id: 'desk_7', x: 600, y: 500, label: 'Desk 7' },
  { id: 'desk_8', x: 700, y: 500, label: 'Desk 8' },

  // Meeting Room
  { id: 'meeting_door', x: 600, y: 200, label: 'Meeting Room Door' },
  { id: 'meeting_center', x: 700, y: 150, label: 'Meeting Room' },
  { id: 'meeting_seat_1', x: 660, y: 120, label: 'Meeting Seat 1' },
  { id: 'meeting_seat_2', x: 740, y: 120, label: 'Meeting Seat 2' },
  { id: 'meeting_seat_3', x: 660, y: 180, label: 'Meeting Seat 3' },
  { id: 'meeting_seat_4', x: 740, y: 180, label: 'Meeting Seat 4' },

  // CEO Suite (top-left corner)
  { id: 'ceo_door', x: 200, y: 200, label: 'CEO Suite Door' },
  { id: 'ceo_desk', x: 100, y: 120, label: 'CEO Desk' },
  { id: 'ceo_couch', x: 180, y: 120, label: 'CEO Couch' },

  // Coffee Machine
  { id: 'coffee_machine', x: 300, y: 500, label: 'Coffee Machine' },

  // Restroom
  { id: 'restroom_door', x: 200, y: 580, label: 'Restroom' },

  // Whiteboard area
  { id: 'whiteboard', x: 500, y: 200, label: 'Whiteboard' },
];

export const EDGES: WaypointEdge[] = [
  // Main hallway spine
  { from: 'entrance', to: 'hallway_1' },
  { from: 'hallway_1', to: 'hallway_2' },
  { from: 'hallway_2', to: 'hallway_3' },
  { from: 'hallway_3', to: 'hallway_4' },

  // Horizontal corridors
  { from: 'hallway_2', to: 'hallway_left' },
  { from: 'hallway_2', to: 'hallway_right' },

  // Left desks
  { from: 'hallway_left', to: 'desk_1' },
  { from: 'hallway_left', to: 'desk_2' },
  { from: 'hallway_left', to: 'desk_4' },
  { from: 'hallway_1', to: 'desk_3' },

  // Right desks
  { from: 'hallway_right', to: 'desk_5' },
  { from: 'hallway_right', to: 'desk_6' },
  { from: 'hallway_right', to: 'desk_7' },
  { from: 'desk_7', to: 'desk_8' },

  // Meeting room
  { from: 'hallway_right', to: 'meeting_door' },
  { from: 'hallway_4', to: 'meeting_door' },
  { from: 'meeting_door', to: 'meeting_center' },
  { from: 'meeting_center', to: 'meeting_seat_1' },
  { from: 'meeting_center', to: 'meeting_seat_2' },
  { from: 'meeting_center', to: 'meeting_seat_3' },
  { from: 'meeting_center', to: 'meeting_seat_4' },

  // CEO suite
  { from: 'hallway_4', to: 'ceo_door' },
  { from: 'hallway_3', to: 'ceo_door' },
  { from: 'ceo_door', to: 'ceo_desk' },
  { from: 'ceo_door', to: 'ceo_couch' },

  // Coffee machine
  { from: 'hallway_1', to: 'coffee_machine' },

  // Restroom
  { from: 'entrance', to: 'restroom_door' },
  { from: 'hallway_1', to: 'restroom_door' },

  // Whiteboard
  { from: 'hallway_4', to: 'whiteboard' },
  { from: 'hallway_3', to: 'whiteboard' },

  // Cross connections
  { from: 'desk_1', to: 'desk_4' },
  { from: 'desk_5', to: 'desk_6' },
];

// ============================================================
// Team Colors
// ============================================================

export const TEAM_COLORS: Record<string, string> = {
  blue: '#3b82f6',
  purple: '#8b5cf6',
  green: '#22c55e',
  orange: '#f97316',
  pink: '#ec4899',
  cyan: '#06b6d4',
  red: '#ef4444',
  yellow: '#eab308',
  indigo: '#6366f1',
  teal: '#14b8a6',
  emerald: '#10b981',
  rose: '#f43f5e',
};

// ============================================================
// Provider Presets
// ============================================================

export interface ProviderPreset {
  type: ProviderType;
  name: string;
  description: string;
  icon: string;
  color: string;
  models: { tier: string; name: string; inputCost: number; outputCost: number }[];
  requiresApiKey: boolean;
  configFields: { key: string; label: string; type: string; placeholder: string; required: boolean }[];
}

export const PROVIDER_PRESETS: ProviderPreset[] = [
  {
    type: ProviderType.ClaudeCode,
    name: 'Claude Code',
    description: 'Anthropic Claude via Claude Code CLI. Uses local claude binary.',
    icon: '🤖',
    color: '#d97706',
    models: [
      { tier: 'opus', name: 'claude-opus-4', inputCost: 15, outputCost: 75 },
      { tier: 'sonnet', name: 'claude-sonnet-4', inputCost: 3, outputCost: 15 },
      { tier: 'haiku', name: 'claude-haiku-3.5', inputCost: 0.25, outputCost: 1.25 },
    ],
    requiresApiKey: false,
    configFields: [
      { key: 'binaryPath', label: 'Claude Binary Path', type: 'text', placeholder: '/usr/local/bin/claude', required: false },
    ],
  },
  {
    type: ProviderType.GeminiCli,
    name: 'Gemini CLI',
    description: 'Google Gemini via Gemini CLI. Uses local gemini binary.',
    icon: '💎',
    color: '#4285f4',
    models: [
      { tier: 'opus', name: 'gemini-2.5-pro', inputCost: 7, outputCost: 21 },
      { tier: 'sonnet', name: 'gemini-2.5-flash', inputCost: 0.15, outputCost: 0.6 },
      { tier: 'haiku', name: 'gemini-2.0-flash-lite', inputCost: 0.075, outputCost: 0.3 },
    ],
    requiresApiKey: false,
    configFields: [
      { key: 'binaryPath', label: 'Gemini Binary Path', type: 'text', placeholder: '/usr/local/bin/gemini', required: false },
    ],
  },
  {
    type: ProviderType.ClaudeAPI,
    name: 'Claude API',
    description: 'Direct Anthropic API access for Claude models.',
    icon: '🧠',
    color: '#d97706',
    models: [
      { tier: 'opus', name: 'claude-opus-4', inputCost: 15, outputCost: 75 },
      { tier: 'sonnet', name: 'claude-sonnet-4', inputCost: 3, outputCost: 15 },
      { tier: 'haiku', name: 'claude-haiku-3.5', inputCost: 0.25, outputCost: 1.25 },
    ],
    requiresApiKey: true,
    configFields: [
      { key: 'apiKey', label: 'API Key', type: 'password', placeholder: 'sk-ant-...', required: true },
      { key: 'baseUrl', label: 'Base URL (optional)', type: 'text', placeholder: 'https://api.anthropic.com', required: false },
    ],
  },
  {
    type: ProviderType.Gemini,
    name: 'Google Gemini',
    description: 'Google Gemini models via the Gemini API.',
    icon: '💎',
    color: '#4285f4',
    models: [
      { tier: 'opus', name: 'gemini-2.5-pro', inputCost: 7, outputCost: 21 },
      { tier: 'sonnet', name: 'gemini-2.5-flash', inputCost: 0.15, outputCost: 0.6 },
      { tier: 'haiku', name: 'gemini-2.0-flash-lite', inputCost: 0.075, outputCost: 0.3 },
    ],
    requiresApiKey: true,
    configFields: [
      { key: 'apiKey', label: 'API Key', type: 'password', placeholder: 'AIza...', required: true },
    ],
  },
  {
    type: ProviderType.OpenAI,
    name: 'OpenAI',
    description: 'OpenAI GPT and o-series models.',
    icon: '🔮',
    color: '#10a37f',
    models: [
      { tier: 'opus', name: 'o3', inputCost: 10, outputCost: 40 },
      { tier: 'sonnet', name: 'gpt-4.1', inputCost: 2, outputCost: 8 },
      { tier: 'haiku', name: 'gpt-4.1-mini', inputCost: 0.4, outputCost: 1.6 },
    ],
    requiresApiKey: true,
    configFields: [
      { key: 'apiKey', label: 'API Key', type: 'password', placeholder: 'sk-...', required: true },
      { key: 'orgId', label: 'Organization ID', type: 'text', placeholder: 'org-...', required: false },
    ],
  },
  {
    type: ProviderType.OpenRouter,
    name: 'OpenRouter',
    description: 'Access multiple providers through OpenRouter unified API.',
    icon: '🌐',
    color: '#6366f1',
    models: [
      { tier: 'opus', name: 'anthropic/claude-opus-4', inputCost: 15, outputCost: 75 },
      { tier: 'sonnet', name: 'anthropic/claude-sonnet-4', inputCost: 3, outputCost: 15 },
      { tier: 'haiku', name: 'anthropic/claude-haiku-3.5', inputCost: 0.25, outputCost: 1.25 },
    ],
    requiresApiKey: true,
    configFields: [
      { key: 'apiKey', label: 'API Key', type: 'password', placeholder: 'sk-or-...', required: true },
    ],
  },
  {
    type: ProviderType.Custom,
    name: 'Custom Provider',
    description: 'Any OpenAI-compatible API endpoint.',
    icon: '⚙️',
    color: '#9ca3af',
    models: [
      { tier: 'opus', name: 'custom-large', inputCost: 0, outputCost: 0 },
      { tier: 'sonnet', name: 'custom-medium', inputCost: 0, outputCost: 0 },
      { tier: 'haiku', name: 'custom-small', inputCost: 0, outputCost: 0 },
    ],
    requiresApiKey: true,
    configFields: [
      { key: 'apiKey', label: 'API Key', type: 'password', placeholder: 'your-api-key', required: true },
      { key: 'baseUrl', label: 'Base URL', type: 'text', placeholder: 'https://your-api.com/v1', required: true },
    ],
  },
];

// ============================================================
// Default Floor Layout
// ============================================================

export interface FurnitureItem {
  id: string;
  type: 'desk' | 'couch' | 'coffee_machine' | 'whiteboard' | 'plant' | 'bookshelf';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
}

export const DEFAULT_FLOOR_LAYOUT: FurnitureItem[] = [
  // Left desk cluster
  { id: 'desk_l1', type: 'desk', x: 80, y: 280, width: 64, height: 40 },
  { id: 'desk_l2', type: 'desk', x: 80, y: 380, width: 64, height: 40 },
  { id: 'desk_l3', type: 'desk', x: 80, y: 480, width: 64, height: 40 },
  { id: 'desk_l4', type: 'desk', x: 180, y: 280, width: 64, height: 40 },

  // Right desk cluster
  { id: 'desk_r1', type: 'desk', x: 580, y: 280, width: 64, height: 40 },
  { id: 'desk_r2', type: 'desk', x: 680, y: 280, width: 64, height: 40 },
  { id: 'desk_r3', type: 'desk', x: 580, y: 480, width: 64, height: 40 },
  { id: 'desk_r4', type: 'desk', x: 680, y: 480, width: 64, height: 40 },

  // CEO desk
  { id: 'ceo_desk', type: 'desk', x: 80, y: 100, width: 80, height: 48 },

  // CEO couch
  { id: 'ceo_couch', type: 'couch', x: 160, y: 100, width: 48, height: 32 },

  // Coffee machine
  { id: 'coffee', type: 'coffee_machine', x: 280, y: 480, width: 32, height: 32 },

  // Meeting room whiteboard
  { id: 'whiteboard_1', type: 'whiteboard', x: 720, y: 100, width: 48, height: 8 },

  // Plants
  { id: 'plant_1', type: 'plant', x: 360, y: 560, width: 24, height: 24 },
  { id: 'plant_2', type: 'plant', x: 440, y: 560, width: 24, height: 24 },
  { id: 'plant_3', type: 'plant', x: 60, y: 560, width: 24, height: 24 },

  // Bookshelf
  { id: 'bookshelf_1', type: 'bookshelf', x: 480, y: 180, width: 40, height: 16 },
];

// ============================================================
// Onboarding Steps
// ============================================================

export const ONBOARDING_STEPS = [
  { id: 1, title: 'Company', description: 'Set up your company' },
  { id: 2, title: 'CEO', description: 'Set up your profile' },
  { id: 3, title: 'Executives', description: 'Hire C-suite agents' },
  { id: 4, title: 'Providers', description: 'Configure AI providers' },
  { id: 5, title: 'First Team', description: 'Create your first team' },
  { id: 6, title: 'Governance', description: 'Set company rules' },
  { id: 7, title: 'Launch', description: 'Review & launch' },
] as const;

// ============================================================
// Executive Roles
// ============================================================

export const EXECUTIVE_ROLES = [
  { id: 'cos', role: 'Chief of Staff', abbrev: 'CoS', description: 'Coordinates executive operations and manages priorities.', defaultModel: 'sonnet' },
  { id: 'cto', role: 'Chief Technology Officer', abbrev: 'CTO', description: 'Oversees technical architecture and engineering standards.', defaultModel: 'opus' },
  { id: 'cdo', role: 'Chief Design Officer', abbrev: 'CDO', description: 'Leads design strategy, UX, and brand standards.', defaultModel: 'sonnet' },
  { id: 'cfo', role: 'Chief Financial Officer', abbrev: 'CFO', description: 'Manages budget allocation, cost optimization, and financial reporting.', defaultModel: 'haiku' },
  { id: 'clo', role: 'Chief Legal Officer', abbrev: 'CLO', description: 'Handles legal compliance, licensing, and policy review.', defaultModel: 'sonnet' },
  { id: 'coo', role: 'Chief Operating Officer', abbrev: 'COO', description: 'Manages day-to-day operations, team coordination, and process.', defaultModel: 'sonnet' },
] as const;

// ============================================================
// Executive Names (random defaults)
// ============================================================

export const EXECUTIVE_NAMES: Record<string, string[]> = {
  cos: ['Kai', 'Morgan', 'Avery'],
  cto: ['Rex', 'Nova', 'Atlas'],
  cdo: ['Luna', 'Sage', 'Iris'],
  cfo: ['Quinn', 'Blake', 'Jordan'],
  clo: ['Harper', 'Rowan', 'Ellis'],
  coo: ['Phoenix', 'River', 'Dakota'],
};

// ============================================================
// Executive Personalities (recommended defaults)
// ============================================================

export const EXECUTIVE_PERSONALITIES: Record<string, string> = {
  cos: 'Organized, proactive. Keeps priorities aligned and communication flowing between departments.',
  cto: 'Technical visionary. Focuses on code quality, architecture decisions, and engineering standards.',
  cdo: 'Creative perfectionist. Champions user experience, visual consistency, and brand identity.',
  cfo: 'Analytical and budget-conscious. Tracks spending, optimizes costs, and produces financial reports.',
  clo: 'Detail-oriented compliance expert. Reviews licenses, policies, and legal requirements.',
  coo: 'Efficiency-driven. Streamlines processes, monitors team output, and removes blockers.',
};

// ============================================================
// Industry Options
// ============================================================

export const INDUSTRIES = [
  'Technology',
  'Gaming',
  'Media & Entertainment',
  'Finance & Fintech',
  'Healthcare',
  'Education',
  'E-Commerce',
  'Other',
] as const;

// ============================================================
// MCP Presets
// ============================================================

export const MCP_POPULAR_PRESETS = [
  { id: 'github', name: 'GitHub', icon: '🐙', category: 'Development', description: 'Repository management, issues, PRs', popular: true },
  { id: 'filesystem', name: 'Filesystem', icon: '📁', category: 'System', description: 'Local file operations', popular: true },
  { id: 'postgres', name: 'PostgreSQL', icon: '🐘', category: 'Database', description: 'Database queries and management', popular: true },
  { id: 'slack', name: 'Slack', icon: '💬', category: 'Communication', description: 'Team messaging integration', popular: true },
  { id: 'web-search', name: 'Web Search', icon: '🔍', category: 'Research', description: 'Internet search capabilities', popular: true },
] as const;

// ============================================================
// Appearance Defaults
// ============================================================

export const HAIR_COLORS = ['#000000', '#2d1b00', '#4a3728', '#8b6914', '#c4a35a', '#e8d5b7', '#d44', '#e88', '#333', '#888', '#fff', '#b5651d', '#a52a2a', '#deb887'];
export const SHIRT_COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#a855f7', '#f97316', '#06b6d4', '#ec4899', '#eab308', '#6b7280', '#1e293b', '#dc2626', '#059669'];
export const PANTS_COLORS = ['#000000', '#1e293b', '#334155', '#1e3a5f', '#312e81', '#3f3f46', '#4a3728', '#1a1a2e', '#0f172a', '#1c1917', '#292524', '#3b3b3b'];
export const SKIN_COLORS = ['#fde8c9', '#f5d0a9', '#d4a574', '#c68642', '#8d5524', '#6b3a1f', '#4a2511'];

export const DEFAULT_APPEARANCE = {
  hair: '#2d1b00',
  shirt: '#3b82f6',
  pants: '#1e293b',
  skin: '#fde8c9',
};
