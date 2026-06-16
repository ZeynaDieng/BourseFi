<script setup lang="ts">
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

const PAGE_SIZE = 20;
const currentPage = ref(1);

const catalogSearch = ref("");

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

/** Texte comparable (accents retirés) pour éviter faux négatifs en français. */
function normalizeForCatalogSearch(s: string): string {
  return s
    .normalize("NFD")
    .replace(/\p{Mn}/gu, "")
    .toLocaleLowerCase("fr")
    .trim();
}

/** Fragments après espaces ou &  — on ne peut pas exiger le caractère & dans les fiches programmes. */
function catalogSearchFragments(rawQ: string): string[] {
  const n = normalizeForCatalogSearch(rawQ);
  if (!n.length) return [];
  return n
    .split(/[\s&/,-]+/)
    .map((t) => t.replace(/[^\p{L}\p{N}]/gu, ""))
    .filter((t) => t.length >= 2 || /^\d{1,6}$/.test(t));
}

function programmeMatchesSearch(
  p: ProgrammeRow,
  rawQ: string,
) {
  const frags = catalogSearchFragments(rawQ);
  if (!frags.length) return true;
  const hay = normalizeForCatalogSearch(
    `${p.titre} ${p.etablissement} ${p.ville} ${p.partnerName} ${p.niveau} ${p.description ?? ""}`,
  );

  const full = normalizeForCatalogSearch(rawQ.replace(/&+/g, " "));
  const condensed = normalizeForCatalogSearch(frags.join(" "));
  if (hay.includes(full) || hay.includes(condensed)) return true;

  return frags.every((frag) => hay.includes(frag));
}

const allProgrammes = computed(() => programmes.value ?? []);

