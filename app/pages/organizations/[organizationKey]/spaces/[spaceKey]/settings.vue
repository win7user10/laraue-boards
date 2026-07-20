<template>
  <SpaceSettingsPage
    :deps="deps"
    :space-key="spaceKey" />
</template>

<script setup lang="ts">
import { openApiDeleteSpace } from '#infrastructure/spaces/space-settings/openApiDeleteSpace'
import { openApiUpdateSpace } from '#infrastructure/spaces/space-settings/openApiUpdateSpace'
import { openApiViewSpaceSettingsPage } from '#infrastructure/spaces/space-settings/openApiViewSpaceSettingsPage'
import SpaceSettingsPage from '~/sections/spaces/space-settings/SpaceSettingsPage.vue'
const route = useRoute('organizations-organizationKey-spaces-spaceKey-settings')
const spaceKey = computed(() => String(route.params.spaceKey))
const config = useRuntimeConfig()
const baseUrl = config.public.boardsApiBaseUrl
const deps = {
  deleteSpace: openApiDeleteSpace(baseUrl),
  updateSpace: openApiUpdateSpace(baseUrl),
  viewSpaceSettingsPage: openApiViewSpaceSettingsPage(baseUrl),
}
</script>
