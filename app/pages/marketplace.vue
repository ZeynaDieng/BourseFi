<template>
  <div class="flex min-h-screen bg-background">
    <aside
      class="sidebar-scroll fixed left-0 hidden h-[calc(100vh-64px)] w-72 overflow-y-auto border-r border-slate-200 bg-white p-6 lg:block"
    >
      <div class="space-y-8">
        <div>
          <h3 class="mb-4 text-[18px] font-bold text-primary">Filtres</h3>
          <div class="space-y-6">
            <div class="space-y-2">
              <label
                class="text-[11px] font-semibold uppercase tracking-wider text-slate-500"
                >Pays</label
              >
              <select class="w-full rounded-lg border-slate-200 text-body-md">
                <option>All Countries</option>
                <option>United Kingdom</option>
                <option>United States</option>
                <option>Switzerland</option>
                <option>Singapore</option>
              </select>
            </div>
            <div class="space-y-2">
              <label
                class="text-[11px] font-semibold uppercase tracking-wider text-slate-500"
                >Ville</label
              >
              <select class="w-full rounded-lg border-slate-200 text-body-md">
                <option>All Cities</option>
                <option>London</option>
                <option>New York</option>
                <option>Zurich</option>
              </select>
            </div>
            <div class="space-y-3">
              <label
                class="text-[11px] font-semibold uppercase tracking-wider text-slate-500"
                >Niveau d'etudes</label
              >
              <div class="space-y-2">
                <label class="flex items-center space-x-3"
                  ><input
                    checked
                    class="rounded text-primary"
                    type="checkbox"
                  /><span>Master</span></label
                >
                <label class="flex items-center space-x-3"
                  ><input class="rounded text-primary" type="checkbox" /><span
                    >Licence</span
                  ></label
                >
                <label class="flex items-center space-x-3"
                  ><input class="rounded text-primary" type="checkbox" /><span
                    >MBA</span
                  ></label
                >
                <label class="flex items-center space-x-3"
                  ><input class="rounded text-primary" type="checkbox" /><span
                    >PhD</span
                  ></label
                >
              </div>
            </div>
            <div class="space-y-2">
              <label
                class="text-[11px] font-semibold uppercase tracking-wider text-slate-500"
                >Budget scolarite (USD)</label
              >
              <input
                class="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-100 accent-secondary-container"
                type="range"
              />
              <div class="flex justify-between text-xs text-slate-400">
                <span>$10k</span><span>$150k+</span>
              </div>
            </div>
            <div class="space-y-2">
              <label
                class="text-[11px] font-semibold uppercase tracking-wider text-slate-500"
                >Duree</label
              >
              <div class="grid grid-cols-2 gap-2">
                <button
                  class="rounded-lg border border-slate-200 py-2 text-xs font-bold"
                >
                  1 Year
                </button>
                <button
                  class="rounded-lg border border-primary-container bg-primary-container py-2 text-xs font-bold text-white"
                >
                  2 Years
                </button>
                <button
                  class="rounded-lg border border-slate-200 py-2 text-xs font-bold"
                >
                  3 Years
                </button>
                <button
                  class="rounded-lg border border-slate-200 py-2 text-xs font-bold"
                >
                  Flexible
                </button>
              </div>
            </div>
          </div>
        </div>
        <div class="border-t border-slate-100 pt-6">
          <button
            class="w-full rounded-lg bg-primary py-3 font-semibold text-white"
          >
            Reinitialiser les filtres
          </button>
        </div>
      </div>
    </aside>

    <main class="ml-0 flex-1 bg-surface p-8 lg:ml-72">
      <div class="mx-auto max-w-6xl space-y-8">
        <div class="space-y-4">
          <div class="group relative">
            <span
              class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              >search</span
            >
            <input
              class="w-full rounded-xl border-slate-200 bg-white py-4 pl-12 pr-4 text-body-lg shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/10"
              placeholder="Rechercher des programmes, universites ou metiers..."
              type="text"
            />
          </div>
          <div class="flex items-center space-x-3 overflow-x-auto pb-2">
            <span class="text-xs text-slate-400">Suggestions:</span>
            <button
              class="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold"
            >
              FinTech Masters
            </button>
            <button
              class="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold"
            >
              London Schools
            </button>
            <button
              class="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold"
            >
              Data Science
            </button>
            <button
              class="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold"
            >
              Admissible aux bourses
            </button>
          </div>
        </div>

        <div class="flex items-baseline justify-between">
          <div>
            <h1 class="text-[32px] font-extrabold text-primary">
              Resultats de recherche
            </h1>
            <p class="text-slate-500">
              142 programmes premium correspondent a votre profil
            </p>
          </div>
          <div class="flex items-center space-x-2 text-slate-600">
            <span>Trier par:</span>
            <button class="flex items-center font-bold text-primary">
              Pertinence
              <span class="material-symbols-outlined ml-1 text-sm"
                >expand_more</span
              >
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          <article
            class="col-span-1 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-premium md:col-span-2"
          >
            <div class="flex flex-col md:flex-row">
              <div class="relative h-48 md:h-auto md:w-2/5">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuA83XOdyc53yUBhNxxi2yH83Neyt99znV7DcJbYfBB-yXjqmAzLceA09jUs_htQpf_-6x826-qDPDrD1vlMZkOD45tnsLv_G1Ub2zWOj3DvObs7arBQSJKtqfHpGYOwMrylcIK5bsVMiNHOCvnYmN8dHy5p1YS2yKoWqH6yY3DLb7We9wQCR22OlvAWTCuTYCMMLEE3Tna36z7kTcsxKTdGe2MDfzX075JBC-XXhC-Nl6graVuXrzb4B1_sS5Y939zl1SdsTdJOpok"
                  alt="Ecole a la une"
                  class="h-full w-full object-cover"
                />
                <div
                  class="absolute top-4 left-4 rounded bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white"
                >
                  A la une
                </div>
              </div>
              <div class="space-y-4 p-6 md:w-3/5">
                <div class="space-y-1">
                  <div class="flex items-start justify-between">
                    <h2 class="font-headline text-3xl font-bold text-primary">
                      London School of Economics
                    </h2>
                    <span class="material-symbols-outlined text-slate-300"
                      >bookmark</span
                    >
                  </div>
                  <p class="text-slate-600">MSc Finance and Private Equity</p>
                </div>
                <div class="grid grid-cols-2 gap-4 text-xs text-slate-500">
                  <div class="flex items-center">
                    <span class="material-symbols-outlined mr-2 text-sm"
                      >location_on</span
                    >London, UK
                  </div>
                  <div class="flex items-center">
                    <span class="material-symbols-outlined mr-2 text-sm"
                      >schedule</span
                    >12 mois
                  </div>
                  <div class="flex items-center">
                    <span class="material-symbols-outlined mr-2 text-sm"
                      >payments</span
                    >$38,500 / yr
                  </div>
                  <div class="flex items-center">
                    <span class="material-symbols-outlined mr-2 text-sm"
                      >trending_up</span
                    >98% insertion
                  </div>
                </div>
                <div
                  class="flex items-center justify-between border-t border-slate-50 pt-4"
                >
                  <div class="flex -space-x-2">
                    <div
                      class="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-slate-200 text-[10px] font-bold"
                    >
                      LSE
                    </div>
                    <div
                      class="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-blue-100 text-[10px] font-bold text-blue-800"
                    >
                      QS
                    </div>
                  </div>
                  <NuxtLink
                    to="/programmes"
                    class="rounded-lg bg-secondary-container px-6 py-2.5 font-bold text-on-secondary-container"
                    >Voir details</NuxtLink
                  >
                </div>
              </div>
            </div>
          </article>

          <article
            class="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-premium"
          >
            <div class="h-40">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAJpv3VRoQbeWOSzzuo-KRK0RryUlA_okeDdHkwr9H-sWxGg_81krsbRvXRAVXt9bzo8mG8wU2Riy7v93HAvkmPGxkTq-4IKP5oddyOw8EpZkj8V-Miayck_8wbXe2tj-tPJh-8fqRwzg8Us6RIzspsDyDxNwRfys2TM7PkE-f0fIVUVf6CzxpGQb-lIOnA0l0KBiA3cHy2LLbZBbnMOVlFkD1ERagVPqECTIZ2pJlu5mXzizBWkfYmIeIvXvzyZ0rf2GD1Hcq-rwA"
                alt="ETH"
                class="h-full w-full object-cover"
              />
            </div>
            <div class="space-y-4 p-6">
              <h2 class="text-[20px] font-bold text-primary">ETH Zurich</h2>
              <p class="text-slate-600">Master en informatique</p>
              <div class="flex flex-wrap gap-2">
                <span
                  class="rounded bg-slate-50 px-2 py-1 text-[10px] font-bold uppercase text-slate-500"
                  >Stem</span
                ><span
                  class="rounded bg-slate-50 px-2 py-1 text-[10px] font-bold uppercase text-slate-500"
                  >High ROI</span
                >
              </div>
              <div class="flex items-center justify-between pt-4">
                <span class="font-bold text-primary"
                  >$4,200
                  <span class="text-xs font-normal text-slate-400"
                    >/ sem</span
                  ></span
                ><NuxtLink
                  to="/programmes"
                  class="rounded-lg border-2 border-slate-100 px-4 py-2 text-sm font-bold text-primary"
                  >Voir</NuxtLink
                >
              </div>
            </div>
          </article>

          <article
            class="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-premium"
          >
            <div class="h-40">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBbQCwzVo5zMy9UsK9O6SXPshPJmLbpzKOP87SK4imy4N4BG78UchtT-1WjbaiYp6_oMxULzmaHpTCGt8veoIt4TEnzQ07xNtEPimVIzgp_7M-SF5PyMjcgxt8_GJV6zv-g7dSo5VHlZmwt3JuLM5cOCK8HYG_hxh5Wu1vXPTTpY3tquE0inFldA_G0TklFPHE7NJHryXuSPHQhYp75sD6dGti4VQTFI3Ee0kSGAzgObZbTngBe6WUVRmiYK0ZI_-cqwnJTr-jQcic"
                  alt="Programme INSEAD"
                class="h-full w-full object-cover"
              />
            </div>
            <div class="space-y-4 p-6">
              <h2 class="text-[20px] font-bold text-primary">INSEAD</h2>
              <p class="text-slate-600">MBA Executif Global</p>
              <div class="flex flex-wrap gap-2">
                <span
                  class="rounded bg-slate-50 px-2 py-1 text-[10px] font-bold uppercase text-slate-500"
                  >Executif</span
                ><span
                  class="rounded bg-slate-50 px-2 py-1 text-[10px] font-bold uppercase text-slate-500"
                  >Multi-campus</span
                >
              </div>
              <div class="flex items-center justify-between pt-4">
                <span class="font-bold text-primary"
                  >$95,000
                  <span class="text-xs font-normal text-slate-400"
                    >total</span
                  ></span
                ><NuxtLink
                  to="/programmes"
                  class="rounded-lg border-2 border-slate-100 px-4 py-2 text-sm font-bold text-primary"
                  >Voir</NuxtLink
                >
              </div>
            </div>
          </article>

          <article
            class="relative col-span-1 space-y-6 overflow-hidden rounded-xl bg-primary p-8 text-white md:col-span-2 xl:col-span-1"
          >
            <div class="absolute -right-10 -bottom-10 opacity-10">
              <span class="material-symbols-outlined text-[160px]"
                >insights</span
              >
            </div>
            <div class="relative z-10 space-y-2">
              <h3
                class="text-[12px] font-bold uppercase tracking-widest text-secondary-container"
              >
                Analyse carriere
              </h3>
              <h2 class="text-[24px] font-bold">Analyste en capital-risque</h2>
            </div>
            <p class="relative z-10 text-sm leading-relaxed text-blue-100">
              D'apres votre recherche en Master Finance, cette trajectoire affiche
              une croissance projetee de 24% a Londres sur les 5 prochaines annees.
            </p>
            <div class="relative z-10 space-y-4">
              <div class="flex items-center justify-between text-sm">
                <span>Salaire d'entree</span
                ><span class="font-bold text-secondary-container">£72,000</span>
              </div>
              <div class="h-1 w-full overflow-hidden rounded-full bg-white/10">
                <div class="h-full w-3/4 bg-secondary-container"></div>
              </div>
            </div>
            <button
              class="relative z-10 w-full rounded-lg border border-white/20 bg-white/10 py-3 font-bold"
            >
              Explorer cette trajectoire
            </button>
          </article>

          <article
            class="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-premium"
          >
            <div class="h-40">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD76BuRQqrT_WjEbc5HKztgkDuez3kTjLjECzGLGj1hdYC4DKECGBQ9OdPZVE8fz0eMELa-hHsFzNPhWkx5UVMYehl3nK_LenItMJqL5r2N1jg7bHMBdszH-hkl0MQ_Il796rhoIoaxroGY9qq0RHHSxTwYjx2XkbkJ7Ese5aUzrj7SP3D-UoYlp65K9CXfhiAUXYy7PlZtxUB-FJ_KWkiVs9zuVA6xykKztlx983ZMuOcZmSdobbh27Pk5YIR9ERJLzkHuM_wW1aY"
                alt="NUS"
                class="h-full w-full object-cover"
              />
            </div>
            <div class="space-y-4 p-6">
              <h2 class="text-[20px] font-bold text-primary">
                Universite nationale de Singapour
              </h2>
              <p class="text-slate-600">MSc en technologie financiere numerique</p>
              <div class="flex items-center justify-between pt-4">
                <span class="font-bold text-primary"
                  >$52,000
                  <span class="text-xs font-normal text-slate-400"
                    >total</span
                  ></span
                ><NuxtLink
                  to="/programmes"
                  class="rounded-lg border-2 border-slate-100 px-4 py-2 text-sm font-bold text-primary"
                  >Voir</NuxtLink
                >
              </div>
            </div>
          </article>
        </div>

        <div class="flex items-center justify-center space-x-2 pt-8">
          <button
            class="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-400"
          >
            <span class="material-symbols-outlined">chevron_left</span>
          </button>
          <button
            class="flex h-10 w-10 items-center justify-center rounded-lg bg-primary font-bold text-white"
          >
            1
          </button>
          <button
            class="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600"
          >
            2
          </button>
          <button
            class="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600"
          >
            3
          </button>
          <span class="px-2 text-slate-400">...</span>
          <button
            class="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600"
          >
            12
          </button>
          <button
            class="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-400"
          >
            <span class="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>
    </main>
  </div>
</template>
