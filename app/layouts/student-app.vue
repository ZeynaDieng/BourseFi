<template>
  <div class="font-body">
    <StudentTopBar />
    <div class="mx-auto flex w-full max-w-6xl">
      <StudentSidebar />
      <div
        id="contenu-principal"
        class="min-w-0 flex-1 pb-28 md:pb-8"
        tabindex="-1"
      >
        <slot />
      </div>
    </div>
    <StudentMobileNav />
  </div>
</template>
