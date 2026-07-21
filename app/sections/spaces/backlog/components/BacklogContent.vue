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
          props.onUpdateSearch(($event.target as HTMLInputElement).value)
        " />
      <IssueFilters
        :attributes="viewModel.attributes"
        :loading="filtering"
        :model-value="filterValue"
        @update:model-value="props.onUpdateFilters" />
    </div>
    <IssueList
      :deps="issueListDeps"
      empty-text="The backlog is empty."
      :filtering="filtering"
      :has-next-page="viewModel.hasNextPage"
      :issues="viewModel.issues"
      :on-moved="props.onIssuesMoved"
      :on-update-page="props.onUpdatePage"
      :page="page"
      :source-board-id="viewModel.backlogBoardId" />
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
    issueKey: string
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
  issueListDeps: IssueListDeps
  onIssuesMoved: () => Promise<void> | void
  onUpdateFilters: (value: BacklogPageFilterValue) => void
  onUpdatePage: (value: number) => void
  onUpdateSearch: (value: string) => void
  page: number
  search: string
  viewModel: BacklogPageViewModel
}
</script>

<script setup lang="ts">
import { ListTodo, Plus } from 'lucide-vue-next'

import IssueList from '~/components/issues/issue-list/IssueList.vue'
import type { IssueListDeps } from '~/components/issues/issue-list/IssueListDeps'
import IssueFilters from '~/components/issues/IssueFilters.vue'

const props = defineProps<BacklogPageProps>()
const organizationRoutes = useOrganizationRoutes()
</script>
