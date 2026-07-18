<template><CreateAttributePageApplication :deps="deps" /></template>

<script setup lang="ts">
import { openApiCreateAttribute } from '~~/infrastructure/organizations/attributes/create-attribute/openApiCreateAttribute'

import CreateAttributePageApplication from '~/sections/organizations/attributes/create-attribute/CreateAttributePageApplication.vue'

const baseUrl = useRuntimeConfig().public.boardsApiBaseUrl
const deps = {
  createAttribute: openApiCreateAttribute(baseUrl),
}
</script>
