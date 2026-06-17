<script setup lang="ts">
import { usePartnerPortalNav } from '~/composables/usePartnerPortalNav'

definePageMeta({ layout: 'portal', middleware: 'partner-auth' })

const { navItems, partnerDrawerLinks } = usePartnerPortalNav()
const { data: profile } = await useFetch('/api/partner/profile')

const form = reactive({
  description: '',
  conditions: '',
  contactEmail: '',
})

watch(
  profile,
  (p) => {
    if (!p) return
    form.description = p.description ?? ''
    form.conditions = p.conditions ?? ''
    form.contactEmail = p.contactEmail ?? ''
  },
  { immediate: true },
)

const saving = ref(false)
const message = ref('')

async function save() {
  saving.value = true
  message.value = ''
  try {
    await $fetch('/api/partner/profile', {
      method: 'PATCH',
      body: { ...form },
    })
    message.value = 'Profil mis à jour.'
  } catch {
    message.value = 'Erreur lors de la sauvegarde.'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <PortalShell
    :nav-items="navItems"
    :drawer-links="partnerDrawerLinks"
    drawer-title="Portail partenaire"
    logo-to="/partenaire/dashboard"
    aria-label="Navigation partenaire"
  >
    <template #sidebar>
      <PartnerSidebar />
    </template>

    <div class="space-y-6 p-4 md:space-y-8 md:p-8">
      <PortalPageHeader
        title="Paramètres"
        subtitle="Informations affichées sur votre fiche partenaire publique."
      />

      <form class="portal-dash-card max-w-xl space-y-4 p-4 md:p-6" @submit.prevent="save">
        <label class="block">
          <span class="admin-label">Description</span>
          <textarea v-model="form.description" rows="4" class="admin-input mt-1 min-h-[6rem]" />
        </label>
        <label class="block">
          <span class="admin-label">Conditions générales</span>
          <textarea v-model="form.conditions" rows="4" class="admin-input mt-1 min-h-[6rem]" />
        </label>
        <label class="block">
          <span class="admin-label">Email de contact</span>
          <input v-model="form.contactEmail" type="email" class="admin-input mt-1 min-h-11" />
        </label>
        <p v-if="message" class="text-sm text-primary">{{ message }}</p>
        <button
          type="submit"
          class="admin-btn-primary flex min-h-11 w-full items-center justify-center active:scale-[0.98] sm:w-auto"
          :disabled="saving"
        >
          {{ saving ? 'Enregistrement…' : 'Enregistrer' }}
        </button>
      </form>
    </div>
  </PortalShell>
</template>
