type CsvColumn<T> = { key: keyof T; header: string; format?: (value: unknown, row: T) => string }

function csvEscape(value: string) {
  return `"${value.replace(/"/g, '""')}"`
}

export function downloadCsv<T extends Record<string, unknown>>(
  filename: string,
  rows: T[],
  columns: CsvColumn<T>[]
) {
  const header = columns.map((c) => csvEscape(c.header)).join(';')
  const lines = rows.map((row) =>
    columns
      .map((c) => {
        const raw = row[c.key]
        const text = c.format ? c.format(raw, row) : raw == null ? '' : String(raw)
        return csvEscape(text)
      })
      .join(';')
  )
  const blob = new Blob(['\uFEFF' + [header, ...lines].join('\n')], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}
