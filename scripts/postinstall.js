#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

const dirs = [
  'data/audit', 'data/runs', 'data/budgets/snapshots', 'data/approvals/pending',
  'data/approvals/resolved', 'data/providers', 'data/mcp', 'data/projects',
  'data/tasks', 'data/company', 'teams/_template/goals', 'teams/_template/tasks',
  'teams/_template/messages/history', 'teams/99_Archive', 'projects',
  'library/characters', 'library/research', 'library/assets', 'library/audio', 'library/data',
  'governance/rules/custom', 'governance/templates', 'governance/history',
];

for (const d of dirs) {
  fs.mkdirSync(path.join(root, d), { recursive: true });
}

const configPath = path.join(root, 'config.json');
if (!fs.existsSync(configPath)) {
  const defaultConfig = {
    platformName: 'BaroHQ',
    version: '6.0.0',
    onboardingComplete: false,
    plan: 'free',
    license: { key: null, tier: 'free', expiresAt: null },
    ceo: {
      name: 'CEO',
      appearance: { hair: '#1e293b', shirt: '#1e40af', pants: '#0f172a', skin: '#d4a574' },
    },
  };
  fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
}

const presetsPath = path.join(root, 'data', 'mcp', 'presets.json');
if (!fs.existsSync(presetsPath)) {
  const srcPresets = path.join(root, 'data', 'mcp', 'presets.json');
  if (!fs.existsSync(srcPresets)) {
    fs.writeFileSync(presetsPath, JSON.stringify({ presets: [] }, null, 2));
  }
}

const providersPath = path.join(root, 'data', 'providers', 'providers.json');
if (!fs.existsSync(providersPath)) {
  fs.writeFileSync(providersPath, JSON.stringify({ providers: [], routing: { strategy: 'priority', fallbackEnabled: true, fallbackTriggers: ['rate_limited', 'down', 'error'], retryAttempts: 2 } }, null, 2));
}

console.log('\n  BaroHQ v6.0.0 installed successfully!');
console.log('  Run "npx barohq start" to launch.\n');
