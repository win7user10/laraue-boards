<template>
  <AppLayout
    :key="organizationKey"
    :deps="deps"
    :organization-key="organizationKey">
    <slot />
  </AppLayout>
</template>

<script setup lang="ts">
import { openApiLogout } from '#infrastructure/common/app-layout/openApiLogout'
import { openApiViewAppLayout } from '#infrastructure/common/app-layout/openApiViewAppLayout'
import AppLayout from '~/sections/common/app-layout/AppLayout.vue'

const config = useRuntimeConfig()
const { organizationKey } = useOrganizationRoutes()
watch(organizationKey, (value, previousValue) => {
  if (previousValue && value !== previousValue) {
    invalidateData({ scope: 'selectedOrganization' })
  }
})
const baseUrl = config.public.boardsApiBaseUrl
const deps = {
  logout: openApiLogout(baseUrl),
  viewLayout: openApiViewAppLayout(baseUrl),
}
</script>
