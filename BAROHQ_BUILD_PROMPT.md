Build BaroHQ — a multi-agent orchestration **control plane** and **company management platform** with a pixel-art office dashboard. It manages AI agent teams across multiple LLM providers, connects to external tools via MCP (Model Context Protocol), tracks projects/tasks/goals/budgets/approvals, provides JIRA-style issue tracking, enforces governance policies, normalizes execution across providers, and keeps an immutable audit trail. Distributed as an npm package (`npx barohq`). This is NOT just a visual layer — it is the full operational backbone for running an AI-powered company.

## 3 LAYERS

1. **Dashboard** — Next.js web app (port 3000)
2. **Bridge** — Node.js WebSocket middleware (port 3001)
3. **Data** — JSON-file persistence (teams, projects, governance, audit)

## FOLDER STRUCTURE

```
<root>/                            ← installed via npm, or local dev
├── dashboard/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx           ← Routes to /onboarding if no company, else /office
│   │   │   ├── onboarding/
│   │   │   │   ├── page.tsx       ← Onboarding wizard entry
│   │   │   │   ├── steps/
│   │   │   │   │   ├── CompanySetup.tsx      ← Step 1: company name, logo, industry
│   │   │   │   │   ├── CeoSetup.tsx          ← Step 2: CEO name, avatar customization
│   │   │   │   │   ├── ExecutiveHiring.tsx    ← Step 3: pick C-suite roles, name, assign models
│   │   │   │   │   ├── ProviderSetup.tsx      ← Step 4: configure LLM providers + API keys
│   │   │   │   │   ├── FirstTeam.tsx          ← Step 5: create first team, leader, agents
│   │   │   │   │   ├── GovernanceSetup.tsx    ← Step 6: import or customize governance rules
│   │   │   │   │   └── ReviewLaunch.tsx       ← Step 7: review summary, launch
│   │   │   │   └── OnboardingLayout.tsx       ← Progress stepper, back/next, skip
│   │   │   ├── office/
│   │   │   │   └── page.tsx       ← Main dashboard (post-onboarding)
│   │   │   ├── projects/
│   │   │   │   ├── page.tsx       ← Project list + board
│   │   │   │   └── [id]/page.tsx  ← Project detail view
│   │   │   ├── tasks/
│   │   │   │   ├── page.tsx       ← JIRA-style board (kanban/list/timeline)
│   │   │   │   └── [id]/page.tsx  ← Task detail view
│   │   │   ├── governance/
│   │   │   │   └── page.tsx       ← Governance rules management
│   │   │   ├── settings/
│   │   │   │   └── page.tsx       ← Platform settings + provider config
│   │   │   └── globals.css
│   │   ├── components/
│   │   │   ├── office/
│   │   │   │   ├── OfficeFloor.tsx        ← Pixel-art office visualization
│   │   │   │   ├── TeamSwitcher.tsx       ← Far-left team pill strip (ET, GS, VS...)
│   │   │   │   ├── PixelCharacter.tsx     ← Full-body pixel-art agent
│   │   │   │   ├── AgentSprite.tsx        ← Wrapper: tooltip, speech bubble, status dot
│   │   │   │   ├── Furniture.tsx          ← Desk, Couch, CoffeeMachine, etc.
│   │   │   │   ├── Walls.tsx             ← Wall, Door, Window
│   │   │   │   └── OrgChart.tsx          ← Interactive org chart (CEO → C-suite → Teams → Agents)
│   │   │   ├── agents/
│   │   │   │   ├── AgentListView.tsx      ← Sortable agent table
│   │   │   │   ├── AgentSettings.tsx      ← Edit agent model/provider, retire agent
│   │   │   │   ├── AddAgentModal.tsx      ← Create agent: appearance picker + LLM provider select
│   │   │   │   └── AgentProviderSelect.tsx ← Provider dropdown: Claude/Gemini/Codex/OpenRouter/Custom
│   │   │   ├── teams/
│   │   │   │   ├── TeamSettings.tsx       ← Rename/delete/archive a team
│   │   │   │   ├── AddTeamModal.tsx       ← Create new team from template
│   │   │   │   └── TeamDashboard.tsx      ← Team overview: members, projects, tasks, velocity
│   │   │   ├── projects/
│   │   │   │   ├── ProjectPanel.tsx       ← Project list, status, git status
│   │   │   │   ├── ProjectDetail.tsx      ← Project overview: goals, tasks, teams, timeline
│   │   │   │   ├── ProjectBoard.tsx       ← Kanban board per project
│   │   │   │   ├── AddProjectModal.tsx    ← Create project: name, description, assign teams
│   │   │   │   └── ProjectTimeline.tsx    ← Gantt-style timeline view
│   │   │   ├── tasks/
│   │   │   │   ├── TaskBoard.tsx          ← JIRA-style kanban: Backlog|Todo|InProgress|InReview|Done
│   │   │   │   ├── TaskListView.tsx       ← Table view with filters/sort
│   │   │   │   ├── TaskDetail.tsx         ← Full task detail: description, subtasks, comments, history
│   │   │   │   ├── TaskCreateModal.tsx    ← Create task: type(epic/story/task/bug), assign, priority
│   │   │   │   ├── TaskTimelineView.tsx   ← Gantt/timeline view
│   │   │   │   ├── SprintPanel.tsx        ← Sprint management: create, plan, start, complete
│   │   │   │   ├── TaskFilters.tsx        ← Filter: type, status, assignee, project, sprint, priority, label
│   │   │   │   └── AutoIssueLog.tsx       ← Auto-created issues from agent failures
│   │   │   ├── governance/
│   │   │   │   ├── GovernancePanel.tsx    ← Rules management: list, edit, toggle
│   │   │   │   ├── RuleEditor.tsx         ← Markdown editor for individual rules
│   │   │   │   ├── RuleCategoryView.tsx   ← Category tabs: Coding, Design, Legal, Security, Custom
│   │   │   │   ├── RuleVersionHistory.tsx ← Version diff view for rule changes
│   │   │   │   └── AddRuleModal.tsx       ← Create new governance rule
│   │   │   ├── providers/
│   │   │   │   ├── ProviderManager.tsx    ← Manage all LLM providers
│   │   │   │   ├── ProviderCard.tsx       ← Individual provider: health, usage, config
│   │   │   │   ├── AddProviderModal.tsx   ← Add new provider: preset or custom
│   │   │   │   ├── ProviderTestPanel.tsx  ← Test provider connection + sample prompt
│   │   │   │   └── ModelMappingEditor.tsx ← Map model tiers to provider-specific models
│   │   │   ├── mcp/
│   │   │   │   ├── McpManager.tsx         ← MCP connections list: status, tools, toggle
│   │   │   │   ├── McpConnectionCard.tsx  ← Individual connection: health, tools list, config
│   │   │   │   ├── AddMcpModal.tsx        ← Add MCP: preset gallery + custom URL/config
│   │   │   │   ├── McpPresetGallery.tsx   ← Browse pre-built MCP presets by category
│   │   │   │   ├── McpToolBrowser.tsx     ← Browse available tools per connection
│   │   │   │   ├── McpTestPanel.tsx       ← Test connection + sample tool call
│   │   │   │   └── McpAgentAssign.tsx     ← Assign MCP connections to agents/teams
│   │   │   ├── goals/
│   │   │   │   ├── GoalsPanel.tsx         ← Goals + Issues hierarchy tree
│   │   │   │   └── GoalDetail.tsx         ← Goal/issue detail modal
│   │   │   ├── budget/
│   │   │   │   ├── BudgetPanel.tsx        ← Budget overview: company/team/agent spend
│   │   │   │   └── BudgetDetail.tsx       ← Drill-down: timeline, alerts, pause/override
│   │   │   ├── audit/
│   │   │   │   ├── AuditPanel.tsx         ← Audit trail + Run history, searchable
│   │   │   │   └── RunHistoryPanel.tsx    ← Normalized execution records across providers
│   │   │   ├── approvals/
│   │   │   │   ├── ApprovalPanel.tsx      ← Pending approvals queue (header badge + panel)
│   │   │   │   ├── ApprovalDetail.tsx     ← Approval context, approve/reject/comment
│   │   │   │   └── ApprovalQueue.tsx      ← Full approval queue with filters + batch actions
│   │   │   ├── chat/
│   │   │   │   ├── ChatPanel.tsx          ← Slack-style: channels + DMs + threads
│   │   │   │   ├── ChannelSidebar.tsx     ← Channel list, DMs, unread badges
│   │   │   │   ├── ChannelView.tsx        ← Message stream
│   │   │   │   ├── DirectMessage.tsx      ← DM conversation
│   │   │   │   └── CreateChannelModal.tsx ← Ad-hoc channel creation
│   │   │   ├── common/
│   │   │   │   ├── ViewTabs.tsx           ← Office sub-tab switcher (Office | List | Org chart)
│   │   │   │   ├── Header.tsx            ← Team name, breadcrumb, badges, usage, approvals, provider dots
│   │   │   │   ├── ProjectSidebar.tsx    ← Collapsible project tree: projects → goals/tasks/issues/teams
│   │   │   │   ├── Panel.tsx             ← Reusable collapsible panel
│   │   │   │   ├── UsageBar.tsx          ← Token usage (header, compact)
│   │   │   │   ├── UsageDetail.tsx       ← Per-agent/model/provider breakdown
│   │   │   │   ├── AdapterStatus.tsx     ← Provider health, fallback state (header widget)
│   │   │   │   ├── PriorityPanel.tsx     ← Drag-and-drop priority queue per team
│   │   │   │   ├── LibraryView.tsx       ← Cross-team shared library
│   │   │   │   ├── OfflineOverlay.tsx    ← Disconnected state
│   │   │   │   └── PausedOverlay.tsx     ← Rate-limited pause overlay
│   │   │   └── onboarding/
│   │   │       ├── StepIndicator.tsx     ← Progress stepper UI
│   │   │       ├── ProviderPresetCards.tsx ← Preset cards: Claude, Gemini, Codex, OpenRouter
│   │   │       └── AgentRolePicker.tsx   ← Role selection cards with descriptions
│   │   ├── hooks/
│   │   │   ├── useIsMobile.ts
│   │   │   └── useWebSocket.ts
│   │   ├── lib/
│   │   │   ├── pathfinding.ts        ← BFS waypoint graph (doorways only)
│   │   │   ├── types.ts              ← All TypeScript interfaces
│   │   │   └── constants.ts          ← Node positions, edges, floor layouts
│   │   └── store/
│   │       ├── useAgentStore.ts      ← Zustand: agents, usage, priorities
│   │       ├── useProjectStore.ts    ← Zustand: projects, sprints, tasks
│   │       ├── useGovernanceStore.ts ← Zustand: rules, versions
│   │       ├── useProviderStore.ts   ← Zustand: providers, health, routing
│   │       ├── useMcpStore.ts       ← Zustand: MCP connections, tools, assignments
│   │       └── useOnboardingStore.ts ← Zustand: onboarding wizard state
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.js
│   └── tailwind.config.js
│
├── bridge/
│   ├── src/
│   │   ├── index.ts              ← Entry point
│   │   ├── watcher.ts            ← chokidar file watcher
│   │   ├── websocket.ts          ← WS server → dashboard
│   │   ├── commander.ts          ← Dashboard commands → agent inbox
│   │   ├── configManager.ts      ← Agent CRUD, roster diffing
│   │   ├── teamManager.ts        ← Team CRUD (create/archive/rename)
│   │   ├── projectManager.ts     ← Project CRUD, cross-team assignment, git init + lint
│   │   ├── taskManager.ts        ← Task/issue CRUD, sprints, kanban state, auto-issue
│   │   ├── channelManager.ts     ← Channels, DMs, message routing, unread
│   │   ├── goalManager.ts        ← Goal/issue CRUD, hierarchy, progress rollup
│   │   ├── approvalManager.ts    ← Approval workflows, escalation, batch ops
│   │   ├── budgetManager.ts      ← Budget limits, usage tracking, alerts, pause/override
│   │   ├── providerManager.ts    ← Multi-LLM provider management, health, routing, fallback
│   │   ├── mcpManager.ts        ← MCP connection CRUD, health checks, tool discovery, agent assignment
│   │   ├── governanceManager.ts  ← Governance rules CRUD, versioning, enforcement
│   │   ├── onboardingManager.ts  ← Company setup, wizard state, initial scaffolding
│   │   ├── auditLogger.ts        ← Append-only audit log (JSONL, daily rotation)
│   │   ├── runHistoryManager.ts  ← Normalized run records across providers
│   │   ├── usageReader.ts        ← Claude Code JSONL usage logs (30s poll)
│   │   ├── watchdog.ts           ← Rate limit detection, auto-resume scheduling
│   │   ├── libraryManager.ts     ← library/ index, cross-team publishing
│   │   ├── persistence.ts        ← State save/load (debounced 2s writes, atomic)
│   │   └── types.ts
│   ├── package.json
│   └── tsconfig.json
│
├── teams/                         ← Team definitions (numbered prefix for ordering)
│   ├── _template/                 ← Copied for new teams
│   │   ├── team.json
│   │   ├── team-config.json
│   │   ├── state.json
│   │   ├── goals/
│   │   ├── tasks/
│   │   ├── messages/channels.json + history/
│   │   ├── CLAUDE.md              ← ≤200 chars
│   │   └── start-team.bat
│   └── 99_Archive/
│
├── projects/                      ← All project repos (top-level, each has own .git)
│   └── .gitkeep
│
├── library/                       ← Cross-team published assets
│   ├── characters/, research/, assets/, audio/, data/
│   └── index.json
│
├── governance/                    ← Governance rules (versioned, editable from UI)
│   ├── rules/
│   │   ├── coding-standards.json
│   │   ├── design-standards.json
│   │   ├── legal-checklist.json
│   │   ├── security-policy.json
│   │   └── custom/               ← User-defined rules
│   ├── templates/                 ← Built-in rule templates
│   │   ├── coding-standards.md
│   │   ├── design-standards.md
│   │   ├── legal-checklist.md
│   │   └── security-policy.md
│   └── history/                   ← Rule version diffs
│
├── data/                          ← Platform-level persistent data
│   ├── audit/                     ← audit-YYYY-MM-DD.jsonl (append-only)
│   ├── runs/                      ← run-{id}.json per execution
│   ├── budgets/
│   │   ├── company.json
│   │   └── snapshots/             ← Daily budget snapshots
│   ├── approvals/
│   │   ├── pending/
│   │   └── resolved/
│   ├── providers/
│   │   └── providers.json         ← All LLM provider definitions + routing
│   ├── mcp/
│   │   ├── connections.json       ← All MCP connections + status
│   │   └── presets.json           ← Built-in MCP preset definitions
│   ├── projects/
│   │   └── projects.json          ← Master project registry
│   ├── tasks/
│   │   ├── tasks.json             ← Task index
│   │   ├── sprints.json           ← Sprint definitions
│   │   └── auto-issues.json       ← Auto-generated issues from failures
│   └── company/
│       ├── company.json           ← Company profile (name, logo, industry)
│       └── onboarding-state.json  ← Wizard progress (completed steps)
│
├── config.json
├── build-progress.json
├── .eslintrc.js, .prettierrc, .lintstagedrc.json
├── .husky/pre-commit, pre-push
├── .gitignore
├── CLAUDE.md                      ← ≤200 chars
├── ecosystem.config.js
├── package.json                   ← NPM package entry: "bin": { "barohq": "./cli.js" }
├── cli.js                         ← CLI entry: npx barohq [init|start|stop|status]
└── README.md                      ← NPM readme with usage, screenshots, features
```

