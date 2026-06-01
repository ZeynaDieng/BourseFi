<template>
  <main class="min-h-screen bg-slate-100 px-6 py-12">
    <div class="mx-auto mb-8 flex max-w-4xl items-center justify-between">
      <NuxtLink to="/etudiant/dashboard" class="text-sm font-semibold text-slate-500">← Retour dashboard</NuxtLink>
      <div class="flex gap-3">
        <button class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-primary">Imprimer</button>
        <button class="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">Telecharger PDF</button>
      </div>
    </div>

    <article class="relative mx-auto max-w-4xl overflow-hidden border-[10px] border-double border-slate-200 bg-white p-12 shadow-2xl">
      <header class="mb-12 flex items-start justify-between">
        <div>
          <AppBrandLogo :to="false" img-class="h-[4.75rem] w-auto max-h-24 object-contain object-left" />
          <p class="mt-2 text-xs uppercase tracking-[0.25em] text-secondary">Protocole Academique Verifie</p>
        </div>
        <div class="text-right">
          <p class="text-xs uppercase tracking-widest text-slate-400">Institution partenaire</p>
          <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDLTs1Topu9jWwK1x5ExtbhRLhYflSpId1EjqTJ30V8rAQyyUzslhWnOv7ARDaOvhXFu5EpCHIS7GcnbS7NnNxC2m3XDItpb1gPlw9HtzhuBtV-xu7W4CJlLmIGQFzCOMrPuELnLYj97fMWAe8BC9_GEXWVX94UN_NLXLfHi8Nwfxr9lqOU4KxCFrJec19rjHSm6p6jW4S6azxwHEXUO-ltILK6IUvnIGHNRGEvZcPV36pnrmlY1yN4uPYCtiRo090STyd_M7sV9i4" alt="Logo institution" class="ml-auto h-14 w-auto opacity-70" />
        </div>
      </header>

      <section class="mb-10 text-center">
        <h2 class="font-headline text-5xl font-extrabold text-primary">Lettre de pre-admission</h2>
        <p class="mx-auto mt-4 max-w-2xl text-slate-600">
          Confirmation officielle de pre-admission pour la cohorte academique 2026.
        </p>
      </section>

      <section class="mb-10 grid grid-cols-1 gap-8 md:grid-cols-2">
        <div class="space-y-4">
          <div><p class="text-xs uppercase tracking-widest text-secondary">Etudiant</p><p class="text-xl font-bold text-primary">Abdoulaye Diallo</p></div>
          <div><p class="text-xs uppercase tracking-widest text-secondary">ID Candidature</p><p class="text-xl font-bold text-primary">BF-2026-9928</p></div>
          <div><p class="text-xs uppercase tracking-widest text-secondary">Programme</p><p class="text-xl font-bold text-primary">Master Finance Numerique</p></div>
        </div>
        <div class="space-y-4">
          <div><p class="text-xs uppercase tracking-widest text-secondary">Statut</p><p class="inline-block rounded-full border border-primary/20 bg-blue-50 px-3 py-1 text-sm font-bold text-primary">ACCEPTE PROVISOIREMENT</p></div>
          <div><p class="text-xs uppercase tracking-widest text-secondary">Date d'emission</p><p class="text-xl font-bold text-primary">05 mai 2026</p></div>
          <div><p class="text-xs uppercase tracking-widest text-secondary">Validite</p><p class="text-xl font-bold text-primary">31 aout 2026</p></div>
        </div>
      </section>

      <section class="mb-10 flex items-center justify-between gap-6 rounded-lg border border-slate-200 bg-slate-50 p-6">
        <div>
        <h3 class="mb-2 font-headline text-xl font-bold text-primary">Verification d'authenticite</h3>
        <p class="text-sm text-slate-600">
          Ce document est signe numeriquement sur le registre BourseFi. Toute alteration annule automatiquement la validite de la pre-admission.
        </p>
        </div>
        <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAAs33uYKH-zHsL_b57i4FcDH8wloxy4zbu-yeC26IfALZ0P0hs_vMQcnA0FwqSkKjHzracEovNV4H7pNC2rQxdWkjFoHh9SyNcUGeMRWmRB42PnPPrx6ZvbC_UDTc3t5AXSlF8UuSXilarpCmvcV9orb8_kyodSPANOlhFU7I41cJkOE-NrlF2P4EZp7hsD5PnTjAS8oLVhwy7rq_FOtjPQFeGw6zFrIO-shzXmNaG6Vk0yz_SaphfbosCIYwDX4QvvV6XGBmm538" alt="QR verification" class="h-24 w-24 rounded bg-white p-2" />
      </section>

      <footer class="flex items-end justify-between">
        <div>
          <div class="mb-1 w-48 border-b border-primary" />
          <p class="font-bold text-primary">Dr. Aissatou Ndiaye</p>
          <p class="text-xs uppercase tracking-widest text-slate-400">Direction des admissions</p>
        </div>
        <p class="text-xs font-mono text-primary">HASH-BF-2026-8X1K</p>
      </footer>
    </article>
  </main>
</template>
