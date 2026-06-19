export function useAdminDrawerLink(openById: (id: string) => Promise<void>, onClose: () => void) {
  const route = useRoute()
  const router = useRouter()

  onMounted(() => {
    const id = route.query.id
    if (typeof id === 'string') void openById(id)
  })

  watch(
    () => route.query.id,
    (id) => {
      if (typeof id === 'string') void openById(id)
    }
  )

  function linkOpen(id: string) {
    void router.replace({ query: { ...route.query, id } })
  }

  function linkClose() {
    const q = { ...route.query }
    delete q.id
    void router.replace({ query: q })
    onClose()
  }

  return { linkOpen, linkClose }
}