## GIT ARCHITECTURE

```
Platform repo (<root>/.git)
  Tracks: dashboard/, bridge/, teams/*/team.json, teams/*/team-config.json,
          governance/, library/index.json, data/budgets/company.json,
          data/providers/providers.json, data/mcp/presets.json,
          data/company/company.json,
          config.json, cli.js, package.json, README.md
  Excludes: projects/*/, data/audit/*.jsonl, data/runs/*.json,
            data/budgets/snapshots/, data/approvals/resolved/,
            data/tasks/, node_modules/

Project repos (projects/<n>/.git) — each independent
```

**.gitignore:**
```
projects/*/
!projects/.gitkeep
node_modules/
.next/
dist/
*.tmp
.env
*.key
*.pem
data/audit/*.jsonl
data/runs/*.json
data/budgets/snapshots/
data/approvals/resolved/
data/tasks/
governance/history/
```

---

## NPM PACKAGE + CLI

**package.json (root):**
```json
{
  "name": "barohq",
  "version": "6.0.0",
  "description": "Multi-agent orchestration control plane & AI company management platform",
  "bin": { "barohq": "./cli.js" },
  "keywords": ["ai", "agents", "orchestration", "llm", "multi-agent", "claude", "gemini", "openai"],
  "license": "MIT",
  "engines": { "node": ">=18.0.0" },
  "scripts": {
    "start": "node cli.js start",
    "dev": "concurrently \"cd dashboard && npm run dev\" \"cd bridge && npm run dev\"",
    "build": "cd dashboard && npm run build && cd ../bridge && npm run build",
    "lint": "eslint . --ext .ts,.tsx",
    "lint:fix": "eslint . --ext .ts,.tsx --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "typecheck": "cd dashboard && tsc --noEmit && cd ../bridge && tsc --noEmit",
    "prepare": "husky install",
    "postinstall": "node scripts/postinstall.js"
  }
}
```

