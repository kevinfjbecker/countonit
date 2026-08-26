export * from './StorageAdapter'
export * from './InMemoryStorageAdapter'
export * from './LocalStorageAdapter'

import { LocalStorageAdapter } from './LocalStorageAdapter'
import { InMemoryStorageAdapter } from './InMemoryStorageAdapter'
import type { StorageAdapter } from '../types/storage'

export function createDefaultStorageAdapter(): StorageAdapter {
  if (typeof window !== 'undefined' && window.localStorage) {
    return new LocalStorageAdapter()
  }
  // Fallback for SSR / Node / tests
  return new InMemoryStorageAdapter()
}

