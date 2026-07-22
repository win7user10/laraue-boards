<template>
  <section class="form-page">
    <div class="title-row">
      <div class="page-heading">
        <AppBackLink
          label="Back to attributes"
          :to="organizationRoutes.attributes()" />
        <Tags class="page-heading-icon" />
        <div class="page-heading-text"><h1>Create attribute</h1></div>
      </div>
    </div>
    <CreateAttributeForm
      :error="state.error"
      :on-submit="create"
      :submitting="state.submitting" />
  </section>
</template>

<script setup lang="ts">
import { Tags } from 'lucide-vue-next'

import CreateAttributeForm from '~/sections/organizations/attributes/create-attribute/components/CreateAttributeForm.vue'
import type {
  CreateAttributeFailure,
  CreateAttributeInput,
  CreateAttributePageDeps,
} from '~/sections/organizations/attributes/create-attribute/CreateAttributePage.deps'
import { matchResult } from '~/utils/actionResult'
import { assertNever } from '~/utils/assertNever'

const props = defineProps<{
  deps: CreateAttributePageDeps
  onCreated: () => Promise<void> | void
}>()
const organizationRoutes = useOrganizationRoutes()
useHead({ title: 'Create attribute' })
const state = reactive({ error: null as null | string, submitting: false })

const getFailureMessage = (failure: CreateAttributeFailure): string => {
  switch (failure.type) {
    case 'accessDenied':
      return 'You do not have permission to create attributes.'
    case 'temporarilyUnavailable':
      return 'Could not create the attribute. Try again.'
    case 'invalidInput':
      return failure.message
    default:
      return assertNever(failure)
  }
}

async function create(input: CreateAttributeInput): Promise<void> {
  if (state.submitting) {
    return
  }
  state.submitting = true
  state.error = null
  try {
    await matchResult(await props.deps.create(input), {
      err: (failure) => {
        state.error = getFailureMessage(failure)
      },
      ok: props.onCreated,
    })
  } finally {
    state.submitting = false
  }
}
</script>
