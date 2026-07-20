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
          props.onUpdateSearch(($event.target as HTMLInputElement).value)
        " />
      <IssueFilters
        :attributes="viewModel.attributes"
        :loading="filtering"
        :model-value="filterValue"
        :spaces="viewModel.spaces"
        @update:model-value="
          props.onUpdateFilters({
            attributes: $event.attributes,
            spaceIds: $event.spaceIds ?? [],
          })
        " />
    </div>
    <IssueList
      :deps="issueListDeps"
      empty-text="No issues yet."
      :filtering="filtering"
      :has-next-page="viewModel.hasNextPage"
      :issues="viewModel.issues"
      :on-moved="props.onIssuesMoved"
      :on-update-page="props.onUpdatePage"
      :page="page"
      :source-board-id="null" />
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
    issueKey: string
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
  issueListDeps: IssueListDeps
  onIssuesMoved: () => Promise<void> | void
  onUpdateFilters: (value: IssuesPageFilterValue) => void
  onUpdatePage: (value: number) => void
  onUpdateSearch: (value: string) => void
  page: number
  search: string
  viewModel: IssuesPageViewModel
}
</script>

<script setup lang="ts">
import { ClipboardList, Plus } from 'lucide-vue-next'

import IssueList from '~/components/issues/issue-list/IssueList.vue'
import type { IssueListDeps } from '~/components/issues/issue-list/IssueListDeps'
import IssueFilters from '~/components/issues/IssueFilters.vue'

const props = defineProps<IssuesPageProps>()
const organizationRoutes = useOrganizationRoutes()
</script>
