<template>
  <main class="mx-auto max-w-4xl px-8 py-20">
    <div class="mb-12 border-b border-slate-100 pb-12">
      <h1 class="font-headline text-5xl font-extrabold leading-[1.12] text-primary md:text-6xl md:leading-[1.1]">Politique de Confidentialité</h1>
      <p class="mt-4 text-lg text-slate-600">Dernière mise à jour : 16 Juin 2026</p>
    </div>

    <div class="prose prose-slate max-w-none space-y-12">
      <section class="space-y-4">
        <h2 class="font-headline text-2xl font-bold text-primary">1. Introduction</h2>
        <p class="text-slate-700 leading-relaxed">
          BourseFi Senegal s'engage à protéger la vie privée des étudiants et des partenaires utilisant notre plateforme. Cette politique détaille comment nous collectons, utilisons et protégeons vos données personnelles dans le cadre de la gestion des bourses d'études.
        </p>
      </section>

      <section class="space-y-4">
        <h2 class="font-headline text-2xl font-bold text-primary">2. Données collectées</h2>
        <p class="text-slate-700 leading-relaxed">
          Nous collectons les types d'informations suivants :
        </p>
        <ul class="list-disc pl-6 text-slate-700 space-y-2">
          <li><strong>Identité :</strong> Nom, prénom, date de naissance.</li>
          <li><strong>Contact :</strong> Adresse email, numéro de téléphone, adresse de résidence.</li>
          <li><strong>Parcours Académique :</strong> Établissement d'origine, diplômes obtenus, relevés de notes.</li>
          <li><strong>Documents :</strong> Copies de la carte d'identité (recto/verso) nécessaires pour l'homologation.</li>
        </ul>
      </section>

      <section class="space-y-4">
        <h2 class="font-headline text-2xl font-bold text-primary">3. Utilisation des données</h2>
        <p class="text-slate-700 leading-relaxed">
          Vos données sont exclusivement utilisées pour :
        </p>
        <ul class="list-disc pl-6 text-slate-700 space-y-2">
          <li>Le traitement de votre demande de bourse auprès des bailleurs (mairies, agences).</li>
          <li>La communication concernant l'état d'avancement de votre dossier.</li>
          <li>L'émission de documents d'homologation de bourse.</li>
          <li>L'amélioration de nos services et de l'expérience utilisateur.</li>
        </ul>
      </section>

      <section class="space-y-4">
        <h2 class="font-headline text-2xl font-bold text-primary">4. Partage des données</h2>
        <p class="text-slate-700 leading-relaxed">
          Vos informations ne sont partagées qu'avec les entités suivantes :
        </p>
        <ul class="list-disc pl-6 text-slate-700 space-y-2">
          <li>Le bailleur spécifique (Mairie, Agence, Fondation) auprès duquel vous postulez.</li>
          <li>L'établissement d'accueil sélectionné pour valider votre inscription.</li>
        </ul>
        <p class="text-sm italic text-slate-500">Nous ne revendons jamais vos données personnelles à des tiers.</p>
      </section>

      <section class="space-y-4">
        <h2 class="font-headline text-2xl font-bold text-primary">5. Vos droits</h2>
        <p class="text-slate-700 leading-relaxed">
          Conformément à la législation sur la protection des données personnelles au Sénégal, vous disposez d'un droit d'accès, de rectification et de suppression de vos données. Vous pouvez exercer ce droit en nous contactant à <span class="font-semibold text-primary">contact@boursefi.sn</span>.
        </p>
      </section>
    </div>

    <div class="mt-20 rounded-2xl bg-secondary-container/10 p-8 border border-secondary-container">
      <p class="text-sm text-primary font-medium">BourseFi utilise des cookies techniques nécessaires au bon fonctionnement de la session et à la sécurité de vos transactions de paiement.</p>
    </div>
  </main>
</template>

<script setup lang="ts">
useHead({
  title: 'Politique de Confidentialité - BourseFi',
  meta: [
    { name: 'description', content: 'Découvrez comment BourseFi Sénégal protège vos données personnelles et respecte votre vie privée.' }
  ]
})
</script>
