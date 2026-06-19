<script setup lang="ts">
import Fuse from "fuse.js";
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import type { PartnerSchoolCardEcole } from "~/types/partner-school-card";

const { data: ecoles } = await useFetch("/api/etablissements");
const { data: site } = await usePublicSite();
const { data: publicStats } = await useFetch("/api/stats/public");
const { data: allBourses } = await useFetch("/api/bourses");

const ecolesPartenairesLanding = computed(
  () =>
    (ecoles.value ?? []).slice(0, 8) as unknown as PartnerSchoolCardEcole[],
);

type StatItem = { value: string; label: string };

const hero = computed(
  () => (site.value?.content?.home_hero ?? {}) as Record<string, unknown>,
);

/** Carrousel d’accueil : bannière métier puis visuels 1, 2, 4, 5 et 6 — sans `slide-3.png`. Champ CMS `bannerImageUrl` plein → image fixe (remplace le carrousel). */
const HERO_SLIDES_DEFAULT = [
  "/hero/slide-accueil-banniere.png",
  "/hero/slide-1.png",
  "/hero/slide-2.png",
  "/hero/slide-4.png",
  "/hero/slide-5.png",
  "/hero/slide-6.png",
] as const;

const heroSlides = computed(() => {
  const url =
    typeof hero.value.bannerImageUrl === "string"
      ? hero.value.bannerImageUrl.trim()
      : "";
  if (url.length) return [url];
  return [...HERO_SLIDES_DEFAULT];
});

const heroShowCarouselDots = computed(() => heroSlides.value.length > 1);

const activeHeroSlide = ref(0);
const heroCarouselPaused = ref(false);
let heroCarouselTimer: ReturnType<typeof setInterval> | undefined;

onMounted(() => {
  if (typeof window === "undefined") return;
  if (heroSlides.value.length <= 1) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  heroCarouselTimer = setInterval(() => {
    if (!heroCarouselPaused.value) {
      activeHeroSlide.value =
        (activeHeroSlide.value + 1) % heroSlides.value.length;
    }
  }, 7500);
});

watch(
  () => heroSlides.value.length,
  (len) => {
    activeHeroSlide.value = Math.min(
      activeHeroSlide.value,
      Math.max(0, len - 1),
    );
  },
);

onUnmounted(() => {
  if (heroCarouselTimer) clearInterval(heroCarouselTimer);
});

function goHeroSlide(i: number) {
  const n = heroSlides.value.length;
  activeHeroSlide.value = Math.max(0, Math.min(i, Math.max(0, n - 1)));
}

const heroHeadlinePrimary = computed(() => {
  const raw =
    typeof hero.value.headlinePrimary === "string"
      ? hero.value.headlinePrimary.trim()
      : "";
  return raw || "Trouvez une bourse d'étude";
});

const heroHeadlineAccent = computed(() => {
  const raw =
    typeof hero.value.headlineAccent === "string"
      ? hero.value.headlineAccent.trim()
      : "";
  return raw || "au Sénégal.";
});

const heroHeadlineAccentLong = computed(() => {
  const raw =
    typeof hero.value.headlineAccent === "string"
      ? hero.value.headlineAccent.trim()
      : "";
  return raw || "pour financer votre formation au Sénégal.";
});

/** Sous-texte depuis le CMS uniquement ; si vide, affichage structuré par défaut. */
const heroSubtitleCms = computed(() => {
  const s =
    typeof hero.value.subtitle === "string" ? hero.value.subtitle.trim() : "";
  return s;
});

const searchPlaceholder = computed(
  () =>
    (hero.value.searchPlaceholder as string) ||
    "Rechercher une bourse…",
);

const sectorOptions = computed(() => {
  const opts = hero.value.sectorOptions as string[] | undefined;
  return opts?.length
    ? opts
    : [
        "Tous les secteurs",
        "Business & Finance",
        "Technologie & IA",
        "Sante & Sciences",
      ];
});

const ctaLabel = computed(
  () => (hero.value.ctaLabel as string) || "Trouver une bourse",
);

