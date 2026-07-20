<template>
  <section
    v-if="pageState.type === 'ready'"
    class="org-picker">
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
          v-for="organization in pageState.data.OrganizationPickerPage
            .organizations"
          :key="organization.id"
          class="org-choice"
          :disabled="state.selecting"
          type="button"
          @click="
            select({
              organizationId: organization.id,
              organizationKey: organization.key,
            })
          ">
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
          v-if="
            pageState.data.OrganizationPickerPage.organizations.length === 0
          "
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
  <PageLoadState
    v-else
    :error-text="pageState.type === 'error' ? pageState.message : ''"
    :loading="pageState.type === 'pending'"
    loading-text="Loading organizations…"
    :on-retry="retry"
    :retry-text="
      pageState.type === 'error' && pageState.error === 'AccessDenied'
        ? 'Sign in'
        : 'Try again'
    " />
</template>

<script lang="ts">
export type OrganizationPickerPageViewModel = {
  organizations: Array<{
    color: string
    description: string
    id: string
    initial: string
    key: string
    name: string
  }>
}
</script>

<script setup lang="ts">
import { ChevronRight, Plus } from 'lucide-vue-next'

import type { SelectOrganizationPageDeps } from '~/sections/organizations/select-organization/SelectOrganizationPageDeps'

const props = defineProps<{ deps: SelectOrganizationPageDeps }>()
const state = reactive({ error: null as null | string, selecting: false })
useHead({ title: 'Organizations' })
const { refresh, state: pageState } = await useActionData({
  action: () => props.deps.viewOrganizationPickerPage(),
  fallbackMessage: 'Could not load organizations. Try again.',
  messages: {
    AccessDenied: 'Your session is missing or has expired.',
    TemporarilyUnavailable:
      'Could not load organizations. The service is temporarily unavailable.',
  },
})
const retry = () =>
  pageState.value.type === 'error' && pageState.value.error === 'AccessDenied'
    ? navigateTo('/')
    : refresh()

async function select(input: {
  organizationId: string
  organizationKey: string
}) {
  state.selecting = true
  state.error = null
  const result = await props.deps.selectOrganization({
    organizationId: input.organizationId,
  })
  state.selecting = false
  await matchActionResult({
    err: async (error) => {
      state.error = getErrorMessage({
        error,
        messages: {
          AccessDenied: 'Your session has expired. Sign in again.',
          OrganizationNotFound:
            'This organization is no longer available to you.',
          TemporarilyUnavailable: 'Could not open organization. Try again.',
        },
      })
    },
    ok: async () => {
      await navigateTo({
        name: 'organizations-organizationKey-issues',
        params: { organizationKey: input.organizationKey },
      })
    },
    result,
  })
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
