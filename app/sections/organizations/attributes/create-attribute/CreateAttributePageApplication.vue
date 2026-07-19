<template>
  <CreateAttributePage
    :error="error"
    :submitting="submitting"
    @submit="create" />
</template>

<script setup lang="ts">
import type { CreateAttributeInput } from './actions/createAttribute'
import type { CreateAttributePageApplicationDeps } from './CreateAttributePageApplicationDeps'
import CreateAttributePage from './view/CreateAttributePage.vue'

const props = defineProps<{ deps: CreateAttributePageApplicationDeps }>()
const organizationRoutes = useOrganizationRoutes()
useHead({ title: 'Create attribute' })
const submitting = ref(false)
const error = ref<null | string>(null)
const invalidation = useAsyncDataInvalidation()

async function create(input: CreateAttributeInput) {
  submitting.value = true
  error.value = null
  const result = await props.deps.createAttribute(input)
  submitting.value = false
  await matchActionResult({
    err: async (actionError) => {
      error.value = getErrorMessage({
        error: actionError,
        messages: {
          AccessDenied: 'You do not have permission to create attributes.',
          TemporarilyUnavailable: 'Could not create the attribute. Try again.',
        },
      })
    },
    ok: async ({ id }) => {
      invalidation.invalidateAttributes()
      await navigateTo(organizationRoutes.attribute(id))
    },
    result,
  })
}
</script>
