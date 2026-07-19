<template>
  <DataMovementPage
    v-if="pageState.type === 'ready'"
    :destination-spaces="destinationSpaces"
    :error="moveError"
    :loading-spaces="loadingSpaces"
    :moving="moving"
    :view-model="pageState.data.DataMovementPage"
    @change-organization="changeOrganization"
    @clear-error="moveError = null"
    @load-spaces="loadSpaces"
    @move-boards="moveBoards"
    @move-spaces="moveSpaces" />
  <PageLoadState
    v-else
    :error-text="pageState.type === 'error' ? pageState.message : ''"
    :loading="pageState.type === 'pending'"
    loading-text="Loading data movement…"
    @retry="refresh()" />
</template>

<script setup lang="ts">
import type { DataMovementPageApplicationDeps } from './DataMovementPageApplicationDeps'
import DataMovementPage from './view/DataMovementPage.vue'

const props = defineProps<{ deps: DataMovementPageApplicationDeps }>()
const { refresh, state: pageState } = await useActionData({
  action: () => props.deps.viewDataMovementPage(),
  fallbackMessage: 'Could not load data movement. Try again.',
  key: asyncDataKeys.workspace.dataMovement,
  messages: {
    AccessDenied: 'The page was not found or is not available to you.',
    TemporarilyUnavailable:
      'Could not load data movement. The service is temporarily unavailable.',
  },
})
useHead({ title: 'Data movement' })

const destinationSpaces = ref<Array<{ label: string; value: string }>>([])
const loadingSpaces = ref(false)
const moveError = ref<null | string>(null)
const moving = ref(false)
const invalidation = useAsyncDataInvalidation()

function changeOrganization() {
  loadingSpaces.value = false
  moveError.value = null
  destinationSpaces.value = []
}

async function loadSpaces(organizationId: string) {
  moveError.value = null
  const page =
    pageState.value.type === 'ready'
      ? pageState.value.data.DataMovementPage
      : null
  if (page?.currentOrganizationId === organizationId) {
    destinationSpaces.value = page.currentSpaces
    return
  }
  loadingSpaces.value = true
  const result = await props.deps.loadDataMovementSpaces({
    organizationId,
  })
  loadingSpaces.value = false
  matchActionResult({
    err: (error) => {
      moveError.value = getErrorMessage({
        error,
        messages: {
          AccessDenied: 'You cannot create boards in this organization.',
          OrganizationNotFound: 'The destination organization was not found.',
          TemporarilyUnavailable: 'Could not load destination spaces.',
        },
      })
    },
    ok: (value) => {
      destinationSpaces.value = value.spaces
    },
    result,
  })
}

async function moveBoards(input: {
  boardIds: string[]
  destinationSpaceId: string
}) {
  moveError.value = null
  moving.value = true
  const result = await props.deps.moveBoards(input)
  matchActionResult({
    err: (error) => {
      moveError.value = getErrorMessage({
        error,
        messages: {
          AccessDenied: 'You do not have permission to move some boards.',
          InvalidDestination: 'Select a valid destination.',
          ResourceNotFound: 'Some boards or the destination were not found.',
          TemporarilyUnavailable: 'Could not move some boards. Try again.',
        },
      })
    },
    ok: () => undefined,
    result,
  })
  invalidation.invalidateBoardStructure()
  await refresh()
  moving.value = false
}

async function moveSpaces(input: {
  destinationOrganizationId: string
  spaceIds: string[]
}) {
  moveError.value = null
  moving.value = true
  const result = await props.deps.moveSpaces(input)
  matchActionResult({
    err: (error) => {
      moveError.value = getErrorMessage({
        error,
        messages: {
          AccessDenied: 'You do not have permission to move some spaces.',
          InvalidDestination: 'Select a valid destination.',
          ResourceNotFound: 'Some spaces or the destination were not found.',
          TemporarilyUnavailable: 'Could not move some spaces. Try again.',
        },
      })
    },
    ok: () => undefined,
    result,
  })
  await invalidation.invalidateWorkspaceStructure()
  await refresh()
  moving.value = false
}
</script>
