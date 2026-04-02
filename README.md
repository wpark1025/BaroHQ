# BaroHQ

Multi-agent orchestration control plane & AI company management platform with a pixel-art office dashboard.

## Quick Start

```bash
npx barohq init
npx barohq start
```

Open http://localhost:3000 — the onboarding wizard will guide you through company setup.

## Features

- **Pixel-Art Office Dashboard** — Visual agent management with animated characters
- **Multi-LLM Providers** — Claude, Gemini, OpenAI/Codex, OpenRouter, Custom endpoints
- **MCP Integration** — Connect GitHub, Slack, Google Drive, Notion, and 30+ tools
- **JIRA-Style Tasks** — Epics, stories, tasks, bugs, sprints, kanban boards
- **Project Management** — Cross-team projects with timelines, milestones, budgets
- **Governance Rules** — Versioned company rules with enforcement levels
- **Approval Workflows** — Protected actions require CEO approval
- **Budget Tracking** — Company/project/team/agent spend with multi-provider cost
- **Audit Trail** — Immutable JSONL logs with daily rotation
- **Org Chart** — Interactive CEO → C-suite → Teams → Agents hierarchy

## Architecture

| Layer | Port | Tech |
|-------|------|------|
| Dashboard | 3000 | Next.js, React, Tailwind, Zustand |
| Bridge | 3001 | Node.js, WebSocket, chokidar |
| Data | — | JSON file persistence |

## CLI

```bash
npx barohq init        # Initialize workspace
npx barohq start       # Start dashboard + bridge
npx barohq stop        # Stop all processes
npx barohq status      # Show running status
```

## License

MIT
