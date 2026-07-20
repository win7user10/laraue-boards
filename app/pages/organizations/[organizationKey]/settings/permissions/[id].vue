<template>
  <MemberPermissionsPage
    :deps="deps"
    :member-id="memberId" />
</template>

<script setup lang="ts">
import { openApiUpdateMemberPermissions } from '#infrastructure/organizations/permissions/member-permissions/member-permissions-form/openApiUpdateMemberPermissions'
import { openApiViewMemberPermissionsPage } from '#infrastructure/organizations/permissions/member-permissions/openApiViewMemberPermissionsPage'
import MemberPermissionsPage from '~/sections/organizations/permissions/member-permissions/MemberPermissionsPage.vue'
import type { MemberPermissionsPageDeps } from '~/sections/organizations/permissions/member-permissions/MemberPermissionsPageDeps'

const route = useRoute('organizations-organizationKey-settings-permissions-id')
const memberId = computed(() => String(route.params.id))
const baseUrl = useRuntimeConfig().public.boardsApiBaseUrl
const deps = {
  form: {
    updateMemberPermissions: openApiUpdateMemberPermissions(baseUrl),
  },
  viewMemberPermissionsPage: openApiViewMemberPermissionsPage(baseUrl),
} satisfies MemberPermissionsPageDeps
</script>
