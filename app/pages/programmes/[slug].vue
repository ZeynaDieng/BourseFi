<script setup lang="ts">
definePageMeta({ middleware: [] })

const route = useRoute()
const programmeSlug = String(route.params.slug ?? '')

const { data: bourses } = await useFetch('/api/bourses', {
  query: { programme: programmeSlug, active: 'false' },
})

const target = bourses.value?.[0]?.slug
  ? `/bourses/${bourses.value[0].slug}`
  : '/bourses'

await navigateTo(target, { replace: true })
</script>

<template>
  <div />
</template>
