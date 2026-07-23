<template>
  <IssuePage
    :deps="deps"
    :issue-key="issueKey"
    :on-back="onBack" />
</template>

<script setup lang="ts">
import { createIssuePageDeps } from '~/sections/issues/issue/IssuePage.deps.impl'
import IssuePage from '~/sections/issues/issue/IssuePage.vue'

const route = useRoute('organizations-organizationKey-issues-issueKey')
const issueKey = computed(() => String(route.params.issueKey))
const router = useRouter()
const organizationRoutes = useOrganizationRoutes()
const client = useApiClient()
const deps = createIssuePageDeps(client)
const onBack = async (): Promise<void> => {
  const back = window.history.state?.back
  if (typeof back === 'string' && back.startsWith('/')) {
    router.back()
    return
  }
  await navigateTo(organizationRoutes.issues())
}
</script>
