<template>
  <SpacePageApplication
    :deps="deps"
    :space-key="spaceKey" />
</template>

<script setup lang="ts">
import { openApiViewSpacePage } from '~~/infrastructure/spaces/space/openApiViewSpacePage'

import SpacePageApplication from '~/sections/spaces/space/SpacePageApplication.vue'

const route = useRoute('organizations-organizationKey-spaces-spaceKey')
const spaceKey = computed(() => String(route.params.spaceKey))
const config = useRuntimeConfig()
const baseUrl = config.public.boardsApiBaseUrl
const deps = {
  viewSpacePage: openApiViewSpacePage(baseUrl),
}
</script>
