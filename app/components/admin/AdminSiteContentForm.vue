<script setup lang="ts">
import { reactive, watch } from 'vue'
import {
  VISUAL_ASSET_KEYS,
  VISUAL_ASSET_HELP,
  ensureSiteContentDraft
} from '~/utils/site-content-labels'

const props = defineProps<{
  contentKey: string
  /** Snapshot au moment d’ouvrir le tiroir */
  seed: Record<string, unknown>
}>()

const state = reactive<Record<string, unknown>>({})

watch(
  () => [props.contentKey, props.seed] as const,
  () => {
    Object.keys(state).forEach((k) => delete state[k])
    Object.assign(state, structuredClone(props.seed ?? {}))
    ensureSiteContentDraft(props.contentKey, state)
  },
  { immediate: true, deep: false }
)

function pruneStrings(arr: string[]) {
  return arr.map((s) => s.trim()).filter(Boolean)
}

function buildPayload(): Record<string, unknown> {
  const key = props.contentKey
  switch (key) {
    case 'visual_assets': {
      const out: Record<string, string> = {}
      for (const k of VISUAL_ASSET_KEYS) {
        const v = String(state[k] ?? '').trim()
        if (v) out[k] = v
      }
      return out
    }
    case 'home_hero':
      return {
        title: String(state.title ?? '').trim(),
        bannerImageUrl: String(state.bannerImageUrl ?? '').trim(),
        headlinePrimary: String(state.headlinePrimary ?? '').trim(),
        headlineAccent: String(state.headlineAccent ?? '').trim(),
        subtitle: String(state.subtitle ?? '').trim(),
        searchPlaceholder: String(state.searchPlaceholder ?? '').trim(),
        sectorOptions: pruneStrings(
          Array.isArray(state.sectorOptions)
            ? (state.sectorOptions as unknown[]).map((x) => String(x))
            : []
        ),
        ctaLabel: String(state.ctaLabel ?? '').trim(),
        ctaHref: String(state.ctaHref ?? '').trim()
      }
    case 'home_stats': {
      const items = (Array.isArray(state.items) ? state.items : []) as { value?: string; label?: string }[]
      return {
        items: items
          .map((x) => ({
            value: String(x?.value ?? '').trim(),
            label: String(x?.label ?? '').trim()
          }))
          .filter((x) => x.value || x.label)
      }
    }
    case 'home_process': {
      const cards = (Array.isArray(state.cards) ? state.cards : []) as Record<string, unknown>[]
      return {
        sectionTitle: String(state.sectionTitle ?? '').trim(),
        sectionSubtitle: String(state.sectionSubtitle ?? '').trim(),
        cards: cards
          .map((c) => ({
            step: String(c.step ?? '').trim(),
            icon: String(c.icon ?? '').trim(),
            variant: String(c.variant ?? 'light').trim() || 'light',
            title: String(c.title ?? '').trim(),
            body: String(c.body ?? '').trim(),
            imageKey: String(c.imageKey ?? '').trim()
          }))
          .filter((c) => c.title || c.body)
      }
    }
    case 'home_partner_section':
      return {
        title: String(state.title ?? '').trim(),
        subtitle: String(state.subtitle ?? '').trim(),
        ctaLabel: String(state.ctaLabel ?? '').trim(),
        ctaHref: String(state.ctaHref ?? '').trim()
      }
    case 'why_choose': {
      const reasons = (Array.isArray(state.reasons) ? state.reasons : []) as Record<string, unknown>[]
      return {
        kicker: String(state.kicker ?? '').trim(),
        title: String(state.title ?? '').trim(),
        subtitle: String(state.subtitle ?? '').trim(),
        bannerImageKey: String(state.bannerImageKey ?? '').trim(),
        reasons: reasons
          .map((r) => ({
            icon: String(r.icon ?? '').trim(),
            title: String(r.title ?? '').trim(),
            description: String(r.description ?? '').trim()
          }))
          .filter((r) => r.title || r.description)
      }
    }
    case 'financement': {
      const steps = (Array.isArray(state.steps) ? state.steps : []) as Record<string, unknown>[]
      return {
        kicker: String(state.kicker ?? '').trim(),
        title: String(state.title ?? '').trim(),
        subtitle: String(state.subtitle ?? '').trim(),
        steps: steps
          .map((s) => ({
            actor: String(s.actor ?? '').trim(),
            icon: String(s.icon ?? '').trim(),
            title: String(s.title ?? '').trim(),
            body: String(s.body ?? '').trim()
          }))
          .filter((s) => s.title || s.body),
        closureTitle: String(state.closureTitle ?? '').trim(),
        closureBody: String(state.closureBody ?? '').trim()
      }
    }
    case 'espace_etudiant': {
      const features = (Array.isArray(state.features) ? state.features : []) as Record<string, unknown>[]
      return {
        kicker: String(state.kicker ?? '').trim(),
        title: String(state.title ?? '').trim(),
        subtitle: String(state.subtitle ?? '').trim(),
        ctaLabel: String(state.ctaLabel ?? '').trim(),
        ctaHref: String(state.ctaHref ?? '').trim(),
        features: features
          .map((f) => ({
            icon: String(f.icon ?? '').trim(),
            title: String(f.title ?? '').trim(),
            text: String(f.text ?? '').trim()
          }))
          .filter((f) => f.title || f.text)
      }
    }
    case 'partners_strip': {
      const items = (Array.isArray(state.items) ? state.items : []) as { label?: string }[]
      return {
        kicker: String(state.kicker ?? '').trim(),
        title: String(state.title ?? '').trim(),
        subtitle: String(state.subtitle ?? '').trim(),
        items: items.map((x) => ({ label: String(x.label ?? '').trim() })).filter((x) => x.label)
      }
    }
    case 'landing_metiers':
      return {
        kicker: String(state.kicker ?? '').trim(),
        title: String(state.title ?? '').trim(),
        subtitle: String(state.subtitle ?? '').trim(),
        footnote: String(state.footnote ?? '').trim()
      }
    case 'faq_section':
      return {
        kicker: String(state.kicker ?? '').trim(),
        title: String(state.title ?? '').trim()
      }
    case 'testimonials_section':
      return {
        kicker: String(state.kicker ?? '').trim(),
        title: String(state.title ?? '').trim()
      }
    case 'orientation_page':
      return {
        heroTitle: String(state.heroTitle ?? '').trim(),
        heroSubtitle: String(state.heroSubtitle ?? '').trim(),
        heroImageKey: String(state.heroImageKey ?? '').trim(),
        guidesTitle: String(state.guidesTitle ?? '').trim(),
        guidesSubtitle: String(state.guidesSubtitle ?? '').trim(),
        comparisonTitle: String(state.comparisonTitle ?? '').trim(),
        comparisonSubtitle: String(state.comparisonSubtitle ?? '').trim(),
        comparisonImageKey: String(state.comparisonImageKey ?? '').trim(),
        comparisonCtaLabel: String(state.comparisonCtaLabel ?? '').trim(),
        comparisonCtaHref: String(state.comparisonCtaHref ?? '').trim(),
        domainsHeading: String(state.domainsHeading ?? '').trim()
      }
    case 'metiers_hub_page':
      return {
        kicker: String(state.kicker ?? '').trim(),
        title: String(state.title ?? '').trim(),
        subtitle: String(state.subtitle ?? '').trim(),
        footnote: String(state.footnote ?? '').trim(),
        heroImageKey: String(state.heroImageKey ?? '').trim()
      }
    default:
      return structuredClone(state)
  }
}