const ctaHref = computed(() => (hero.value.ctaHref as string) || "/bourses");

const ctaSecondaryHref = computed(() => (hero.value.ctaSecondaryHref as string) || "/bourses");

const heroSearchQ = ref("");
const heroSector = ref("");
const showLiveResults = ref(false);
const showSectorDropdown = ref(false);

// Fermer les menus au clic à l'extérieur
if (typeof window !== "undefined") {
  window.addEventListener("click", (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest(".group.relative")) {
      showLiveResults.value = false;
      showSectorDropdown.value = false;
    }
  });
}

watch(
  sectorOptions,
  (opts) => {
    if (!opts.length) return;
    if (!heroSector.value || !opts.includes(heroSector.value)) {
      heroSector.value = opts[0]!;
    }
  },
  { immediate: true },
);

const router = useRouter();
const route = useRoute();

/** Configuration Fuse.js — bourses */
const fuse = computed(() => {
  const items = (allBourses.value ?? []).map(
    (b: {
      id: string
      titre: string
      slug: string
      etablissement: string
      partnerName: string
      programmeTitre: string
    }) => ({
      ...b,
      kind: "bourse",
      searchLabel: b.titre,
      href: `/bourses/${b.slug}`,
    }),
  );
  return new Fuse(items, {
    keys: [
      { name: "searchLabel", weight: 1.0 },
      { name: "programmeTitre", weight: 0.9 },
      { name: "etablissement", weight: 0.8 },
      { name: "partnerName", weight: 0.7 },
    ],
    threshold: 0.4,
  });
});

const liveResults = computed(() => {
  const q = heroSearchQ.value.trim();
  if (q.length < 2) return [];
  return fuse.value
    .search(q)
    .slice(0, 6)
    .map((r) => r.item);
});

function handleResultClick(p: {
  href?: string;
  titre?: string;
  searchLabel?: string;
}) {
  showLiveResults.value = false;
  if (p.href) {
    router.push(p.href);
    return;
  }
  router.push({
    path: "/recherche",
    query: { q: p.searchLabel ?? p.titre ?? "" },
  });
}

function buildHeroCatalogLocation() {
  const terms: string[] = [];
  const sq = heroSearchQ.value.trim();
  if (sq) terms.push(sq);
  if (heroSector.value && heroSector.value !== "Tous les secteurs") {
    terms.push(heroSector.value);
  }
  const q = terms.join(" ").trim();
  return q.length
    ? { path: "/recherche" as const, query: { q } }
    : { path: "/bourses" as const };
}

function submitHeroSearch() {
  showLiveResults.value = false;
  void router.push(buildHeroCatalogLocation());
}

const stats = computed(() => {
  if (publicStats.value?.heroStats?.length) {
    return publicStats.value.heroStats;
  }
  const items = (
    site.value?.content?.home_stats as { items?: StatItem[] } | undefined
  )?.items;
  return (
    items ?? [
      { value: "245", label: "Bourses disponibles" },
      { value: "37", label: "Écoles partenaires" },
      { value: "8", label: "Partenaires financeurs" },
      { value: "1200", label: "Candidatures validées" },
    ]
  );
});

const partnerHead = computed(
  () =>
    (site.value?.content?.home_partner_section ?? {}) as Record<string, string>,
);

const partnerTitle = computed(
  () => partnerHead.value.title || "Écoles partenaires",
);
const partnerSubtitle = computed(
  () =>
    partnerHead.value.subtitle ||
    "Formations couvertes par une bourse.",
);
const partnerCtaLabel = computed(
  () => partnerHead.value.ctaLabel || "Toutes les ecoles",
);
const partnerCtaHref = computed(() => partnerHead.value.ctaHref || "/ecoles");

/** Métadonnées `<head>` pour la page d’accueil uniquement (SEO / partages). */
const pageMetaTitle = computed(() => {
  const raw =
    typeof hero.value.title === "string" ? hero.value.title.trim() : "";
  if (raw.length) return raw.includes("BourseFi") ? raw : `${raw} | BourseFi`;
  const h = `${heroHeadlinePrimary.value} ${heroHeadlineAccent.value}`.replace(
    /\s+/g,
    " ",
  );
  return `${h.trim()} | BourseFi`;
});

