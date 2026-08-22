<template>
  <div class="font-body min-h-screen bg-slate-50">
    <StudentTopBar />
    <div class="mx-auto flex w-full max-w-6xl">
      <StudentSidebar />
      <div
        id="contenu-principal"
        class="min-w-0 flex-1 pb-8 md:pb-8"
        tabindex="-1"
      >
        <slot />
      </div>
    </div>
  </div>
</template>
