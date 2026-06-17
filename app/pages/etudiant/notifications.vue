<script setup lang="ts">
definePageMeta({ layout: 'student-app', middleware: 'student-auth' })

const { data, refresh } = await useFetch('/api/notifications')

async function markRead(id: string) {
  await $fetch(`/api/notifications/${id}`, { method: 'PATCH' })
  await refresh()
}

async function markAllRead() {
  const unread = (data.value?.items ?? []).filter((n) => !n.readAt)
  await Promise.all(unread.map((n) => $fetch(`/api/notifications/${n.id}`, { method: 'PATCH' })))
  await refresh()
}

const unread = computed(() => (data.value?.items ?? []).filter((n) => !n.readAt))
const read = computed(() => (data.value?.items ?? []).filter((n) => n.readAt))

useSeoMeta({ title: 'Notifications — BourseFi' })
</script>

<template>
  <main class="min-h-[calc(100dvh-4rem)] bg-gradient-to-b from-primary/[0.04] to-background pb-8">
    <StudentPageShell title="Notifications" :show-notifications="false">
      <div v-if="unread.length" class="mb-4 flex justify-end">
        <button
          type="button"
          class="min-h-10 rounded-xl px-4 text-xs font-semibold text-primary ring-1 ring-primary/20 active:scale-[0.98]"
          @click="markAllRead"
        >
          Tout marquer lu
        </button>
      </div>

      <section v-if="unread.length" class="mb-6">
        <h2 class="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Non lues</h2>
        <div class="space-y-3">
          <button
            v-for="n in unread"
            :key="n.id"
            type="button"
            class="block w-full text-left active:scale-[0.99]"
            @click="markRead(n.id)"
          >
            <NotificationCard
              :title="n.title"
              :body="n.body"
              :created-at="n.createdAt"
              :read="false"
            />
          </button>
        </div>
      </section>

      <section v-if="read.length">
        <h2 class="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Lues</h2>
        <div class="space-y-3 opacity-80">
          <NotificationCard
            v-for="n in read"
            :key="n.id"
            :title="n.title"
            :body="n.body"
            :created-at="n.createdAt"
            :read="true"
          />
        </div>
      </section>

      <div
        v-if="!(data?.items?.length)"
        class="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center"
      >
        <span class="material-symbols-outlined text-[40px] text-slate-300">notifications_off</span>
        <p class="mt-3 text-slate-500">Aucune notification pour le moment.</p>
      </div>
    </StudentPageShell>
  </main>
</template>
