<script setup lang="ts">
import { portalNavActive, type PortalNavItem } from '~/utils/portal-nav'

const props = defineProps<{
  items: PortalNavItem[]
  ariaLabel?: string
}>()

const emit = defineEmits<{ menu: [] }>()

const route = useRoute()

function isActive(item: PortalNavItem) {
  return portalNavActive(route.path, item)
}

function onTap(item: PortalNavItem, e: Event) {
  if (item.key === 'menu' || item.to === '#menu') {
    e.preventDefault()
    emit('menu')
  }
}
</script>

<template>
  <nav
    class="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/90 bg-white/95 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur-md md:hidden"
    :aria-label="ariaLabel ?? 'Navigation portail'"
  >
    <ul class="mx-auto grid max-w-lg grid-cols-5">
      <li v-for="item in items" :key="item.key">
        <NuxtLink
          v-if="item.key !== 'menu' && item.to !== '#menu'"
          :to="item.to"
          class="relative flex flex-col items-center gap-0.5 px-1 py-1.5 text-[9px] font-semibold transition active:scale-[0.98]"
          :class="isActive(item) ? 'text-primary' : 'text-slate-500'"
        >
          <span
            class="relative flex h-8 w-8 items-center justify-center rounded-xl transition"
            :class="isActive(item) ? 'bg-primary/10 text-primary' : 'text-slate-500'"
          >
            <span class="material-symbols-outlined text-[20px]">{{ item.icon }}</span>
            <span
              v-if="item.badge && item.badge > 0"
              class="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-secondary px-1 text-[9px] font-bold text-on-secondary-container"
            >
              {{ item.badge > 9 ? '9+' : item.badge }}
            </span>
          </span>
          {{ item.label }}
        </NuxtLink>
        <button
          v-else
          type="button"
          class="flex w-full flex-col items-center gap-0.5 px-1 py-1.5 text-[9px] font-semibold text-slate-500 transition active:scale-[0.98]"
          @click="onTap(item, $event)"
        >
          <span class="flex h-8 w-8 items-center justify-center rounded-xl text-slate-500">
            <span class="material-symbols-outlined text-[20px]">{{ item.icon }}</span>
          </span>
          {{ item.label }}
        </button>
      </li>
    </ul>
  </nav>
</template>
