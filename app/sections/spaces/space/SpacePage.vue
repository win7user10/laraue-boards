<template>
  <PageState
    error-title="Could not load space"
    loading-text="Loading space…"
    :on-retry="query.refresh"
    :state="pageState">
    <template #default="{ data }">
      <section class="space-page">
        <div class="title-row">
          <div class="page-heading">
            <SpaceIcon
              class="page-heading-icon"
              :style="{ color: data.color }" />
            <div class="page-heading-text">
              <h1>{{ data.name }}</h1>
            </div>
          </div>
          <div class="title-actions">
            <NuxtLink
              v-if="data.canManage"
              aria-label="Space settings"
              class="secondary"
              :to="organizationRoutes.spaceSettings(data.key)">
              <Settings />
              <span class="btn-label">Settings</span>
            </NuxtLink>
            <NuxtLink
              v-if="data.canCreateBoards"
              class="primary"
              :to="organizationRoutes.newBoard(data.key)">
              <Plus />
              <span class="btn-label">Create board</span>
            </NuxtLink>
          </div>
        </div>

        <div
          v-if="backlog"
          class="space-section">
          <h2 class="space-section-title">Backlog</h2>
          <NuxtLink
            class="backlog-summary"
            :to="organizationRoutes.backlog(data.key)">
            <div class="summary-title">
              <ListTodo :style="{ color: backlog.color }" />
              <strong>{{ backlog.name }}</strong>
              <span class="muted issue-count">{{ backlog.issueCount }} issues</span>
            </div>
          </NuxtLink>
        </div>

        <div class="space-section">
          <h2 class="space-section-title">
            Boards
            <span class="muted">{{ regularBoards.length }}</span>
          </h2>
          <div
            v-if="regularBoards.length"
            class="board-grid">
            <NuxtLink
              v-for="board in regularBoards"
              :key="board.id"
              class="board-summary"
              :to="organizationRoutes.board(data.key, board.id)">
              <div class="summary-title">
                <BoardIcon :style="{ color: board.color }" />
                <strong>{{ board.name }}</strong>
                <span class="muted issue-count">{{ board.issueCount }} issues</span>
              </div>
              <div class="meter">
                <span
                  v-for="status in board.statuses"
                  :key="status.name"
                  :style="{
                    flex: status.count || 0,
                    background: status.color,
                  }" />
              </div>
              <div class="summary-statuses">
                <span
                  v-for="status in board.statuses"
                  :key="status.name">
                  <span
                    class="dot"
                    :style="{ background: status.color }" />
                  {{ status.count }} {{ status.name }}
                </span>
              </div>
            </NuxtLink>
          </div>
          <p
            v-else
            class="muted">
            No boards in this space yet.
          </p>
        </div>
      </section>
    </template>
  </PageState>
</template>

<script setup lang="ts">
import { ListTodo, Plus, Settings } from 'lucide-vue-next'

import { BoardIcon, SpaceIcon } from '~/constants/icons'
import type { SpacePageDeps, ViewSpaceFailure } from '~/sections/spaces/space/SpacePage.deps'
import { assertNever } from '~/utils/assertNever'
import { toAsyncResultState } from '~/utils/asyncResultState'

const props = defineProps<{ deps: SpacePageDeps; spaceKey: string }>()
const organizationRoutes = useOrganizationRoutes()
const query = await useAsyncData(
  () => `space:${props.spaceKey}`,
  (_nuxtApp, { signal }) => props.deps.view({ signal, spaceKey: props.spaceKey }),
  { watch: [() => props.spaceKey] },
)
const getFailureMessage = (failure: ViewSpaceFailure): string => {
  switch (failure.type) {
    case 'accessDenied':
      return 'You do not have access to this space.'
    case 'spaceNotFound':
      return 'The space was not found or is not available to you.'
    case 'temporarilyUnavailable':
      return 'Could not load space. The service is temporarily unavailable.'
    default:
      return assertNever(failure)
  }
}
const pageState = computed(() =>
  toAsyncResultState({
    error: query.error.value,
    getErrorMessage: getFailureMessage,
    result: query.data.value,
    status: query.status.value,
  }),
)
const boards = computed(() => (pageState.value.type === 'ready' ? pageState.value.data.boards : []))
const backlog = computed(() => boards.value.find((board) => board.kind === 'backlog'))
const regularBoards = computed(() => boards.value.filter((board) => board.kind === 'board'))
useHead({
  title: computed(() => (pageState.value.type === 'ready' ? pageState.value.data.name : 'Space')),
})
</script>

<style scoped>
.space-page {
  align-content: start;
  display: grid;
  gap: var(--space-4);
  grid-template-columns: minmax(0, 1fr);
}

.space-section {
  display: grid;
  gap: var(--space-2);
}

.space-section-title {
  align-items: center;
  color: var(--color-muted);
  display: flex;
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-semibold);
  gap: var(--space-2);
  letter-spacing: 0.04em;
  margin: 0;
  text-transform: uppercase;
}

.board-grid {
  display: grid;
  gap: var(--space-3);
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.board-summary,
.backlog-summary {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  color: var(--color-text);
  min-width: 0;
  padding: var(--space-4);
  text-decoration: none;
  transition: var(--transition-press);
}

.board-summary:active,
.backlog-summary:active {
  translate: 0 var(--press-offset);
}

.backlog-summary:hover,
.board-summary:hover {
  border-color: var(--color-accent);
}

.backlog-summary {
  background: var(--color-soft);
  border-style: dashed;
}

.summary-title {
  align-items: center;
  display: flex;
  gap: var(--space-2);
  min-width: 0;
}

.summary-title strong {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.meter {
  background: var(--color-soft);
  border-radius: var(--radius-pill);
  display: flex;
  gap: 1px;
  height: 2px;
  margin-top: var(--space-3);
  opacity: 0.9;
  overflow: hidden;
}

.summary-statuses {
  color: var(--color-muted);
  display: flex;
  flex-wrap: wrap;
  font-size: var(--font-size-caption);
  gap: var(--space-1);
  margin-top: var(--space-3);
}

.summary-statuses > span {
  align-items: center;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-control);
  display: inline-flex;
  gap: var(--space-1);
  padding: 2px 8px;
}

@media (max-width: 1100px) {
  .board-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .board-grid {
    grid-template-columns: 1fr;
  }
}
</style>
