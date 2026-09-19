<script setup lang="ts">
import { ref } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue?: string | null
    folder?: string
    placeholder?: string
    label?: string
  }>(),
  {
    modelValue: '',
    folder: 'ecoles',
    placeholder: 'https://... ou téléverser un fichier',
    label: '',
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const isUploading = ref(false)
const uploadError = ref<string | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

function triggerFilePicker() {
  fileInput.value?.click()
}

async function handleFileSelected(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  isUploading.value = true
  uploadError.value = null

  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', props.folder)

    const res = await $fetch<{ success: boolean; url: string }>('/api/admin/upload', {
      method: 'POST',
      body: formData,
    })

    if (res?.url) {
      emit('update:modelValue', res.url)
    }
  } catch (err: any) {
    uploadError.value = err?.data?.statusMessage || 'Erreur lors du téléversement du fichier.'
  } finally {
    isUploading.value = false
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  }
}

function clearImage() {
  emit('update:modelValue', '')
  uploadError.value = null
}
</script>

<template>
  <div class="space-y-2">
    <label v-if="label" class="block text-xs font-bold uppercase tracking-wider text-slate-500">
      {{ label }}
    </label>

    <div class="flex items-center gap-2">
      <!-- Input URL classique -->
      <div class="relative flex-1">
        <input
          :value="modelValue"
          type="text"
          class="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-3 pr-8 text-xs text-slate-800 placeholder:text-slate-400 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/10"
          :placeholder="placeholder"
          @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        />
        <button
          v-if="modelValue"
          type="button"
          @click="clearImage"
          title="Effacer"
          class="absolute right-2.5 top-2.5 text-slate-400 hover:text-red-500 transition-colors"
        >
          <span class="material-symbols-outlined text-sm">close</span>
        </button>
      </div>

      <!-- Input file caché -->
      <input
        ref="fileInput"
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
        class="hidden"
        @change="handleFileSelected"
      />

      <!-- Bouton Téléverser -->
      <button
        type="button"
        :disabled="isUploading"
        @click="triggerFilePicker"
        class="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-100 hover:border-slate-300 active:scale-95 disabled:opacity-50"
      >
        <span v-if="isUploading" class="material-symbols-outlined text-sm animate-spin">progress_activity</span>
        <span v-else class="material-symbols-outlined text-sm text-primary">upload_file</span>
        <span>{{ isUploading ? 'Téléversement...' : 'Parcourir' }}</span>
      </button>
    </div>

    <!-- Message d'erreur -->
    <p v-if="uploadError" class="text-[11px] font-semibold text-red-600 flex items-center gap-1">
      <span class="material-symbols-outlined text-xs">error</span>
      {{ uploadError }}
    </p>

    <!-- Aperçu de l'image -->
    <div v-if="modelValue?.trim()" class="mt-2 flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-2">
      <div class="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white">
        <img
          :src="modelValue.trim()"
          alt="Aperçu image"
          class="h-full w-full object-contain p-0.5"
          @error="($event.target as HTMLImageElement).style.display = 'none'"
        />
      </div>
      <div class="min-w-0 flex-1">
        <p class="truncate text-[11px] font-bold text-slate-700">{{ modelValue }}</p>
        <p class="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
          <span class="material-symbols-outlined text-xs">check_circle</span>
          Image liée et enregistrée
        </p>
      </div>
    </div>
  </div>
</template>
