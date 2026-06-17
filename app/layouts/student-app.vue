<template>
  <div class="font-body">
    <SiteHeader />
    <div id="contenu-principal" class="pb-28 md:pb-0" tabindex="-1">
      <slot />
    </div>
    <StudentMobileNav />
  </div>
</template>
