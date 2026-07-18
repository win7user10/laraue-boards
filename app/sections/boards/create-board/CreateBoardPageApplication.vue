<template>
  <CreateBoardPage
    :error="error"
    :space-key="spaceKey"
    :submitting="submitting"
    @submit="submit" />
</template>

<script setup lang="ts">
import type { CreateBoardPageApplicationDeps } from './CreateBoardPageApplicationDeps'
import CreateBoardPage from './view/CreateBoardPage.vue'

const props = defineProps<{
  deps: CreateBoardPageApplicationDeps
  spaceKey: string
}>()
const organizationRoutes = useOrganizationRoutes()
useHead({ title: 'Create board' })
const submitting = ref(false)
const error = ref<null | string>(null)
const invalidation = useAsyncDataInvalidation()
async function submit(input: { color: string; name: string }) {
  submitting.value = true
  error.value = null
  const result = await props.deps.createBoard({
    spaceKey: props.spaceKey,
    ...input,
  })
  submitting.value = false
  await matchActionResult({
    err: async (actionError) => {
      error.value = getErrorMessage({
        error: actionError,
        messages: {
          AccessDenied: 'You do not have permission to create boards.',
          SpaceNotFound: 'The space was not found or is not available to you.',
          TemporarilyUnavailable: 'Could not create board. Try again.',
        },
      })
    },
    ok: async ({ boardId }) => {
      invalidation.invalidateBoardStructure()
      await navigateTo(organizationRoutes.board(props.spaceKey, boardId))
    },
    result,
  })
}
</script>
