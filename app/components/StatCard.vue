<script setup lang="ts">
defineProps<{
  value: string
  label: string
}>()
</script>

<template>
  <div class="text-center">
    <div class="text-3xl font-extrabold text-secondary-fixed">{{ value }}</div>
    <div class="text-xs uppercase tracking-widest text-on-primary-container">{{ label }}</div>
  </div>
</template>
