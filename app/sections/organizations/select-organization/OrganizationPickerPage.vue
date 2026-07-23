<template>
  <PageState
    error-title="Could not load organizations"
    loading-text="Loading organizations…"
    :on-retry="
      pageState.type === 'error' && pageState.error.type === 'accessDenied'
        ? onAccessDenied
        : query.refresh
    "
    :retry-text="
      pageState.type === 'error' && pageState.error.type === 'accessDenied'
        ? 'Sign in'
        : 'Try again'
    "
    :state="pageState">
    <template #default="{ data: organizations }">
      <section class="org-picker">
        <div class="picker-card">
          <div class="logo">
            <img
              alt=""
              class="logo-mark"
              src="/favicon.svg" />
            <span>Laraue Boards</span>
          </div>
          <h1>Choose an organization</h1>
          <p class="muted">Select where you want to work today.</p>
          <div class="org-list">
            <button
              v-for="organization in organizations"
              :key="organization.id"
              class="org-choice"
              :disabled="state.selecting"
              type="button"
              @click="select(organization.id, organization.key)">
              <span
                class="entity-avatar"
                :style="{ background: organization.color }">
                {{ organization.initial }}
              </span>
              <span>
                <strong>{{ organization.name }}</strong>
                <small class="muted">{{ organization.description }}</small>
              </span>
              <ChevronRight />
            </button>
            <p
              v-if="organizations.length === 0"
              class="empty">
              No organizations yet.
            </p>
          </div>
          <NuxtLink
            class="secondary"
            to="/organizations/new">
            <Plus />
            Create organization
          </NuxtLink>
          <p
            v-if="state.error"
            class="form-error">
            {{ state.error }}
          </p>
        </div>
      </section>
    </template>
  </PageState>
</template>

<script setup lang="ts">
import { ChevronRight, Plus } from 'lucide-vue-next'

import type {
  OrganizationPickerPageDeps,
  SelectOrganizationFailure,
  ViewOrganizationPickerFailure,
} from '~/sections/organizations/select-organization/OrganizationPickerPage.deps'
import { matchResult } from '~/utils/actionResult'
import { assertNever } from '~/utils/assertNever'
import { toAsyncResultState } from '~/utils/asyncResultState'

const props = defineProps<{
  deps: OrganizationPickerPageDeps
  onAccessDenied: () => Promise<void> | void
  onSelected: (organizationKey: string) => Promise<void> | void
}>()
const state = reactive({ error: null as null | string, selecting: false })
useHead({ title: 'Organizations' })
const query = await useAsyncData('organization-picker', (_nuxtApp, { signal }) =>
  props.deps.view({ signal }),
)
const getViewFailureMessage = (failure: ViewOrganizationPickerFailure): string => {
  switch (failure.type) {
    case 'accessDenied':
      return 'Your session is missing or has expired.'
    case 'temporarilyUnavailable':
      return 'Could not load organizations. The service is temporarily unavailable.'
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
const getSelectFailureMessage = (failure: SelectOrganizationFailure): string => {
  switch (failure.type) {
    case 'accessDenied':
      return 'Your session has expired. Sign in again.'
    case 'organizationNotFound':
      return 'This organization is no longer available to you.'
    case 'temporarilyUnavailable':
      return 'Could not open organization. Try again.'
    default:
      return assertNever(failure)
  }
}

async function select(organizationId: string, organizationKey: string): Promise<void> {
  if (state.selecting) {
    return
  }
  state.selecting = true
  state.error = null
  try {
    const result = await props.deps.select({ organizationId })
    await matchResult(result, {
      err: (failure) => {
        state.error = getSelectFailureMessage(failure)
      },
      ok: () => props.onSelected(organizationKey),
    })
  } finally {
    state.selecting = false
  }
}
</script>

<style scoped>
.org-picker {
  display: grid;
  min-height: 100vh;
  padding: var(--space-6);
  place-items: center;
}

.picker-card {
  width: min(var(--form-page-max-width), 100%);
}

.picker-card > .logo {
  margin-bottom: 48px;
}

.org-list {
  display: grid;
  gap: var(--space-2);
  margin: var(--space-6) 0 var(--space-4);
}

.org-choice {
  align-items: center;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  color: var(--color-text);
  display: flex;
  gap: var(--space-3);
  padding: var(--space-4);
  text-align: left;
  transition: var(--transition-press);
  width: 100%;
}

.org-choice:hover {
  border-color: var(--color-accent);
}

.org-choice:not(:disabled):active {
  translate: 0 var(--press-offset);
}

.org-choice > span:nth-child(2) {
  display: grid;
}

.org-choice > .lucide {
  color: var(--color-muted);
  margin-left: auto;
}
</style>
