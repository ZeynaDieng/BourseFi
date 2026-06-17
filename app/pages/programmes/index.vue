<script setup lang="ts">
import Fuse from "fuse.js";
import { STUDENT_HOME } from "~/utils/routes";

const route = useRoute();
const router = useRouter();

const metierParam = computed(() => {
  const m = route.query.metier;
  if (typeof m === "string" && m.length > 0) return m;
  if (Array.isArray(m) && typeof m[0] === "string" && m[0].length > 0)
    return m[0];
  return undefined;
});

const { data: programmes } = await useAsyncData(
  () => `programmes-catalog:${metierParam.value ?? "all"}`,
  () =>
    $fetch("/api/programmes", {
      query: metierParam.value ? { metier: metierParam.value } : {},
    }),
  {
    watch: [metierParam],
  },
);

const metierLabel = computed(() => getMetierTrackLabel(metierParam.value));

const procedureOpen = ref(false);
const candidatureOpen = ref(false);

type ProgrammeRow = NonNullable<typeof programmes.value>[number];
const selectedProgramme = ref<ProgrammeRow | null>(null);

function openProcedurePopup(p: ProgrammeRow) {
  selectedProgramme.value = p;
  procedureOpen.value = true;
}

function closeProcedurePopup() {
  procedureOpen.value = false;
  selectedProgramme.value = null;
}

function openCandidatureFromProcedure() {
  procedureOpen.value = false;
  candidatureOpen.value = true;
}

function closeCandidature() {
  candidatureOpen.value = false;
  selectedProgramme.value = null;
}

function onCandidatureSubmitted(payload: {
  candidatureId: string;
  requiresPayment: boolean;
}) {
  if (payload.requiresPayment) {
    router.push(
      `/paiement?candidatureId=${encodeURIComponent(payload.candidatureId)}`,
    );
  } else {
    router.push(STUDENT_HOME);
  }
}

const PAGE_SIZE = 10;
const currentPage = ref(1);

const catalogSearch = ref("");
const selectedSector = ref("Tous");
const selectedCity = ref("Toutes les villes");
const selectedLevel = ref("Tous les niveaux");

const showCityDropdown = ref(false);
const showLevelDropdown = ref(false);

// Fermer les menus au clic à l'extérieur
if (typeof window !== "undefined") {
  window.addEventListener("click", (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest(".relative-dropdown")) {
      showCityDropdown.value = false;
      showLevelDropdown.value = false;
    }
  });
}

const sortField = ref<"titre" | "etablissement" | "ville" | "niveau">("titre");
const sortOrder = ref<"asc" | "desc">("asc");

const sectors = ["Tous", "Business & Finance", "Technologie & IA", "Sante & Sciences"];

function toggleSort(field: typeof sortField.value) {
  if (sortField.value === field) {
    sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
  } else {
    sortField.value = field;
    sortOrder.value = "asc";
  }
}

watch(
  () => route.query.q,
  (q) => {
    const s =
      typeof q === "string"
        ? q
        : Array.isArray(q) && typeof q[0] === "string"
          ? q[0]
          : "";
    if (catalogSearch.value !== s) catalogSearch.value = s;
  },
  { immediate: true },
);

const allProgrammes = computed(() => programmes.value ?? []);

const cities = computed(() => {
  const c = new Set(allProgrammes.value.map(p => p.ville));
  return ["Toutes les villes", ...Array.from(c).sort()];
});

const levels = computed(() => {
  const l = new Set(allProgrammes.value.map(p => p.niveau));
  return ["Tous les niveaux", ...Array.from(l).sort()];
});

const programmeList = computed(() => {
  let base = allProgrammes.value;

  if (selectedSector.value !== "Tous") {
    const fuseSect = new Fuse(base, { keys: ["titre", "description"], threshold: 0.4 });
    base = fuseSect.search(selectedSector.value).map(r => r.item);
  }

  if (selectedCity.value !== "Toutes les villes") {
    base = base.filter(p => p.ville === selectedCity.value);
  }

  if (selectedLevel.value !== "Tous les niveaux") {
    base = base.filter(p => p.niveau === selectedLevel.value);
  }

  const q = catalogSearch.value.trim();
  let results = base;
  if (q) {
    results = new Fuse(base, {
      keys: [
        { name: "titre", weight: 1.0 },
        { name: "etablissement", weight: 0.8 },
        { name: "partnerName", weight: 0.7 },
        { name: "ville", weight: 0.5 }
      ],
      threshold: 0.35
    }).search(q).map(r => r.item);
  }

  return [...results].sort((a: any, b: any) => {
    const field = sortField.value;
    const valA = String(a[field]).toLowerCase();
    const valB = String(b[field]).toLowerCase();
    if (sortOrder.value === "asc") return valA.localeCompare(valB);
    return valB.localeCompare(valA);
  });
});

function syncCatalogQueryToUrl() {
  const q = catalogSearch.value.trim();
  const query = { ...route.query } as Record<string, string>;
  if (q) query.q = q;
  else delete query.q;
  void router.replace({ path: "/programmes", query });
}