defineExpose({ buildPayload })
</script>

<template>
  <div class="space-y-6">
    <!-- visual_assets -->
    <template v-if="contentKey === 'visual_assets'">
      <p class="text-sm text-slate-600">
        Indiquez l’URL complète de chaque visuel (https…). Les champs vides ne sont pas enregistrés.
      </p>
      <div v-for="vk in VISUAL_ASSET_KEYS" :key="vk" class="space-y-1">
        <label class="admin-label">{{ VISUAL_ASSET_HELP[vk] || vk }}</label>
        <input v-model="state[vk] as string" type="url" class="admin-input font-mono text-xs" placeholder="https://…" />
      </div>
    </template>

    <!-- home_hero -->
    <template v-else-if="contentKey === 'home_hero'">
      <p class="text-sm text-slate-600">
        Carrousel d’images en arrière-plan (slides 1, 2, 4, 5 et 6 —
        <code class="rounded bg-slate-100 px-1">slide-3</code>
        volontairement exclu). Si vous renseignez une URL ci-dessous : une image fixe remplace le carrousel.
      </p>
      <label class="admin-label">Image de fond (URL optionnelle)</label>
      <input v-model="state.bannerImageUrl as string" type="text" class="admin-input font-mono text-xs" placeholder="Laisser vide pour le carrousel (sans slide 3)" />
      <label class="admin-label">Titre H1 — partie 1 (bleu)</label>
      <input v-model="state.headlinePrimary as string" class="admin-input" placeholder="Votre avenir," />
      <label class="admin-label">Titre H1 — partie 2 (or)</label>
      <input v-model="state.headlineAccent as string" class="admin-input" placeholder="notre priorité." />
      <label class="admin-label">Phrase d’accroche (optionnel)</label>
      <textarea v-model="state.subtitle as string" rows="3" class="admin-input min-h-[72px]" />
      <p class="text-xs text-slate-500">
        Si ce champ est vide, le site affiche automatiquement la phrase sur les étudiants sénégalais (mise en forme du modèle).
      </p>
      <label class="admin-label">Placeholder recherche</label>
      <input v-model="state.searchPlaceholder as string" class="admin-input" />
      <label class="admin-label">Options secteurs (une ligne = une entrée)</label>
      <textarea
        :value="(state.sectorOptions as string[]).join('\n')"
        rows="5"
        class="admin-input min-h-[100px] font-mono text-xs"
        @input="state.sectorOptions = ($event.target as HTMLTextAreaElement).value.split(/\r?\n/)"
      />
      <label class="admin-label">Libellé bouton principal</label>
      <input v-model="state.ctaLabel as string" class="admin-input" />
      <label class="admin-label">Lien bouton (chemin)</label>
      <input v-model="state.ctaHref as string" class="admin-input font-mono text-xs" placeholder="/programmes" />
      <label class="admin-label">Méta titre (optionnel)</label>
      <input v-model="state.title as string" class="admin-input" placeholder="Pour balises ou SEO — non affiché dans le hero." />
    </template>

    <!-- home_stats -->
    <template v-else-if="contentKey === 'home_stats'">
      <p class="text-sm text-slate-600">Chaque ligne du tableau = une vignette chiffre + libellé.</p>
      <div class="space-y-3">
        <div
          v-for="(row, i) in state.items as { value: string; label: string }[]"
          :key="i"
          class="flex flex-wrap gap-2 rounded-lg border border-slate-100 bg-slate-50/80 p-3"
        >
          <input v-model="row.value" class="admin-input max-w-[120px]" placeholder="25k+" />
          <input v-model="row.label" class="admin-input min-w-[200px] flex-1" placeholder="Libellé" />
          <button
            type="button"
            class="admin-btn-danger px-3 py-1.5 text-xs"
            @click="(state.items as unknown[]).splice(i, 1)"
          >
            Retirer
          </button>
        </div>
        <button
          type="button"
          class="admin-btn-secondary text-xs"
          @click="(state.items as unknown[]).push({ value: '', label: '' })"
        >
          + Ajouter un chiffre
        </button>
      </div>
    </template>

    <!-- home_process -->
    <template v-else-if="contentKey === 'home_process'">
      <label class="admin-label">Titre de section</label>
      <input v-model="state.sectionTitle as string" class="admin-input" />
      <label class="admin-label">Sous-titre</label>
      <textarea v-model="state.sectionSubtitle as string" rows="2" class="admin-input min-h-[56px]" />
      <p class="text-sm font-semibold text-primary">Cartes du parcours</p>
      <div class="space-y-4">
        <article
          v-for="(card, i) in state.cards as Record<string, string>[]"
          :key="i"
          class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div class="mb-2 flex items-center justify-between gap-2">
            <span class="text-xs font-bold uppercase text-slate-400">Étape {{ i + 1 }}</span>
            <button type="button" class="text-xs font-semibold text-red-600 hover:underline" @click="(state.cards as unknown[]).splice(i, 1)">
              Supprimer
            </button>
          </div>
          <div class="grid gap-2 sm:grid-cols-2">
            <label class="admin-label">Numéro affiché</label>
            <label class="admin-label">Icône (Material)</label>
            <input v-model="card.step" class="admin-input" placeholder="01" />
            <input v-model="card.icon" class="admin-input font-mono text-xs" placeholder="search_insights" />
            <label class="admin-label">Style carte</label>
            <label class="admin-label">Clé image</label>
            <select v-model="card.variant" class="admin-input bg-white">
              <option value="light">Clair</option>
              <option value="primary">Accent</option>
            </select>
            <select v-model="card.imageKey" class="admin-input bg-white font-mono text-xs">
              <option value="">— Choisir —</option>
              <option v-for="vk in VISUAL_ASSET_KEYS" :key="vk" :value="vk">{{ vk }}</option>
            </select>
          </div>
          <label class="admin-label mt-2">Titre carte</label>
          <input v-model="card.title" class="admin-input" />
          <label class="admin-label">Texte</label>
          <textarea v-model="card.body" rows="3" class="admin-input min-h-[72px]" />
        </article>
        <button type="button" class="admin-btn-secondary text-xs" @click="(state.cards as unknown[]).push({
          step: '',
          icon: '',
          variant: 'light',
          title: '',
          body: '',
          imageKey: ''
        })">
          + Ajouter une carte
        </button>
      </div>
    </template>

    <!-- home_partner_section -->
    <template v-else-if="contentKey === 'home_partner_section'">
      <label class="admin-label">Titre</label>
      <input v-model="state.title as string" class="admin-input" />
      <label class="admin-label">Sous-titre</label>
      <textarea v-model="state.subtitle as string" rows="3" class="admin-input min-h-[72px]" />
      <label class="admin-label">Libellé lien</label>
      <input v-model="state.ctaLabel as string" class="admin-input" />
      <label class="admin-label">URL lien</label>
      <input v-model="state.ctaHref as string" class="admin-input font-mono text-xs" />
    </template>

    <!-- why_choose -->
    <template v-else-if="contentKey === 'why_choose'">
      <label class="admin-label">Sur-titre</label>
      <input v-model="state.kicker as string" class="admin-input" />
      <label class="admin-label">Titre</label>
      <input v-model="state.title as string" class="admin-input" />
      <label class="admin-label">Sous-titre</label>
      <textarea v-model="state.subtitle as string" rows="2" class="admin-input min-h-[52px]" />
      <label class="admin-label">Image bandeau (clé)</label>
      <select v-model="state.bannerImageKey as string" class="admin-input bg-white font-mono text-xs">
        <option value="">— Choisir —</option>
        <option v-for="vk in VISUAL_ASSET_KEYS" :key="vk" :value="vk">{{ vk }}</option>
      </select>
      <p class="text-sm font-semibold text-primary">Arguments</p>
      <div class="space-y-3">
        <div
          v-for="(r, i) in state.reasons as { icon: string; title: string; description: string }[]"
          :key="i"
          class="rounded-lg border border-slate-100 bg-slate-50/80 p-3"
        >
          <div class="mb-2 flex justify-between">
            <span class="text-xs font-bold text-slate-400">#{{ i + 1 }}</span>
            <button type="button" class="text-xs text-red-600 hover:underline" @click="(state.reasons as unknown[]).splice(i, 1)">Retirer</button>
          </div>
          <label class="admin-label">Icône</label>
          <input v-model="r.icon" class="admin-input font-mono text-xs" />
          <label class="admin-label">Titre</label>
          <input v-model="r.title" class="admin-input" />
          <label class="admin-label">Description</label>
          <textarea v-model="r.description" rows="2" class="admin-input min-h-[52px]" />
        </div>
        <button type="button" class="admin-btn-secondary text-xs" @click="(state.reasons as unknown[]).push({ icon: '', title: '', description: '' })">
          + Ajouter un argument
        </button>
      </div>
    </template>

    <!-- financement -->
    <template v-else-if="contentKey === 'financement'">
      <label class="admin-label">Sur-titre</label>
      <input v-model="state.kicker as string" class="admin-input" />
      <label class="admin-label">Titre</label>
      <input v-model="state.title as string" class="admin-input" />
      <label class="admin-label">Sous-titre</label>
      <textarea v-model="state.subtitle as string" rows="2" class="admin-input min-h-[52px]" />
      <p class="text-sm font-semibold text-primary">Étapes</p>
      <div class="space-y-3">
        <div
          v-for="(s, i) in state.steps as { actor: string; icon: string; title: string; body: string }[]"
          :key="i"
          class="rounded-lg border border-slate-100 bg-slate-50/80 p-3"
        >
          <div class="mb-2 flex justify-between">
            <span class="text-xs font-bold text-slate-400">Bloc {{ i + 1 }}</span>
            <button type="button" class="text-xs text-red-600 hover:underline" @click="(state.steps as unknown[]).splice(i, 1)">Retirer</button>
          </div>
          <label class="admin-label">Acteur / catégorie</label>
          <input v-model="s.actor" class="admin-input" />
          <label class="admin-label">Icône</label>
          <input v-model="s.icon" class="admin-input font-mono text-xs" />
          <label class="admin-label">Titre</label>
          <input v-model="s.title" class="admin-input" />
          <label class="admin-label">Texte</label>
          <textarea v-model="s.body" rows="3" class="admin-input min-h-[72px]" />
        </div>
        <button type="button" class="admin-btn-secondary text-xs" @click="(state.steps as unknown[]).push({ actor: '', icon: '', title: '', body: '' })">
          + Ajouter une étape
        </button>
      </div>
      <label class="admin-label mt-4">Titre de clôture</label>
      <input v-model="state.closureTitle as string" class="admin-input" />
      <label class="admin-label">Texte de clôture</label>
      <textarea v-model="state.closureBody as string" rows="4" class="admin-input min-h-[96px]" />
    </template>

    <!-- espace_etudiant -->
    <template v-else-if="contentKey === 'espace_etudiant'">
      <label class="admin-label">Sur-titre</label>
      <input v-model="state.kicker as string" class="admin-input" />
      <label class="admin-label">Titre</label>
      <input v-model="state.title as string" class="admin-input" />
      <label class="admin-label">Sous-titre</label>
      <textarea v-model="state.subtitle as string" rows="2" class="admin-input min-h-[52px]" />
      <label class="admin-label">Libellé bouton</label>
      <input v-model="state.ctaLabel as string" class="admin-input" />
      <label class="admin-label">Lien bouton</label>
      <input v-model="state.ctaHref as string" class="admin-input font-mono text-xs" />
      <p class="text-sm font-semibold text-primary">Points forts</p>
      <div class="space-y-3">
        <div
          v-for="(f, i) in state.features as { icon: string; title: string; text: string }[]"
          :key="i"
          class="rounded-lg border border-slate-100 bg-slate-50/80 p-3"
        >
          <div class="mb-2 flex justify-between">
            <span class="text-xs font-bold text-slate-400">#{{ i + 1 }}</span>
            <button type="button" class="text-xs text-red-600 hover:underline" @click="(state.features as unknown[]).splice(i, 1)">Retirer</button>
          </div>
          <label class="admin-label">Icône</label>
          <input v-model="f.icon" class="admin-input font-mono text-xs" />
          <label class="admin-label">Titre</label>
          <input v-model="f.title" class="admin-input" />
          <label class="admin-label">Texte</label>
          <textarea v-model="f.text" rows="2" class="admin-input min-h-[52px]" />
        </div>
        <button type="button" class="admin-btn-secondary text-xs" @click="(state.features as unknown[]).push({ icon: '', title: '', text: '' })">
          + Ajouter un point
        </button>
      </div>
    </template>

    <!-- partners_strip -->
    <template v-else-if="contentKey === 'partners_strip'">
      <label class="admin-label">Sur-titre</label>
      <input v-model="state.kicker as string" class="admin-input" />
      <label class="admin-label">Titre</label>
      <input v-model="state.title as string" class="admin-input" />
      <label class="admin-label">Sous-titre</label>
      <textarea v-model="state.subtitle as string" rows="2" class="admin-input min-h-[52px]" />
      <p class="text-sm font-semibold text-primary">Pastilles affichées</p>
      <div class="space-y-2">
        <div v-for="(it, i) in state.items as { label: string }[]" :key="i" class="flex gap-2">
          <input v-model="it.label" class="admin-input flex-1" placeholder="Libellé" />
          <button type="button" class="admin-btn-danger shrink-0 px-3 py-2 text-xs" @click="(state.items as unknown[]).splice(i, 1)">✕</button>
        </div>
        <button type="button" class="admin-btn-secondary text-xs" @click="(state.items as unknown[]).push({ label: '' })">+ Ajouter</button>
      </div>
    </template>

    <!-- landing_metiers -->
    <template v-else-if="contentKey === 'landing_metiers'">
      <label class="admin-label">Sur-titre</label>
      <input v-model="state.kicker as string" class="admin-input" />
      <label class="admin-label">Titre</label>
      <input v-model="state.title as string" class="admin-input" />
      <label class="admin-label">Sous-titre</label>
      <textarea v-model="state.subtitle as string" rows="3" class="admin-input min-h-[72px]" />
      <label class="admin-label">Note de bas de section</label>
      <textarea v-model="state.footnote as string" rows="2" class="admin-input min-h-[52px]" />
    </template>

    <!-- faq_section / testimonials_section -->
    <template v-else-if="contentKey === 'faq_section' || contentKey === 'testimonials_section'">
      <label class="admin-label">Sur-titre</label>
      <input v-model="state.kicker as string" class="admin-input" />
      <label class="admin-label">Titre</label>
      <input v-model="state.title as string" class="admin-input" />
    </template>

    <!-- orientation_page -->
    <template v-else-if="contentKey === 'orientation_page'">
      <label class="admin-label">Titre hero</label>
      <textarea v-model="state.heroTitle as string" rows="2" class="admin-input min-h-[52px]" />
      <label class="admin-label">Sous-titre hero</label>
      <textarea v-model="state.heroSubtitle as string" rows="3" class="admin-input min-h-[72px]" />
      <label class="admin-label">Image hero (clé)</label>
      <select v-model="state.heroImageKey as string" class="admin-input bg-white font-mono text-xs">
        <option value="">— Choisir —</option>
        <option v-for="vk in VISUAL_ASSET_KEYS" :key="vk" :value="vk">{{ vk }}</option>
      </select>
      <label class="admin-label">Titre guides métiers</label>
      <input v-model="state.guidesTitle as string" class="admin-input" />
      <label class="admin-label">Sous-titre guides</label>
      <textarea v-model="state.guidesSubtitle as string" rows="2" class="admin-input min-h-[52px]" />
      <label class="admin-label">Titre comparaison</label>
      <input v-model="state.comparisonTitle as string" class="admin-input" />
      <label class="admin-label">Sous-titre comparaison</label>
      <textarea v-model="state.comparisonSubtitle as string" rows="2" class="admin-input min-h-[52px]" />
      <label class="admin-label">Image comparaison (clé)</label>
      <select v-model="state.comparisonImageKey as string" class="admin-input bg-white font-mono text-xs">
        <option value="">— Choisir —</option>
        <option v-for="vk in VISUAL_ASSET_KEYS" :key="vk" :value="vk">{{ vk }}</option>
      </select>
      <label class="admin-label">Libellé bouton comparaison</label>
      <input v-model="state.comparisonCtaLabel as string" class="admin-input" />
      <label class="admin-label">Lien comparaison</label>
      <input v-model="state.comparisonCtaHref as string" class="admin-input font-mono text-xs" />
      <label class="admin-label">Titre bloc domaines</label>
      <input v-model="state.domainsHeading as string" class="admin-input" />
    </template>

    <!-- metiers_hub_page -->
    <template v-else-if="contentKey === 'metiers_hub_page'">
      <label class="admin-label">Sur-titre</label>
      <input v-model="state.kicker as string" class="admin-input" />
      <label class="admin-label">Titre</label>
      <input v-model="state.title as string" class="admin-input" />
      <label class="admin-label">Sous-titre</label>
      <textarea v-model="state.subtitle as string" rows="3" class="admin-input min-h-[72px]" />
      <label class="admin-label">Note de bas de page</label>
      <textarea v-model="state.footnote as string" rows="2" class="admin-input min-h-[52px]" />
      <label class="admin-label">Image hero (clé)</label>
      <select v-model="state.heroImageKey as string" class="admin-input bg-white font-mono text-xs">
        <option value="">— Choisir —</option>
        <option v-for="vk in VISUAL_ASSET_KEYS" :key="vk" :value="vk">{{ vk }}</option>
      </select>
    </template>

    <template v-else>
      <p class="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        Aucun formulaire n’est défini pour cette clé. Utilisez une migration ou contactez l’équipe technique.
      </p>
    </template>
  </div>
</template>
