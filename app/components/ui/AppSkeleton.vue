<script setup lang="ts">
defineProps<{
  type?: 'card' | 'line' | 'text' | 'table' | 'avatar' | 'rect'
  count?: number
  height?: string
  width?: string
}>()
</script>

<template>
  <div class="animate-pulse space-y-3">
    <!-- Card Skeleton -->
    <div v-if="type === 'card'" v-for="n in (count || 1)" :key="'c-' + n" class="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
      <div class="h-32 w-full rounded-lg bg-slate-200/60 mb-4" />
      <div class="h-4 w-3/4 rounded bg-slate-200/60 mb-2.5" />
      <div class="h-3.5 w-1/2 rounded bg-slate-200/60" />
    </div>

    <!-- Line/Text Skeleton -->
    <div v-else-if="type === 'line' || type === 'text'" v-for="n in (count || 1)" :key="'l-' + n" class="space-y-2">
      <div class="h-4 rounded bg-slate-200/60" :style="{ width: width || '100%', height }" />
    </div>

    <!-- Avatar Skeleton -->
    <div v-else-if="type === 'avatar'" class="rounded-full bg-slate-200/60" :style="{ width: width || '40px', height: height || '40px' }" />

    <!-- Table Skeleton -->
    <div v-else-if="type === 'table'" class="border border-slate-100 rounded-xl bg-white overflow-hidden">
      <div class="bg-slate-50/50 p-4 border-b border-slate-100 flex gap-4">
        <div class="h-4 w-1/4 rounded bg-slate-200" />
        <div class="h-4 w-1/4 rounded bg-slate-200" />
        <div class="h-4 w-1/4 rounded bg-slate-200" />
      </div>
      <div v-for="n in (count || 3)" :key="'t-' + n" class="p-4 border-b border-slate-100 flex gap-4 last:border-b-0">
        <div class="h-4 w-1/3 rounded bg-slate-200/60" />
        <div class="h-4 w-1/4 rounded bg-slate-200/60" />
        <div class="h-4 w-1/5 rounded bg-slate-200/60" />
      </div>
    </div>

    <!-- Arbitrary Rectangle Skeleton -->
    <div v-else class="rounded bg-slate-200/60" :style="{ width: width || '100%', height: height || '100px' }" />
  </div>
</template>
