<template>
  <AttributesPage :deps="deps" />
</template>

<script setup lang="ts">
import { createAttributesPageDeps } from '~/sections/organizations/attributes/list-attributes/AttributesPage.deps.impl'
import AttributesPage from '~/sections/organizations/attributes/list-attributes/AttributesPage.vue'

const client = useApiClient()
const deps = createAttributesPageDeps(client)
</script>
