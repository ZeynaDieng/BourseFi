<script setup lang="ts">
withDefaults(
  defineProps<{
    /** Lien de destination ; désactive le clic si `false`. */
    to?: string | false
    imgClass?: string
  }>(),
  {
    to: '/',
    imgClass: 'h-12 w-auto max-h-12 object-contain object-left'
  }
)

const alt = 'BourseFi — Plateforme de gestion de bourses'
</script>

<template>
  <NuxtLink
    v-if="to !== false"
    :to="typeof to === 'string' ? to : '/'"
    class="inline-flex shrink-0 items-center rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary-fixed focus-visible:ring-offset-2"
  >
    <img
      src="/boursefi-logo.png"
      :alt="alt"
      width="280"
      height="82"
      loading="eager"
      decoding="async"
      :class="imgClass"
    />
  </NuxtLink>
  <div v-else class="inline-flex shrink-0 items-center">
    <img
      src="/boursefi-logo.png"
      :alt="alt"
      width="280"
      height="82"
      loading="eager"
      decoding="async"
      :class="imgClass"
    />
  </div>
</template>
