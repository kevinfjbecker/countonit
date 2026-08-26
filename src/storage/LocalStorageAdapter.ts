import type { StorageAdapter } from '../types/storage'

export class LocalStorageAdapter implements StorageAdapter {
  private prefix: string

  constructor(prefix: string = '') {
    this.prefix = prefix
  }

  private getPrefixedKey(key: string): string {
    return this.prefix ? `${this.prefix}:${key}` : key
  }

  private getOriginalKey(prefixedKey: string): string {
    if (this.prefix && prefixedKey.startsWith(`${this.prefix}:`)) {
      return prefixedKey.slice(this.prefix.length + 1)
    }
    return prefixedKey
  }

  async getItem<T>(key: string): Promise<T | null> {
    try {
      const raw = localStorage.getItem(this.getPrefixedKey(key))
      if (raw === null) {
        return null
      }
      return JSON.parse(raw) as T
    } catch {
      return null
    }
  }

  async setItem<T>(key: string, value: T): Promise<void> {
    try {
      localStorage.setItem(this.getPrefixedKey(key), JSON.stringify(value))
    } catch (error) {
      console.error('LocalStorageAdapter setItem error:', error)
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      localStorage.removeItem(this.getPrefixedKey(key))
    } catch (error) {
      console.error('LocalStorageAdapter removeItem error:', error)
    }
  }

  async clear(): Promise<void> {
    try {
      if (!this.prefix) {
        localStorage.clear()
        return
      }

      const keysToRemove: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i)
        if (k && k.startsWith(`${this.prefix}:`)) {
          keysToRemove.push(k)
        }
      }
      for (const k of keysToRemove) {
        localStorage.removeItem(k)
      }
    } catch (error) {
      console.error('LocalStorageAdapter clear error:', error)
    }
  }

  async keys(): Promise<string[]> {
    try {
      const result: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i)
        if (k) {
          if (this.prefix) {
            if (k.startsWith(`${this.prefix}:`)) {
              result.push(this.getOriginalKey(k))
            }
          } else {
            result.push(k)
          }
        }
      }
      return result
    } catch {
      return []
    }
  }
}