const pageMetaDescription = computed(() => {
  if (heroSubtitleCms.value.length) return heroSubtitleCms.value;
  return "Trouvez les bourses d'études faites pour les étudiants sénégalais. Recherchez une école ou un domaine et demandez une bourse en ligne.";
});

const { siteUrl } = useSiteSeo({
  title: pageMetaTitle,
  description: pageMetaDescription,
});

useJsonLd(
  computed(() => {
    const description = pageMetaDescription.value;
    const faqItems = site.value?.faq ?? [];
    return [
      buildOrganizationJsonLd(siteUrl, description),
      buildWebSiteJsonLd(siteUrl),
      buildFaqJsonLd(faqItems),
    ];
  }),
);
</script>

<template>
  <main class="bg-background text-on-background">
    <section
      class="relative isolate flex min-h-[min(72vh,640px)] items-center overflow-hidden pb-28 pt-[max(4rem,env(safe-area-inset-top))] md:min-h-[min(92vh,860px)] md:pb-48 md:pt-28"
      @mouseenter="heroCarouselPaused = true"
      @mouseleave="heroCarouselPaused = false"
    >
      <!--
        Sources souvent réduites (ex. fichier WhatsApp) + ~1024 px de large :
        forte compression + agrandissement plein viewport = perte apparente du détail.
        Idéal : fichier maître (Figma/export outil graphique), PNG/WebP Haute qualité,
        largeur ≥ 1920 px pour le hero plein cadre sur ordinateurs.
      -->
      <div class="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
        <img
          v-for="(src, i) in heroSlides"
          :key="`${i}-${src}`"
          :src="src"
          alt=""
          width="1024"
          height="546"
          sizes="100vw"
          :loading="i === 0 ? 'eager' : 'lazy'"
          :fetchpriority="i === 0 ? 'high' : undefined"
          decoding="async"
          class="hero-bg-photo hero-carousel-crossfade absolute inset-0 size-full max-h-none object-cover object-[center_top] sm:object-center"
          :class="[
            i === activeHeroSlide ? 'z-[2] opacity-100' : 'z-[1] opacity-0',
          ]"
        />
        <div class="absolute inset-0 z-[3] bg-black/18" aria-hidden="true" />
        <div
          class="absolute inset-0 z-[4] bg-gradient-to-br from-white/10 via-transparent to-primary/[0.08]"
          aria-hidden="true"
        />
      </div>

      <div
        class="pointer-events-none absolute inset-y-0 left-0 z-[5] w-full bg-gradient-to-r from-gray-100/92 from-3% via-white/80 to-transparent md:max-w-[min(94%,62rem)] md:via-white/70 lg:max-w-[min(94%,68rem)]"
        aria-hidden="true"
      />
      <div
        class="pointer-events-none absolute inset-y-0 right-0 z-[5] w-[min(42%,380px)] bg-gradient-to-l from-transparent via-transparent to-white/20 md:to-transparent lg:w-[28%]"
        aria-hidden="true"
      />

      <div class="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-12">
        <div
          class="w-full max-w-2xl md:max-w-3xl"
          aria-labelledby="home-hero-title"
        >
          <div class="flex flex-col gap-4 md:gap-9">
            <div class="home-hero-stagger-item">
              <h1
                id="home-hero-title"
                class="mt-2 font-headline text-[1.75rem] font-extrabold leading-[1.15] sm:text-4xl md:mt-3 md:text-5xl md:leading-[1.1]"
              >
                <span class="text-primary">{{ heroHeadlinePrimary }}</span>
                <span class="text-secondary-fixed md:hidden">
                  {{ " " }}{{ heroHeadlineAccent }}
                </span>
                <span class="hidden text-secondary-fixed md:inline">
                  {{ " " }}{{ heroHeadlineAccentLong }}
                </span>
              </h1>
            </div>

            <div class="home-hero-stagger-item hidden md:block">
              <p
                v-if="heroSubtitleCms"
                class="max-w-none text-lg leading-relaxed text-on-surface-variant md:text-xl md:leading-relaxed"
              >
                {{ heroSubtitleCms }}
              </p>
              <p
                v-else
                class="max-w-none text-lg leading-relaxed text-on-surface-variant md:text-xl md:leading-relaxed"
              >
                Trouvez les bourses d'études faites pour les
                <strong class="font-semibold text-primary"
                  >étudiants sénégalais</strong
                >.
              </p>
            </div>

            <form
              class="home-hero-stagger-item group relative grid w-full max-w-none grid-cols-1 gap-2 rounded-2xl border border-slate-100/95 bg-white/95 p-2.5 shadow-premium transition-all duration-300 focus-within:border-primary/30 focus-within:ring-4 focus-within:ring-primary/5 sm:gap-3 sm:p-3 md:p-4 md:grid-cols-[minmax(11rem,1.35fr)_minmax(10rem,.95fr)_auto]"
              @submit.prevent="submitHeroSearch"
            >
              <!-- Input Recherche avec Dropdown -->
              <div
                class="relative flex min-h-[52px] min-w-0 items-center px-4 md:border-r md:border-slate-100 md:py-1"
              >
                <span
                  class="material-symbols-outlined mr-3 shrink-0 text-slate-400"
                  >search</span
                >
                <input
                  id="hero-search-programmes"
                  v-model="heroSearchQ"
                  name="q"
                  type="search"
                  enterkeyhint="search"
                  autocomplete="off"
                  class="w-full min-w-0 border-none bg-transparent py-3 text-base focus:outline-none focus:ring-0 sm:text-sm md:text-base"
                  :placeholder="searchPlaceholder"
                  :aria-label="searchPlaceholder"
                  @focus="showLiveResults = true"
                  @blur="() => setTimeout(() => (showLiveResults = false), 200)"
                />

                <!-- Dropdown Résultats Live -->
                <div
                  v-if="showLiveResults && liveResults.length > 0"
                  class="absolute left-0 top-full z-50 mt-2 w-full min-w-[320px] overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl backdrop-blur-xl"
                >
                  <div class="max-h-[380px] overflow-y-auto p-2">
                    <button
                      v-for="p in liveResults"
                      :key="p.id"
                      type="button"
                      class="flex w-full items-start gap-4 rounded-xl p-3 text-left transition hover:bg-slate-50"
                      @click="handleResultClick(p)"
                    >
                      <div
                        class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/5 text-primary"
                      >
                        <span class="material-symbols-outlined text-xl"
                          >school</span
                        >
                      </div>
                      <div class="min-w-0 flex-1">
                        <p class="truncate font-bold text-primary text-sm">
                          {{ p.searchLabel ?? p.titre }}
                        </p>
                        <p class="truncate text-xs text-slate-500">
                          {{ p.etablissement }} · Bourse
                        </p>
                      </div>
                    </button>
                  </div>
                  <div
                    class="border-t border-slate-50 bg-slate-50/50 p-3 text-center"
                  >
                    <button
                      type="submit"
                      class="text-xs font-bold text-primary hover:underline"
                    >
                      Voir tous les résultats
                    </button>
                  </div>
                </div>
              </div>

              <!-- Sélecteur de Secteur — desktop uniquement -->
              <div
                class="relative hidden min-h-[52px] min-w-0 items-center px-4 md:flex md:py-1"
              >
                <button
                  type="button"
                  class="flex w-full items-center gap-3 py-3 text-left focus:outline-none"
                  @click="showSectorDropdown = !showSectorDropdown"
                >
                  <span
                    class="material-symbols-outlined shrink-0 text-slate-400 text-xl"
                    >category</span
                  >
                  <span
                    class="block truncate text-base font-medium text-slate-700 sm:text-sm md:text-base"
                  >
                    {{ heroSector || "Tous les secteurs" }}
                  </span>
                  <span
                    class="material-symbols-outlined ml-auto text-slate-400 transition-transform duration-300"
                    :class="{ 'rotate-180': showSectorDropdown }"
                  >
                    expand_more
                  </span>
                </button>

                <!-- Dropdown personnalisé (Options) -->
                <div
                  v-if="showSectorDropdown"
                  class="absolute left-0 top-full z-50 mt-2 w-full min-w-[240px] overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200"
                >
                  <div class="p-2">
                    <button
                      v-for="opt in sectorOptions"
                      :key="opt"
                      type="button"
                      class="flex w-full items-center rounded-xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-primary/5 hover:text-primary"
                      @click="
                        () => {
                          heroSector = opt;
                          showSectorDropdown = false;
                        }
                      "
                    >
                      <span
                        v-if="heroSector === opt"
                        class="material-symbols-outlined mr-2 text-primary text-lg"
                        >check</span
                      >
                      <span :class="{ 'ml-7': heroSector !== opt }">{{
                        opt
                      }}</span>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Bouton CTA primaire -->
              <button
                type="submit"
                class="min-h-[48px] shrink-0 rounded-xl bg-primary px-5 py-3 text-center text-sm font-semibold text-white whitespace-nowrap shadow-xl transition-all duration-300 hover:scale-[1.02] hover:bg-primary-hover active:scale-95 md:min-h-[52px] md:px-7 md:text-base"
              >
                {{ ctaLabel }}
              </button>
            </form>
          </div>
        </div>
      </div>

      <div
        v-if="heroShowCarouselDots"
        class="absolute bottom-6 left-0 right-0 z-10 flex justify-center gap-2.5 pb-[env(safe-area-inset-bottom)] md:bottom-10"
        role="tablist"
        aria-label="Choisir un visuel d’arrière-plan"
      >
        <button
          v-for="(_, i) in heroSlides"
          :key="i"
          type="button"
          role="tab"
          :aria-selected="i === activeHeroSlide"
          :aria-label="'Arrière-plan ' + (i + 1)"
          class="h-2.5 rounded-full transition-[width,opacity,background-color,box-shadow] duration-700 ease-out motion-safe:duration-700"
          :class="
            i === activeHeroSlide
              ? 'w-9 bg-primary ring-2 ring-white/75'
              : 'w-2.5 bg-white/90 ring-2 ring-white/40 hover:bg-white'
          "
          @click="goHeroSlide(i)"
        />
      </div>
    </section>

    <LandingStatsBand
      :items="stats"
      :dossiers-valides="publicStats?.candidaturesValidees ?? publicStats?.socialProof?.dossiersValides"
    />

    <LandingBoursesDisponibles />

    <section class="landing-rise bg-surface-container-low py-12 md:py-20">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
        <div class="mb-8 flex flex-wrap items-end justify-between gap-3 md:mb-12 md:gap-4">
          <div>
            <h2 class="mb-1 font-headline text-2xl font-extrabold text-primary md:mb-2 md:text-4xl">
              {{ partnerTitle }}
            </h2>
            <p class="hidden text-sm text-on-surface-variant sm:block md:text-base">{{ partnerSubtitle }}</p>
          </div>
          <NuxtLink :to="partnerCtaHref" class="text-sm font-semibold text-primary md:text-base">{{
            partnerCtaLabel
          }}</NuxtLink>
        </div>
        <div
          class="landing-scroll-row -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-2 md:gap-6 md:overflow-visible md:px-0 md:pb-0 lg:grid-cols-3 xl:grid-cols-4"
        >
          <div
            v-for="e in ecolesPartenairesLanding"
            :key="e.slug"
            class="w-[min(88vw,300px)] shrink-0 snap-center md:w-auto"
          >
            <PartnerSchoolCard :ecole="e" />
          </div>
        </div>
      </div>
    </section>

    <LandingCommentObtenirBourse />

    <LandingEspaceEtudiant />

    <LandingTrustQuotes />

    <LandingFaq />
  </main>
</template>
