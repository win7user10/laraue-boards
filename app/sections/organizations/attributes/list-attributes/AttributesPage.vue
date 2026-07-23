<template>
  <PageState
    error-title="Could not load attributes"
    loading-text="Loading attributes…"
    :on-retry="query.refresh"
    :state="pageState">
    <template #default="{ data: attributes }">
      <section class="attributes-page">
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
          v-if="attributes.length"
          class="attribute-list">
          <NuxtLink
            v-for="attribute in attributes"
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
    </template>
  </PageState>
</template>

<script setup lang="ts">
import { ChevronRight, Plus, Tags } from 'lucide-vue-next'

import type {
  AttributesPageDeps,
  ViewAttributesFailure,
} from '~/sections/organizations/attributes/list-attributes/AttributesPage.deps'
import { assertNever } from '~/utils/assertNever'
import { toAsyncResultState } from '~/utils/asyncResultState'

const props = defineProps<{ deps: AttributesPageDeps }>()
const organizationRoutes = useOrganizationRoutes()
useHead({ title: 'Attributes' })
const query = await useAsyncData('organization-attributes', (_nuxtApp, { signal }) =>
  props.deps.view({ signal }),
)
const getFailureMessage = (failure: ViewAttributesFailure): string => {
  switch (failure.type) {
    case 'accessDenied':
      return 'You do not have permission to manage attributes.'
    case 'temporarilyUnavailable':
      return 'Could not load attributes. The service is temporarily unavailable.'
    default:
      return assertNever(failure)
  }
}
const pageState = computed(() =>
  toAsyncResultState({
    error: query.error.value,
    getErrorMessage: getFailureMessage,
    result: query.data.value,
    status: query.status.value,
  }),
)
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
