/**
 * Domain and date formatting utilities aligned with CONTEXT.md and spec.
 */

export function formatDateTimeForInput(dateOrIso: Date | string = new Date()): string {
  let d: Date
  if (typeof dateOrIso === 'string') {
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateOrIso)) {
      const [y, m, day] = dateOrIso.split('-').map(Number)
      d = new Date(y, m - 1, day, new Date().getHours(), new Date().getMinutes())
    } else {
      d = new Date(dateOrIso)
    }
  } else {
    d = dateOrIso
  }

  const pad = (num: number) => String(num).padStart(2, '0')
  const y = d.getFullYear()
  const m = pad(d.getMonth() + 1)
  const day = pad(d.getDate())
  const h = pad(d.getHours())
  const min = pad(d.getMinutes())
  return `${y}-${m}-${day}T${h}:${min}`
}

export function formatUnitQuantity(quantity: number, unit?: string | null): string {
  const u = unit || ''
  if (!u) return `${quantity}`
  if (quantity === 1) return `1 ${u}`
  if (u.endsWith('ss')) return `${quantity} ${u}es`
  if (u.endsWith('s')) return `${quantity} ${u}`
  return `${quantity} ${u}s`
}
