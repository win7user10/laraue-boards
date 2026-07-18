<template><AttributesPageApplication :deps="deps" /></template>

<script setup lang="ts">
import { openApiViewAttributesPage } from '~~/infrastructure/organizations/attributes/list-attributes/openApiViewAttributesPage'

import AttributesPageApplication from '~/sections/organizations/attributes/list-attributes/AttributesPageApplication.vue'

const baseUrl = useRuntimeConfig().public.boardsApiBaseUrl
const deps = {
  viewAttributesPage: openApiViewAttributesPage(baseUrl),
}
</script>
