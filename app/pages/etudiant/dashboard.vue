<script setup lang="ts">
import { STUDENT_HOME } from '~/utils/routes'

definePageMeta({ middleware: 'student-auth' })

await navigateTo(STUDENT_HOME, { replace: true })
</script>

<template>
  <div />
</template>
