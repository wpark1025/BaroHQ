import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import {
  LibraryItem,
  LibraryIndex,
  Manager,
} from './types';
import {
  getLibraryDir,
  readJson,
  writeJsonAtomic,
  ensureDir,
  copyDir,
  exists,
} from './persistence';
import { BroadcastFn } from './auditLogger';

export class LibraryManager implements Manager {
  private libraryDir: string;
  private indexPath: string;
  private broadcast: BroadcastFn | null = null;

  constructor() {
    this.libraryDir = getLibraryDir();
    this.indexPath = path.join(this.libraryDir, 'index.json');
  }

  setBroadcast(fn: BroadcastFn): void {
    this.broadcast = fn;
  }

  async init(): Promise<void> {
    await ensureDir(this.libraryDir);
    // Ensure index exists
    if (!(await exists(this.indexPath))) {
      await writeJsonAtomic(this.indexPath, { items: [] });
    }
    console.log('[library] Library manager initialized.');
  }

  private async loadIndex(): Promise<LibraryIndex> {
    return readJson<LibraryIndex>(this.indexPath, { items: [] });
  }

  private async saveIndex(index: LibraryIndex): Promise<void> {
    await writeJsonAtomic(this.indexPath, index);
  }

  /**
   * List all library items.
   */
  async listItems(filters?: {
    type?: string;
    category?: string;
    tags?: string[];
  }): Promise<LibraryItem[]> {
    const index = await this.loadIndex();
    let items = index.items;

    if (filters) {
      if (filters.type) items = items.filter((i) => i.type === filters.type);
      if (filters.category) items = items.filter((i) => i.category === filters.category);
      if (filters.tags && filters.tags.length > 0) {
        items = items.filter((i) =>
          filters.tags!.some((tag) => i.tags.includes(tag))
        );
      }
    }

    return items;
  }

  /**
   * Get a single library item by ID.
   */
  async getItem(id: string): Promise<LibraryItem | null> {
    const index = await this.loadIndex();
    return index.items.find((i) => i.id === id) || null;
  }

  /**
   * Publish an item from a team to the shared library.
   */
  async publishItem(params: {
    name: string;
    type: string;
    category: string;
    description: string;
    sourcePath: string;
    publishedBy: string;
    publishedFrom: string;
    tags?: string[];
  }): Promise<LibraryItem> {
    const now = new Date().toISOString();
    const id = uuidv4();
    const slug = params.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const destPath = path.join(this.libraryDir, params.category, slug);

    // Copy source to library
    if (await exists(params.sourcePath)) {
      const fsp = await import('fs/promises');
      const stat = await fsp.stat(params.sourcePath);
      if (stat.isDirectory()) {
        await copyDir(params.sourcePath, destPath);
      } else {
        await ensureDir(path.dirname(destPath));
        await fsp.copyFile(params.sourcePath, destPath);
      }
    } else {
      // Create a placeholder directory
      await ensureDir(destPath);
    }

    const item: LibraryItem = {
      id,
      name: params.name,
      type: params.type,
      category: params.category,
      description: params.description,
      path: path.relative(this.libraryDir, destPath),
      publishedBy: params.publishedBy,
      publishedFrom: params.publishedFrom,
      tags: params.tags || [],
      createdAt: now,
      updatedAt: now,
    };

    const index = await this.loadIndex();
    index.items.push(item);
    await this.saveIndex(index);

    if (this.broadcast) {
      this.broadcast('library_item_published', { item });
    }

    console.log(`[library] Published item: ${item.name} (${id})`);
    return item;
  }

  /**
   * Remove an item from the library.
   */
  async removeItem(id: string): Promise<boolean> {
    const index = await this.loadIndex();
    const idx = index.items.findIndex((i) => i.id === id);
    if (idx === -1) return false;

    const item = index.items[idx];
    index.items.splice(idx, 1);
    await this.saveIndex(index);

    // Optionally remove the files
    const itemPath = path.join(this.libraryDir, item.path);
    if (await exists(itemPath)) {
      const fsp = await import('fs/promises');
      await fsp.rm(itemPath, { recursive: true, force: true });
    }

    return true;
  }

  /**
   * Re-index library contents from disk.
   */
  async reindex(): Promise<LibraryIndex> {
    // Keep existing items but verify they still exist on disk
    const index = await this.loadIndex();
    const validItems: LibraryItem[] = [];

    for (const item of index.items) {
      const itemPath = path.join(this.libraryDir, item.path);
      if (await exists(itemPath)) {
        validItems.push(item);
      }
    }

    const updated: LibraryIndex = { items: validItems };
    await this.saveIndex(updated);

    return updated;
  }

  async shutdown(): Promise<void> {
    console.log('[library] Library manager shut down.');
  }
}