**cli.js:**
```javascript
#!/usr/bin/env node
const { Command } = require('commander');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

const program = new Command();
program.name('barohq').description('BaroHQ — AI Company Management Platform').version('6.0.0');

program.command('init')
  .description('Initialize a new BaroHQ workspace in the current directory')
  .option('--dir <path>', 'Target directory', '.')
  .action(async (opts) => {
    const targetDir = path.resolve(opts.dir);
    // Copy template structure, run npm install for dashboard + bridge
    // Create data/, teams/, projects/, governance/, library/ dirs
    // Generate default config.json with onboarding incomplete
    console.log(`Initializing BaroHQ workspace at ${targetDir}...`);
    // ... scaffold logic
  });

program.command('start')
  .description('Start BaroHQ dashboard + bridge')
  .option('--port <number>', 'Dashboard port', '3000')
  .option('--bridge-port <number>', 'Bridge port', '3001')
  .action(async (opts) => {
    // Start bridge then dashboard via PM2 or direct spawn
    console.log('Starting BaroHQ...');
    // ... startup logic
  });

program.command('stop').description('Stop all BaroHQ processes').action(async () => { /* pm2 stop */ });
program.command('status').description('Show running status').action(async () => { /* pm2 status */ });

program.parse();
```

---

## config.json

```json
{
  "platformName": "BaroHQ",
  "version": "6.0.0",
  "onboardingComplete": false,
  "plan": "free",
  "license": { "key": null, "tier": "free", "expiresAt": null },
  "usageLimits": {
    "sessionTokenLimit": 88000,
    "weeklyHoursLimit": 40,
    "sessionDurationHours": 5
  },
  "autoResume": { "enabled": true, "bufferMinutes": 2 },
  "teamNumbering": {
    "reserved": { "00": "Executive_Office", "99": "Archive" },
    "nextAvailable": 1
  },
  "budgets": {
    "enabled": true,
    "companyMonthlyLimit": null,
    "alertThresholds": [0.50, 0.75, 0.90],
    "pauseOnExceed": false,
    "overrideRequiresApproval": true
  },
  "providers": {
    "defaultProvider": "claude-code",
    "fallbackEnabled": true,
    "fallbackOrder": ["claude-code"]
  },
  "approvals": {
    "enabled": true,
    "protectedActions": [
      "delete_team", "retire_agent", "budget_override", "change_provider",
      "archive_project", "modify_governance", "delete_project", "modify_provider_keys"
    ],
    "defaultApprover": "ceo",
    "autoApproveTimeout": null
  },
  "tasks": {
    "autoCreateIssues": true,
    "autoIssueOnFailure": true,
    "issuePrefix": "BHQ",
    "sprintsEnabled": true,
    "defaultSprintDurationDays": 14
  },
  "governance": {
    "enabled": true,
    "enforceOnCommit": true,
    "versionHistory": true
  },
  "mcp": {
    "enabled": true,
    "healthCheckIntervalSeconds": 120,
    "maxConnectionsPerAgent": 10,
    "autoDiscoverTools": true
  },
  "audit": { "enabled": true, "retentionDays": 90, "rotateDaily": true },
  "ceo": {
    "name": "CEO",
    "appearance": { "hair": "#1e293b", "shirt": "#1e40af", "pants": "#0f172a", "skin": "#d4a574" }
  }
}
```

Plans: `free` (limited agents, 1 provider), `starter` (10 agents, 3 providers), `pro` (unlimited agents, all providers), `enterprise` (custom, SSO, SLA). Plan enforcement checked at agent/team/provider creation time.

---

## build-progress.json

```json
{
  "steps": [
    { "step": 0, "desc": "Git init + .gitignore", "done": null },
    { "step": 1, "desc": "Folder structure + NPM package scaffold", "done": null },
    { "step": 2, "desc": "Code quality (eslint, prettier, husky)", "done": null },
    { "step": 3, "desc": "Governance templates + MCP presets", "done": null },
    { "step": 4, "desc": "CLI entry point + postinstall", "done": null },
    { "step": 5, "desc": "Dashboard — onboarding wizard", "done": null },
    { "step": 6, "desc": "Dashboard — main app (office, agents, teams, chat, header)", "done": null },
    { "step": 7, "desc": "Dashboard — projects + tasks (JIRA-style)", "done": null },
    { "step": 8, "desc": "Dashboard — providers, MCP, governance, goals, budget, audit, approvals", "done": null },
    { "step": 9, "desc": "Bridge — all 23 modules", "done": null },
    { "step": 10, "desc": "Team template + data/ scaffolding", "done": null },
    { "step": 11, "desc": "config.json, ecosystem, scripts", "done": null },
    { "step": 12, "desc": "Dependencies + build verified", "done": null }
  ],
  "lastCompleted": -1
}
```

Before each step: read this, skip completed. After each step: update + `git add -A && git commit -m "Step N: <desc>"`.

---

## CODE QUALITY

**ESLint:** strict TS, no `any`, explicit return types (warn), react-hooks, prettier integration.
**Prettier:** semi, trailing commas, single quotes, 100 width.
**Husky:** pre-commit → lint-staged; pre-push → `tsc --noEmit` on dashboard + bridge.
**lint-staged:** `*.{ts,tsx}` → eslint --fix + prettier; `*.{json,md,css}` → prettier.

Root package.json scripts: `lint`, `lint:fix`, `format`, `format:check`, `typecheck`, `prepare`.

---

## DETAILED SPECS

### 1. ONBOARDING WIZARD (/onboarding)

**Trigger:** `page.tsx` checks `config.json → onboardingComplete`. If `false` → redirect to `/onboarding`. If `true` → redirect to `/office`.

**7 Steps (all skippable except Step 1):**

**Step 1 — Company Setup (required):**
- Company name (text input)
- Industry (dropdown: Tech, Gaming, Media, Finance, Health, Education, Other)
- Company description (textarea, optional)
- Logo upload (optional, stored in `data/company/logo.png`)
- Creates `data/company/company.json`

**Step 2 — CEO Setup:**
- CEO display name (default: "CEO")
- Avatar customization: hair/shirt/pants/skin color pickers with live pixel-art preview
- Saves to `config.json → ceo`

**Step 3 — Executive Hiring:**
- Shows 6 C-suite role cards: CoS, CTO, CDO, CFO, CLO, COO
- Each card: toggle on/off, set name, set personality note (optional)
- Model tier auto-assigned (opus for key roles, sonnet for others)
- Provider selection per agent (from configured providers)
- Creates `teams/00_Executive_Office/` with selected executives

**Step 4 — Provider Setup:**
- Preset cards for each supported provider:
  - **Claude (Claude Code)** — local CLI, no API key needed
  - **Claude API** — requires API key
  - **Google Gemini** — requires API key, model selection
  - **OpenAI (GPT/Codex)** — requires API key, model selection
  - **OpenRouter** — requires API key, model routing
  - **Custom** — URL endpoint + API key + model name
- "Test Connection" button per provider
- At least one provider must be configured
- Saves to `data/providers/providers.json`
- **Sub-section: Connect Tools (MCP)** — optional, skippable:
  - Shows top 5 popular MCP presets as cards: GitHub, Slack, Google Drive, Notion, Brave Search
  - Click card → enter credentials → "Test Connection"
  - "I'll set this up later" skip link
  - Connected MCP servers saved to `data/mcp/connections.json`
  - Connections made here default to scope: all agents

**Step 5 — First Team:**
- Team name, icon (emoji picker), description
- Team leader: name, role title, avatar customization, provider/model selection
- Optional: add 1-3 more agents with quick setup
- Creates `teams/01_{TeamName}/`

**Step 6 — Governance Setup:**
- Shows built-in rule templates: Coding Standards, Design Standards, Legal Checklist, Security Policy
- Toggle each on/off
- "Import Custom" button (paste markdown or upload .md file)
- Quick preview of each rule set
- Saves to `governance/rules/`

**Step 7 — Review & Launch:**
- Summary of all configured items: company, CEO, executives, providers, MCP connections, teams, governance
- "Launch BaroHQ" button → sets `onboardingComplete: true`, redirects to `/office`

**UI:** Pixel-art themed progress stepper. Back/Next navigation. Step validation before next. Animation transitions between steps.

---

### 2. MULTI-LLM PROVIDER SYSTEM

**Supported Provider Types:**

| Provider | ID | Config Required | Models |
|----------|-----|-----------------|--------|
| Claude Code (CLI) | `claude-code` | None (local CLI) | opus, sonnet, haiku |
| Claude API | `claude-api` | API key | claude-opus-4-6, claude-sonnet-4-6, claude-haiku-4-5 |
| Google Gemini | `gemini` | API key | gemini-2.5-pro, gemini-2.5-flash |
| OpenAI / Codex | `openai` | API key | gpt-4.1, o3, codex-mini |
| OpenRouter | `openrouter` | API key | Any model via routing |
| Custom | `custom-{id}` | URL + API key | User-specified |

