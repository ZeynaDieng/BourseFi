<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import Fuse from 'fuse.js'
import type { BourseDto } from '~/types/bourse'

const isOpen = ref(false)
const searchQ = ref('')
const bourses = ref<BourseDto[]>([])
const isLoading = ref(false)
const selectedIndex = ref(0)
const inputRef = ref<HTMLInputElement | null>(null)

// Charger les bourses de façon paresseuse au premier clic / ouverture
async function loadBourses() {
  if (bourses.value.length > 0) return
  isLoading.value = true
  try {
    bourses.value = await $fetch<BourseDto[]>('/api/bourses')
  } catch (err) {
    console.error('Erreur chargement recherche globale:', err)
  } finally {
    isLoading.value = false
  }
}

watch(isOpen, async (val) => {
  if (val) {
    await loadBourses()
    selectedIndex.value = 0
    searchQ.value = ''
    nextTick(() => {
      inputRef.value?.focus()
    })
    if (typeof document !== 'undefined') document.body.style.overflow = 'hidden'
  } else {
    if (typeof document !== 'undefined') document.body.style.overflow = ''
  }
})

const fuse = computed(() =>
  new Fuse(bourses.value, {
    keys: [
      { name: 'titre', weight: 1 },
      { name: 'etablissement', weight: 0.8 },
      { name: 'partnerName', weight: 0.6 },
      { name: 'ville', weight: 0.4 },
    ],
    threshold: 0.4,
  }),
)

const results = computed(() => {
  if (!searchQ.value.trim()) return bourses.value.slice(0, 5) // Renvoyer les 5 premières par défaut
  return fuse.value.search(searchQ.value.trim()).slice(0, 8).map((r) => r.item)
})

watch(results, () => {
  selectedIndex.value = 0
})

function handleKeyDown(e: KeyboardEvent) {
  // Toggle avec Cmd+K / Ctrl+K
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault()
    isOpen.value = !isOpen.value
  }
  
  if (!isOpen.value) return

  if (e.key === 'Escape') {
    isOpen.value = false
  } else if (e.key === 'ArrowDown') {
    e.preventDefault()
    selectedIndex.value = (selectedIndex.value + 1) % results.value.length
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    selectedIndex.value = (selectedIndex.value - 1 + results.value.length) % results.value.length
  } else if (e.key === 'Enter') {
    e.preventDefault()
    if (results.value[selectedIndex.value]) {
      selectResult(results.value[selectedIndex.value])
    }
  }
}

async function selectResult(bourse: BourseDto) {
  isOpen.value = false
  await navigateTo(`/bourses/${bourse.slug}`)
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
  window.addEventListener('open-global-search', () => {
    isOpen.value = true
  })
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('keydown', handleKeyDown)
  }
  if (typeof document !== 'undefined') document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-[200] flex items-start justify-center bg-slate-900/40 p-4 pt-[12vh] backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      @click="isOpen = false"
    >
      <div
        class="animate-scale-up w-full max-w-xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl"
        @click.stop
      >
        <!-- Barre de recherche -->
        <div class="relative border-b border-slate-100 p-4 flex items-center">
          <span class="material-symbols-outlined absolute left-4 text-[22px] text-slate-400 select-none">search</span>
          <input
            ref="inputRef"
            v-model="searchQ"
            type="search"
            placeholder="Rechercher une bourse, école, ville..."
            class="w-full bg-transparent pl-9 pr-12 text-[15px] font-medium text-slate-900 placeholder:text-slate-400 outline-none"
          />
          <span class="absolute right-4 rounded border border-slate-200 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 uppercase">esc</span>
        </div>

        <!-- Chargement -->
        <div v-if="isLoading" class="p-8 flex items-center justify-center gap-3 text-sm text-slate-500">
          <span class="material-symbols-outlined animate-spin text-[20px] text-primary">progress_activity</span>
          <span>Indexation du catalogue...</span>
        </div>

        <!-- Liste des résultats -->
        <div v-else-if="results.length > 0" class="max-h-[360px] overflow-y-auto p-2 space-y-0.5">
          <p class="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 select-none">
            {{ searchQ.trim() ? 'Résultats correspondants' : 'Bourses suggérées' }}
          </p>
          <button
            v-for="(b, index) in results"
            :key="b.id"
            type="button"
            class="w-full text-left flex items-center justify-between rounded-lg px-3 py-2.5 transition duration-150"
            :class="index === selectedIndex ? 'bg-primary/5 text-primary' : 'text-slate-700 hover:bg-slate-50'"
            @click="selectResult(b)"
            @mouseenter="selectedIndex = index"
          >
            <div class="min-w-0 pr-4">
              <p class="truncate text-sm font-semibold leading-snug">{{ b.titre }}</p>
              <div class="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                <span class="truncate font-medium text-slate-500">{{ b.etablissement }}</span>
                <span>•</span>
                <span class="truncate">{{ b.ville }}</span>
              </div>
            </div>
            <span class="material-symbols-outlined text-[18px] shrink-0 opacity-40" :class="{ 'opacity-100 text-primary': index === selectedIndex }">
              arrow_forward
            </span>
          </button>
        </div>

        <!-- Aucun résultat -->
        <div v-else class="p-8 text-center text-sm text-slate-500">
          <span class="material-symbols-outlined text-[32px] text-slate-300 block mb-2">find_in_page</span>
          Aucun résultat pour <strong class="text-slate-800">"{{ searchQ }}"</strong>
        </div>

        <!-- Footer Palette -->
        <div class="border-t border-slate-100 bg-slate-50 px-4 py-2 flex items-center justify-between text-[11px] text-slate-400">
          <div class="flex items-center gap-4">
            <span class="flex items-center gap-1"><span class="font-mono bg-white border border-slate-200 rounded px-1">↑↓</span> Naviguer</span>
            <span class="flex items-center gap-1"><span class="font-mono bg-white border border-slate-200 rounded px-1">↵</span> Valider</span>
          </div>
          <span>BourseFi Search</span>
        </div>
      </div>
    </div>
  </Teleport>
</template>
