<template>
  <footer class="mt-20 border-t border-white/10 bg-primary px-8 py-12 font-headline text-xs uppercase tracking-widest text-white">
    <div class="mx-auto grid max-w-7xl grid-cols-1 gap-8 md:grid-cols-4">
      <div class="space-y-4">
        <AppBrandLogo :to="false" img-class="h-16 w-auto max-h-[5.25rem] object-contain object-left opacity-95" />
        <p class="normal-case tracking-normal text-slate-300">
          Guichet numerique pour les bourses d etudes dans les ecoles senegalaises avec les mairies et agences partenaires.
        </p>
        <div class="flex gap-3 text-slate-300">
          <span class="material-symbols-outlined cursor-pointer transition hover:text-white">public</span>
          <span class="material-symbols-outlined cursor-pointer transition hover:text-white">mail</span>
          <span class="material-symbols-outlined cursor-pointer transition hover:text-white">hub</span>
        </div>
      </div>
      <div class="space-y-4">
        <h4 class="font-bold text-yellow-500">Parcours</h4>
        <NuxtLink
          class="block rounded-lg bg-secondary-container/90 px-3 py-2 text-center text-xs font-extrabold normal-case tracking-normal text-on-secondary-container transition hover:opacity-95"
          :to="{ path: '/programmes', hash: '#programmes-catalog' }"
        >
          Demander une bourse
        </NuxtLink>
        <NuxtLink class="block text-slate-300 underline-offset-4 transition hover:text-white hover:underline" to="/ecoles">Écoles partenaires</NuxtLink>
        <NuxtLink class="block text-slate-300 underline-offset-4 transition hover:text-white hover:underline" to="/programmes">Catalogue des formations</NuxtLink>
        <!-- <NuxtLink class="block text-slate-300 underline-offset-4 transition hover:text-white hover:underline" to="/orientation">Orientation</NuxtLink> -->
        <NuxtLink class="block normal-case tracking-normal text-slate-300 underline-offset-4 transition hover:text-white hover:underline" to="/candidature">Comment postuler</NuxtLink>
      </div>
      <div class="space-y-4">
        <h4 class="font-bold text-yellow-500">Juridique</h4>
        <NuxtLink class="block text-slate-300 underline-offset-4 transition hover:text-white hover:underline" to="/confidentialite">Confidentialité</NuxtLink>
        <NuxtLink class="block text-slate-300 underline-offset-4 transition hover:text-white hover:underline" to="/conditions">Conditions d'utilisation</NuxtLink>
      </div>
      <div class="space-y-4">
        <h4 class="font-bold text-yellow-500">Assistance</h4>
        <a class="block text-slate-300 underline-offset-4 transition hover:text-white hover:underline" href="#">Contact support</a>
       <!-- <a class="block text-slate-300 underline-offset-4 transition hover:text-white hover:underline" href="#">Partenaires institutionnels</a> -->
      </div>
    </div>
    <div class="mx-auto mt-12 max-w-7xl border-t border-white/10 pt-8 text-center text-slate-400">
      © 2026 BourseFi Senegal. Tous droits reserves.
    </div>
  </footer>
</template>
