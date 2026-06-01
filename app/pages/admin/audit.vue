<script setup lang="ts">
definePageMeta({ layout: 'portal', middleware: 'admin-auth' })
const { data: logs } = await useFetch('/api/audit-logs?limit=150')

function formatAuditMeta(meta: unknown): string {
  if (meta === null || meta === undefined) return '—'
  if (typeof meta !== 'object') return String(meta)
  const entries = Object.entries(meta as Record<string, unknown>)
  if (!entries.length) return '—'
  return entries.map(([k, v]) => `${k} : ${formatAuditMeta(v)}`).join('\n')
}
</script>

<template>
  <div class="flex min-h-screen">
    <AdminSidebar />
    <main class="flex-1 p-8">
      <h2 class="admin-page-title">Journal d’audit</h2>
      <p class="admin-page-desc">Historique des actions sensibles (catalogue, CMS, auth…).</p>
      <div class="admin-table-shell">
        <table class="admin-table">
          <thead>
            <tr>
              <th class="admin-th whitespace-nowrap">Date</th>
              <th class="admin-th">Rôle</th>
              <th class="admin-th">Action</th>
              <th class="admin-th">Entité</th>
              <th class="admin-th max-w-md">Métadonnées</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="log in logs || []" :key="log.id" class="hover:bg-slate-50/80">
              <td class="admin-td whitespace-nowrap text-xs">{{ new Date(log.createdAt).toLocaleString('fr-FR') }}</td>
              <td class="admin-td font-semibold text-primary">{{ log.actorRole }}</td>
              <td class="admin-td font-mono text-xs">{{ log.action }}</td>
              <td class="admin-td">{{ log.entityType }}</td>
              <td class="admin-td max-w-md whitespace-pre-line text-xs text-slate-600">
                {{ formatAuditMeta(log.metadata) }}
              </td>
            </tr>
            <tr v-if="!logs?.length">
              <td colspan="5" class="admin-td text-slate-500">Aucun événement pour le moment.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  </div>
</template>
