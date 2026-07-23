<template>
  <PageState
    error-title="Could not load member permissions"
    loading-text="Loading member permissions…"
    :on-retry="query.refresh"
    :state="pageState">
    <template #default="{ data }">
      <section class="member-permissions-page">
        <div class="title-row">
          <div class="page-heading">
            <AppBackLink
              label="Back to members"
              :to="organizationRoutes.permissions()" />
            <ShieldCheck class="page-heading-icon" />
            <div class="page-heading-text">
              <h1>{{ data.member.name }}</h1>
            </div>
          </div>
        </div>
        <MemberPermissionsForm
          :error="state.error"
          :on-submit="submit"
          :saved="state.saved"
          :submitting="state.submitting"
          :view-model="data" />
      </section>
    </template>
  </PageState>
</template>

<script setup lang="ts">
import { ShieldCheck } from 'lucide-vue-next'

import MemberPermissionsForm from '~/sections/organizations/permissions/member-permissions/components/MemberPermissionsForm/MemberPermissionsForm.vue'
import type {
  MemberPermissions,
  MemberPermissionsPageDeps,
  UpdateMemberPermissionsFailure,
  ViewMemberPermissionsFailure,
} from '~/sections/organizations/permissions/member-permissions/MemberPermissionsPage.deps'
import { matchResult } from '~/utils/actionResult'
import { assertNever } from '~/utils/assertNever'
import { toAsyncResultState } from '~/utils/asyncResultState'

const props = defineProps<{
  deps: MemberPermissionsPageDeps
  memberId: string
  onSaved: () => Promise<void> | void
}>()
const organizationRoutes = useOrganizationRoutes()

const query = await useAsyncData(
  () => `member-permissions:${props.memberId}`,
  (_nuxtApp, { signal }) => props.deps.view({ memberId: props.memberId, signal }),
  { watch: [() => props.memberId] },
)

const getViewFailureMessage = (failure: ViewMemberPermissionsFailure): string => {
  switch (failure.type) {
    case 'accessDenied':
      return 'You do not have permission to open this page.'
    case 'permissionsNotFound':
      return 'The requested page was not found.'
    case 'temporarilyUnavailable':
      return 'Could not load member permissions. The service is temporarily unavailable.'
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
const state = reactive({
  error: null as null | string,
  saved: false,
  submitting: false,
})

useHead({
  title: computed(() =>
    pageState.value.type === 'ready'
      ? `${pageState.value.data.member.name} permissions`
      : 'Member permissions',
  ),
})

const getUpdateFailureMessage = (failure: UpdateMemberPermissionsFailure): string => {
  switch (failure.type) {
    case 'accessDenied':
      return 'You do not have permission to update this member.'
    case 'memberNotFound':
      return 'The requested page was not found.'
    case 'temporarilyUnavailable':
      return 'Could not save permissions.'
    case 'invalidInput':
      return failure.message
    default:
      return assertNever(failure)
  }
}

async function submit(permissions: MemberPermissions): Promise<void> {
  if (state.submitting) {
    return
  }
  state.submitting = true
  state.saved = false
  state.error = null
  try {
    const result = await props.deps.update({
      memberId: props.memberId,
      permissions,
    })
    await matchResult(result, {
      err: (failure) => {
        state.error = getUpdateFailureMessage(failure)
      },
      ok: async () => {
        await props.onSaved()
        state.saved = true
      },
    })
  } finally {
    state.submitting = false
  }
}
</script>

<style scoped>
.member-permissions-page {
  overflow: visible;
}
</style>
