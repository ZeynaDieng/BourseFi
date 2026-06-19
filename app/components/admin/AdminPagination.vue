<script setup lang="ts">
const props = defineProps<{
  page: number
  totalPages: number
  totalItems: number
}>()

const emit = defineEmits<{ 'update:page': [number] }>()
</script>

<template>
  <div
    v-if="totalItems > 0 && totalPages > 1"
    class="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 text-xs text-slate-500"
  >
    <p>{{ totalItems }} élément(s) · page {{ page }} / {{ totalPages }}</p>
    <div class="flex gap-2">
      <button
        type="button"
        class="admin-btn-ghost !px-3 !py-1.5 text-xs"
        :disabled="page <= 1"
        @click="emit('update:page', page - 1)"
      >
        Précédent
      </button>
      <button
        type="button"
        class="admin-btn-ghost !px-3 !py-1.5 text-xs"
        :disabled="page >= totalPages"
        @click="emit('update:page', page + 1)"
      >
        Suivant
      </button>
    </div>
  </div>
</template>
