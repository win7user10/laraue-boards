<template>
  <MemberPermissionsPage
    :deps="deps"
    :member-id="memberId"
    :on-saved="onSaved" />
</template>

<script setup lang="ts">
import { createApiClient } from '#infrastructure/api/client'
import { createMemberPermissionsPageDeps } from '~/sections/organizations/permissions/member-permissions/MemberPermissionsPage.deps.impl'
import MemberPermissionsPage from '~/sections/organizations/permissions/member-permissions/MemberPermissionsPage.vue'

const route = useRoute('organizations-organizationKey-settings-permissions-id')
const memberId = computed(() => String(route.params.id))
const config = useRuntimeConfig()
const client = createApiClient({
  baseUrl: config.public.boardsApiBaseUrl,
  headers: import.meta.server ? useRequestHeaders(['cookie']) : undefined,
})
const deps = createMemberPermissionsPageDeps(client)
const organizationRoutes = useOrganizationRoutes()
const onSaved = async (): Promise<void> => {
  await navigateTo(organizationRoutes.permissions())
}
</script>
