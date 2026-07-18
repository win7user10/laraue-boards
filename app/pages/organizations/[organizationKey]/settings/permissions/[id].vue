<template>
  <MemberPermissionsPageApplication
    :deps="deps"
    :member-id="memberId" />
</template>

<script setup lang="ts">
import { openApiUpdateMemberPermissions } from '~~/infrastructure/organizations/permissions/member-permissions/openApiUpdateMemberPermissions'
import { openApiViewMemberPermissionsPage } from '~~/infrastructure/organizations/permissions/member-permissions/openApiViewMemberPermissionsPage'

import MemberPermissionsPageApplication from '~/sections/organizations/permissions/member-permissions/MemberPermissionsPageApplication.vue'

const route = useRoute('organizations-organizationKey-settings-permissions-id')
const memberId = computed(() => String(route.params.id))
const baseUrl = useRuntimeConfig().public.boardsApiBaseUrl
const deps = {
  updateMemberPermissions: openApiUpdateMemberPermissions(baseUrl),
  viewMemberPermissionsPage: openApiViewMemberPermissionsPage(baseUrl),
}
</script>
