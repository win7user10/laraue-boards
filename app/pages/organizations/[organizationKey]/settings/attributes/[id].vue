<template>
  <AttributePage
    :attribute-id="attributeId"
    :deps="deps"
    :on-finished="onFinished" />
</template>

<script setup lang="ts">
import { createAttributePageDeps } from '~/sections/organizations/attributes/attribute/AttributePage.deps.impl'
import AttributePage from '~/sections/organizations/attributes/attribute/AttributePage.vue'

const route = useRoute('organizations-organizationKey-settings-attributes-id')
const attributeId = computed(() => String(route.params.id))
const client = useApiClient()
const deps = createAttributePageDeps(client)
const organizationRoutes = useOrganizationRoutes()
const onFinished = async (): Promise<void> => {
  await navigateTo(organizationRoutes.attributes())
}
</script>
