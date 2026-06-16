<template>
  <main class="mx-auto max-w-4xl px-8 py-20">
    <div class="mb-12 border-b border-slate-100 pb-12">
      <h1 class="font-headline text-5xl font-extrabold text-primary">Conditions d'Utilisation</h1>
      <p class="mt-4 text-lg text-slate-600">Dernière mise à jour : 16 Juin 2026</p>
    </div>

    <div class="prose prose-slate max-w-none space-y-12">
      <section class="space-y-4">
        <h2 class="font-headline text-2xl font-bold text-primary">1. Acceptation des conditions</h2>
        <p class="text-slate-700 leading-relaxed">
          En accédant et en utilisant la plateforme BourseFi, vous acceptez d'être lié par les présentes conditions générales d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser nos services.
        </p>
      </section>

      <section class="space-y-4">
        <h2 class="font-headline text-2xl font-bold text-primary">2. Services fournis</h2>
        <p class="text-slate-700 leading-relaxed">
          BourseFi agit en tant qu'intermédiaire numérique facilitant la mise en relation entre les étudiants, les établissements d'enseignement et les bailleurs de bourses (mairies, agences nationales, partenaires privés).
        </p>
      </section>

      <section class="space-y-4">
        <h2 class="font-headline text-2xl font-bold text-primary">3. Comptes Utilisateurs</h2>
        <p class="text-slate-700 leading-relaxed">
          Pour postuler, vous devez créer un compte. Vous êtes responsable du maintien de la confidentialité de vos identifiants. Toute activité effectuée sous votre compte est sous votre entière responsabilité.
        </p>
      </section>

      <section class="space-y-4">
        <h2 class="font-headline text-2xl font-bold text-primary">4. Frais de Dossier</h2>
        <p class="text-slate-700 leading-relaxed">
          Certaines demandes de bourses peuvent être soumises à des frais de dossier. Ces frais sont :
        </p>
        <ul class="list-disc pl-6 text-slate-700 space-y-2">
          <li>Payables via les méthodes de paiement sécurisées intégrées (Wave, Orange Money).</li>
          <li>Non remboursables après le début de l'étude du dossier par le bailleur.</li>
          <li>Destinés à couvrir les coûts administratifs de traitement et d'homologation.</li>
        </ul>
      </section>

      <section class="space-y-4">
        <h2 class="font-headline text-2xl font-bold text-primary">5. Exactitude des Informations</h2>
        <p class="text-slate-700 leading-relaxed">
          L'utilisateur s'engage à fournir des informations exactes et véridiques lors de sa candidature. Toute falsification de document (relevés de notes, pièces d'identité) entraînera le rejet immédiat du dossier et pourra faire l'objet de poursuites.
        </p>
      </section>

      <section class="space-y-4">
        <h2 class="font-headline text-2xl font-bold text-primary">6. Limitation de Responsabilité</h2>
        <p class="text-slate-700 leading-relaxed">
          Bien que BourseFi s'efforce de garantir la fiabilité des informations, l'octroi final de la bourse reste à l'entière discrétion du bailleur partenaire. BourseFi ne peut être tenu responsable d'un refus de bourse par un partenaire.
        </p>
      </section>
    </div>

    <div class="mt-20 border-t border-slate-100 pt-10 text-center">
      <p class="text-slate-500">Pour toute question concernant ces conditions, contactez-nous à <span class="text-primary font-bold">contact@boursefi.sn</span></p>
    </div>
  </main>
</template>

<script setup lang="ts">
useHead({
  title: 'Conditions d\'Utilisation - BourseFi',
  meta: [
    { name: 'description', content: 'Lisez les conditions générales d\'utilisation de la plateforme BourseFi Sénégal.' }
  ]
})
</script>
