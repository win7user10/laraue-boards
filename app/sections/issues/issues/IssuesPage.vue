<template>
  <IssuesContent
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
    :view-model="pageState.data.IssuesPage" />
  <PageLoadState
    v-else
    :error-text="pageState.type === 'error' ? pageState.message : ''"
    :loading="pageState.type === 'pending'"
    loading-text="Loading issues…"
    :on-retry="refresh" />
</template>

<script setup lang="ts">
import { debounce } from 'es-toolkit'

import type { IssuesPageFilterValue } from '~/sections/issues/issues/components/IssuesContent.vue'
import IssuesContent from '~/sections/issues/issues/components/IssuesContent.vue'
import type { IssuesPageDeps } from '~/sections/issues/issues/IssuesPageDeps'
import {
  getIssueAttributeFilterInput,
  normalizeIssueAttributeFilters,
  readIssueAttributeQuery,
  readIssueSpaceQuery,
  withIssueAttributeFilters,
} from '~/utils/issueAttributeFilters'

const props = defineProps<{ deps: IssuesPageDeps }>()
useHead({ title: 'All issues' })

// Page loading and filtering
const route = useRoute('organizations-organizationKey-issues')
const request = computed(() => ({
  attributeQuery: readIssueAttributeQuery(route.query),
  page: Math.max(1, Number(route.query.page) || 1),
  search: typeof route.query.search === 'string' ? route.query.search : '',
  spaceIds: readIssueSpaceQuery(route.query.space),
}))
const router = useRouter()
const {
  actionResult: outcome,
  refresh,
  state: pageState,
} = await useActionData({
  action: () => props.deps.viewIssuesPage(request.value),
  fallbackMessage: 'Could not load issues. Try again.',
  key: dataKeys.workspace.issues,
  messages: {
    AccessDenied: 'You do not have access to organization issues.',
    TemporarilyUnavailable:
      'Could not load issues. The service is temporarily unavailable.',
  },
})
const issueAttributes = computed(() =>
  pageState.value.type === 'ready'
    ? pageState.value.data.IssuesPage.attributes
    : [],
)
const attributeFilters = computed(() =>
  normalizeIssueAttributeFilters(
    request.value.attributeQuery,
    issueAttributes.value,
  ),
)
const filterValue = computed<IssuesPageFilterValue>(() => ({
  attributes: attributeFilters.value,
  spaceIds: request.value.spaceIds,
}))

function updateFilters(value: IssuesPageFilterValue) {
  const query = withIssueAttributeFilters(
    route.query,
    value.attributes,
    issueAttributes.value,
  )
  if (value.spaceIds.length) {
    query.space = value.spaceIds
  } else {
    delete query.space
  }
  void router.replace({ query })
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

// Issue search
const runSearch = createLatestRequest()
const filtering = ref(false)

async function searchIssues(input: typeof request.value) {
  scheduleSearch.cancel()
  filtering.value = true
  const latest = await runSearch({
    onLatest: (result) => {
      matchActionResult({
        err: (error) => {
          outcome.value = { error, ok: false }
        },
        ok: (value) => {
          const current = outcome.value
          if (!current) {
            return
          }
          matchActionResult({
            err: () => undefined,
            ok: (currentValue) => {
              outcome.value = {
                ok: true,
                value: {
                  IssuesPage: {
                    ...currentValue.IssuesPage,
                    ...value.IssuesPage,
                  },
                },
              }
            },
            result: current,
          })
        },
        result,
      })
    },
    request: () =>
      props.deps.searchIssues({
        filters: getIssueAttributeFilterInput(
          attributeFilters.value,
          issueAttributes.value,
        ),
        page: input.page,
        search: input.search,
        spaceIds: input.spaceIds,
      }),
  })
  if (latest) {
    filtering.value = false
  }
}

async function handleIssuesMoved() {
  invalidateData({
    preserve: [dataKeys.workspace.issues],
    scope: 'issues',
  })
  await searchIssues(request.value)
}

const scheduleSearch = debounce(searchIssues, 300)
watch(request, (input) => {
  filtering.value = true
  scheduleSearch(input)
})
onScopeDispose(scheduleSearch.cancel)
</script>
