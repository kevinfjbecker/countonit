import { describe, it, expect, beforeEach } from 'vitest'
import { InMemoryStorageAdapter } from '../InMemoryStorageAdapter'
import { LocalStorageAdapter } from '../LocalStorageAdapter'

describe('InMemoryStorageAdapter', () => {
  let adapter: InMemoryStorageAdapter

  beforeEach(() => {
    adapter = new InMemoryStorageAdapter()
  })

  it('stores and retrieves primitive values', async () => {
    await adapter.setItem('test-key', 'test-value')
    const result = await adapter.getItem<string>('test-key')
    expect(result).toBe('test-value')
  })

  it('stores and retrieves objects and arrays', async () => {
    const complexObj = { id: '123', tags: ['a', 'b'], nested: { score: 42 } }
    await adapter.setItem('complex', complexObj)
    const result = await adapter.getItem<typeof complexObj>('complex')
    expect(result).toEqual(complexObj)
  })

  it('returns null for non-existent keys', async () => {
    const result = await adapter.getItem<string>('non-existent')
    expect(result).toBeNull()
  })

  it('removes items correctly', async () => {
    await adapter.setItem('to-remove', 'value')
    expect(await adapter.getItem('to-remove')).toBe('value')
    await adapter.removeItem('to-remove')
    expect(await adapter.getItem('to-remove')).toBeNull()
  })

  it('clears all items', async () => {
    await adapter.setItem('key1', 1)
    await adapter.setItem('key2', 2)
    expect((await adapter.keys()).length).toBe(2)
    await adapter.clear()
    expect(await adapter.getItem('key1')).toBeNull()
    expect(await adapter.getItem('key2')).toBeNull()
    expect((await adapter.keys()).length).toBe(0)
  })

  it('lists all keys', async () => {
    await adapter.setItem('alpha', 1)
    await adapter.setItem('beta', 2)
    const keys = await adapter.keys()
    expect(keys).toEqual(expect.arrayContaining(['alpha', 'beta']))
  })
})

describe('LocalStorageAdapter', () => {
  let adapter: LocalStorageAdapter

  beforeEach(() => {
    localStorage.clear()
    adapter = new LocalStorageAdapter()
  })

  it('persists and retrieves JSON data through localStorage', async () => {
    await adapter.setItem('user-key', { name: 'Count' })
    const result = await adapter.getItem<{ name: string }>('user-key')
    expect(result).toEqual({ name: 'Count' })
  })

  it('returns null for non-existent keys', async () => {
    const result = await adapter.getItem('not-found')
    expect(result).toBeNull()
  })

  it('handles invalid JSON gracefully by returning null', async () => {
    localStorage.setItem('corrupted-key', 'not-valid-json{')
    const result = await adapter.getItem('corrupted-key')
    expect(result).toBeNull()
  })

  it('removes items from localStorage', async () => {
    await adapter.setItem('temp', 123)
    await adapter.removeItem('temp')
    expect(await adapter.getItem('temp')).toBeNull()
  })

  it('clears all stored items', async () => {
    await adapter.setItem('a', 1)
    await adapter.setItem('b', 2)
    await adapter.clear()
    expect(await adapter.getItem('a')).toBeNull()
    expect(await adapter.getItem('b')).toBeNull()
  })

  it('lists stored keys', async () => {
    await adapter.setItem('k1', 'v1')
    await adapter.setItem('k2', 'v2')
    const keys = await adapter.keys()
    expect(keys).toEqual(expect.arrayContaining(['k1', 'k2']))
  })
})