**Provider Data Model (data/providers/providers.json):**
```json
{
  "providers": [
    {
      "id": "claude-code",
      "type": "claude-code",
      "name": "Claude Code (Local CLI)",
      "enabled": true,
      "priority": 1,
      "status": "active",
      "config": {},
      "modelMapping": {
        "opus": "claude-opus-4-6",
        "sonnet": "claude-sonnet-4-6",
        "haiku": "claude-haiku-4-5-20251001"
      },
      "pricing": {
        "opus": { "inputPer1M": 15, "outputPer1M": 75 },
        "sonnet": { "inputPer1M": 3, "outputPer1M": 15 },
        "haiku": { "inputPer1M": 1, "outputPer1M": 5 }
      },
      "lastHealthCheck": null,
      "createdAt": "..."
    },
    {
      "id": "gemini-1",
      "type": "gemini",
      "name": "Google Gemini",
      "enabled": false,
      "priority": 2,
      "status": "unconfigured",
      "config": {
        "apiKeyEnvVar": "GEMINI_API_KEY",
        "apiKey": null,
        "baseUrl": "https://generativelanguage.googleapis.com/v1beta"
      },
      "modelMapping": {
        "opus": "gemini-2.5-pro",
        "sonnet": "gemini-2.5-flash",
        "haiku": "gemini-2.5-flash"
      },
      "pricing": {
        "opus": { "inputPer1M": 1.25, "outputPer1M": 10 },
        "sonnet": { "inputPer1M": 0.15, "outputPer1M": 3.50 },
        "haiku": { "inputPer1M": 0.15, "outputPer1M": 3.50 }
      },
      "lastHealthCheck": null,
      "createdAt": "..."
    },
    {
      "id": "openai-1",
      "type": "openai",
      "name": "OpenAI",
      "enabled": false,
      "priority": 3,
      "status": "unconfigured",
      "config": {
        "apiKeyEnvVar": "OPENAI_API_KEY",
        "apiKey": null,
        "baseUrl": "https://api.openai.com/v1"
      },
      "modelMapping": {
        "opus": "gpt-4.1",
        "sonnet": "gpt-4.1-mini",
        "haiku": "gpt-4.1-nano"
      },
      "pricing": {
        "opus": { "inputPer1M": 2, "outputPer1M": 8 },
        "sonnet": { "inputPer1M": 0.4, "outputPer1M": 1.6 },
        "haiku": { "inputPer1M": 0.1, "outputPer1M": 0.4 }
      },
      "lastHealthCheck": null,
      "createdAt": "..."
    },
    {
      "id": "openrouter-1",
      "type": "openrouter",
      "name": "OpenRouter",
      "enabled": false,
      "priority": 4,
      "status": "unconfigured",
      "config": {
        "apiKeyEnvVar": "OPENROUTER_API_KEY",
        "apiKey": null,
        "baseUrl": "https://openrouter.ai/api/v1"
      },
      "modelMapping": {
        "opus": "anthropic/claude-opus-4-6",
        "sonnet": "anthropic/claude-sonnet-4-6",
        "haiku": "anthropic/claude-haiku-4-5"
      },
      "pricing": {},
      "lastHealthCheck": null,
      "createdAt": "..."
    },
    {
      "id": "custom-example",
      "type": "custom",
      "name": "My Custom LLM",
      "enabled": false,
      "priority": 99,
      "status": "unconfigured",
      "config": {
        "baseUrl": "",
        "apiKey": null,
        "apiKeyHeader": "Authorization",
        "apiKeyPrefix": "Bearer ",
        "requestFormat": "openai",
        "modelName": ""
      },
      "modelMapping": {
        "opus": "",
        "sonnet": "",
        "haiku": ""
      },
      "pricing": {},
      "lastHealthCheck": null,
      "createdAt": "..."
    }
  ],
  "routing": {
    "strategy": "priority",
    "fallbackEnabled": true,
    "fallbackTriggers": ["rate_limited", "down", "error"],
    "retryAttempts": 2
  }
}
```

**Custom Provider Config:**
- `baseUrl` — Full API endpoint URL (e.g., `http://localhost:11434/v1` for Ollama)
- `apiKey` — Stored encrypted in .env, referenced by envVar
- `apiKeyHeader` — HTTP header name (default: `Authorization`)
- `apiKeyPrefix` — Prefix before key (default: `Bearer `)
- `requestFormat` — API format: `openai` (OpenAI-compatible), `anthropic`, `google`, `raw`
- `modelName` — Model identifier string

**Provider Adapter Interface:**
```typescript
interface ProviderAdapter {
  id: string;
  type: 'claude-code' | 'claude-api' | 'gemini' | 'openai' | 'openrouter' | 'custom';
  name: string;
  status: 'active' | 'degraded' | 'down' | 'disabled' | 'unconfigured';
  execute(req: ExecutionRequest): Promise<ExecutionResult>;
  stream(req: ExecutionRequest): AsyncIterable<StreamChunk>;
  healthCheck(): Promise<HealthStatus>;
  testConnection(): Promise<{ success: boolean; latencyMs: number; error?: string }>;
}

interface ExecutionRequest {
  agentId: string;
  team: string;
  prompt: string;
  model: 'opus' | 'sonnet' | 'haiku';
  providerId?: string;
  budgetRemaining?: number;
  context?: { projectId?: string; taskId?: string; goalId?: string };
}

interface ExecutionResult {
  runId: string;
  provider: string;
  providerType: string;
  model: string;
  modelTier: string;
  output: string;
  usage: { inputTokens: number; outputTokens: number; costUsd: number };
  durationMs: number;
  status: 'success' | 'error' | 'rate_limited' | 'budget_exceeded';
  errorMessage?: string;
}
```

**AddAgentModal — Provider Selection:** When adding a new agent, the modal includes:
- Provider dropdown (from enabled providers in `providers.json`)
- Model tier selector (opus/sonnet/haiku) — maps to provider-specific model
- Live preview showing: selected provider name, actual model name, estimated cost/1K tokens
- "Test" button to verify provider+model works
- Stores `providerId` and `modelTier` in agent's `team-config.json` entry

**Fallback:** Highest-priority enabled → if trigger → next enabled → if all fail → queue retry. Events audit-logged + WS-emitted.

---

### 3. PROJECT MANAGEMENT

**Projects are SEPARATE from teams.** A project has its own goal, timeline, and budget. Multiple teams can contribute to a single project. Teams can work on multiple projects.

