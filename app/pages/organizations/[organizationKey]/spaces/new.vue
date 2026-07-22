<template>
  <CreateSpacePage
    :deps="deps"
    :on-created="onCreated" />
</template>

<script setup lang="ts">
import { createCreateSpacePageDeps } from '~/sections/spaces/create-space/CreateSpacePage.deps.impl'
import CreateSpacePage from '~/sections/spaces/create-space/CreateSpacePage.vue'

const client = useApiClient()
const deps = createCreateSpacePageDeps(client)
const organizationRoutes = useOrganizationRoutes()
const onCreated = async (spaceKey: string): Promise<void> => {
  await refreshAppLayoutData()
  await navigateTo(organizationRoutes.space(spaceKey))
}
</script>
