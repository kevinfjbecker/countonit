export function generateId(prefix?: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  const pfx = prefix ? `${prefix}-` : 'id-'
  return pfx + Math.random().toString(36).substring(2, 11) + '-' + Date.now()
}
