<template>
  <section
    v-if="pageState.type === 'ready'"
    class="attributes-page">
    <div class="title-row">
      <div class="page-heading">
        <Tags class="page-heading-icon" />
        <div class="page-heading-text">
          <h1>Attributes</h1>
        </div>
      </div>
      <NuxtLink
        class="primary"
        :to="organizationRoutes.newAttribute()">
        <Plus />
        <span class="btn-label">New attribute</span>
      </NuxtLink>
    </div>
    <p class="attributes-intro">
      Custom fields you can attach to issues, like Priority or Severity.
    </p>
    <div
      v-if="pageState.data.AttributesPage.attributes.length"
      class="attribute-list">
      <NuxtLink
        v-for="attribute in pageState.data.AttributesPage.attributes"
        :key="attribute.id"
        :to="organizationRoutes.attribute(attribute.id)">
        <span :style="{ background: attribute.color }" />
        <span class="attribute-name">
          <strong>{{ attribute.name }}</strong>
          <small class="muted">
            {{ attribute.type === 'list' ? 'List' : 'Text' }}
          </small>
        </span>
        <ChevronRight />
      </NuxtLink>
    </div>
    <p
      v-else
      class="empty">
      No attributes yet.
    </p>
  </section>
  <PageLoadState
    v-else
    :error-text="pageState.type === 'error' ? pageState.message : ''"
    :loading="pageState.type === 'pending'"
    loading-text="Loading attributes…"
    :on-retry="refresh" />
</template>

<script lang="ts">
export type AttributesPageViewModel = {
  attributes: Array<{
    color: string
    id: string
    name: string
    type: 'list' | 'text'
  }>
}
</script>

<script setup lang="ts">
import { ChevronRight, Plus, Tags } from 'lucide-vue-next'

import type { AttributesPageDeps } from '~/sections/organizations/attributes/list-attributes/AttributesPageDeps'

const props = defineProps<{ deps: AttributesPageDeps }>()
const organizationRoutes = useOrganizationRoutes()
useHead({ title: 'Attributes' })
const { refresh, state: pageState } = await useActionData({
  action: () => props.deps.viewAttributesPage(),
  fallbackMessage:
    'Could not load attributes. The service is temporarily unavailable.',
  messages: {
    AccessDenied: 'You do not have permission to manage attributes.',
    TemporarilyUnavailable:
      'Could not load attributes. The service is temporarily unavailable.',
  },
})
</script>

<style scoped>
.attributes-intro {
  color: var(--color-muted);
  margin: var(--space-6) 0 var(--space-4);
}

.attribute-list {
  display: grid;
  gap: var(--space-2);
}

.attribute-list a {
  align-items: center;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  color: var(--color-text);
  display: grid;
  gap: var(--space-3);
  grid-template-columns: auto 1fr auto;
  padding: var(--space-3) var(--space-4);
  text-decoration: none;
  transition: var(--transition-press);
}

.attribute-list a:hover {
  background: var(--color-hover);
}

.attribute-list a:active {
  translate: 0 var(--press-offset);
}

.attribute-list a > .lucide:last-child {
  color: var(--color-muted);
}

.attribute-list a > span:first-child {
  border-radius: var(--radius-pill);
  height: 12px;
  width: 12px;
}

.attribute-name {
  display: grid;
  min-width: 0;
}

.attribute-name > * {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
