<template>
  <section>
    <div class="title-row">
      <div class="page-heading">
        <AppBackLink
          label="Back to space"
          :to="organizationRoutes.space(viewModel.spaceKey)" />
        <ListTodo
          class="page-heading-icon"
          :style="{ color: viewModel.color }" />
        <div class="page-heading-text">
          <h1>{{ viewModel.title }}</h1>
        </div>
      </div>
      <div class="title-actions">
        <NuxtLink
          class="primary"
          :to="organizationRoutes.newBacklogIssue(viewModel.spaceKey)">
          <Plus />
          <span class="btn-label">Add issue</span>
        </NuxtLink>
      </div>
    </div>
    <div class="toolbar">
      <input
        aria-label="Search issues"
        placeholder="Search issues"
        type="search"
        :value="search"
        @input="
          emit('updateSearch', ($event.target as HTMLInputElement).value)
        " />
      <IssueFilters
        :attributes="viewModel.attributes"
        :model-value="filterValue"
        @update:model-value="emit('updateFilters', $event)" />
      <AppResultsUpdating :loading="filtering" />
    </div>
    <IssueList
      empty-text="The backlog is empty."
      :filtering="filtering"
      :has-next-page="viewModel.hasNextPage"
      :issues="viewModel.issues"
      :loading-move-boards="loadingMoveBoards"
      :loading-move-spaces="loadingMoveSpaces"
      :loading-move-statuses="loadingMoveStatuses"
      :move-boards="moveBoards"
      :move-error="moveError"
      :move-spaces="moveSpaces"
      :move-statuses="moveStatuses"
      :moving="moving"
      :page="page"
      @change-move-board="emit('changeMoveBoard')"
      @change-move-space="emit('changeMoveSpace')"
      @load-move-boards="emit('loadMoveBoards', $event)"
      @load-move-spaces="emit('loadMoveSpaces')"
      @load-move-statuses="emit('loadMoveStatuses', $event)"
      @move-issues="emit('moveIssues', $event)"
      @update-page="emit('updatePage', $event)" />
  </section>
</template>

<script lang="ts">
export type BacklogPageAttributeViewModel =
  | { color: string; id: string; name: string; type: 'text' }
  | {
      color: string
      id: string
      name: string
      options: Array<{ label: string; value: string }>
      type: 'list'
    }

export type BacklogPageFilterValue = {
  attributes: Record<string, string | string[]>
}

export type BacklogPageViewModel = {
  attributes: BacklogPageAttributeViewModel[]
  backlogBoardId: string
  color: string
  hasNextPage: boolean
  issues: Array<{
    assignee: string
    assigneeColor: string
    assigneeInitial: string
    boardColor: string
    boardName: string
    canMove: boolean
    content: string
    id: string
    key: string
    status: string
    statusColor: string
  }>
  spaceId: string
  spaceKey: string
  title: string
}

type BacklogPageProps = {
  filtering: boolean
  filterValue: BacklogPageFilterValue
  loadingMoveBoards: boolean
  loadingMoveSpaces: boolean
  loadingMoveStatuses: boolean
  moveBoards: Array<{ label: string; value: string }>
  moveError: null | string
  moveSpaces: Array<{ label: string; value: string }>
  moveStatuses: Array<{ id: string; name: string }>
  moving: boolean
  page: number
  search: string
  viewModel: BacklogPageViewModel
}
</script>

<script setup lang="ts">
import { ListTodo, Plus } from 'lucide-vue-next'

import IssueFilters from '~/components/issues/IssueFilters.vue'
import IssueList from '~/components/issues/IssueList.vue'

defineProps<BacklogPageProps>()
const emit = defineEmits<{
  changeMoveBoard: []
  changeMoveSpace: []
  loadMoveBoards: [spaceId: string]
  loadMoveSpaces: []
  loadMoveStatuses: [boardId: string]
  moveIssues: [input: { issueIds: string[]; statusId: string }]
  updateFilters: [value: BacklogPageFilterValue]
  updatePage: [value: number]
  updateSearch: [value: string]
}>()
const organizationRoutes = useOrganizationRoutes()
</script>
