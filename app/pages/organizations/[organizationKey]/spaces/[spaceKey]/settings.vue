<template>
  <SpaceSettingsPage
    :back-to="organizationRoutes.space(spaceKey)"
    :deps="deps"
    :on-deleted="onDeleted"
    :on-updated="onUpdated"
    :space-key="spaceKey" />
</template>

<script setup lang="ts">
import { createSpaceSettingsPageDeps } from '~/sections/spaces/space-settings/SpaceSettingsPage.deps.impl'
import SpaceSettingsPage from '~/sections/spaces/space-settings/SpaceSettingsPage.vue'

const route = useRoute('organizations-organizationKey-spaces-spaceKey-settings')
const spaceKey = computed(() => String(route.params.spaceKey))
const organizationRoutes = useOrganizationRoutes()
const client = useApiClient()
const deps = createSpaceSettingsPageDeps(client)
const onDeleted = async (): Promise<void> => {
  await refreshAppLayoutData()
  await navigateTo(organizationRoutes.issues())
}
const onUpdated = async (newSpaceKey: string): Promise<void> => {
  await refreshAppLayoutData()
  await navigateTo(organizationRoutes.space(newSpaceKey))
}
</script>
