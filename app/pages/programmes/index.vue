<script setup lang="ts">
import Fuse from "fuse.js";

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
    router.push("/etudiant/dashboard");
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

/** Configuration de Fuse.js pour la recherche floue et la pondération */
const fuse = computed(() => {
  return new Fuse(allProgrammes.value, {
    keys: [
      { name: "titre", weight: 1.0 },
      { name: "etablissement", weight: 0.8 },
      { name: "partnerName", weight: 0.7 },
      { name: "ville", weight: 0.5 },
      { name: "description", weight: 0.3 }
    ],
    threshold: 0.35,
    distance: 100,
    ignoreLocation: true,
    minMatchCharLength: 2
  });
});

const programmeList = computed(() => {
  let base = allProgrammes.value;

  // 1. Filtrage par secteur (si renseigné)
  if (selectedSector.value !== "Tous") {
    const fuseSect = new Fuse(base, { keys: ["titre", "description"], threshold: 0.4 });
    base = fuseSect.search(selectedSector.value).map(r => r.item);
  }

  // 2. Filtrage par ville
  if (selectedCity.value !== "Toutes les villes") {
    base = base.filter(p => p.ville === selectedCity.value);
  }

  // 3. Filtrage par niveau
  if (selectedLevel.value !== "Tous les niveaux") {
    base = base.filter(p => p.niveau === selectedLevel.value);
  }

  // 4. Recherche textuelle floue
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

  // 5. Tri
  return [...results].sort((a, b) => {
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
  nextTick(() => {
    document
      .getElementById("programmes-catalog")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

onBeforeUnmount(() => {
  clearTimeout(catalogSearchUrlTimer);
});
</script>

<template>
  <main class="mx-auto max-w-7xl px-8 py-12">
    <header class="mb-12">
      <div class="flex flex-col gap-8">
        <!-- Title & Stats -->
        <div class="flex flex-wrap items-end justify-between gap-4">
          <div class="min-w-0 flex-1">
            <h1 class="font-headline text-5xl font-extrabold leading-[1.12] text-primary md:text-6xl md:leading-[1.1]">
              Catalogue des Formations
            </h1>
            <p class="mt-2 text-lg text-slate-600">
              Trouvez la bourse idéale parmi <span class="font-bold text-primary">{{ allProgrammes.length }}</span> programmes partenaires.
            </p>
          </div>
          <NuxtLink
            to="/comparaison"
            class="group flex items-center gap-2 rounded-2xl bg-secondary-container/10 px-6 py-3 font-bold text-primary transition hover:bg-secondary-container/20"
          >
            <span class="material-symbols-outlined text-xl">compare_arrows</span>
            Comparer
          </NuxtLink>
        </div>

        <!-- Search & Filter Bar -->
        <div class="space-y-6 rounded-3xl border border-slate-100/50 bg-white p-6 shadow-premium">
          <!-- Text Search -->
          <div class="flex flex-col gap-4 md:flex-row md:items-center">
            <div class="flex flex-1 items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-5 py-3.5 transition-all focus-within:border-primary/30 focus-within:ring-4 focus-within:ring-primary/5">
              <span class="material-symbols-outlined text-slate-400">search</span>
              <input
                id="catalog-search"
                v-model="catalogSearch"
                type="search"
                class="w-full border-none bg-transparent text-base outline-none focus:outline-none focus:ring-0 sm:text-sm md:text-base"
                placeholder="Métier, école, ville..."
              />
            </div>
            
            <div class="flex gap-4">
              <!-- City Filter Dropdown -->
              <div class="relative relative-dropdown">
                <button
                  type="button"
                  class="flex min-w-[160px] items-center justify-between gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3.5 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-100 focus:ring-4 focus:ring-primary/5"
                  @click="showCityDropdown = !showCityDropdown"
                >
                  <span class="truncate">{{ selectedCity }}</span>
                  <span class="material-symbols-outlined text-slate-400 text-xl transition-transform" :class="{ 'rotate-180': showCityDropdown }">expand_more</span>
                </button>
                <div v-if="showCityDropdown" class="absolute right-0 top-full z-50 mt-2 w-full min-w-[200px] overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-premium animate-in fade-in slide-in-from-top-2 duration-200">
                  <div class="max-h-60 overflow-y-auto p-2">
                    <button
                      v-for="c in cities"
                      :key="c"
                      type="button"
                      class="flex w-full items-center rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-primary/5 hover:text-primary"
                      @click="() => { selectedCity = c; showCityDropdown = false; }"
                    >
                      <span v-if="selectedCity === c" class="material-symbols-outlined mr-2 text-primary text-lg">check</span>
                      <span :class="{ 'ml-7': selectedCity !== c }">{{ c }}</span>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Level Filter Dropdown -->
              <div class="relative relative-dropdown">
                <button
                  type="button"
                  class="flex min-w-[160px] items-center justify-between gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3.5 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-100 focus:ring-4 focus:ring-primary/5"
                  @click="showLevelDropdown = !showLevelDropdown"
                >
                  <span class="truncate">{{ selectedLevel }}</span>
                  <span class="material-symbols-outlined text-slate-400 text-xl transition-transform" :class="{ 'rotate-180': showLevelDropdown }">expand_more</span>
                </button>
                <div v-if="showLevelDropdown" class="absolute right-0 top-full z-50 mt-2 w-full min-w-[200px] overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-premium animate-in fade-in slide-in-from-top-2 duration-200">
                  <div class="max-h-60 overflow-y-auto p-2">
                    <button
                      v-for="l in levels"
                      :key="l"
                      type="button"
                      class="flex w-full items-center rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-primary/5 hover:text-primary"
                      @click="() => { selectedLevel = l; showLevelDropdown = false; }"
                    >
                      <span v-if="selectedLevel === l" class="material-symbols-outlined mr-2 text-primary text-lg">check</span>
                      <span :class="{ 'ml-7': selectedLevel !== l }">{{ l }}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Industry Chips -->
          <div class="flex flex-wrap items-center gap-2 border-t border-slate-50 pt-4">
            <span class="mr-2 text-xs font-bold uppercase tracking-wider text-slate-400">Secteurs :</span>
            <button
              v-for="s in sectors"
              :key="s"
              type="button"
              class="rounded-full px-5 py-2 text-sm font-semibold transition-all"
              :class="selectedSector === s ? 'bg-primary text-white shadow-lg' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
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
        class="mb-10 flex flex-col gap-3 rounded-2xl border border-secondary/25 bg-secondary/5 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <p class="text-sm text-slate-700">
          <span class="font-headline font-semibold text-primary"
            >Parcours {{ metierLabel }} </span
          >
          — formations du catalogue alignées sur ce métier (titres, contenus et
          débouchés).
        </p>
        <NuxtLink
          to="/programmes"
          class="shrink-0 text-sm font-semibold text-primary underline-offset-2 hover:underline"
        >
          Voir toutes les formations
        </NuxtLink>
      </div>
    </Transition>

    <p
      v-if="programmes?.length === 0"
      class="mb-8 rounded-2xl border border-slate-200 bg-white px-5 py-8 text-center text-slate-600 shadow-premium"
    >
      Aucune formation ne correspond encore à ce parcours dans le catalogue.
      <NuxtLink to="/programmes" class="mt-3 block font-semibold text-primary"
        >Afficher toutes les formations</NuxtLink
      >
    </p>

    <div
      v-else
      id="programmes-catalog"
      class="overflow-hidden rounded-3xl border border-slate-100/50 bg-white shadow-premium"
    >
      <!-- Table Actions / Pagination Header -->
      <div
        class="flex flex-wrap items-center justify-between gap-4 border-b border-slate-50 bg-slate-50/30 px-6 py-4"
      >
        <p class="text-sm font-medium text-slate-400">
          Affichage de <span class="text-slate-600">{{ pageRangeLabel }}</span> formations
        </p>
        <div v-if="totalPages > 1" class="flex items-center gap-3">
          <button
            type="button"
            class="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-slate-100 text-slate-400 transition hover:bg-primary hover:text-white hover:border-primary disabled:opacity-20"
            :disabled="currentPage <= 1"
            @click="goToPage(currentPage - 1)"
          >
            <span class="material-symbols-outlined text-xl">chevron_left</span>
          </button>
          <span class="text-xs font-bold uppercase tracking-widest text-slate-400">Page {{ currentPage }} / {{ totalPages }}</span>
          <button
            type="button"
            class="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-slate-100 text-slate-400 transition hover:bg-primary hover:text-white hover:border-primary disabled:opacity-20"
            :disabled="currentPage >= totalPages"
            @click="goToPage(currentPage + 1)"
          >
            <span class="material-symbols-outlined text-xl">chevron_right</span>
          </button>
        </div>
      </div>

      <!-- Desktop Table Header -->
      <div class="hidden border-b border-slate-50 bg-white px-6 py-4 md:flex">
        <button @click="toggleSort('titre')" class="flex min-w-0 flex-[2] items-center gap-2 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:text-primary transition-colors">
          FORMATION & ÉTABLISSEMENT
          <span class="material-symbols-outlined text-sm">{{ sortField === 'titre' ? (sortOrder === 'asc' ? 'expand_less' : 'expand_more') : 'sort' }}</span>
        </button>
        <button @click="toggleSort('niveau')" class="flex w-28 shrink-0 items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:text-primary transition-colors xl:flex">
          NIVEAU
          <span class="material-symbols-outlined text-sm">{{ sortField === 'niveau' ? (sortOrder === 'asc' ? 'expand_less' : 'expand_more') : 'sort' }}</span>
        </button>
        <button @click="toggleSort('ville')" class="flex min-w-0 flex-1 items-center gap-2 px-4 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:text-primary transition-colors lg:block lg:max-w-[12rem]">
          VILLE & BAILLEUR
          <span class="material-symbols-outlined text-sm">{{ sortField === 'ville' ? (sortOrder === 'asc' ? 'expand_less' : 'expand_more') : 'sort' }}</span>
        </button>
        <div class="w-16 shrink-0 text-right text-[11px] font-bold uppercase tracking-widest text-slate-400">ACTION</div>
      </div>

      <!-- Table Rows -->
      <ul class="divide-y divide-slate-50">
        <li
          v-for="programme in paginatedProgrammes"
          :key="programme.id"
          class="group cursor-pointer transition-all hover:bg-slate-50/30"
          @click="openProcedurePopup(programme)"
        >
          <div class="flex flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:gap-4 md:py-6">
            <!-- Training & School -->
            <div class="min-w-0 flex-[2]">
              <h3 class="font-headline text-base font-bold text-primary transition-colors group-hover:text-secondary-fixed md:text-lg">
                {{ programme.titre }}
              </h3>
              <p class="mt-1.5 flex items-center gap-2 text-sm text-slate-500">
                <span class="material-symbols-outlined text-sm text-slate-400">school</span>
                {{ programme.etablissement }}
              </p>
            </div>

            <!-- Level Badge -->
            <div class="hidden w-28 shrink-0 text-center xl:block">
              <span 
                class="inline-block rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider"
                :class="{
                  'bg-blue-50 text-blue-600': programme.niveau.includes('Licence'),
                  'bg-purple-50 text-purple-600': programme.niveau.includes('Master'),
                  'bg-emerald-50 text-emerald-600': programme.niveau.includes('BTS') || programme.niveau.includes('DTS'),
                  'bg-slate-50 text-slate-600': !['Licence', 'Master', 'BTS', 'DTS'].some(n => programme.niveau.includes(n))
                }"
              >
                {{ programme.niveau }}
              </span>
            </div>

            <!-- Meta info (City / Partner) -->
            <div class="hidden min-w-0 flex-1 px-4 lg:block lg:max-w-[12rem]">
              <div class="flex items-center gap-1.5 text-sm font-medium text-slate-600">
                <span class="material-symbols-outlined text-sm text-slate-400">location_on</span>
                {{ programme.ville }}
              </div>
              <p class="mt-1 truncate text-[9px] font-bold uppercase tracking-widest text-secondary/60">
                {{ programme.partnerName }}
              </p>
            </div>

            <!-- Action Button -->
            <div class="flex shrink-0 items-center justify-end md:w-16">
              <button
                type="button"
                class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-lg transition-all hover:scale-110 hover:shadow-primary/20 active:scale-95"
                @click.stop="openProcedurePopup(programme)"
              >
                <span class="material-symbols-outlined text-xl">send</span>
              </button>
            </div>

            <!-- Mobile Only Info -->
            <div class="flex flex-wrap items-center gap-3 md:hidden">
              <span class="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase text-slate-600">{{ programme.niveau }}</span>
              <span class="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <span class="material-symbols-outlined text-xs">location_on</span>
                {{ programme.ville }}
              </span>
            </div>
          </div>
        </li>
      </ul>

      <!-- Bottom Pagination -->
      <div v-if="totalPages > 1" class="border-t border-slate-50 bg-slate-50/30 px-6 py-6">
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
