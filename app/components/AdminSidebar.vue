<template>
  <aside class="w-64 shrink-0 border-r border-slate-200 bg-white p-4">
    <div class="mb-8">
      <AppBrandLogo to="/admin/dashboard" img-class="h-12 w-auto max-h-14 object-contain object-left" />
      <p class="mt-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">Administration</p>
    </div>
    <nav class="space-y-1 text-sm">
      <NuxtLink
        to="/admin/dashboard"
        class="block rounded-lg px-4 py-3 font-semibold text-slate-600 hover:bg-slate-50 hover:text-primary"
        active-class="bg-slate-50 text-primary"
      >
        Tableau de bord
      </NuxtLink>

      <p class="mt-4 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Opérations</p>
      <NuxtLink
        to="/admin/candidatures"
        class="block rounded-lg px-4 py-3 font-semibold text-slate-600 hover:bg-slate-50 hover:text-primary"
        active-class="bg-slate-50 text-primary"
      >
        Candidatures
      </NuxtLink>
      <NuxtLink
        to="/admin/transactions"
        class="block rounded-lg px-4 py-3 font-semibold text-slate-600 hover:bg-slate-50 hover:text-primary"
        active-class="bg-slate-50 text-primary"
      >
        Paiements
      </NuxtLink>

      <p class="mt-4 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Catalogue bourses</p>
      <NuxtLink
        to="/admin/catalogue/bourses"
        class="block rounded-lg px-4 py-3 font-semibold text-slate-600 hover:bg-slate-50 hover:text-primary"
        active-class="bg-slate-50 text-primary"
      >
        Bourses
      </NuxtLink>
      <NuxtLink
        to="/admin/catalogue/programmes"
        class="block rounded-lg px-4 py-3 font-semibold text-slate-600 hover:bg-slate-50 hover:text-primary"
        active-class="bg-slate-50 text-primary"
      >
        Formations
      </NuxtLink>
      <NuxtLink
        to="/admin/catalogue/ecoles"
        class="block rounded-lg px-4 py-3 font-semibold text-slate-600 hover:bg-slate-50 hover:text-primary"
        active-class="bg-slate-50 text-primary"
      >
        Écoles
      </NuxtLink>
      <NuxtLink
        to="/admin/catalogue/partenaires"
        class="block rounded-lg px-4 py-3 font-semibold text-slate-600 hover:bg-slate-50 hover:text-primary"
        active-class="bg-slate-50 text-primary"
      >
        Partenaires
      </NuxtLink>

      <p class="mt-4 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Contenu site</p>
      <NuxtLink
        to="/admin/cms/site"
        class="block rounded-lg px-4 py-3 font-semibold text-slate-600 hover:bg-slate-50 hover:text-primary"
        active-class="bg-slate-50 text-primary"
      >
        Blocs du site
      </NuxtLink>
      <NuxtLink
        to="/admin/cms/faq"
        class="block rounded-lg px-4 py-3 font-semibold text-slate-600 hover:bg-slate-50 hover:text-primary"
        active-class="bg-slate-50 text-primary"
      >
        FAQ
      </NuxtLink>
      <NuxtLink
        to="/admin/cms/testimonials"
        class="block rounded-lg px-4 py-3 font-semibold text-slate-600 hover:bg-slate-50 hover:text-primary"
        active-class="bg-slate-50 text-primary"
      >
        Témoignages
      </NuxtLink>

      <p class="mt-4 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Rapports & système</p>
      <NuxtLink
        to="/admin/rapports"
        class="block rounded-lg px-4 py-3 font-semibold text-slate-600 hover:bg-slate-50 hover:text-primary"
        active-class="bg-slate-50 text-primary"
      >
        Rapports
      </NuxtLink>
      <NuxtLink
        to="/admin/users"
        class="block rounded-lg px-4 py-3 font-semibold text-slate-600 hover:bg-slate-50 hover:text-primary"
        active-class="bg-slate-50 text-primary"
      >
        Utilisateurs
      </NuxtLink>
      <NuxtLink
        to="/admin/audit"
        class="block rounded-lg px-4 py-3 font-semibold text-slate-600 hover:bg-slate-50 hover:text-primary"
        active-class="bg-slate-50 text-primary"
      >
        Journal d'audit
      </NuxtLink>
      <button
        type="button"
        class="mt-6 w-full rounded-lg border border-slate-200 px-4 py-3 text-left font-semibold text-slate-600 hover:bg-slate-50"
        @click="logout"
      >
        Déconnexion
      </button>
    </nav>
  </aside>
</template>

<script setup lang="ts">
async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await navigateTo('/auth/login')
}
</script>
