<script setup lang="ts">
import { computed } from 'vue'

const open = defineModel<boolean>('open', { default: false })

const props = withDefaults(
  defineProps<{
    title: string
    description?: string
    /** Largeur max du panneau */
    size?: 'md' | 'lg' | 'xl' | '2xl'
  }>(),
  { size: 'xl', description: '' }
)

const emit = defineEmits<{ close: [] }>()

const panelClass = computed(() => {
  const map: Record<string, string> = {
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-3xl'
  }
  return map[props.size] ?? 'max-w-xl'
})

function close() {
  open.value = false
  emit('close')
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') close()
}
</script>

<template>
  <Teleport to="body">
    <Transition name="admin-drawer-fade">
      <div
        v-if="open"
        class="fixed inset-0 z-[100] flex justify-end bg-slate-900/40 backdrop-blur-[2px]"
        role="dialog"
        aria-modal="true"
        @click.self="close"
        @keydown="onKeydown"
      >
        <Transition name="admin-drawer-slide">
          <aside
            v-if="open"
            :class="[
              'flex h-full w-full flex-col bg-white shadow-2xl',
              panelClass
            ]"
            @click.stop
          >
            <header class="flex shrink-0 items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
              <div class="min-w-0">
                <h3 class="font-headline text-lg font-bold leading-tight text-primary">{{ title }}</h3>
                <p v-if="description" class="mt-1 text-sm leading-snug text-slate-600">{{ description }}</p>
              </div>
              <button
                type="button"
                class="shrink-0 rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                aria-label="Fermer"
                @click="close"
              >
                <span class="material-symbols-outlined text-[22px] leading-none">close</span>
              </button>
            </header>
            <div class="min-h-0 flex-1 overflow-y-auto px-5 py-4">
              <slot />
            </div>
            <footer v-if="$slots.footer" class="shrink-0 border-t border-slate-100 bg-slate-50/80 px-5 py-4">
              <slot name="footer" />
            </footer>
          </aside>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.admin-drawer-fade-enter-active,
.admin-drawer-fade-leave-active {
  transition: opacity 0.2s ease;
}
.admin-drawer-fade-enter-from,
.admin-drawer-fade-leave-to {
  opacity: 0;
}

.admin-drawer-slide-enter-active,
.admin-drawer-slide-leave-active {
  transition: transform 0.28s cubic-bezier(0.33, 1, 0.68, 1);
}
.admin-drawer-slide-enter-from,
.admin-drawer-slide-leave-to {
  transform: translateX(100%);
}
</style>
