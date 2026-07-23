<template>
  <section class="movement-section">
    <div>
      <h2>Boards</h2>
      <p class="muted">Move boards to a space in an accessible organization.</p>
    </div>
    <AppBulkBar
      action-label="Move boards"
      :count="state.selected.size"
      @action="openDialog([...state.selected])"
      @clear="state.selected.clear()" />
    <div class="board-groups">
      <section
        v-for="space in spaces"
        v-show="space.boards.length"
        :key="space.id"
        class="board-group">
        <div class="board-group-heading">
          <SpaceIcon :style="{ color: space.color }" />
          <strong>{{ space.name }}</strong>
        </div>
        <div class="board-list">
          <div
            v-for="board in space.boards"
            :key="board.id"
            class="entity-row">
            <input
              :aria-label="`Select ${board.name}`"
              :checked="state.selected.has(board.id)"
              type="checkbox"
              @change="toggle(board.id)" />
            <BoardIcon :style="{ color: board.color }" />
            <strong>{{ board.name }}</strong>
            <button
              :aria-label="`Move ${board.name}`"
              class="icon-btn"
              title="Move board"
              type="button"
              @click="openDialog([board.id])">
              <ArrowRightLeft />
            </button>
          </div>
        </div>
      </section>
      <p
        v-if="!boardCount"
        class="empty">
        No movable boards.
      </p>
    </div>

    <dialog ref="dialog">
      <form @submit.prevent="confirmMove">
        <h2>Move {{ state.ids.length === 1 ? 'board' : 'boards' }}</h2>
        <label for="movement-board-organization">Organization</label>
        <select
          id="movement-board-organization"
          v-model="state.organizationId"
          required
          @change="changeOrganization">
          <option
            v-for="organization in organizations"
            :key="organization.value"
            :value="organization.value">
            {{ organization.label }}
          </option>
        </select>
        <label for="movement-board-space">Space</label>
        <select
          id="movement-board-space"
          v-model="state.spaceId"
          required
          @focus="loadSpaces">
          <option
            disabled
            value="">
            Select space
          </option>
          <option
            v-if="loadingSpaces"
            disabled
            value="__loading">
            Loading spaces…
          </option>
          <option
            v-for="space in destinationSpaces"
            :key="space.value"
            :value="space.value">
            {{ space.label }}
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
            :disabled="moving || loadingSpaces || !state.spaceId">
            {{ moving ? 'Moving…' : 'Move' }}
          </button>
        </div>
      </form>
    </dialog>
  </section>
</template>

<script lang="ts">
import type {
  DataMovementPageData,
  MoveOption,
} from '~/sections/organizations/data-movement/DataMovementPage.deps'

type BoardsMovementSectionProps = {
  currentOrganizationId: string
  destinationSpaces: MoveOption[]
  error: null | string
  loadingSpaces: boolean
  moving: boolean
  onChangeOrganization: () => void
  onClearError: () => void
  onLoadSpaces: (organizationId: string) => void
  onMove: (input: { boardIds: string[]; destinationSpaceId: string }) => void
  organizations: DataMovementPageData['organizations']
  spaces: DataMovementPageData['spaces']
}
</script>

<script setup lang="ts">
import { ArrowRightLeft } from 'lucide-vue-next'

import { BoardIcon, SpaceIcon } from '~/constants/icons'

const props = defineProps<BoardsMovementSectionProps>()
const boardCount = computed(() =>
  props.spaces.reduce((count, space) => count + space.boards.length, 0),
)
const state = reactive({
  ids: [] as string[],
  organizationId: props.currentOrganizationId,
  pending: false,
  selected: new Set<string>(),
  spaceId: '',
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
  state.organizationId = props.currentOrganizationId
  state.spaceId = ''
  dialog.value?.showModal()
}
const changeOrganization = () => {
  state.spaceId = ''
  props.onChangeOrganization()
}
const loadSpaces = () => {
  if (!props.loadingSpaces && props.destinationSpaces.length === 0) {
    props.onLoadSpaces(state.organizationId)
  }
}
const confirmMove = () => {
  state.pending = true
  props.onMove({
    boardIds: state.ids,
    destinationSpaceId: state.spaceId,
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
.board-groups,
.board-group,
.board-list {
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
  background: color-mix(
    in srgb,
    var(--color-accent-soft) 55%,
    var(--color-surface)
  );
  border-color: color-mix(
    in srgb,
    var(--color-accent) 45%,
    var(--color-border)
  );
}

.board-group-heading {
  align-items: center;
  display: flex;
  gap: var(--space-2);
  padding: var(--space-2) 0;
}

.board-list {
  border-left: var(--movement-tree-line-width) solid var(--color-border);
  margin-left: calc((var(--icon-size) - var(--movement-tree-line-width)) / 2);
  padding-left: var(--space-4);
}
</style>
