<template>
  <PageState
    error-title="Could not load issues"
    loading-text="Loading issues…"
    :on-retry="query.refresh"
    :state="pageState">
    <template #default="{ data }">
      <section>
        <div class="title-row">
          <div class="page-heading">
            <ClipboardList class="page-heading-icon" />
            <div class="page-heading-text">
              <h1>All issues</h1>
            </div>
          </div>
          <NuxtLink
            v-if="data.spaces.length"
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
            :value="request.search"
            @input="updateSearch(($event.target as HTMLInputElement).value)" />
          <IssueFilters
            :attributes="data.attributes"
            :loading="state.filtering"
            :model-value="filterValue"
            :spaces="data.spaces"
            @update:model-value="
              updateFilters({
                attributes: $event.attributes,
                spaceIds: $event.spaceIds ?? [],
              })
            " />
        </div>
        <p
          v-if="state.searchError"
          class="form-error">
          {{ state.searchError }}
        </p>
        <IssueList
          :deps="deps.issueList"
          empty-text="No issues yet."
          :filtering="state.filtering"
          :has-next-page="data.hasNextPage"
          :issues="data.issues"
          :on-moved="searchIssues"
          :on-update-page="updatePage"
          :page="request.page" />
      </section>
    </template>
  </PageState>
</template>

<script setup lang="ts">
import { debounce } from 'es-toolkit'
import { ClipboardList, Plus } from 'lucide-vue-next'
import type { LocationQuery, LocationQueryRaw } from 'vue-router'

import IssueList from '~/components/issue-list/IssueList.vue'
import IssueFilters from '~/components/IssueFilters.vue'
import type { IssuesPageDeps, ViewIssuesFailure } from '~/sections/issues/issues/deps'
import type { IssuesPageFilterValue } from '~/sections/issues/issues/IssuesPage.types'
import { ok } from '~/utils/actionResult'
import { assertNever } from '~/utils/assertNever'
import { toAsyncResultState } from '~/utils/asyncResultState'
import {
  getIssueAttributeFilterInput,
  normalizeIssueAttributeFilters,
  readIssueAttributeQuery,
  readIssueSpaceQuery,
  withIssueAttributeFilters,
} from '~/utils/issueAttributeFilters'

const props = defineProps<{
  deps: IssuesPageDeps
  onUpdateQuery: (query: LocationQueryRaw) => Promise<void> | void
  organizationKey: string
  routeQuery: LocationQuery
}>()

const organizationRoutes = useOrganizationRoutes()
const request = computed(() => ({
  attributeQuery: readIssueAttributeQuery(props.routeQuery),
  page: Math.max(1, Number(props.routeQuery.page) || 1),
  search: typeof props.routeQuery.search === 'string' ? props.routeQuery.search : '',
  spaceIds: readIssueSpaceQuery(props.routeQuery.space),
}))
const query = await useAsyncData(
  () => `issues:${props.organizationKey}`,
  (_nuxtApp, { signal }) => props.deps.view({ ...request.value, signal }),
  { watch: [() => props.organizationKey] },
)

const getViewFailureMessage = (failure: ViewIssuesFailure): string => {
  switch (failure.type) {
    case 'accessDenied':
      return 'You do not have access to organization issues.'
    case 'temporarilyUnavailable':
      return 'Could not load issues. The service is temporarily unavailable.'
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
const attributes = computed(() =>
  pageState.value.type === 'ready' ? pageState.value.data.attributes : [],
)
const attributeFilters = computed(() =>
  normalizeIssueAttributeFilters(request.value.attributeQuery, attributes.value),
)
const filterValue = computed<IssuesPageFilterValue>(() => ({
  attributes: attributeFilters.value,
  spaceIds: request.value.spaceIds,
}))
const state = reactive({
  filtering: false,
  searchError: null as null | string,
})
const runSearch = createLatestRequest()

const searchIssues = async () => {
  scheduleSearch.cancel()
  const current = query.data.value
  if (!current?.ok) {
    state.filtering = false
    return
  }

  state.filtering = true
  state.searchError = null
  const result = await runSearch({
    request: () =>
      props.deps.searchIssues({
        filters: getIssueAttributeFilterInput(attributeFilters.value, attributes.value),
        page: request.value.page,
        search: request.value.search,
        spaceIds: request.value.spaceIds,
      }),
  })
  if (!result) {
    return
  }

  state.filtering = false
  if (!result.ok) {
    state.searchError = 'Could not update issues. Try again.'
    return
  }
  query.data.value = ok({ ...current.value, ...result.value })
}

const scheduleSearch = debounce(searchIssues, 300)

const updateFilters = (value: IssuesPageFilterValue) => {
  const nextQuery = withIssueAttributeFilters(props.routeQuery, value.attributes, attributes.value)
  if (value.spaceIds.length) {
    nextQuery.space = value.spaceIds
  } else {
    delete nextQuery.space
  }
  void props.onUpdateQuery(nextQuery)
}

const updatePage = (value: number) => {
  const nextQuery: LocationQueryRaw = { ...props.routeQuery }
  if (value > 1) {
    nextQuery.page = String(value)
  } else {
    delete nextQuery.page
  }
  void props.onUpdateQuery(nextQuery)
}

const updateSearch = (value: string) => {
  const nextQuery: LocationQueryRaw = { ...props.routeQuery }
  delete nextQuery.page
  if (value) {
    nextQuery.search = value
  } else {
    delete nextQuery.search
  }
  void props.onUpdateQuery(nextQuery)
}

watch(request, () => {
  state.filtering = true
  scheduleSearch()
})
watch(
  () => props.organizationKey,
  () => {
    scheduleSearch.cancel()
    runSearch.cancel()
    state.filtering = false
    state.searchError = null
  },
)
onScopeDispose(() => {
  scheduleSearch.cancel()
  runSearch.cancel()
})
useHead({ title: 'All issues' })
</script>
