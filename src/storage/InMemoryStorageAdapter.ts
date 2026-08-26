import type { StorageAdapter } from '../types/storage'

export class InMemoryStorageAdapter implements StorageAdapter {
  private store: Map<string, string> = new Map()

  async getItem<T>(key: string): Promise<T | null> {
    const raw = this.store.get(key)
    if (raw === undefined) {
      return null
    }
    try {
      return JSON.parse(raw) as T
    } catch {
      return null
    }
  }

  async setItem<T>(key: string, value: T): Promise<void> {
    this.store.set(key, JSON.stringify(value))
  }

  async removeItem(key: string): Promise<void> {
    this.store.delete(key)
  }

  async clear(): Promise<void> {
    this.store.clear()
  }

  async keys(): Promise<string[]> {
    return Array.from(this.store.keys())
  }
}
