<template>
  <AttributeContent
    v-if="pageState.type === 'ready'"
    :error="error"
    :on-delete="remove"
    :on-update="update"
    :saved="saved"
    :submitting="submitting"
    :view-model="pageState.data.AttributePage" />
  <PageLoadState
    v-else
    :error-text="pageState.type === 'error' ? pageState.message : ''"
    :loading="pageState.type === 'pending'"
    loading-text="Loading attribute…"
    :on-retry="refresh" />
</template>

<script setup lang="ts">
import type { AttributePageDeps } from '~/sections/organizations/attributes/attribute/AttributePageDeps'
import AttributeContent from '~/sections/organizations/attributes/attribute/components/AttributeContent.vue'
import type { UpdateAttributeInput } from '~/sections/organizations/attributes/attribute/deps/updateAttribute'

const props = defineProps<{
  attributeId: string
  deps: AttributePageDeps
}>()
const organizationRoutes = useOrganizationRoutes()
const { refresh, state: pageState } = await useActionData({
  action: () =>
    props.deps.viewAttributePage({ attributeId: props.attributeId }),
  fallbackMessage:
    'Could not load the attribute. The service is temporarily unavailable.',
  messages: {
    AccessDenied: 'You do not have permission to open this page.',
    AttributeNotFound: 'The requested page was not found.',
    TemporarilyUnavailable:
      'Could not load the attribute. The service is temporarily unavailable.',
  },
  watch: [() => props.attributeId],
})
useHead({
  title: computed(() =>
    pageState.value.type === 'ready'
      ? `${pageState.value.data.AttributePage.EditAttributeForm.name} attribute`
      : 'Attribute',
  ),
})
const submitting = ref(false)
const saved = ref(false)
const error = ref<null | string>(null)

async function returnToAttributes() {
  await navigateTo(organizationRoutes.attributes())
}

async function remove(id: string) {
  submitting.value = true
  saved.value = false
  error.value = null
  const result = await props.deps.deleteAttribute({ id })
  submitting.value = false
  await matchActionResult({
    err: async (actionError) => {
      error.value = getErrorMessage({
        error: actionError,
        messages: {
          AccessDenied: 'You do not have permission to delete attributes.',
          AttributeNotFound: 'The requested page was not found.',
          TemporarilyUnavailable: 'Could not delete the attribute. Try again.',
        },
      })
    },
    ok: async () => {
      await returnToAttributes()
    },
    result,
  })
}

async function update(input: UpdateAttributeInput) {
  submitting.value = true
  saved.value = false
  error.value = null
  const result = await props.deps.updateAttribute(input)
  submitting.value = false
  await matchActionResult({
    err: async (actionError) => {
      error.value = getErrorMessage({
        error: actionError,
        messages: {
          AccessDenied: 'You do not have permission to update attributes.',
          AttributeNotFound: 'The requested page was not found.',
          TemporarilyUnavailable: 'Could not save the attribute. Try again.',
        },
      })
    },
    ok: async () => {
      await returnToAttributes()
    },
    result,
  })
}
</script>