**Project Data Model (data/projects/projects.json + projects/{slug}/):**
```json
{
  "projects": [
    {
      "id": "proj-001",
      "slug": "puzzle-platformer",
      "name": "Puzzle Platformer",
      "description": "Mobile puzzle platformer game for iOS and Android",
      "status": "active",
      "priority": "high",
      "owner": "nova",
      "teams": ["01_Game_Studio", "00_Executive_Office"],
      "teamLeads": { "01_Game_Studio": "nova", "00_Executive_Office": "kai" },
      "goals": ["goal-001", "goal-002"],
      "sprints": ["sprint-001", "sprint-002"],
      "budget": { "allocated": 500.00, "spent": 142.35 },
      "timeline": {
        "startDate": "2026-03-01",
        "targetDate": "2026-06-30",
        "milestones": [
          { "id": "ms-001", "name": "Alpha", "date": "2026-04-15", "status": "in_progress" },
          { "id": "ms-002", "name": "Beta", "date": "2026-05-30", "status": "not_started" },
          { "id": "ms-003", "name": "Launch", "date": "2026-06-30", "status": "not_started" }
        ]
      },
      "git": { "initialized": true, "branch": "main", "lastCommit": null },
      "channels": ["#proj-puzzle-platformer"],
      "tags": ["mobile", "game", "ios", "android"],
      "createdBy": "ceo",
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

**Project Statuses:** `planning`, `active`, `on_hold`, `completed`, `archived`, `cancelled`

**Project Priority:** `critical`, `high`, `medium`, `low`

**Dashboard — /projects:**
- Project list with cards: name, status badge, progress bar, team avatars, milestone indicator
- Filter: status, team, priority, tag
- Sort: priority, deadline, name, creation date
- "+ New Project" button → AddProjectModal

**ProjectDetail (/projects/[id]):**
- Header: name, status, owner, priority, dates
- Tabs: Overview | Tasks | Timeline | Teams | Budget | Settings
- Overview: description, milestones, recent activity, key metrics
- Tasks: embedded TaskBoard filtered to this project
- Timeline: Gantt-style milestone/task timeline (ProjectTimeline component)
- Teams: assigned teams with per-team task breakdowns
- Budget: project-level spend vs allocation
- Settings: edit project, archive, delete (→ approval)

**AddProjectModal:**
- Name, description, slug (auto-generated, editable)
- Assign teams (multi-select from existing teams)
- Set team leads per team
- Priority, target date
- Milestones (add/remove)
- Auto-creates: git repo in `projects/{slug}/`, project channel, initial goal

---

### 4. JIRA-STYLE TASK + ISSUE TRACKING

**Task types:** `epic`, `story`, `task`, `bug`, `sub_task`

**Task Data Model (data/tasks/tasks.json entries):**
```json
{
  "id": "BHQ-42",
  "type": "task",
  "title": "Implement collision detection",
  "description": "Add AABB collision detection for player vs obstacles",
  "status": "in_progress",
  "priority": "high",
  "assignee": "bolt",
  "reporter": "nova",
  "team": "01_Game_Studio",
  "project": "proj-001",
  "sprint": "sprint-001",
  "parent": "BHQ-10",
  "children": ["BHQ-43", "BHQ-44"],
  "labels": ["physics", "core"],
  "storyPoints": 5,
  "dueDate": "2026-04-10",
  "timeTracking": {
    "estimated": 480,
    "logged": 320,
    "remaining": 160
  },
  "linkedGoal": "goal-001",
  "linkedTasks": [{ "type": "blocks", "taskId": "BHQ-45" }],
  "attachments": [],
  "comments": [
    {
      "id": "tc-001", "author": "bolt", "text": "Started AABB implementation",
      "time": "...", "reactions": []
    }
  ],
  "history": [
    { "field": "status", "from": "todo", "to": "in_progress", "by": "bolt", "time": "..." }
  ],
  "autoCreated": false,
  "autoCreatedFrom": null,
  "createdBy": "nova",
  "createdAt": "...",
  "updatedAt": "..."
}
```

**Task Statuses:** `backlog`, `todo`, `in_progress`, `in_review`, `blocked`, `done`, `cancelled`

**Task Priority:** `critical`, `high`, `medium`, `low`, `trivial`

**Task ID Format:** `{issuePrefix}-{autoIncrement}` (e.g., `BHQ-42`). Prefix configured in `config.json → tasks.issuePrefix`.

**Sprint Data Model (data/tasks/sprints.json):**
```json
{
  "sprints": [
    {
      "id": "sprint-001",
      "name": "Sprint 1",
      "project": "proj-001",
      "status": "active",
      "startDate": "2026-03-18",
      "endDate": "2026-04-01",
      "goal": "Complete core game mechanics",
      "tasks": ["BHQ-42", "BHQ-43", "BHQ-44"],
      "velocity": { "planned": 21, "completed": 13 },
      "createdAt": "..."
    }
  ]
}
```

**Sprint Statuses:** `planning`, `active`, `completed`, `cancelled`

**Auto-Issue Creation (data/tasks/auto-issues.json):**
When an agent execution fails (`ExecutionResult.status === 'error'`), the system automatically:
1. Creates a `bug` type task with:
   - Title: `[Auto] Agent {name} failed: {errorSummary}`
   - Description: full error details, run ID, provider, model
   - Assignee: the agent that failed (or team lead if agent unavailable)
   - Priority: `high` (or `critical` if same failure repeated 3x)
   - Labels: `["auto-issue", "agent-failure"]`
   - `autoCreated: true`, `autoCreatedFrom: { runId, agentId, errorType }`
2. Links to the goal/task the agent was working on
3. Sends WS event `auto_issue_created`
4. If `config.json → tasks.autoCreateIssues` is false, suppressed

**Auto-Issue → Approval Queue:** If an auto-issue is `critical` priority or the agent has failed 3+ times in the same task, the system:
1. Creates an approval request: "Agent {name} repeatedly failing on {task}. Reassign or investigate?"
2. Options: reassign to different agent, change provider/model, manually resolve, dismiss

**Dashboard — /tasks:**
- **Kanban View (default):** Drag-and-drop columns per status. Cards show: type icon, ID, title, assignee avatar, priority, labels, story points
- **List View:** Sortable table with all fields. Bulk actions (assign, change status, move sprint)
- **Timeline View:** Gantt chart grouped by epic → story → task with dependencies
- **Sprint Board:** SprintPanel for current/upcoming sprints with burndown chart
- **Filters bar:** Type, status, assignee, project, sprint, priority, label, reporter, date range
- **Quick create:** Inline "+" at top of each column or global "+ Create Task" button

**TaskDetail (/tasks/[id]):**
- Header: type icon, ID, title (editable inline), status dropdown, priority
- Sidebar: assignee, reporter, sprint, story points, dates, time tracking
- Body: description (markdown editor), subtasks checklist, linked tasks, attachments
- Activity: merged view of comments + history changes (filterable)
- Actions: assign, transition status, link task, add to sprint, add label, delete (→ approval for epics)

**TaskCreateModal:**
- Type selector (epic/story/task/bug/sub_task)
- Title, description (markdown)
- Project (dropdown), Sprint (dropdown), Parent task (dropdown for sub_tasks)
- Assignee (agent picker), Reporter (auto: current user or requesting agent)
- Priority, labels, story points, due date
- Link to goal (optional)

---

### 5. GOVERNANCE MANAGEMENT

**Governance = company rules that agents must follow.** Separate from goals/tasks. Editable from the dashboard UI.

**Governance Rule Data Model (governance/rules/{id}.json):**
```json
{
  "id": "coding-standards",
  "name": "Coding Standards",
  "category": "engineering",
  "status": "active",
  "enforcer": "cto",
  "enforcerName": "Rex",
  "version": 3,
  "content": "## Coding Standards\n\n- TypeScript strict, no `any`...",
  "contentFormat": "markdown",
  "tags": ["code", "quality", "typescript"],
  "scope": "all_teams",
  "scopeTeams": [],
  "enforcement": {
    "level": "required",
    "onViolation": "block_and_notify",
    "preCommitHook": true
  },
  "history": [
    {
      "version": 2,
      "changedBy": "ceo",
      "changeType": "update",
      "diff": "...",
      "timestamp": "..."
    }
  ],
  "createdBy": "ceo",
  "createdAt": "...",
  "updatedAt": "..."
}
```

**Rule Categories:** `engineering`, `design`, `legal`, `security`, `operations`, `custom`

**Enforcement Levels:** `required` (blocks on violation), `recommended` (warns), `informational` (reference only)

**On-Violation Actions:** `block_and_notify`, `warn_and_log`, `log_only`

**Scope:** `all_teams` (applies globally), `specific_teams` (listed in `scopeTeams[]`)

**Built-in Rule Templates (governance/templates/):**

1. **coding-standards.md** — TypeScript strict, no `any`, JSDoc on public functions, functions <50 lines, files <300 lines, early returns, PascalCase components, camelCase hooks, UPPER_SNAKE constants, commit format: `type(scope): desc`
2. **design-standards.md** — shadcn/ui inspired, Tailwind only, slate grays, one accent per team, system font stack, text-sm body, 4px grid, rounded-lg default, no inline styles
3. **legal-checklist.md** — Allowed licenses: MIT, Apache-2.0, BSD, ISC. Blocked: GPL, AGPL, SSPL. No copyrighted assets, no API keys in source, no PII in logs
4. **security-policy.md** — No secrets in code, env vars for keys, input validation, dependency audit, no eval(), sanitize outputs

**Dashboard — /governance:**
- **Rule List:** Cards per rule: name, category badge, enforcer, status toggle, scope, version
- **Category Tabs:** Engineering | Design | Legal | Security | Operations | Custom
- **RuleEditor:** Full markdown editor with live preview. Save → increments version, stores diff in history
- **RuleVersionHistory:** Side-by-side diff view. Rollback button (→ triggers approval)
- **AddRuleModal:** Name, category, content (markdown editor or import .md), enforcer (agent picker), scope, enforcement level
- **Toggle active/inactive** per rule (deactivate without deleting)
- **Modifying rules = protected action** → triggers approval workflow

**Bridge — governanceManager.ts:**
- CRUD operations on `governance/rules/`
- Version tracking: increment version, compute diff, store in `governance/history/`
- Scope resolution: which rules apply to which teams
- Enforcement integration: when agent executes, inject applicable rules into prompt context
- Audit: all governance changes logged

---

### 6. DASHBOARD — MAIN APP

**3-Column Navigation Layout:**

```
┌──────────┬────────────────────┬──────────────────────────────┬──────────────┐
│ Team     │ Project            │ Main Content                 │ Chat         │
│ Switcher │ Sidebar            │ (Office / Tasks / etc.)      │ Panel        │
│ (52px)   │ (220px,collapsible)│                              │ (260px)      │
└──────────┴────────────────────┴──────────────────────────────┴──────────────┘
```

**Column 1 — Team Switcher (far-left, 52px):**
- Logo/home button at top → navigates to /office of current team
- Divider line
- Team pills: colored rounded squares with 2-letter abbreviation (team accent color bg, white text)
  - ET = Executive Team (blue #1e40af)
  - GS = Game Studio (purple #7C3AED)
  - VS = Video Studio (red #dc2626)
  - etc. — dynamically generated from teams
- Active team has highlighted border (2px solid `--color-border-info`)
- Dashed "+" pill at bottom of team list → opens AddTeamModal
- Clicking a team pill switches the office floor AND scopes the project sidebar to that team's projects
- Spacer
- Settings gear icon
- CEO avatar (bottom) — click → account/plan menu
- Mobile: horizontal strip at top, scrollable

**Column 2 — Project Sidebar (220px, collapsible):**

Top section — "PROJECTS" label + "+" button (→ AddProjectModal):
- Each project is a collapsible tree node:
  - Collapsed: project name + status dot (green=active, amber=paused, gray=archived) + inline team pills showing involved teams
  - Expanded: reveals 4 sub-items:
    - Goals — count badge, click → filters Goals panel to this project
    - Tasks — count badge, click → opens /tasks filtered to this project
    - Issues — count badge (red bg if any open bugs), click → opens /tasks?type=bug filtered
    - Teams — shows small colored team pills for teams assigned to this project (e.g., GS + ET), NOT individual agents
- Active sub-item highlighted with info background
- Projects shown: all projects the currently-selected team participates in. If no team selected (home), show all projects.

Divider line

Bottom section — "MANAGE" label:
- Governance — click → /governance
- MCP tools — count badge (connected count), click → /settings#mcp
- Budget — click → /office (Budget tab)
- Audit log — click → /office (Audit tab)
- Library — click → /office (Library tab)

Footer: plan badge ("Free plan") + "Upgrade" link

Mobile: drawer from left edge, swipe to open/close

**Column 3 — Main Content Area:**

Header bar: current team name + breadcrumb (e.g., "Executive team · Office view"), spacer, token usage bar, approval bell badge (count), provider health dots (green/gray/red per provider), "+ New" dropdown button (Agent, Team, Project, Task)

Sub-tabs below header (context-dependent):
- Office context: `[Office] [List] [Org chart]`
- Project context: `[Overview] [Tasks] [Timeline] [Teams] [Budget] [Settings]`
- Tasks context: `[Kanban] [List] [Timeline] [Sprints]`

Main body: renders the active view (pixel-art office, task board, project detail, etc.)

**Column 4 — Chat Panel (260px, right side):**
Same Slack-style chat as before: channel mini-sidebar + message stream + input.

**Office View (/office):** Pixel-art office floor. Sub-tabs: Office (pixel art), List (agent table), Org chart (hierarchy). Each team's office is a separate floor shown when that team's pill is clicked. All pixel-art features preserved: characters, BFS pathfinding, furniture, walls, status dots, speech bubbles, CEO corner suite, etc.

**Org Chart (sub-tab of Office):** Interactive hierarchical org chart:
- CEO (top) → C-suite → Team Directors → Agents
- Click any node → agent detail panel
- Drag to reorganize (→ triggers approval for executive changes)
- Shows provider icon per agent, status dot, current task

---

### 7. EXECUTIVE OFFICE (Team 00)

Created during onboarding. No agents exist until onboarding Step 3.

**team.json:** Same structure as V5, but `agents` in `team-config.json` are populated by onboarding wizard.

**CEO (human — NOT an agent):**
- Same as V5: corner suite, customizable avatar, online/offline status
- Now also appears in Org Chart as root node
- Can approve/reject from dashboard header

**C-Suite agents:** Same roles as V5 (CoS, CTO, CDO, CFO, CLO, COO) but:
- Each agent has a `providerId` field pointing to their LLM provider
- Each agent's `modelTier` maps to the provider's specific model
- Created during onboarding (user picks which executives to hire)
- Can be added/removed later from Teams settings

---

### 8. TEAM MANAGEMENT

**No hardcoded teams.** Teams 01, 02, etc. are created by the user (first team created during onboarding Step 5, rest added later via AddTeamModal).

**Team template (_template/):** Copied when creating new team. Contains:
- `team.json` — metadata (name, icon, accent, floor, budget, projects, etc.)
- `team-config.json` — agent roster (empty array to start)
- `state.json` — runtime state
- `goals/`, `tasks/`, `messages/` — empty directories
- `CLAUDE.md` — template text (user can edit)
- `start-team.bat` — launch script

**AddTeamModal:**
- Team name, icon (emoji picker), description
- Color accent picker
- Initial team leader: name, role, appearance, provider, model
- Optional: add starter agents
- Assign to existing project(s) (optional)

**TeamDashboard (sidebar panel or route):**
- Team overview: members, active project, current sprint, velocity chart
- Member list with status, provider, model, current task
- Quick actions: add agent, assign project, create task

---

### 9. GOALS + ISSUES

Same as V5 but enhanced:

**Enhancements:**
- Goals can be linked to projects (goal.project field)
- Goals can span multiple teams (goal.teams[] array)
- Issue auto-creation links to goals
- Progress rollup now includes task completion data from JIRA-style tasks
- Goals panel accessible from both /office (Goals tab) and /projects/{id} (Goals section)

**Data model:** Same structure as V5 `teams/{team}/goals/{id}.json` with added fields:
```json
{
  "...same as V5...",
  "project": "proj-001",
  "teams": ["01_Game_Studio", "02_Video_Studio"],
  "linkedTasks": ["BHQ-42", "BHQ-43"],
  "taskProgress": { "total": 12, "done": 5, "ratio": 0.42 }
}
```

---

### 10. GOVERNANCE + APPROVALS

**Approvals** same as V5 but expanded protected actions list:
```
delete_team, retire_agent, budget_override, change_provider,
archive_project, delete_project, modify_governance, rollback_governance,
modify_provider_keys, bulk_reassign, promote_agent, epic_delete
```

**Approval Queue (/approvals or header panel):**
- Full list with filters: status, action type, requester, date
- Batch approve/reject for same-type approvals
- Auto-escalation: if not resolved in 24h, escalate to next approver
- Delegation: approver can delegate to another C-suite agent

**Auto-Issue → Approval flow:** When auto-created issues hit critical threshold:
1. System creates approval: "Repeated failures detected for agent {name} on task {taskId}"
2. Recommended actions: reassign, change model, change provider, investigate manually
3. Approver picks action → system executes

---

### 11. BUDGET + ACCOUNTABILITY

Same as V5 but enhanced with multi-provider cost tracking:

**Enhancements:**
- Cost calculated per provider using each provider's pricing table from `providers.json`
- Budget breakdown by provider (pie chart: Claude vs Gemini vs OpenAI vs Custom)
- Project-level budgets (in addition to company → team → agent hierarchy)
- Cost comparison: show equivalent cost if same task ran on different provider

**Hierarchy:** Company → Project → Team → Agent

---

### 12. AUDIT + RUN HISTORY

Same as V5 but enhanced:

**Additional audited actions:** governance CRUD, provider CRUD, MCP CRUD, project CRUD, task CRUD, sprint lifecycle, onboarding events, auto-issue creation, approval delegation, bulk operations.

**Run records** now include:
```json
{
  "...same as V5...",
  "providerType": "gemini",
  "projectId": "proj-001",
  "taskId": "BHQ-42",
  "autoIssueCreated": false,
  "mcpToolsUsed": ["github:create_issue", "slack:post_message"]
}
```

---

### 13. MCP (MODEL CONTEXT PROTOCOL) CONNECTIONS

MCP connections give agents access to external tools and services. The platform ships with pre-built presets for popular MCP servers and supports custom connections.

**MCP Connection Data Model (data/mcp/connections.json):**
```json
{
  "connections": [
    {
      "id": "mcp-github-1",
      "preset": "github",
      "name": "GitHub",
      "description": "Repository management, issues, PRs, code search",
      "status": "connected",
      "transport": "sse",
      "config": {
        "url": "https://github.com/mcp-server",
        "authType": "token",
        "authToken": null,
        "authTokenEnvVar": "GITHUB_TOKEN",
        "headers": {}
      },
      "tools": [
        { "name": "create_issue", "description": "Create a GitHub issue", "enabled": true },
        { "name": "create_pr", "description": "Create a pull request", "enabled": true },
        { "name": "search_code", "description": "Search repository code", "enabled": true },
        { "name": "list_repos", "description": "List repositories", "enabled": true }
      ],
      "scope": {
        "type": "specific",
        "teams": ["01_Game_Studio"],
        "agents": []
      },
      "lastHealthCheck": "...",
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

**Connection Statuses:** `connected`, `disconnected`, `error`, `unconfigured`

**Transport Types:** `sse` (Server-Sent Events), `stdio` (local process), `streamable-http`

**Auth Types:** `none`, `token`, `oauth`, `api_key`, `custom_header`

**Scope:** `all` (every agent can use it), `specific` (only listed teams/agents)

**Pre-built MCP Presets (data/mcp/presets.json):**

Organized by category. Each preset includes: id, name, description, icon, category, default URL, auth type, transport, and documentation link.

| Category | Presets |
|----------|---------|
| **Code & Dev** | GitHub, GitLab, Bitbucket, Linear, Jira (Atlassian), Sentry |
| **Communication** | Slack, Discord, Microsoft Teams, Gmail, Outlook |
| **Storage & Docs** | Google Drive, Notion, Confluence, Dropbox, OneDrive |
| **Data & Analytics** | PostgreSQL, MySQL, MongoDB, Supabase, Firebase, BigQuery |
| **Cloud & Infra** | AWS, GCP, Azure, Vercel, Cloudflare, Docker |
| **Design** | Figma |
| **AI & Search** | Brave Search, Tavily, Exa, Perplexity |
| **Productivity** | Google Calendar, Todoist, Asana, Trello, Airtable |
| **Finance** | Stripe, QuickBooks |
| **Custom** | Any URL — user provides endpoint, auth, transport |

**Preset Definition Example:**
```json
{
  "id": "github",
  "name": "GitHub",
  "icon": "github",
  "category": "code_dev",
  "description": "Repository management, issues, PRs, actions, code search",
  "defaultTransport": "sse",
  "defaultUrl": "",
  "authType": "token",
  "authInstructions": "Create a personal access token at github.com/settings/tokens",
  "docsUrl": "https://github.com/modelcontextprotocol/servers/tree/main/src/github",
  "requiredScopes": ["repo", "read:org"],
  "popular": true
}
```

**Dashboard — MCP Manager (accessible from Settings → MCP or Sidebar → MCP):**

- **Connection List:** Cards per connection: name, icon, status badge, tools count, scope, toggle on/off
- **Category Tabs:** All | Code & Dev | Communication | Storage | Data | Cloud | AI | Productivity | Custom
- **McpPresetGallery:** Browse presets as cards. Click → opens AddMcpModal pre-filled with preset config
- **AddMcpModal:**
  - If preset: pre-filled URL, transport, auth type. User just provides credentials
  - If custom: URL input, transport selector (SSE/stdio/streamable-http), auth type selector, custom headers editor, optional model name
  - "Test Connection" button → verifies connectivity, discovers tools
  - Scope assignment: all agents, specific teams, or specific agents
- **McpConnectionCard (expanded):**
  - Connection health (last check, latency)
  - Tool list with per-tool enable/disable toggles
  - Agent/team assignment panel
  - Credentials update (without revealing existing values)
  - Delete (→ triggers approval if agents depend on it)
- **McpToolBrowser:** Searchable list of all available tools across all connections. Shows which agents have access.
- **McpAgentAssign:** Drag-and-drop or checklist to assign connections to agents/teams

**Agent Integration:**
- Each agent in `team-config.json` gains an `mcpConnections` field:
  ```json
  {
    "id": "bolt",
    "name": "Bolt",
    "...": "...",
    "mcpConnections": ["mcp-github-1", "mcp-slack-1"]
  }
  ```
- When an agent executes, the bridge injects the agent's assigned MCP tools into the execution context
- For Claude Code agents: tools available via `--mcp-config` flag
- For API-based agents (Claude API, Gemini, OpenAI): tools injected as function/tool definitions in the API request
- Audit log records which MCP tools each agent invocation used

**Bridge — mcpManager.ts:**
- CRUD operations on `data/mcp/connections.json`
- Health checks every `mcp.healthCheckIntervalSeconds` (default 120s)
- Tool discovery: on connect/reconnect, query MCP server for available tools via `tools/list`
- Connection lifecycle: connect, disconnect, reconnect with exponential backoff
- Scope resolution: resolve which tools are available to which agents
- Credential management: store tokens in `.env`, reference by envVar in connection config
- Proxy: for API-based agents, bridge acts as MCP client and translates tool calls

**Onboarding Integration:** Step 4 (Provider Setup) includes an optional "Connect Tools (MCP)" sub-section:
- Shows top 5 most popular presets (GitHub, Slack, Google Drive, Notion, Brave Search)
- Quick-connect with "I'll set this up later" skip option
- Any connections added here are available to all agents by default

---

### 14. BRIDGE

**Watches:** All V5 watch paths + `governance/rules/`, `data/projects/`, `data/tasks/`, `data/company/`, `data/providers/`, `data/mcp/`.

**Modules (23 total):**
- `configManager.ts` — Agent CRUD, roster diffing
- `teamManager.ts` — Team CRUD from _template, archive to 99_Archive
- `projectManager.ts` — Project CRUD, cross-team assignment, git init + lint, milestone tracking
- `taskManager.ts` — Task/issue CRUD, sprint management, kanban state transitions, auto-issue creation on agent failure, task ID generation, story point tracking, time logging, dependency resolution
- `goalManager.ts` — Goal/issue CRUD, hierarchy, rollup (now includes task progress)
- `approvalManager.ts` — Approval workflows, escalation, batch ops, delegation, auto-escalation timer
- `budgetManager.ts` — Budget limits, multi-provider usage tracking, alerts, pause, snapshots
- `providerManager.ts` — Multi-LLM provider CRUD, health checks (60s), routing, fallback, connection testing, adapter factory (creates correct adapter per provider type)
- `mcpManager.ts` — MCP connection CRUD, health checks (120s), tool discovery, scope resolution, credential management, connection lifecycle, proxy for API-based agents
- `governanceManager.ts` — Governance rules CRUD, versioning, diff computation, scope resolution, enforcement injection
- `onboardingManager.ts` — Company setup, wizard state persistence, initial scaffolding (creates team dirs, provider configs, MCP presets, governance files)
- `auditLogger.ts` — Append JSONL, rotate daily
- `runHistoryManager.ts` — Per-run JSON, linked to tasks/goals/projects
- `channelManager.ts` — Channels, DMs, unread, 10K rotation
- `usageReader.ts` — Claude Code JSONL poll 30s + API-based provider cost aggregation
- `watchdog.ts` — Rate limits, auto-resume
- `libraryManager.ts` — Index, publish
- `persistence.ts` — Debounced 2s, atomic writes, full_state_sync on connect
- `commander.ts` — Dashboard commands → agent inbox

---

### 15. WEBSOCKET PROTOCOL

**Server → Dashboard:**
```
full_state_sync, agent_message, agent_status, roster_update, usage_update,
priorities_updated, team_created/archived/renamed, platform_config_updated,
library_item_published, channel_created/message/dm_message,
rate_limit_hit, auto_resume_scheduled,
project_created/updated/archived/deleted/git_status/milestone_updated,
task_created/updated/status_changed/assigned/commented/sprint_changed,
sprint_created/started/completed,
auto_issue_created, auto_issue_escalated,
goal_created/updated/status_changed/progress_rollup/comment_added,
approval_requested/resolved/escalated/delegated/count_update,
budget_update/alert/pause/resume,
provider_added/updated/removed/health_changed/fallback_triggered/recovered,
mcp_connected/disconnected/error/health_changed/tools_discovered/tool_toggled,
governance_rule_created/updated/toggled/deleted/rollback,
audit_entry, run_completed/failed,
onboarding_step_completed/finished
```

**Dashboard → Server:**
```
request_state, send_message/dm, create_channel,
update_agent_config, add_agent, remove_agent, update_priorities,
create_team, archive_team, rename_team, update_platform_config,
publish_to_library,
create_project, update_project, archive_project, delete_project,
assign_team_to_project, remove_team_from_project, request_git_status,
create_task, update_task, transition_task, assign_task, comment_task,
bulk_update_tasks, create_sprint, start_sprint, complete_sprint,
create_goal, update_goal, add_goal_comment, create_issue,
resolve_approval, delegate_approval, batch_approve,
update_budget_limits, budget_override/pause/resume,
add_provider, update_provider, remove_provider, test_provider,
switch_agent_provider, set_default_provider,
add_mcp_connection, update_mcp_connection, remove_mcp_connection,
test_mcp_connection, toggle_mcp_tool, assign_mcp_to_agent,
unassign_mcp_from_agent, refresh_mcp_tools,
create_governance_rule, update_governance_rule, toggle_governance_rule,
delete_governance_rule, rollback_governance_rule,
query_audit, query_runs,
complete_onboarding_step, finish_onboarding
```

---

### 16. CLAUDE.md FILES

**⚠️ Every CLAUDE.md ≤200 characters. No headers, bullets, or prose. Sticky-note directives only.**

**Root:**
```
BaroHQ: AI company control plane. npm package. /dashboard=Next.js, /bridge=WS, /teams=agents, /projects=repos, /governance=rules, /data=audit+budgets+tasks+runs.
```

**_template (copied per team):**
```
{TeamName}. Director:{LeaderName}→CoS→CEO. Read team.json, state.json, goals/, tasks/. Post to #{channel}. Follow governance/rules/. Check library/.
```

---

### 17. SCRIPTS

**start-team.bat:** Same as V5.

**start-infra.bat:** `npx pm2 start ecosystem.config.js`
**stop-all.bat:** `npx pm2 stop all && npx pm2 delete all`

**ecosystem.config.js:**
```javascript
module.exports = {
  apps: [
    { name: 'barohq-dashboard', cwd: './dashboard', script: 'npm', args: 'run start', env: { PORT: 3000 } },
    { name: 'barohq-bridge', cwd: './bridge', script: 'npm', args: 'run start', env: { PORT: 3001 } }
  ]
};
```

**postinstall.js (scripts/):** Runs after `npm install`:
- Creates `data/`, `teams/`, `projects/`, `governance/`, `library/` if missing
- Copies governance templates to `governance/rules/` if first install
- Copies MCP presets to `data/mcp/presets.json` if first install
- Generates default `config.json` if missing
- Prints welcome message with `npx barohq start` instructions

---

### 18. MONETIZATION FRAMEWORK

**License tiers (enforced client-side + future server validation):**

| Feature | Free | Starter | Pro | Enterprise |
|---------|------|---------|-----|------------|
| Agents | 5 | 10 | Unlimited | Unlimited |
| Teams | 2 | 5 | Unlimited | Unlimited |
| Projects | 2 | 10 | Unlimited | Unlimited |
| Providers | 1 | 3 | All | All + Custom |
| MCP Connections | 2 | 5 | Unlimited | Unlimited |
| Governance Rules | 3 | 10 | Unlimited | Unlimited |
| Task Tracking | Basic | Full | Full | Full |
| Sprint Management | ✗ | ✓ | ✓ | ✓ |
| Auto-Issue | ✗ | ✓ | ✓ | ✓ |
| Audit Retention | 7 days | 30 days | 90 days | Custom |
| Budget Tracking | Basic | Full | Full | Full |
| Approval Workflows | ✗ | Basic | Full | Full + Custom |
| API Access | ✗ | ✗ | ✓ | ✓ |
| Priority Support | ✗ | ✗ | ✓ | ✓ |
| SSO / SAML | ✗ | ✗ | ✗ | ✓ |

**License enforcement (config.json → license):**
```json
{
  "key": null,
  "tier": "free",
  "expiresAt": null,
  "maxAgents": 5,
  "maxTeams": 2,
  "maxProjects": 2,
  "maxProviders": 1,
  "maxMcpConnections": 2,
  "maxGovernanceRules": 3,
  "features": {
    "sprints": false,
    "autoIssue": false,
    "advancedApprovals": false,
    "apiAccess": false
  }
}
```

**Enforcement points:** Agent creation, team creation, project creation, provider addition, MCP connection creation, governance rule creation. When limit hit → show upgrade modal with plan comparison.

**Upgrade modal:** Pixel-art themed. Shows current plan, next tier benefits, CTA button. In V6 the CTA is a placeholder URL. Future: integrate Stripe/LemonSqueezy.

**Settings → Subscription:** Show current plan, usage vs limits, license key input, upgrade button.

---

## BUILD ORDER

0. `git init`, `.gitignore`
1. Full folder structure (teams/, projects/, library/, governance/, data/) + NPM package scaffold (package.json, cli.js, README.md)
2. Code quality (eslint, prettier, husky, lint-staged, tsconfig strict)
3. Governance templates (governance/templates/*.md → governance/rules/*.json) + MCP presets (data/mcp/presets.json)
4. CLI entry point (cli.js) + postinstall script
5. Dashboard — onboarding wizard (7 steps, all components in onboarding/, includes MCP quick-connect in Step 4)
6. Dashboard — main app: office (pixel-art, team switcher, org chart), project sidebar (tree nav), agents (list, add, settings, provider select), teams (settings, add, dashboard), chat (channels, DMs), header, common components
7. Dashboard — projects (panel, detail, board, timeline, add modal) + tasks (JIRA-style: board, list, timeline, detail, create, sprint, filters, auto-issue log)
8. Dashboard — providers (manager, card, add, test, model mapping), MCP (manager, connection card, preset gallery, tool browser, test, agent assign), governance (panel, editor, categories, version history, add rule), goals, budget, audit, approvals (queue + batch)
9. Bridge — all 23 modules (including mcpManager)
10. Team template + data/ scaffolding (company.json, providers.json, mcp/connections.json, mcp/presets.json, tasks.json, sprints.json, auto-issues.json, empty dirs)
11. config.json, build-progress.json, ecosystem, scripts
12. Install deps, `npm run dev`, verify OFFLINE at localhost:3000 (should show onboarding), `npm run lint` → 0 errors
13. `git add -A && git commit -m "Initial build complete"`

After each step: update build-progress.json + git commit.

---

## CRITICAL REQUIREMENTS

1. OFFLINE overlay when bridge disconnected — no mock data
2. ONBOARDING WIZARD on first launch — guides company setup start to finish
3. NO HARDCODED TEAMS — user creates all teams (except 00_Executive_Office from onboarding)
4. MULTI-LLM PROVIDERS — Claude Code, Claude API, Gemini, OpenAI/Codex, OpenRouter, Custom (URL+key)
5. Agent model + provider editable from dashboard → persisted to team-config.json
6. Agent ADD modal includes provider/model selection with live preview
7. PROJECTS separate from teams — cross-team, own goals/tasks/budget/timeline
8. JIRA-STYLE TASKS — epics, stories, tasks, bugs, sub-tasks, sprints, kanban, timeline
9. AUTO-ISSUE creation on agent failure → bug task → escalation → approval queue
10. GOVERNANCE as separate concept — versioned rules, categories, UI editor, enforcement levels
11. Agent ADD (appearance picker + preview) and RETIRE (walk-out animation)
12. Roster changes from any source auto-detected
13. Pixel characters: FULL BODY, unique appearance, BFS pathfinding (doorways only)
14. Office: tile floor, walls, doors, windows, entrance, restroom, hallway, furniture
15. Mobile responsive, collapsible panels, sidebar navigation
16. TypeScript throughout, Zustand state (split stores), chokidar watching, atomic writes
17. **OFFICE SUB-TABS:** Office (pixel art), List (agent table), Org chart — all real-time. Goals/Budget/Audit/Library accessible from project sidebar.
18. **3-COLUMN NAV:** Team switcher (far-left pills) + Project sidebar (collapsible tree) + Main content + Chat panel
19. **CHAT:** Slack-style channels + DMs + unread + @mentions + threads
20. **ALL state persisted** — reconnect = full sync, resume positions, load histories
21. **USAGE:** header bar + detail, color coded, per-provider breakdown
22. **TEAM SWITCHER:** Far-left colored pills (2-letter abbreviation), clicking switches office floor + scopes sidebar
23. **ORG CHART:** Interactive hierarchy: CEO → C-suite → Directors → Agents
24. **EXECUTIVE:** CEO corner suite, Meeting Room, C-suite desks (populated from onboarding)
25. **HIERARCHY:** CEO (avatar) → CoS → C-suite → Directors → Agents
26. **TEAM CRUD:** create/rename/archive/delete, numbered 00-98, 99=Archive
27. **GOALS + ISSUES:** hierarchy, ownership, status, comments, progress rollup, kanban, linked to tasks
28. **APPROVALS:** protected actions require CEO approval, batch ops, delegation, auto-escalation
29. **BUDGETS:** company/project/team/agent limits, multi-provider cost, alerts, pause-on-exceed
30. **PROVIDERS:** full CRUD, health checks, test connection, fallback routing, custom endpoints
31. **MCP:** pre-built presets (GitHub, Slack, Drive, etc.), custom URL connections, per-agent tool assignment, tool discovery, health checks
32. **GOVERNANCE:** versioned rules, category tabs, markdown editor, enforcement levels, diff history
33. **AUDIT:** immutable JSONL, daily rotation, searchable dashboard, expanded action coverage
34. **RUN HISTORY:** per-execution records, linked to goals/tasks/projects, multi-provider, MCP tools tracked
35. **NPM PACKAGE:** `npx barohq init`, `npx barohq start`, distributable via npm
36. **MONETIZATION:** license tiers (free/starter/pro/enterprise), enforcement, upgrade modal
37. **CODE QUALITY:** ESLint + Prettier + Husky, blocks on lint failure
38. **CLAUDE.md ≤200 chars** everywhere — terse directives only
39. **CRASH RECOVERY:** build-progress.json + git commit per step
40. **"Teams" not "departments"** throughout all code, configs, UI, file paths

Start building. Create every file. No questions — make decisions and build.
