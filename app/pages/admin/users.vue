<script setup lang="ts">
definePageMeta({ layout: 'portal', middleware: 'admin-auth' })

const { data: users } = await useFetch('/api/admin/users')
</script>

<template>
  <div class="flex min-h-screen">
    <AdminSidebar />
    <main class="flex-1 p-8">
      <h1 class="admin-page-title">Utilisateurs</h1>
      <div class="admin-table-shell mt-6">
        <table class="admin-table">
          <thead>
            <tr>
              <th class="admin-th">Nom</th>
              <th class="admin-th">Email</th>
              <th class="admin-th">Rôle</th>
              <th class="admin-th">Candidatures</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in users ?? []" :key="u.id">
              <td class="admin-td">{{ u.name }}</td>
              <td class="admin-td">{{ u.email }}</td>
              <td class="admin-td">{{ u.role }}</td>
              <td class="admin-td">{{ u.candidaturesCount }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  </div>
</template>
