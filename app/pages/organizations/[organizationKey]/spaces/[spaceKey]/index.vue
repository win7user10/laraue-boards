<template>
  <SpacePage
    :deps="deps"
    :space-key="spaceKey" />
</template>

<script setup lang="ts">
import { createSpacePageDeps } from '~/sections/spaces/space/SpacePage.deps.impl'
import SpacePage from '~/sections/spaces/space/SpacePage.vue'

const route = useRoute('organizations-organizationKey-spaces-spaceKey')
const spaceKey = computed(() => String(route.params.spaceKey))
const client = useApiClient()
const deps = createSpacePageDeps(client)
</script>
