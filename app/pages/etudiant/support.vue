<script setup lang="ts">
definePageMeta({ layout: 'student-app', middleware: 'student-auth' })

const quickLinks = [
  { to: '/candidature', icon: 'help', label: 'Comment ça marche' },
  { to: '/faq', icon: 'quiz', label: 'FAQ' },
  { to: '/contact', icon: 'mail', label: 'Nous contacter' },
  { to: '/etudiant/documents', icon: 'folder', label: 'Mes documents' },
]

useSeoMeta({ title: 'Support — BourseFi' })
</script>

<template>
  <main class="min-h-[calc(100dvh-4rem)] bg-gradient-to-b from-primary/[0.04] to-background pb-8">
    <StudentPageShell title="Support" subtitle="Besoin d'aide pour votre dossier ?">
      <div class="mb-6 grid grid-cols-2 gap-2">
        <NuxtLink
          v-for="link in quickLinks"
          :key="link.to"
          :to="link.to"
          class="flex min-h-[4.5rem] flex-col items-center justify-center gap-1 rounded-2xl border border-slate-100 bg-white p-3 text-center text-xs font-semibold text-primary shadow-sm transition active:scale-[0.98]"
        >
          <span class="material-symbols-outlined text-[22px] text-secondary">{{ link.icon }}</span>
          {{ link.label }}
        </NuxtLink>
      </div>

      <NuxtLink
        to="/contact"
        class="mb-8 flex min-h-12 w-full items-center justify-center rounded-xl bg-primary text-sm font-semibold text-white shadow-lg active:scale-[0.98]"
      >
        Contacter le support
      </NuxtLink>

      <section class="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-premium">
        <div class="border-b border-slate-100 px-4 py-3">
          <h2 class="font-headline text-base font-bold text-primary">Questions fréquentes</h2>
        </div>
        <div class="p-2">
          <LandingFaq />
        </div>
      </section>
    </StudentPageShell>
  </main>
</template>
