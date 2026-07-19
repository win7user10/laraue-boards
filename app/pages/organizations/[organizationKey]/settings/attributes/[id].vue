<template>
  <AttributePageApplication
    :attribute-id="attributeId"
    :deps="deps" />
</template>

<script setup lang="ts">
import { openApiDeleteAttribute } from '~~/infrastructure/organizations/attributes/attribute/openApiDeleteAttribute'
import { openApiUpdateAttribute } from '~~/infrastructure/organizations/attributes/attribute/openApiUpdateAttribute'
import { openApiViewAttributePage } from '~~/infrastructure/organizations/attributes/attribute/openApiViewAttributePage'

import AttributePageApplication from '~/sections/organizations/attributes/attribute/AttributePageApplication.vue'

const route = useRoute('organizations-organizationKey-settings-attributes-id')
const attributeId = computed(() => String(route.params.id))
const baseUrl = useRuntimeConfig().public.boardsApiBaseUrl
const deps = {
  deleteAttribute: openApiDeleteAttribute(baseUrl),
  updateAttribute: openApiUpdateAttribute(baseUrl),
  viewAttributePage: openApiViewAttributePage(baseUrl),
}
</script>
