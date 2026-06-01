<script setup lang="ts">
definePageMeta({ layout: 'portal', middleware: 'partner-auth' })
const { data: logs } = await useFetch('/api/audit-logs?limit=100')
</script>

<template>
  <div class="flex min-h-screen">
    <aside class="w-64 border-r border-slate-200 bg-white p-4">
      <div class="mb-8">
        <AppBrandLogo to="/" img-class="h-12 w-auto max-h-14 object-contain object-left" />
        <p class="mt-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Portail partenaire</p>
      </div>
      <nav class="space-y-1">
        <NuxtLink to="/partenaire/dashboard" class="block rounded-lg px-4 py-3 text-slate-500">Tableau de bord</NuxtLink>
        <NuxtLink to="/partenaire/audit" class="block rounded-lg bg-slate-50 px-4 py-3 font-semibold text-primary">Audit partenaire</NuxtLink>
      </nav>
    </aside>
    <main class="flex-1 p-8">
      <h2 class="mb-6 font-headline text-3xl font-extrabold text-primary">Journal des actions</h2>
      <div class="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-premium">
        <table class="w-full text-left">
          <thead class="bg-slate-50 text-xs uppercase tracking-widest text-slate-500">
            <tr><th class="p-4">Date</th><th class="p-4">Action</th><th class="p-4">Entite</th><th class="p-4">Role</th></tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="log in logs || []" :key="log.id">
              <td class="p-4 text-sm">{{ new Date(log.createdAt).toLocaleString('fr-FR') }}</td>
              <td class="p-4 text-sm">{{ log.action }}</td>
              <td class="p-4 text-sm">{{ log.entityType }}</td>
              <td class="p-4 text-sm font-semibold text-primary">{{ log.actorRole }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  </div>
</template>
