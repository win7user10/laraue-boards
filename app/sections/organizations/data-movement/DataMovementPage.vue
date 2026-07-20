<template>
  <DataMovementContent
    v-if="pageState.type === 'ready'"
    :destination-spaces="destinationSpaces"
    :error="moveError"
    :loading-spaces="loadingSpaces"
    :moving="moving"
    :on-change-organization="changeOrganization"
    :on-clear-error="() => (moveError = null)"
    :on-load-spaces="loadSpaces"
    :on-move-boards="moveBoards"
    :on-move-spaces="moveSpaces"
    :view-model="pageState.data.DataMovementPage" />
  <PageLoadState
    v-else
    :error-text="pageState.type === 'error' ? pageState.message : ''"
    :loading="pageState.type === 'pending'"
    loading-text="Loading data movement…"
    :on-retry="refresh" />
</template>

<script setup lang="ts">
import DataMovementContent from '~/sections/organizations/data-movement/components/DataMovementContent.vue'
import type { DataMovementPageDeps } from '~/sections/organizations/data-movement/DataMovementPageDeps'

const props = defineProps<{ deps: DataMovementPageDeps }>()
const { refresh, state: pageState } = await useActionData({
  action: () => props.deps.viewDataMovementPage(),
  fallbackMessage: 'Could not load data movement. Try again.',
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
  await matchActionResult({
    err: async (error) => {
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
    ok: async () => {
      await refresh()
    },
    result,
  })
  moving.value = false
}

async function moveSpaces(input: {
  destinationOrganizationId: string
  spaceIds: string[]
}) {
  moveError.value = null
  moving.value = true
  const result = await props.deps.moveSpaces(input)
  await matchActionResult({
    err: async (error) => {
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
    ok: async () => {
      await Promise.all([refresh(), refreshAppLayoutData()])
    },
    result,
  })
  moving.value = false
}
</script>
