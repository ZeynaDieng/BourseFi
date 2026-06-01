<template>
  <div class="font-body">
    <a
      href="#contenu-principal"
      class="fixed left-4 top-4 z-[300] -translate-y-[220%] rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-xl transition focus:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary-fixed focus-visible:ring-offset-2"
    >
      Aller au contenu principal
    </a>
    <NuxtRouteAnnouncer />
    <SiteHeader />
    <div id="contenu-principal" tabindex="-1">
      <slot />
    </div>
    <SiteFooter />
  </div>
</template>
