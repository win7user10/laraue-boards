<template>
  <BacklogContent
    v-if="pageState.type === 'ready'"
    :filter-value="filterValue"
    :filtering="filtering"
    :issue-list-deps="deps.issueList"
    :on-issues-moved="handleIssuesMoved"
    :on-update-filters="updateFilters"
    :on-update-page="updatePage"
    :on-update-search="updateSearch"
    :page="request.page"
    :search="request.search"
    :view-model="pageState.data.BacklogPage" />
  <PageLoadState
    v-else
    :error-text="pageState.type === 'error' ? pageState.message : ''"
    :loading="pageState.type === 'pending'"
    loading-text="Loading backlog…"
    :on-retry="refresh" />
</template>

<script setup lang="ts">
import { debounce } from 'es-toolkit'

import type { BacklogPageDeps } from '~/sections/spaces/backlog/BacklogPageDeps'
import type { BacklogPageFilterValue } from '~/sections/spaces/backlog/components/BacklogContent.vue'
import BacklogContent from '~/sections/spaces/backlog/components/BacklogContent.vue'
import {
  getIssueAttributeFilterInput,
  normalizeIssueAttributeFilters,
  readIssueAttributeQuery,
  withIssueAttributeFilters,
} from '~/utils/issueAttributeFilters'

const props = defineProps<{
  deps: BacklogPageDeps
  spaceKey: string
}>()
const route = useRoute('organizations-organizationKey-spaces-spaceKey-backlog')
const request = computed(() => ({
  attributeQuery: readIssueAttributeQuery(route.query),
  page: Math.max(1, Number(route.query.page) || 1),
  search: typeof route.query.search === 'string' ? route.query.search : '',
  spaceKey: props.spaceKey,
}))
const router = useRouter()
const {
  actionResult: outcome,
  refresh,
  state: pageState,
} = await useActionData({
  action: () => props.deps.viewBacklogPage(request.value),
  fallbackMessage: 'Could not load backlog. Try again.',
  key: () => dataKeys.space.backlog(props.spaceKey),
  messages: {
    AccessDenied: 'You do not have access to this backlog.',
    SpaceNotFound: 'The space was not found or is not available to you.',
    TemporarilyUnavailable:
      'Could not load backlog. The service is temporarily unavailable.',
  },
  watch: [() => props.spaceKey],
})
const issueAttributes = computed(() =>
  pageState.value.type === 'ready'
    ? pageState.value.data.BacklogPage.attributes
    : [],
)
const attributeFilters = computed(() =>
  normalizeIssueAttributeFilters(
    request.value.attributeQuery,
    issueAttributes.value,
  ),
)
const filterValue = computed<BacklogPageFilterValue>(() => ({
  attributes: attributeFilters.value,
}))

function updateFilters(value: BacklogPageFilterValue) {
  void router.replace({
    query: withIssueAttributeFilters(
      route.query,
      value.attributes,
      issueAttributes.value,
    ),
  })
}

function updatePage(value: number) {
  const query = { ...route.query }
  if (value > 1) {
    query.page = String(value)
  } else {
    delete query.page
  }
  void router.replace({ query })
}

function updateSearch(value: string) {
  const query = { ...route.query }
  delete query.page
  if (value) {
    query.search = value
  } else {
    delete query.search
  }
  void router.replace({ query })
}
useHead({
  title: computed(() =>
    pageState.value.type === 'ready'
      ? pageState.value.data.BacklogPage.title
      : 'Backlog',
  ),
})
const runSearch = createLatestRequest()
const filtering = ref(false)
const scheduleSearch = debounce(searchIssues, 300)

watch(
  () => ({
    attributeQuery: request.value.attributeQuery,
    page: request.value.page,
    search: request.value.search,
  }),
  () => {
    filtering.value = true
    scheduleSearch()
  },
)
onScopeDispose(scheduleSearch.cancel)

watch(
  () => props.spaceKey,
  () => {
    scheduleSearch.cancel()
    runSearch.cancel()
    filtering.value = false
  },
)

async function searchIssues() {
  scheduleSearch.cancel()
  const current = outcome.value
  if (!current) {
    return
  }
  await matchActionResult({
    err: async () => undefined,
    ok: async (currentValue) => {
      filtering.value = true
      const result = await runSearch({
        request: () =>
          props.deps.searchBacklogIssues({
            backlogBoardId: currentValue.BacklogPage.backlogBoardId,
            filters: getIssueAttributeFilterInput(
              attributeFilters.value,
              issueAttributes.value,
            ),
            page: request.value.page,
            search: request.value.search,
          }),
      })
      if (!result) {
        return
      }
      filtering.value = false
      matchActionResult({
        err: (error) => {
          outcome.value = { error, ok: false }
        },
        ok: (value) => {
          outcome.value = {
            ok: true,
            value: {
              BacklogPage: {
                ...currentValue.BacklogPage,
                ...value.BacklogPage,
              },
            },
          }
        },
        result,
      })
    },
    result: current,
  })
}

async function handleIssuesMoved() {
  invalidateData({
    preserve: [dataKeys.space.backlog(props.spaceKey)],
    scope: 'issues',
  })
  await searchIssues()
}
</script>
