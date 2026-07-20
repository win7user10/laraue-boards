<template>
  <CreateAttributeContent
    :error="error"
    :on-submit="create"
    :submitting="submitting" />
</template>

<script setup lang="ts">
import CreateAttributeContent from '~/sections/organizations/attributes/create-attribute/components/CreateAttributeContent.vue'
import type { CreateAttributePageDeps } from '~/sections/organizations/attributes/create-attribute/CreateAttributePageDeps'
import type { CreateAttributeInput } from '~/sections/organizations/attributes/create-attribute/deps/createAttribute'

const props = defineProps<{ deps: CreateAttributePageDeps }>()
const organizationRoutes = useOrganizationRoutes()
useHead({ title: 'Create attribute' })
const submitting = ref(false)
const error = ref<null | string>(null)

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
    ok: async () => {
      invalidateData({ scope: 'attributes' })
      await navigateTo(organizationRoutes.attributes())
    },
    result,
  })
}
</script>
