<template>
  <PageState
    error-title="Could not load data movement"
    loading-text="Loading data movement…"
    :on-retry="query.refresh"
    :state="pageState">
    <template #default="{ data }">
      <section class="movement-page">
        <div class="title-row">
          <div class="page-heading">
            <ArrowRightLeft class="page-heading-icon" />
            <div class="page-heading-text">
              <h1>Data movement</h1>
            </div>
          </div>
        </div>
        <div class="movement-sections">
          <SpacesMovementSection
            :error="state.error"
            :moving="state.moving"
            :on-clear-error="clearError"
            :on-move="moveSpaces"
            :organizations="data.spaceOrganizations"
            :spaces="data.spaces" />
          <BoardsMovementSection
            :current-organization-id="data.currentOrganizationId"
            :destination-spaces="state.destinationSpaces"
            :error="state.error"
            :loading-spaces="state.loadingSpaces"
            :moving="state.moving"
            :on-change-organization="changeOrganization"
            :on-clear-error="clearError"
            :on-load-spaces="loadSpaces"
            :on-move="moveBoards"
            :organizations="data.organizations"
            :spaces="data.spaces" />
        </div>
      </section>
    </template>
  </PageState>
</template>

<script setup lang="ts">
import { ArrowRightLeft } from 'lucide-vue-next'

import BoardsMovementSection from '~/sections/organizations/data-movement/components/BoardsMovementSection.vue'
import SpacesMovementSection from '~/sections/organizations/data-movement/components/SpacesMovementSection.vue'
import type {
  DataMovementPageDeps,
  LoadDestinationSpacesFailure,
  MoveDataFailure,
  ViewDataMovementFailure,
} from '~/sections/organizations/data-movement/DataMovementPage.deps'
import { matchResult } from '~/utils/actionResult'
import { assertNever } from '~/utils/assertNever'
import { toAsyncResultState } from '~/utils/asyncResultState'

const props = defineProps<{ deps: DataMovementPageDeps }>()
useHead({ title: 'Data movement' })

const query = await useAsyncData(
  'organization-data-movement',
  (_nuxtApp, { signal }) => props.deps.view({ signal }),
)

const getViewFailureMessage = (failure: ViewDataMovementFailure): string => {
  switch (failure.type) {
    case 'accessDenied':
      return 'The page was not found or is not available to you.'
    case 'temporarilyUnavailable':
      return 'Could not load data movement. The service is temporarily unavailable.'
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
const state = reactive({
  destinationSpaces: [] as Array<{ label: string; value: string }>,
  error: null as null | string,
  loadingSpaces: false,
  moving: false,
})
let loadSpacesRequest = 0

const clearError = () => {
  state.error = null
}

function changeOrganization() {
  loadSpacesRequest++
  state.loadingSpaces = false
  state.error = null
  state.destinationSpaces = []
}

const getLoadSpacesFailureMessage = (
  failure: LoadDestinationSpacesFailure,
): string => {
  switch (failure.type) {
    case 'accessDenied':
      return 'You cannot create boards in this organization.'
    case 'organizationNotFound':
      return 'The destination organization was not found.'
    case 'temporarilyUnavailable':
      return 'Could not load destination spaces.'
    default:
      return assertNever(failure)
  }
}

async function loadSpaces(organizationId: string): Promise<void> {
  if (state.loadingSpaces) {
    return
  }
  const requestId = ++loadSpacesRequest
  state.error = null
  const page = pageState.value.type === 'ready' ? pageState.value.data : null
  if (page?.currentOrganizationId === organizationId) {
    state.destinationSpaces = page.currentSpaces
    return
  }

  state.loadingSpaces = true
  try {
    const result = await props.deps.loadSpaces({ organizationId })
    if (requestId !== loadSpacesRequest) {
      return
    }
    matchResult(result, {
      err: (failure) => {
        state.error = getLoadSpacesFailureMessage(failure)
      },
      ok: (spaces) => {
        state.destinationSpaces = spaces
      },
    })
  } finally {
    if (requestId === loadSpacesRequest) {
      state.loadingSpaces = false
    }
  }
}

const getMoveFailureMessage = (
  failure: MoveDataFailure,
  resource: 'boards' | 'spaces',
): string => {
  switch (failure.type) {
    case 'accessDenied':
      return `You do not have permission to move some ${resource}.`
    case 'invalidDestination':
      return 'Select a valid destination.'
    case 'resourceNotFound':
      return `Some ${resource} or the destination were not found.`
    case 'temporarilyUnavailable':
      return `Could not move some ${resource}. Try again.`
    default:
      return assertNever(failure)
  }
}

async function moveBoards(input: {
  boardIds: string[]
  destinationSpaceId: string
}): Promise<void> {
  if (state.moving) {
    return
  }
  state.error = null
  state.moving = true
  try {
    const result = await props.deps.moveBoards(input)
    await matchResult(result, {
      err: (failure) => {
        state.error = getMoveFailureMessage(failure, 'boards')
      },
      ok: () => query.refresh(),
    })
  } finally {
    state.moving = false
  }
}

async function moveSpaces(input: {
  destinationOrganizationId: string
  spaceIds: string[]
}): Promise<void> {
  if (state.moving) {
    return
  }
  state.error = null
  state.moving = true
  try {
    const result = await props.deps.moveSpaces(input)
    await matchResult(result, {
      err: (failure) => {
        state.error = getMoveFailureMessage(failure, 'spaces')
      },
      ok: () => Promise.all([query.refresh(), refreshAppLayoutData()]),
    })
  } finally {
    state.moving = false
  }
}
</script>

<style scoped>
.movement-page {
  --movement-tree-line-width: 2px;
}

.movement-sections {
  display: grid;
  gap: var(--space-6);
  margin-top: var(--space-6);
}
</style>
