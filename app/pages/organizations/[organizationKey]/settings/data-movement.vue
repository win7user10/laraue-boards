<template>
  <DataMovementPage :deps="deps" />
</template>

<script setup lang="ts">
import { openApiLoadDataMovementSpaces } from '#infrastructure/organizations/data-movement/openApiLoadDataMovementSpaces'
import { openApiMoveBoards } from '#infrastructure/organizations/data-movement/openApiMoveBoards'
import { openApiMoveSpaces } from '#infrastructure/organizations/data-movement/openApiMoveSpaces'
import { openApiViewDataMovementPage } from '#infrastructure/organizations/data-movement/openApiViewDataMovementPage'
import DataMovementPage from '~/sections/organizations/data-movement/DataMovementPage.vue'

const baseUrl = useRuntimeConfig().public.boardsApiBaseUrl
const deps = {
  loadDataMovementSpaces: openApiLoadDataMovementSpaces(baseUrl),
  moveBoards: openApiMoveBoards(baseUrl),
  moveSpaces: openApiMoveSpaces(baseUrl),
  viewDataMovementPage: openApiViewDataMovementPage(baseUrl),
}
</script>
