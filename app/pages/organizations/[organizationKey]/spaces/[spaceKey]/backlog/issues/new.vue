<template>
  <CreateBacklogIssuePage
    :deps="deps"
    :on-created="onCreated"
    :space-key="spaceKey" />
</template>

<script setup lang="ts">
import { createCreateBacklogIssuePageDeps } from '~/sections/spaces/create-backlog-issue/CreateBacklogIssuePage.deps.impl'
import CreateBacklogIssuePage from '~/sections/spaces/create-backlog-issue/CreateBacklogIssuePage.vue'

const route = useRoute(
  'organizations-organizationKey-spaces-spaceKey-backlog-issues-new',
)
const spaceKey = computed(() => String(route.params.spaceKey))
const organizationRoutes = useOrganizationRoutes()
const client = useApiClient()
const deps = createCreateBacklogIssuePageDeps(client)
const onCreated = async (): Promise<void> => {
  await navigateTo(organizationRoutes.backlog(spaceKey.value))
}
</script>
