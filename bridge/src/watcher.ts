import * as path from 'path';
import chokidar from 'chokidar';
import { Manager } from './types';
import { getRootDir } from './persistence';

export type FileChangeCallback = (eventType: string, filePath: string) => void;

export class FileWatcher implements Manager {
  private watcher: chokidar.FSWatcher | null = null;
  private rootDir: string;
  private callback: FileChangeCallback | null = null;
  private debounceTimers: Map<string, ReturnType<typeof setTimeout>> = new Map();
  private debounceMs: number;

  constructor(debounceMs = 500) {
    this.rootDir = getRootDir();
    this.debounceMs = debounceMs;
  }

  setCallback(cb: FileChangeCallback): void {
    this.callback = cb;
  }

  async init(): Promise<void> {
    const watchPaths = [
      path.join(this.rootDir, 'data', 'teams.json'),
      path.join(this.rootDir, 'data', 'goals.json'),
      path.join(this.rootDir, 'data', 'channels.json'),
      path.join(this.rootDir, 'data', 'messages', '**'),
      path.join(this.rootDir, 'governance', 'rules', '**'),
      path.join(this.rootDir, 'data', 'projects', '*'),
      path.join(this.rootDir, 'data', 'tasks', '*'),
      path.join(this.rootDir, 'data', 'company', '*'),
      path.join(this.rootDir, 'data', 'providers', '*'),
      path.join(this.rootDir, 'data', 'mcp', '*'),
      path.join(this.rootDir, 'config.json'),
    ];

    this.watcher = chokidar.watch(watchPaths, {
      ignoreInitial: true,
      persistent: true,
      awaitWriteFinish: {
        stabilityThreshold: 300,
        pollInterval: 100,
      },
      ignored: [
        /(^|[/\\])\../, // dotfiles
        /\.tmp$/,        // temp files from atomic writes
      ],
    });

    this.watcher.on('add', (fp) => this.debouncedNotify('add', fp));
    this.watcher.on('change', (fp) => this.debouncedNotify('change', fp));
    this.watcher.on('unlink', (fp) => this.debouncedNotify('unlink', fp));

    this.watcher.on('error', (err) => {
      console.error('[watcher] Error:', err);
    });

    console.log('[watcher] File watcher initialized.');
  }

  private debouncedNotify(eventType: string, filePath: string): void {
    const key = `${eventType}:${filePath}`;
    const existing = this.debounceTimers.get(key);
    if (existing) {
      clearTimeout(existing);
    }

    const timer = setTimeout(() => {
      this.debounceTimers.delete(key);
      if (this.callback) {
        this.callback(eventType, filePath);
      }
    }, this.debounceMs);

    this.debounceTimers.set(key, timer);
  }

  /**
   * Categorize a file change to determine which manager handles it.
   */
  static categorize(filePath: string): string {
    const normalized = filePath.replace(/\\/g, '/');

    if (normalized.endsWith('config.json') && !normalized.includes('/data/')) {
      return 'config';
    }
    if (normalized.includes('/data/teams.json')) {
      return 'teams';
    }
    if (normalized.includes('/data/goals.json')) {
      return 'goal';
    }
    if (normalized.includes('/data/channels.json')) {
      return 'channel';
    }
    if (normalized.includes('/data/messages/')) {
      return 'channel';
    }
    if (normalized.includes('/governance/rules/')) {
      return 'governance';
    }
    if (normalized.includes('/data/projects/')) {
      return 'project';
    }
    if (normalized.includes('/data/tasks/')) {
      return 'task';
    }
    if (normalized.includes('/data/company/')) {
      return 'company';
    }
    if (normalized.includes('/data/providers/')) {
      return 'provider';
    }
    if (normalized.includes('/data/mcp/')) {
      return 'mcp';
    }
    return 'unknown';
  }

  async shutdown(): Promise<void> {
    // Clear all debounce timers
    for (const timer of this.debounceTimers.values()) {
      clearTimeout(timer);
    }
    this.debounceTimers.clear();

    if (this.watcher) {
      await this.watcher.close();
      console.log('[watcher] File watcher closed.');
    }
  }
}
