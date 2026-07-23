<template>
  <section class="movement-section">
    <div>
      <h2>Spaces</h2>
      <p class="muted">Move spaces to another organization.</p>
    </div>
    <AppBulkBar
      action-label="Move spaces"
      :count="state.selected.size"
      @action="openDialog([...state.selected])"
      @clear="state.selected.clear()" />
    <div class="entity-list">
      <div
        v-for="space in movableSpaces"
        :key="space.id"
        class="entity-row">
        <input
          :aria-label="`Select ${space.name}`"
          :checked="state.selected.has(space.id)"
          type="checkbox"
          @change="toggle(space.id)" />
        <SpaceIcon :style="{ color: space.color }" />
        <strong>{{ space.name }}</strong>
        <button
          :aria-label="`Move ${space.name}`"
          class="icon-btn"
          title="Move space"
          type="button"
          @click="openDialog([space.id])">
          <ArrowRightLeft />
        </button>
      </div>
      <p
        v-if="!movableSpaces.length"
        class="empty">
        No movable spaces.
      </p>
    </div>

    <dialog ref="dialog">
      <form @submit.prevent="confirmMove">
        <h2>Move {{ state.ids.length === 1 ? 'space' : 'spaces' }}</h2>
        <label for="movement-space-organization">Organization</label>
        <select
          id="movement-space-organization"
          v-model="state.organizationId"
          required>
          <option
            disabled
            value="">
            Select organization
          </option>
          <option
            v-for="organization in organizations"
            :key="organization.value"
            :value="organization.value">
            {{ organization.label }}
          </option>
        </select>
        <p
          v-if="error"
          class="form-error">
          {{ error }}
        </p>
        <div class="dialog-actions">
          <button
            class="secondary"
            :disabled="moving"
            type="button"
            @click="dialog?.close()">
            Cancel
          </button>
          <button
            class="primary"
            :disabled="moving || !state.organizationId">
            {{ moving ? 'Moving…' : 'Move' }}
          </button>
        </div>
      </form>
    </dialog>
  </section>
</template>

<script lang="ts">
import type { DataMovementPageData } from '~/sections/organizations/data-movement/DataMovementPage.deps'

type SpacesMovementSectionProps = {
  error: null | string
  moving: boolean
  onClearError: () => void
  onMove: (input: { destinationOrganizationId: string; spaceIds: string[] }) => void
  organizations: DataMovementPageData['spaceOrganizations']
  spaces: DataMovementPageData['spaces']
}
</script>

<script setup lang="ts">
import { ArrowRightLeft } from 'lucide-vue-next'

import { SpaceIcon } from '~/constants/icons'

const props = defineProps<SpacesMovementSectionProps>()
const movableSpaces = computed(() => props.spaces.filter((space) => !space.isDefault))
const state = reactive({
  ids: [] as string[],
  organizationId: '',
  pending: false,
  selected: new Set<string>(),
})
const dialog = ref<HTMLDialogElement>()

const toggle = (id: string) => {
  if (state.selected.has(id)) {
    state.selected.delete(id)
  } else {
    state.selected.add(id)
  }
}
const openDialog = (ids: string[]) => {
  props.onClearError()
  state.ids = ids
  state.organizationId = props.organizations[0]?.value ?? ''
  dialog.value?.showModal()
}
const confirmMove = () => {
  state.pending = true
  props.onMove({
    destinationOrganizationId: state.organizationId,
    spaceIds: state.ids,
  })
}

watch(
  () => props.moving,
  (moving, wasMoving) => {
    if (state.pending && wasMoving && !moving && !props.error) {
      state.pending = false
      state.selected.clear()
      dialog.value?.close()
    }
  },
)
</script>

<style scoped>
.movement-section,
.entity-list {
  display: grid;
  gap: var(--space-2);
}

.movement-section h2,
.movement-section p {
  margin: 0;
}

.entity-row {
  align-items: center;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  display: grid;
  gap: var(--space-3);
  grid-template-columns: auto auto 1fr auto;
  padding: var(--space-3) var(--space-4);
}

.entity-row:focus-within {
  border-color: var(--color-accent);
}

.entity-row:has(input:checked) {
  background: color-mix(in srgb, var(--color-accent-soft) 55%, var(--color-surface));
  border-color: color-mix(in srgb, var(--color-accent) 45%, var(--color-border));
}
</style>
