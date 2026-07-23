<template>
  <BoardPage
    :board-id="boardId"
    :deps="deps"
    :issue-key="issueKey"
    :on-back="onBack"
    :on-push-query="onPushQuery"
    :on-replace-query="onReplaceQuery"
    :route-path="route.path"
    :route-query="route.query"
    :space-key="spaceKey" />
</template>

<script setup lang="ts">
import type { LocationQueryRaw } from 'vue-router'

import { createBoardPageDeps } from '~/sections/boards/board/BoardPage.deps.impl'
import BoardPage from '~/sections/boards/board/BoardPage.vue'

const route = useRoute('organizations-organizationKey-spaces-spaceKey-boardId')
const boardId = computed(() => String(route.params.boardId))
const spaceKey = computed(() => String(route.params.spaceKey))
const issueKey = computed(() =>
  typeof route.query.issue === 'string' ? route.query.issue : null,
)
const client = useApiClient()
const deps = createBoardPageDeps(client)
const router = useRouter()
const onBack = () => router.back()
const onPushQuery = async (query: LocationQueryRaw): Promise<void> => {
  await router.push({ query })
}
const onReplaceQuery = async (query: LocationQueryRaw): Promise<void> => {
  await router.replace({ query })
}
</script>
