<template>
  <PageState
    error-title="Could not load attribute"
    loading-text="Loading attribute…"
    :on-retry="query.refresh"
    :state="pageState">
    <template #default="{ data }">
      <section class="form-page">
        <div class="title-row">
          <div class="page-heading">
            <AppBackLink
              label="Back to attributes"
              :to="organizationRoutes.attributes()" />
            <Tags
              class="page-heading-icon"
              :style="{ color: data.color }" />
            <div class="page-heading-text">
              <h1>{{ data.name }}</h1>
            </div>
          </div>
        </div>
        <EditAttributeForm
          :error="state.error"
          :on-delete="remove"
          :on-submit="update"
          :submitting="state.submitting"
          :view-model="data" />
      </section>
    </template>
  </PageState>
</template>

<script setup lang="ts">
import { Tags } from 'lucide-vue-next'

import type {
  AttributePageDeps,
  ChangeAttributeFailure,
  UpdateAttributeInput,
  ViewAttributeFailure,
} from '~/sections/organizations/attributes/attribute/AttributePage.deps'
import EditAttributeForm from '~/sections/organizations/attributes/attribute/components/EditAttributeForm.vue'
import { matchResult } from '~/utils/actionResult'
import { assertNever } from '~/utils/assertNever'
import { toAsyncResultState } from '~/utils/asyncResultState'

const props = defineProps<{
  attributeId: string
  deps: AttributePageDeps
  onFinished: () => Promise<void> | void
}>()
const organizationRoutes = useOrganizationRoutes()
const query = await useAsyncData(
  () => `attribute:${props.attributeId}`,
  (_nuxtApp, { signal }) => props.deps.view({ attributeId: props.attributeId, signal }),
  { watch: [() => props.attributeId] },
)
const getViewFailureMessage = (failure: ViewAttributeFailure): string => {
  switch (failure.type) {
    case 'accessDenied':
      return 'You do not have permission to open this page.'
    case 'attributeNotFound':
      return 'The requested page was not found.'
    case 'temporarilyUnavailable':
      return 'Could not load the attribute. The service is temporarily unavailable.'
    default:
      return assertNever(failure)
  }
}
const getChangeFailureMessage = (
  failure: ChangeAttributeFailure,
  unavailableMessage: string,
): string => {
  switch (failure.type) {
    case 'invalidInput':
      return failure.message
    case 'accessDenied':
      return 'You do not have permission to manage attributes.'
    case 'attributeNotFound':
      return 'The requested page was not found.'
    case 'temporarilyUnavailable':
      return unavailableMessage
    default:
      return assertNever(failure)
  }
}
const pageState = computed(() =>
  toAsyncResultState({
    error: query.error.value,
    getErrorMessage: getViewFailureMessage,
    result: query.data.value,
    status: query.status.value,
  }),
)
const state = reactive({ error: null as null | string, submitting: false })
useHead({
  title: computed(() =>
    pageState.value.type === 'ready' ? `${pageState.value.data.name} attribute` : 'Attribute',
  ),
})

async function remove(id: string): Promise<void> {
  if (state.submitting) {
    return
  }
  state.submitting = true
  state.error = null
  try {
    const result = await props.deps.delete({ id })
    await matchResult(result, {
      err: (failure) => {
        state.error = getChangeFailureMessage(failure, 'Could not delete the attribute. Try again.')
      },
      ok: props.onFinished,
    })
  } finally {
    state.submitting = false
  }
}

async function update(input: UpdateAttributeInput): Promise<void> {
  if (state.submitting) {
    return
  }
  state.submitting = true
  state.error = null
  try {
    const result = await props.deps.update(input)
    await matchResult(result, {
      err: (failure) => {
        state.error = getChangeFailureMessage(failure, 'Could not save the attribute. Try again.')
      },
      ok: props.onFinished,
    })
  } finally {
    state.submitting = false
  }
}
</script>
