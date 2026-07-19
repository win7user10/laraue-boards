<template>
  <section>
    <div class="title-row">
      <div class="page-heading">
        <ClipboardList class="page-heading-icon" />
        <div class="page-heading-text">
          <h1>All issues</h1>
        </div>
      </div>
      <NuxtLink
        v-if="viewModel.spaces.length"
        class="primary"
        :to="organizationRoutes.newIssue()">
        <Plus />
        <span class="btn-label">Add issue</span>
      </NuxtLink>
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
        :spaces="viewModel.spaces"
        @update:model-value="
          emit('updateFilters', {
            attributes: $event.attributes,
            spaceIds: $event.spaceIds ?? [],
          })
        " />
      <AppResultsUpdating :loading="filtering" />
    </div>
    <IssueList
      empty-text="No issues yet."
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
export type IssuesPageAttributeViewModel =
  | { color: string; id: string; name: string; type: 'text' }
  | {
      color: string
      id: string
      name: string
      options: Array<{ label: string; value: string }>
      type: 'list'
    }

export type IssuesPageFilterValue = {
  attributes: Record<string, string | string[]>
  spaceIds: string[]
}

export type IssuesPageViewModel = {
  attributes: IssuesPageAttributeViewModel[]
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
    spaceColor: string
    spaceName: string
    status: string
    statusColor: string
  }>
  spaces: Array<{ label: string; value: string }>
}

type IssuesPageProps = {
  filtering: boolean
  filterValue: IssuesPageFilterValue
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
  viewModel: IssuesPageViewModel
}
</script>

<script setup lang="ts">
import { ClipboardList, Plus } from 'lucide-vue-next'

import IssueFilters from '~/components/issues/IssueFilters.vue'
import IssueList from '~/components/issues/IssueList.vue'

defineProps<IssuesPageProps>()
const emit = defineEmits<{
  changeMoveBoard: []
  changeMoveSpace: []
  loadMoveBoards: [spaceId: string]
  loadMoveSpaces: []
  loadMoveStatuses: [boardId: string]
  moveIssues: [input: { issueIds: string[]; statusId: string }]
  updateFilters: [value: IssuesPageFilterValue]
  updatePage: [value: number]
  updateSearch: [value: string]
}>()
const organizationRoutes = useOrganizationRoutes()
</script>
