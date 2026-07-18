<template>
  <CreateSpacePage
    :error="error"
    :submitting="submitting"
    @submit="submit" />
</template>

<script setup lang="ts">
import type { CreateSpacePageApplicationDeps } from './CreateSpacePageApplicationDeps'
import CreateSpacePage from './view/CreateSpacePage.vue'

const props = defineProps<{ deps: CreateSpacePageApplicationDeps }>()
const organizationRoutes = useOrganizationRoutes()
useHead({ title: 'Create space' })
const submitting = ref(false)
const error = ref<null | string>(null)
const invalidation = useAsyncDataInvalidation()
async function submit(input: { color: string; key: string; name: string }) {
  submitting.value = true
  error.value = null
  const result = await props.deps.createSpace(input)
  submitting.value = false
  await matchActionResult({
    err: async (actionError) => {
      error.value = getErrorMessage({
        error: actionError,
        messages: {
          AccessDenied: 'You do not have permission to create spaces.',
          OrganizationNotFound: 'The organization was not found.',
          TemporarilyUnavailable: 'Could not create space. Try again.',
        },
      })
    },
    ok: async ({ spaceKey }) => {
      await invalidation.invalidateWorkspaceStructure()
      await navigateTo(organizationRoutes.space(spaceKey))
    },
    result,
  })
}
</script>
