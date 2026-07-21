<template>
  <CreateAttributePage :deps="deps" />
</template>

<script setup lang="ts">
import { openApiCreateAttribute } from '#infrastructure/organizations/attributes/create-attribute/openApiCreateAttribute'
import CreateAttributePage from '~/sections/organizations/attributes/create-attribute/CreateAttributePage.vue'

const baseUrl = useRuntimeConfig().public.boardsApiBaseUrl
const deps = {
  createAttribute: openApiCreateAttribute(baseUrl),
}
</script>
