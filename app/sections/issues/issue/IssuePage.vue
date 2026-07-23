<template>
  <PageState
    v-if="!state.leaving"
    error-title="Could not load issue"
    loading-text="Loading issue…"
    :on-retry="query.refresh"
    :state="pageState">
    <template #default="{ data }">
      <section>
        <div class="title-row">
          <div class="page-heading">
            <button
              aria-label="Back"
              class="icon-btn"
              type="button"
              @click="leave">
              <ArrowLeft />
            </button>
            <div class="page-heading-text">
              <h1>{{ data.issueKey }}</h1>
            </div>
          </div>
        </div>
        <IssueDetails
          :deps="deps.issueDetails"
          :form-id="formId"
          :on-can-save-change="setCanSave"
          :on-dirty-change="setDirty"
          :on-saved="handleSaved"
          :on-saving-change="setSaving"
          :view-model="data" />
        <p
          v-if="state.actionError"
          class="form-error">
          {{ state.actionError }}
        </p>
        <div
          v-if="data.canEdit"
          class="page-actions">
          <button
            class="primary"
            :disabled="!state.canSave"
            :form="formId"
            type="submit">
            {{ state.saving ? 'Saving…' : 'Save changes' }}
          </button>
          <button
            class="secondary danger"
            :disabled="state.saving"
            type="button"
            @click="remove">
            <Trash2 />
            Delete issue
          </button>
        </div>
      </section>
    </template>
  </PageState>
</template>

<script setup lang="ts">
import { ArrowLeft, Trash2 } from 'lucide-vue-next'

import type { IssueDetailsSavedIssue } from '~/components/issues/issue-details/deps'
import IssueDetails from '~/components/issues/issue-details/IssueDetails.vue'
import type { IssuePageDeps, ViewIssueFailure } from '~/sections/issues/issue/deps'
import { assertNever } from '~/utils/assertNever'
import { toAsyncResultState } from '~/utils/asyncResultState'

const props = defineProps<{
  deps: IssuePageDeps
  issueKey: string
  onBack: () => Promise<void> | void
}>()

const formId = useId()

const query = await useAsyncData(
  () => `issue:${props.issueKey}`,
  (_nuxtApp, { signal }) => props.deps.view({ issueKey: props.issueKey, signal }),
  { watch: [() => props.issueKey] },
)

const getViewFailureMessage = (failure: ViewIssueFailure): string => {
  switch (failure.type) {
    case 'accessDenied':
      return 'You do not have access to this issue.'
    case 'issueNotFound':
      return 'The issue was not found or is not available to you.'
    case 'temporarilyUnavailable':
      return 'Could not load issue. The service is temporarily unavailable.'
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

useHead({
  title: computed(() =>
    pageState.value.type === 'ready' ? pageState.value.data.issueKey : 'Issue',
  ),
})

const state = reactive({
  actionError: null as null | string,
  canSave: false,
  dirty: false,
  leaving: false,
  saving: false,
})

useUnsavedChangesWarning(toRef(state, 'dirty'))

watch(
  () => props.issueKey,
  () => {
    state.actionError = null
  },
)

const setDirty = (value: boolean) => {
  state.dirty = value
}

const setCanSave = (value: boolean) => {
  state.canSave = value
}

const setSaving = (value: boolean) => {
  state.saving = value
}

const handleSaved = async (issue: IssueDetailsSavedIssue) => {
  if (issue.complete) {
    await leaveAfterIssueChanged()
    return
  }
  await query.refresh()
}

const remove = async () => {
  if (!confirm('Delete this issue?')) {
    return
  }
  state.actionError = null
  const result = await props.deps.deleteIssue({ issueKey: props.issueKey })
  if (!result.ok) {
    state.actionError = 'Could not delete issue. Try again.'
    return
  }
  await leaveAfterIssueChanged()
}

const leaveAfterIssueChanged = async () => {
  state.dirty = false
  await leave()
}

const leave = async () => {
  state.leaving = true
  await props.onBack()
}
</script>
