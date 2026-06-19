import { computed, ref, watch, type Ref } from 'vue'

type SortDir = 'asc' | 'desc'

export function useAdminListView<T extends Record<string, unknown>>(
  source: Ref<T[]>,
  opts?: { pageSize?: number; defaultSort?: { key: keyof T; dir?: SortDir } }
) {
  const sortKey = ref<keyof T | ''>(opts?.defaultSort?.key ?? '')
  const sortDir = ref<SortDir>(opts?.defaultSort?.dir ?? 'desc')
  const page = ref(1)
  const pageSize = ref(opts?.pageSize ?? 20)

  function toggleSort(key: keyof T) {
    if (sortKey.value === key) sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
    else {
      sortKey.value = key
      sortDir.value = 'desc'
    }
    page.value = 1
  }

  function sortIcon(key: keyof T) {
    if (sortKey.value !== key) return 'unfold_more'
    return sortDir.value === 'asc' ? 'arrow_upward' : 'arrow_downward'
  }

  const sorted = computed(() => {
    const list = [...source.value]
    if (!sortKey.value) return list
    const key = sortKey.value
    const dir = sortDir.value === 'asc' ? 1 : -1
    return list.sort((a, b) => {
      const va = a[key]
      const vb = b[key]
      if (va == null && vb == null) return 0
      if (va == null) return 1
      if (vb == null) return -1
      if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * dir
      if (typeof va === 'boolean' && typeof vb === 'boolean') return (Number(va) - Number(vb)) * dir
      return String(va).localeCompare(String(vb), 'fr', { numeric: true }) * dir
    })
  })

  const totalPages = computed(() => Math.max(1, Math.ceil(sorted.value.length / pageSize.value)))

  const paginated = computed(() => {
    const start = (page.value - 1) * pageSize.value
    return sorted.value.slice(start, start + pageSize.value)
  })

  watch(source, () => {
    if (page.value > totalPages.value) page.value = totalPages.value
  })

  function resetPage() {
    page.value = 1
  }

  return {
    sortKey,
    sortDir,
    page,
    pageSize,
    sorted,
    paginated,
    totalPages,
    toggleSort,
    sortIcon,
    resetPage,
  }
}