const programmeList = computed(() =>
  allProgrammes.value.filter((p) =>
    programmeMatchesSearch(p, catalogSearch.value),
  ),
);

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
    <header class="mb-10 flex flex-col gap-6">
      <div
        class="flex flex-wrap items-end justify-between gap-4"
      >
        <div class="min-w-0 flex-1">
          <h1 class="font-headline text-4xl font-extrabold text-primary">
            Formations disponibles sous bourse
          </h1>
          <p class="mt-1 text-slate-600">
            Choisissez une ligne du catalogue, ouvrez la fiche puis
            <strong class="text-primary">demandez votre bourse</strong> en
            quelques étapes (dossier, frais si besoin, suivi dans votre espace).
          </p>
        </div>
        <NuxtLink
          to="/comparaison"
          class="shrink-0 rounded-lg border border-primary px-5 py-3 font-semibold text-primary"
          >Comparer des programmes</NuxtLink
        >
      </div>
      <div
        class="flex flex-col gap-3 rounded-2xl border border-secondary/20 bg-secondary/5 px-4 py-4 sm:flex-row sm:items-center"
      >
        <label class="sr-only" for="catalog-search">Filtrer les formations</label>
        <div
          class="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm transition-all duration-300 focus-within:border-primary/40 focus-within:ring-4 focus-within:ring-primary/5"
        >
          <span class="material-symbols-outlined text-slate-400 text-xl"
            >search</span
          >
          <input
            id="catalog-search"
            v-model="catalogSearch"
            type="search"
            enterkeyhint="search"
            autocomplete="off"
            class="min-w-0 flex-1 border-none bg-transparent text-sm focus:ring-0"
            placeholder="Métier, école, ville, bailleur…"
            @keydown.enter.prevent="syncCatalogQueryToUrl"
            @blur="syncCatalogQueryToUrl"
          />
        </div>
        <button
          type="button"
          class="shrink-0 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-95"
          @click="syncCatalogQueryToUrl"
        >
          Appliquer le filtre
        </button>
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
      class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-premium"
    >
      <div
        class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/90 px-4 py-3"
      >
        <p class="text-sm text-slate-600">
          <span class="font-semibold text-primary">{{ pageRangeLabel }}</span>
          <template v-if="totalCount > 0">
            — formation<span v-if="totalCount !== 1">s</span>
          </template>
        </p>
        <div v-if="totalPages > 1" class="flex items-center gap-2 text-sm">
          <button
            type="button"
            class="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium text-primary transition hover:border-primary/30 disabled:cursor-not-allowed disabled:opacity-40"
            :disabled="currentPage <= 1"
            @click="goToPage(currentPage - 1)"
          >
            Précédent
          </button>
          <span class="tabular-nums text-slate-600">
            Page {{ currentPage }} / {{ totalPages }}
          </span>
          <button
            type="button"
            class="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium text-primary transition hover:border-primary/30 disabled:cursor-not-allowed disabled:opacity-40"
            :disabled="currentPage >= totalPages"
            @click="goToPage(currentPage + 1)"
          >
            Suivant
          </button>
        </div>
      </div>

      <div
        class="hidden md:flex border-b border-slate-100 bg-white px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-500"
      >
        <div class="min-w-0 flex-[1.2] pr-3">Formation</div>
        <div class="hidden w-[11rem] shrink-0 lg:block">Établissement</div>
        <div class="hidden w-16 shrink-0 text-center xl:block">Niveau</div>
        <!-- <div class="hidden w-[5.5rem] shrink-0 text-right xl:block">Dossier</div -->
        <div class="hidden min-w-0 flex-1 px-2 lg:block lg:max-w-[12rem]">
          Bailleur
        </div>
        <div class="w-[7.5rem] shrink-0 text-right">Action</div>
      </div>

      <ul class="divide-y divide-slate-100">
        <li
          v-if="totalCount === 0 && programmes && programmes.length > 0"
          class="bg-white px-4 py-12 text-center"
        >
          <p class="text-sm leading-relaxed text-slate-600">
            Aucune formation ne correspond à
            <span class="inline-block font-semibold text-primary">{{
              catalogSearch.trim()
                ? "" + catalogSearch.trim() + " "
                : "cette recherche "
            }}</span
            >. Essayez une autre formulation (ville, niveau, mot-clé…) ou élargissez les
            termes.
          </p>
          <button
            type="button"
            class="mt-5 rounded-xl border border-primary/30 bg-secondary-container/90 px-4 py-2.5 text-sm font-semibold text-on-secondary-container hover:opacity-95"
            @click="
              catalogSearch = '';
              syncCatalogQueryToUrl();
            "
          >
            Effacer et tout afficher
          </button>
        </li>
        <li
          v-for="programme in paginatedProgrammes"
          :key="programme.id"
          class="transition-colors hover:bg-slate-50/60"
        >
          <div
            class="flex flex-col gap-2 px-4 py-3 md:flex-row md:items-center md:gap-3 md:py-2.5"
          >
            <div class="min-w-0 flex-[1.2] pr-0 md:pr-3">
              <p
                class="font-headline text-sm font-semibold leading-snug text-primary md:line-clamp-2"
              >
                {{ programme.titre }}
              </p>
              <p class="mt-0.5 line-clamp-2 text-xs text-slate-500 md:hidden">
                {{ programme.etablissement }} · {{ programme.ville }} ·
                {{ programme.niveau }}
                <span class="text-secondary">
                  · {{ programme.partnerName }}</span
                >
              </p>
            </div>
            <div
              class="hidden min-w-0 text-xs text-slate-600 lg:block lg:w-[11rem] lg:shrink-0 lg:truncate"
              :title="`${programme.etablissement} · ${programme.ville}`"
            >
              {{ programme.etablissement }} · {{ programme.ville }}
            </div>
            <div
              class="hidden w-16 shrink-0 text-center text-xs font-medium text-slate-600 xl:block"
            >
              {{ programme.niveau }}
            </div>
            <!-- <div
              class="hidden w-[5.5rem] shrink-0 text-right text-xs text-slate-600 xl:block"
            >
              <template v-if="programme.fraisDossier > 0">
                {{ programme.fraisDossier.toLocaleString("fr-FR") }}
                {{ programme.devise }}
              </template>
              <span v-else class="text-slate-400">—</span>
            </div> -->
            <div
              class="hidden min-w-0 flex-1 px-0 text-xs font-medium text-secondary lg:block lg:max-w-[12rem] lg:truncate"
              :title="programme.partnerName"
            >
              {{ programme.partnerName }}
            </div>
            <div class="flex shrink-0 justify-end md:w-[7.5rem] md:justify-end">
              <button
                type="button"
                class="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white transition hover:opacity-95 md:py-1.5"
                title="Voir la procédure et demander une bourse pour cette formation"
                @click="openProcedurePopup(programme)"
              >
                Demander une bourse
              </button>
            </div>
          </div>
        </li>
      </ul>

      <div
        v-if="totalPages > 1"
        class="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/50 px-4 py-3"
      >
        <p class="text-xs text-slate-500">{{ pageRangeLabel }}</p>
        <div class="flex items-center gap-2 text-sm">
          <button
            type="button"
            class="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium text-primary transition hover:border-primary/30 disabled:cursor-not-allowed disabled:opacity-40"
            :disabled="currentPage <= 1"
            @click="goToPage(currentPage - 1)"
          >
            Précédent
          </button>
          <button
            type="button"
            class="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium text-primary transition hover:border-primary/30 disabled:cursor-not-allowed disabled:opacity-40"
            :disabled="currentPage >= totalPages"
            @click="goToPage(currentPage + 1)"
          >
            Suivant
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
