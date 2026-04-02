#!/usr/bin/env node
const { Command } = require('commander');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

const program = new Command();
program.name('barohq').description('BaroHQ — AI Company Management Platform').version('6.0.0');

program
  .command('init')
  .description('Initialize a new BaroHQ workspace in the current directory')
  .option('--dir <path>', 'Target directory', '.')
  .action(async (opts) => {
    const targetDir = path.resolve(opts.dir);
    const dirs = [
      'data/audit', 'data/runs', 'data/budgets/snapshots', 'data/approvals/pending',
      'data/approvals/resolved', 'data/providers', 'data/mcp', 'data/projects',
      'data/tasks', 'data/company', 'data/messages', 'projects',
      'library/characters', 'library/research', 'library/assets', 'library/audio', 'library/data',
      'governance/rules/custom', 'governance/templates', 'governance/history',
    ];
    for (const d of dirs) {
      fs.mkdirSync(path.join(targetDir, d), { recursive: true });
    }
    // Ensure flat data files exist
    const flatFiles = [
      { path: 'data/teams.json', default: '[]' },
      { path: 'data/goals.json', default: '[]' },
      { path: 'data/channels.json', default: '[]' },
    ];
    for (const f of flatFiles) {
      const fp = path.join(targetDir, f.path);
      if (!fs.existsSync(fp)) {
        fs.writeFileSync(fp, f.default);
      }
    }
    const configPath = path.join(targetDir, 'config.json');
    if (!fs.existsSync(configPath)) {
      const pkgDir = __dirname;
      const defaultConfig = path.join(pkgDir, 'config.json');
      if (fs.existsSync(defaultConfig)) {
        fs.copyFileSync(defaultConfig, configPath);
      }
    }
    console.log(`BaroHQ workspace initialized at ${targetDir}`);
    console.log('Run "npx barohq start" to launch.');
  });

program
  .command('start')
  .description('Start BaroHQ dashboard + bridge')
  .option('--port <number>', 'Dashboard port', '3000')
  .option('--bridge-port <number>', 'Bridge port', '3001')
  .action(async (opts) => {
    console.log('Starting BaroHQ...');
    const bridgeProc = spawn('node', [path.join(__dirname, 'bridge', 'dist', 'index.js')], {
      env: { ...process.env, PORT: opts.bridgePort },
      stdio: 'inherit',
    });
    const dashProc = spawn('npm', ['run', 'start'], {
      cwd: path.join(__dirname, 'dashboard'),
      env: { ...process.env, PORT: opts.port },
      stdio: 'inherit',
      shell: true,
    });
    process.on('SIGINT', () => {
      bridgeProc.kill();
      dashProc.kill();
      process.exit(0);
    });
  });

program
  .command('stop')
  .description('Stop all BaroHQ processes')
  .action(async () => {
    spawn('npx', ['pm2', 'stop', 'all'], { stdio: 'inherit', shell: true });
  });

program
  .command('status')
  .description('Show running status')
  .action(async () => {
    spawn('npx', ['pm2', 'status'], { stdio: 'inherit', shell: true });
  });

program.parse();
