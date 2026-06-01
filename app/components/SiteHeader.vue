<script setup lang="ts">
const route = useRoute()
const { data, refresh } = await useFetch('/api/auth/me')

const links = [
  { to: '/ecoles', label: 'Écoles partenaires' },
  {
    to: { path: '/programmes', hash: '#programmes-catalog' },
    label: 'Demander une bourse'
  }
]

const isActive = (to: string | { path?: string }) => {
  const path = typeof to === 'string' ? to : (typeof to.path === 'string' ? to.path : '/')
  return route.path.startsWith(path)
}
const currentUser = computed(() => data.value?.user || null)

const isHome = computed(() => route.path === '/')

/** Accueil : logo plus marquant ; autres pages : un peu plus compact sur mobile. */
const logoImgClass = computed(() =>
  isHome.value
    ? 'h-12 w-auto max-h-12 md:h-14 md:max-h-14 lg:h-16 lg:max-h-16 object-contain object-left'
    : 'h-10 w-auto max-h-10 md:h-12 md:max-h-12 lg:h-14 lg:max-h-14 object-contain object-left'
)

const headerBarClass = computed(() =>
  isHome.value
    ? 'min-h-[5rem] py-2.5 md:min-h-[5.25rem]'
    : 'min-h-[4rem] py-2 md:min-h-[4.5rem]'
)

async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await refresh()
  await navigateTo('/auth/login')
}
</script>

<template>
  <header class="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur-md shadow-premium">
    <div
      class="mx-auto flex w-full max-w-screen-2xl items-center justify-between px-6 lg:px-8"
      :class="headerBarClass"
    >
      <AppBrandLogo to="/" :img-class="logoImgClass" />
      <nav class="hidden items-center gap-8 md:flex">
        <NuxtLink
          v-for="link in links"
          :key="typeof link.to === 'string' ? link.to : link.to.path + (link.to.hash || '')"
          :to="link.to"
          class="border-b-2 pb-1 text-sm font-semibold transition"
          :class="isActive(link.to) ? 'border-secondary text-primary' : 'border-transparent text-slate-600 hover:text-primary'"
        >
          {{ link.label }}
        </NuxtLink>
      </nav>
      <div class="flex items-center gap-3">
        <NuxtLink
          v-if="!currentUser"
          to="/auth/login"
          class="hidden rounded-lg px-4 py-2 font-medium text-slate-600 transition hover:text-primary md:inline-flex"
        >
          Connexion
        </NuxtLink>
        <button
          v-else
          type="button"
          class="hidden rounded-lg px-4 py-2 font-medium text-slate-600 transition hover:text-primary md:inline-flex"
          @click="logout"
        >
          Déconnexion
        </button>
        <NuxtLink
          :to="{ path: '/programmes', hash: '#programmes-catalog' }"
          class="rounded-lg bg-secondary-container px-4 py-2 text-sm font-semibold text-on-secondary-container shadow-sm transition hover:opacity-90 active:scale-95 md:px-5"
        >
          Demander une bourse
        </NuxtLink>
        <details class="relative md:hidden">
          <summary class="list-none rounded-lg border border-slate-200 p-2 text-slate-600">
            <span class="material-symbols-outlined">menu</span>
          </summary>
          <div class="absolute right-0 top-12 w-60 max-w-[calc(100vw-2rem)] rounded-xl border border-slate-200 bg-white p-3 shadow-xl">
            <NuxtLink
              :to="{ path: '/programmes', hash: '#programmes-catalog' }"
              class="mb-2 block rounded-lg bg-primary px-3 py-2.5 text-center text-sm font-semibold text-white"
            >
              Demander une bourse
            </NuxtLink>
            <NuxtLink
              v-for="link in links"
              :key="`m-${typeof link.to === 'string' ? link.to : link.to.path}`"
              :to="link.to"
              class="block rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              {{ link.label }}
            </NuxtLink>
            <NuxtLink
              v-if="!currentUser"
              to="/auth/login"
              class="mt-2 block rounded-md border border-slate-100 px-3 py-2 text-sm font-semibold text-primary"
            >
              Connexion
            </NuxtLink>
            <button
              v-else
              type="button"
              class="mt-2 w-full rounded-md border border-slate-100 px-3 py-2 text-left text-sm font-semibold text-slate-700"
              @click="logout"
            >
              Déconnexion
            </button>
          </div>
        </details>
      </div>
    </div>
  </header>
</template>
