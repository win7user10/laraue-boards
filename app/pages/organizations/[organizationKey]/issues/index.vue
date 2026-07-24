<template>
  <IssuesPage
    :deps="deps"
    :on-update-query="onUpdateQuery"
    :organization-key="organizationKey"
    :route-query="route.query" />
</template>

<script setup lang="ts">
import type { LocationQueryRaw } from 'vue-router'

import { createIssuesPageDeps } from '~/sections/issues/issues/deps/impl'
import IssuesPage from '~/sections/issues/issues/IssuesPage.vue'

const route = useRoute('organizations-organizationKey-issues')
const organizationKey = computed(() => String(route.params.organizationKey))
const router = useRouter()
const client = useApiClient()
const deps = createIssuesPageDeps(client)
const onUpdateQuery = async (query: LocationQueryRaw): Promise<void> => {
  await router.replace({ query })
}
</script>
