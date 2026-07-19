<template>
  <AppLayoutApplication
    :key="organizationKey"
    :deps="deps"
    :organization-key="organizationKey">
    <slot />
  </AppLayoutApplication>
</template>
<script setup lang="ts">
import { openApiLogout } from '~~/infrastructure/common/app-layout/openApiLogout'
import { openApiViewAppLayout } from '~~/infrastructure/common/app-layout/openApiViewAppLayout'

import AppLayoutApplication from '~/sections/common/app-layout/AppLayoutApplication.vue'

const config = useRuntimeConfig()
const { organizationKey } = useOrganizationRoutes()
const invalidation = useAsyncDataInvalidation()
watch(organizationKey, (value, previousValue) => {
  if (previousValue && value !== previousValue) {
    invalidation.resetSelectedOrganizationData()
  }
})
const baseUrl = config.public.boardsApiBaseUrl
const deps = {
  logout: openApiLogout(baseUrl),
  viewLayout: openApiViewAppLayout(baseUrl),
}
</script>
