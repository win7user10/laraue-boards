<template>
  <CreateIssuePage
    :deps="deps"
    :on-created="onCreated" />
</template>

<script setup lang="ts">
import { createCreateIssuePageDeps } from '~/sections/issues/create-issue/CreateIssuePage.deps.impl'
import CreateIssuePage from '~/sections/issues/create-issue/CreateIssuePage.vue'

const organizationRoutes = useOrganizationRoutes()
const client = useApiClient()
const deps = createCreateIssuePageDeps(client)
const onCreated = async (): Promise<void> => {
  await navigateTo(organizationRoutes.issues(), { replace: true })
}
</script>
