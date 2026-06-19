<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  label: string
  modelValue: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const ACCEPTED = /^(image\/(jpeg|png|webp)|application\/pdf)$/i
const MAX_BYTES = 5 * 1024 * 1024

const inputRef = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const fileName = ref('')
const isPdf = ref(false)
const error = ref('')

function openPicker() {
  inputRef.value?.click()
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result)
      else reject(new Error('Lecture fichier'))
    }
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

// Redimensionne et recompresse les images côté client pour garder une charge utile légère
// (les requêtes JSON avec photos en base64 dépassaient la limite du proxy -> erreur 413).
const MAX_DIMENSION = 1600
const JPEG_QUALITY = 0.82

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Image illisible'))
    img.src = src
  })
}

async function compressImage(file: File): Promise<string> {
  const original = await readFileAsDataUrl(file)
  try {
    const img = await loadImage(original)
    const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height))
    const width = Math.round(img.width * scale)
    const height = Math.round(img.height * scale)
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) return original
    ctx.drawImage(img, 0, 0, width, height)
    const compressed = canvas.toDataURL('image/jpeg', JPEG_QUALITY)
    // On garde le résultat le plus léger
    return compressed.length < original.length ? compressed : original
  } catch {
    return original
  }
}

async function handleFile(file: File | undefined) {
  if (!file) return
  if (!ACCEPTED.test(file.type)) {
    error.value = 'Formats acceptés : JPG, PNG, WebP ou PDF.'
    return
  }
  if (file.size > MAX_BYTES) {
    error.value = 'Le fichier doit faire au plus 5 Mo.'
    return
  }
  try {
    const pdf = file.type === 'application/pdf'
    const dataUrl = pdf ? await readFileAsDataUrl(file) : await compressImage(file)
    fileName.value = file.name
    isPdf.value = pdf
    error.value = ''
    emit('update:modelValue', dataUrl)
  } catch {
    error.value = 'Lecture du fichier impossible.'
  }
}

function onInputChange(event: Event) {
  const input = event.target as HTMLInputElement
  handleFile(input.files?.[0])
}

function onDrop(event: DragEvent) {
  isDragging.value = false
  handleFile(event.dataTransfer?.files?.[0])
}

function reset() {
  fileName.value = ''
  isPdf.value = false
  error.value = ''
  if (inputRef.value) inputRef.value.value = ''
  emit('update:modelValue', '')
}
</script>

<template>
  <div>
    <p class="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">{{ label }}</p>

    <!-- Etat vide : zone de depot -->
    <button
      v-if="!modelValue"
      type="button"
      class="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-8 text-center transition"
      :class="isDragging ? 'border-primary bg-primary/5' : 'border-slate-200 bg-slate-50 hover:border-primary/40 hover:bg-primary/5'"
      @click="openPicker"
      @dragover.prevent="isDragging = true"
      @dragenter.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="onDrop"
    >
      <span class="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <span class="material-symbols-outlined text-[26px]">photo_camera</span>
      </span>
      <span class="text-sm font-semibold text-primary">Glisser ou déposer votre fichier ici</span>
      <span class="text-xs text-slate-500">ou cliquez pour parcourir</span>
      <span class="mt-1 inline-flex gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
        <span class="rounded bg-white px-1.5 py-0.5 ring-1 ring-slate-200">JPG</span>
        <span class="rounded bg-white px-1.5 py-0.5 ring-1 ring-slate-200">PNG</span>
        <span class="rounded bg-white px-1.5 py-0.5 ring-1 ring-slate-200">PDF</span>
      </span>
    </button>

    <!-- Etat rempli : succes -->
    <div
      v-else
      class="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-3"
    >
      <div class="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white ring-1 ring-emerald-100">
        <img v-if="!isPdf" :src="modelValue" :alt="`Aperçu ${label}`" class="h-full w-full object-cover" />
        <span v-else class="material-symbols-outlined text-[26px] text-red-500">picture_as_pdf</span>
      </div>
      <div class="min-w-0 flex-1">
        <p class="flex items-center gap-1 text-sm font-semibold text-emerald-800">
          <span class="material-symbols-outlined text-[18px]">check_circle</span>
          <span class="truncate">{{ fileName || 'Fichier ajouté' }}</span>
        </p>
        <p class="text-xs text-emerald-700">Téléchargé avec succès</p>
      </div>
      <button
        type="button"
        class="shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-white hover:text-red-500"
        aria-label="Retirer le fichier"
        @click="reset"
      >
        <span class="material-symbols-outlined text-[20px]">delete</span>
      </button>
    </div>

    <p v-if="error" class="mt-2 text-xs font-medium text-red-600">{{ error }}</p>

    <input
      ref="inputRef"
      type="file"
      accept="image/jpeg,image/png,image/webp,application/pdf"
      class="hidden"
      @change="onInputChange"
    />
  </div>
</template>
