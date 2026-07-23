<template>
  <BacklogPage
    :deps="deps"
    :on-update-query="onUpdateQuery"
    :route-query="route.query"
    :space-key="spaceKey" />
</template>

<script setup lang="ts">
import type { LocationQueryRaw } from 'vue-router'

import { createBacklogPageDeps } from '~/sections/spaces/backlog/BacklogPage.deps.impl'
import BacklogPage from '~/sections/spaces/backlog/BacklogPage.vue'

const route = useRoute('organizations-organizationKey-spaces-spaceKey-backlog')
const spaceKey = computed(() => String(route.params.spaceKey))
const router = useRouter()
const client = useApiClient()
const deps = createBacklogPageDeps(client)
const onUpdateQuery = async (query: LocationQueryRaw): Promise<void> => {
  await router.replace({ query })
}
</script>