let catalogSearchUrlTimer: ReturnType<typeof setTimeout> | undefined;
watch(catalogSearch, () => {
  clearTimeout(catalogSearchUrlTimer);
  catalogSearchUrlTimer = setTimeout(() => syncCatalogQueryToUrl(), 400);
});

const totalCount = computed(() => programmeList.value.length);
const totalPages = computed(() =>
  Math.max(1, Math.ceil(totalCount.value / PAGE_SIZE)),
);

const paginatedProgrammes = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE;
  return programmeList.value.slice(start, start + PAGE_SIZE);
});

const pageRangeLabel = computed(() => {
  if (totalCount.value === 0) return "0 résultat";
  const from = (currentPage.value - 1) * PAGE_SIZE + 1;
  const to = Math.min(currentPage.value * PAGE_SIZE, totalCount.value);
  return `${from}–${to} sur ${totalCount.value}`;
});

watch([metierParam, programmeList, catalogSearch], () => {
  currentPage.value = 1;
});

function goToPage(n: number) {
  const p = Math.min(Math.max(1, n), totalPages.value);
  currentPage.value = p;
}

onBeforeUnmount(() => {
  clearTimeout(catalogSearchUrlTimer);
});
</script>

<template>
  <main class="mx-auto max-w-7xl px-4 py-8 md:px-8">
    <header class="mb-8">
      <div class="flex flex-col gap-6">
        <!-- Title & Stats -->
        <div class="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div class="min-w-0 flex-1">
            <h1 class="font-headline text-3xl font-extrabold text-primary md:text-4xl">
              Catalogue des Formations
            </h1>
            <p class="mt-1 text-base text-slate-500">
              <span class="font-bold text-primary">{{ allProgrammes.length }}</span> programmes disponibles.
            </p>
          </div>
          <NuxtLink
            to="/comparaison"
            class="flex items-center justify-center gap-2 rounded-2xl bg-secondary-container/10 px-6 py-3.5 text-sm font-bold text-primary transition hover:bg-secondary-container/20 md:py-3"
          >
            <span class="material-symbols-outlined text-xl">compare_arrows</span>
            Comparer
          </NuxtLink>
        </div>

        <!-- Search & Filter Bar -->
        <div class="space-y-4 rounded-3xl border border-slate-100 bg-white p-4 shadow-premium md:p-6 md:space-y-6">
          <div class="flex flex-col gap-3 md:flex-row">
            <div class="flex flex-1 items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 transition-all focus-within:border-primary/30 focus-within:ring-4 focus-within:ring-primary/5">
              <span class="material-symbols-outlined text-translate text-slate-400">search</span>
              <input
                id="catalog-search"
                v-model="catalogSearch"
                type="search"
                class="w-full border-none bg-transparent text-sm outline-none focus:ring-0 md:text-base"
                placeholder="Métier, école, ville..."
              />
            </div>
            
            <div class="grid grid-cols-2 gap-2 md:flex md:gap-4">
              <!-- City Filter -->
              <div class="relative relative-dropdown">
                <button
                  type="button"
                  class="flex w-full items-center justify-between gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-xs font-bold text-slate-700 transition-all md:text-sm md:min-w-[160px]"
                  @click="showCityDropdown = !showCityDropdown"
                >
                  <span class="truncate">{{ selectedCity }}</span>
                  <span class="material-symbols-outlined text-slate-400 text-lg transition-transform" :class="{ 'rotate-180': showCityDropdown }">expand_more</span>
                </button>
                <div v-if="showCityDropdown" class="absolute right-0 top-full z-50 mt-2 w-[200px] overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-premium">
                  <div class="max-h-60 overflow-y-auto p-2">
                    <button
                      v-for="c in cities"
                      :key="c"
                      type="button"
                      class="flex w-full items-center rounded-xl px-4 py-2.5 text-left text-xs font-semibold text-slate-700 transition hover:bg-primary/5 hover:text-primary"
                      @click="() => { selectedCity = c; showCityDropdown = false; }"
                    >
                      {{ c }}
                    </button>
                  </div>
                </div>
              </div>

              <!-- Level Filter -->
              <div class="relative relative-dropdown">
                <button
                  type="button"
                  class="flex w-full items-center justify-between gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-xs font-bold text-slate-700 transition-all md:text-sm md:min-w-[160px]"
                  @click="showLevelDropdown = !showLevelDropdown"
                >
                  <span class="truncate">{{ selectedLevel }}</span>
                  <span class="material-symbols-outlined text-slate-400 text-lg transition-transform" :class="{ 'rotate-180': showLevelDropdown }">expand_more</span>
                </button>
                <div v-if="showLevelDropdown" class="absolute right-0 top-full z-50 mt-2 w-[200px] overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-premium">
                  <div class="max-h-60 overflow-y-auto p-2">
                    <button
                      v-for="l in levels"
                      :key="l"
                      type="button"
                      class="flex w-full items-center rounded-xl px-4 py-2.5 text-left text-xs font-semibold text-slate-700 transition hover:bg-primary/5 hover:text-primary"
                      @click="() => { selectedLevel = l; showLevelDropdown = false; }"
                    >
                      {{ l }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="no-scrollbar flex items-center gap-2 overflow-x-auto pb-1 md:flex-wrap md:pb-0">
            <span class="hidden text-[10px] font-bold uppercase tracking-wider text-slate-400 md:block">Secteurs :</span>
            <button
              v-for="s in sectors"
              :key="s"
              type="button"
              class="whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold transition-all md:px-5 md:text-sm"
              :class="selectedSector === s ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'"
              @click="selectedSector = s"
            >
              {{ s }}
            </button>
          </div>
        </div>
      </div>
    </header>

    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 -translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
    >
      <div
        v-if="metierLabel"
        key="metier-banner"
        class="mb-8 flex flex-col gap-3 rounded-2xl border border-secondary/20 bg-secondary/5 px-4 py-4 md:flex-row md:items-center md:justify-between"
      >
        <p class="text-xs font-medium text-slate-700 md:text-sm">
          <span class="font-headline font-bold text-primary">Parcours {{ metierLabel }}</span>
          — formations sélectionnées pour ces débouchés.
        </p>
        <NuxtLink to="/programmes" class="shrink-0 text-xs font-bold text-primary underline underline-offset-4">
          Voir tout le catalogue
        </NuxtLink>
      </div>
    </Transition>

    <div v-if="programmeList.length > 0" id="programmes-catalog" class="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-premium">
      <div class="bg-slate-50/50 border-b border-slate-100 px-4 py-3 flex items-center justify-between">
        <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400">
          Resultats : <span class="text-slate-600 font-extrabold">{{ pageRangeLabel }}</span>
        </p>
      </div>

      <ul class="divide-y divide-slate-50">
        <li v-for="programme in paginatedProgrammes" :key="programme.id" class="group transition hover:bg-slate-50/50">
          <div class="flex flex-col gap-4 p-5 md:flex-row md:items-center md:gap-6 md:p-6">
            <div class="flex-1 space-y-1.5">
              <div class="flex flex-wrap items-center gap-2">
                <NuxtLink :to="`/programmes/${programme.slug}`" class="text-base font-extrabold text-primary md:text-lg hover:underline underline-offset-4">
                  {{ programme.titre }}
                </NuxtLink>
                <span class="rounded-lg bg-primary/5 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary">
                  {{ programme.niveau }}
                </span>
              </div>
              
              <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold text-slate-500">
                <span class="flex items-center gap-1">
                  <span class="material-symbols-outlined text-sm">school</span>
                  {{ programme.etablissement }}
                </span>
                <span class="flex items-center gap-1">
                  <span class="material-symbols-outlined text-sm text-slate-300">location_on</span>
                  {{ programme.ville }}
                </span>
                <span class="flex items-center gap-1 text-secondary">
                  <span class="material-symbols-outlined text-sm">verified</span>
                  {{ programme.partnerName }}
                </span>
              </div>
            </div>

            <div class="flex items-center justify-between border-t border-slate-50 pt-4 md:border-none md:pt-0 md:justify-end md:gap-6">
              <div class="text-left md:text-right">
                <p class="text-[9px] font-bold uppercase tracking-widest text-slate-400">Referentiel</p>
                <p class="text-sm font-extrabold text-primary">{{ programme.frais.toLocaleString('fr-FR') }} {{ programme.devise }}</p>
              </div>
              <NuxtLink
                :to="`/programmes/${programme.slug}`"
                class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/20 transition hover:scale-105 active:scale-95 md:h-12 md:w-12"
              >
                <span class="material-symbols-outlined text-xl">arrow_forward</span>
              </NuxtLink>
            </div>
          </div>
        </li>
      </ul>

      <div v-if="totalPages > 1" class="border-t border-slate-50 bg-slate-50/20 px-6 py-6">
        <div class="flex items-center justify-center gap-2">
          <button
            v-for="p in totalPages"
            :key="p"
            type="button"
            class="flex h-10 w-10 items-center justify-center rounded-xl border font-bold transition-all"
            :class="currentPage === p ? 'bg-primary border-primary text-white shadow-xl' : 'bg-white border-slate-100 text-slate-500 hover:border-primary/30 hover:text-primary'"
            @click="goToPage(p)"
          >
            {{ p }}
          </button>
        </div>
      </div>
    </div>

    <div v-else class="rounded-3xl border border-dashed border-slate-200 py-20 text-center">
      <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 text-slate-300">
        <span class="material-symbols-outlined text-3xl">search_off</span>
      </div>
      <h3 class="mt-4 text-sm font-bold text-slate-500">Aucun résultat trouvé</h3>
      <p class="mt-1 text-xs text-slate-400">Essayez de modifier vos filtres ou votre recherche.</p>
    </div>

    <ProcedureBourseModal
      :open="procedureOpen"
      :programme="selectedProgramme"
      @close="closeProcedurePopup"
      @apply="openCandidatureFromProcedure"
    />
    <CandidatureModal
      :open="candidatureOpen"
      :programme="selectedProgramme"
      @close="closeCandidature"
      @submitted="onCandidatureSubmitted"
    />
  </main>
</template>
