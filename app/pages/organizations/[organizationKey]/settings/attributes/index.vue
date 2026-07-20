<template>
  <AttributesPage :deps="deps" />
</template>

<script setup lang="ts">
import { openApiViewAttributesPage } from '#infrastructure/organizations/attributes/list-attributes/openApiViewAttributesPage'
import AttributesPage from '~/sections/organizations/attributes/list-attributes/AttributesPage.vue'

const baseUrl = useRuntimeConfig().public.boardsApiBaseUrl
const deps = {
  viewAttributesPage: openApiViewAttributesPage(baseUrl),
}
</script>
