<template>
  <AttributePage
    :attribute-id="attributeId"
    :deps="deps" />
</template>

<script setup lang="ts">
import { openApiDeleteAttribute } from '#infrastructure/organizations/attributes/attribute/openApiDeleteAttribute'
import { openApiUpdateAttribute } from '#infrastructure/organizations/attributes/attribute/openApiUpdateAttribute'
import { openApiViewAttributePage } from '#infrastructure/organizations/attributes/attribute/openApiViewAttributePage'
import AttributePage from '~/sections/organizations/attributes/attribute/AttributePage.vue'

const route = useRoute('organizations-organizationKey-settings-attributes-id')
const attributeId = computed(() => String(route.params.id))
const baseUrl = useRuntimeConfig().public.boardsApiBaseUrl
const deps = {
  deleteAttribute: openApiDeleteAttribute(baseUrl),
  updateAttribute: openApiUpdateAttribute(baseUrl),
  viewAttributePage: openApiViewAttributePage(baseUrl),
}
</script>
