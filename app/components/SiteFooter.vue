<template>
  <footer class="mt-12 border-t border-white/10 bg-primary px-4 py-8 font-headline text-xs uppercase tracking-widest text-white md:mt-20 md:px-8 md:py-12">
    <div class="mx-auto grid max-w-7xl grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
      <div class="col-span-2 space-y-3 md:col-span-1 md:space-y-4">
        <AppBrandLogo :to="false" img-class="h-12 w-auto max-h-12 object-contain object-left opacity-95 md:h-16 md:max-h-[5.25rem]" />
        <p class="hidden normal-case tracking-normal text-slate-300 md:block">
          Guichet numerique pour les bourses d etudes dans les ecoles senegalaises avec les mairies et agences partenaires.
        </p>
        <div class="flex gap-3 text-slate-300">
          <span class="material-symbols-outlined cursor-pointer transition hover:text-white">mail</span>
        </div>
      </div>
      <div class="space-y-4">
        <h4 class="font-bold text-yellow-500">Parcours</h4>
        <NuxtLink
          class="block rounded-lg bg-secondary-container/90 px-3 py-2 text-center text-xs font-extrabold normal-case tracking-normal text-on-secondary-container transition hover:opacity-95"
          to="/bourses"
        >
          Obtenir une bourse
        </NuxtLink>
        <NuxtLink class="block text-slate-300 underline-offset-4 transition hover:text-white hover:underline" to="/bourses">Bourses</NuxtLink>
        <NuxtLink class="block text-slate-300 underline-offset-4 transition hover:text-white hover:underline" to="/ecoles">Écoles</NuxtLink>
        <NuxtLink class="block text-slate-300 underline-offset-4 transition hover:text-white hover:underline" to="/programmes">Formations</NuxtLink>
        <NuxtLink class="hidden normal-case tracking-normal text-slate-300 underline-offset-4 transition hover:text-white hover:underline md:block" to="/candidature">Comment ça marche</NuxtLink>
      </div>
      <div class="space-y-4">
        <h4 class="font-bold text-yellow-500">Juridique</h4>
        <NuxtLink class="block text-slate-300 underline-offset-4 transition hover:text-white hover:underline" to="/confidentialite">Confidentialité</NuxtLink>
        <NuxtLink class="block text-slate-300 underline-offset-4 transition hover:text-white hover:underline" to="/conditions">Conditions d'utilisation</NuxtLink>
      </div>
      <div class="space-y-4">
        <h4 class="font-bold text-yellow-500">Assistance</h4>
        <NuxtLink class="block text-slate-300 underline-offset-4 transition hover:text-white hover:underline" to="/contact">Contact support</NuxtLink>
      </div>
    </div>
    <div class="mx-auto mt-12 max-w-7xl border-t border-white/10 pt-8 text-center text-slate-400">
      <div class="flex flex-col items-center justify-center gap-2 md:flex-row md:gap-4">
        <span>© 2026 BourseFi Senegal. Tous droits reserves.</span>
        <span class="hidden h-1 w-1 rounded-full bg-white/20 md:block"></span>
        <span class="normal-case tracking-normal">Un produit de <span class="font-bold text-slate-200">MATKAM</span></span>
      </div>
    </div>
  </footer>
</template>
