<template>
  <CreateOrganizationPage
    :error="error"
    :submitting="submitting"
    @submit="submit" />
</template>

<script setup lang="ts">
import type { CreateOrganizationPageApplicationDeps } from './CreateOrganizationPageApplicationDeps'
import CreateOrganizationPage from './view/CreateOrganizationPage.vue'

const props = defineProps<{ deps: CreateOrganizationPageApplicationDeps }>()
useHead({ title: 'Create organization' })
const submitting = ref(false)
const error = ref<null | string>(null)
const invalidation = useAsyncDataInvalidation()
const submit = async (input: { color: string; name: string; slug: string }) => {
  submitting.value = true
  error.value = null
  const result = await props.deps.createOrganization(input)
  submitting.value = false
  await matchActionResult({
    err: async (actionError) => {
      error.value = getErrorMessage({
        error: actionError,
        messages: {
          AccessDenied: 'Sign in to create an organization.',
          TemporarilyUnavailable: 'Could not create organization. Try again.',
        },
      })
    },
    ok: async () => {
      invalidation.invalidateOrganizations()
      await navigateTo('/organizations')
    },
    result,
  })
}
</script>
