<template>
  <section class="movement-page">
    <div class="title-row">
      <div class="page-heading">
        <ArrowRightLeft class="page-heading-icon" />
        <div class="page-heading-text">
          <h1>Data movement</h1>
        </div>
      </div>
    </div>
    <div class="movement-sections">
      <section class="movement-section">
        <div>
          <h2>Spaces</h2>
          <p class="muted">Move spaces to another organization.</p>
        </div>
        <Transition name="slide-fade">
          <div
            v-if="selectedSpaces.size"
            class="bulk-bar">
            <span>{{ selectedSpaces.size }} selected</span>
            <div class="bulk-actions">
              <button
                class="secondary"
                type="button"
                @click="selectedSpaces.clear()">
                Clear
              </button>
              <button
                class="primary"
                type="button"
                @click="openSpaceDialog([...selectedSpaces])">
                <ArrowRightLeft />
                Move spaces
              </button>
            </div>
          </div>
        </Transition>
        <div class="entity-list">
          <div
            v-for="space in movableSpaces"
            :key="space.id"
            class="entity-row">
            <input
              :aria-label="`Select ${space.name}`"
              :checked="selectedSpaces.has(space.id)"
              type="checkbox"
              @change="toggle(selectedSpaces, space.id)" />
            <SpaceIcon :style="{ color: space.color }" />
            <strong>{{ space.name }}</strong>
            <button
              :aria-label="`Move ${space.name}`"
              class="icon-btn"
              title="Move space"
              type="button"
              @click="openSpaceDialog([space.id])">
              <ArrowRightLeft />
            </button>
          </div>
          <p
            v-if="!movableSpaces.length"
            class="empty">
            No movable spaces.
          </p>
        </div>
      </section>

      <section class="movement-section">
        <div>
          <h2>Boards</h2>
          <p class="muted">
            Move boards to a space in an accessible organization.
          </p>
        </div>
        <Transition name="slide-fade">
          <div
            v-if="selectedBoards.size"
            class="bulk-bar">
            <span>{{ selectedBoards.size }} selected</span>
            <div class="bulk-actions">
              <button
                class="secondary"
                type="button"
                @click="selectedBoards.clear()">
                Clear
              </button>
              <button
                class="primary"
                type="button"
                @click="openBoardDialog([...selectedBoards])">
                <ArrowRightLeft />
                Move boards
              </button>
            </div>
          </div>
        </Transition>
        <div class="board-groups">
          <section
            v-for="space in viewModel.spaces"
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
                class="entity-row board-row">
                <input
                  :aria-label="`Select ${board.name}`"
                  :checked="selectedBoards.has(board.id)"
                  type="checkbox"
                  @change="toggle(selectedBoards, board.id)" />
                <BoardIcon :style="{ color: board.color }" />
                <strong>{{ board.name }}</strong>
                <button
                  :aria-label="`Move ${board.name}`"
                  class="icon-btn"
                  title="Move board"
                  type="button"
                  @click="openBoardDialog([board.id])">
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
      </section>
    </div>

    <dialog ref="spaceDialog">
      <form @submit.prevent="confirmSpaceMove">
        <h2>Move {{ spaceIds.length === 1 ? 'space' : 'spaces' }}</h2>
        <label for="movement-space-organization">Organization</label>
        <select
          id="movement-space-organization"
          v-model="spaceOrganization"
          required>
          <option
            disabled
            value="">
            Select organization
          </option>
          <option
            v-for="organization in viewModel.spaceOrganizations"
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
            @click="spaceDialog?.close()">
            Cancel
          </button>
          <button
            class="primary"
            :disabled="moving || !spaceOrganization">
            {{ moving ? 'Moving…' : 'Move' }}
          </button>
        </div>
      </form>
    </dialog>

    <dialog ref="boardDialog">
      <form @submit.prevent="confirmBoardMove">
        <h2>Move {{ boardIds.length === 1 ? 'board' : 'boards' }}</h2>
        <label for="movement-board-organization">Organization</label>
        <select
          id="movement-board-organization"
          v-model="boardOrganization"
          required
          @change="changeOrganization">
          <option
            v-for="organization in viewModel.organizations"
            :key="organization.value"
            :value="organization.value">
            {{ organization.label }}
          </option>
        </select>
        <label for="movement-board-space">Space</label>
        <select
          id="movement-board-space"
          v-model="boardSpace"
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
            @click="boardDialog?.close()">
            Cancel
          </button>
          <button
            class="primary"
            :disabled="moving || loadingSpaces || !boardSpace">
            {{ moving ? 'Moving…' : 'Move' }}
          </button>
        </div>
      </form>
    </dialog>
  </section>
</template>

<script lang="ts">
export type DataMovementPageViewModel = {
  currentOrganizationId: string
  currentSpaces: Array<{ label: string; value: string }>
  organizations: Array<{ label: string; value: string }>
  spaceOrganizations: Array<{ label: string; value: string }>
  spaces: Array<{
    boards: Array<{ color: string; id: string; name: string }>
    color: string
    id: string
    isDefault: boolean
    name: string
  }>
}

type DataMovementPageProps = {
  destinationSpaces: Array<{ label: string; value: string }>
  error: null | string
  loadingSpaces: boolean
  moving: boolean
  onChangeOrganization: () => void
  onClearError: () => void
  onLoadSpaces: (organizationId: string) => void
  onMoveBoards: (input: {
    boardIds: string[]
    destinationSpaceId: string
  }) => void
  onMoveSpaces: (input: {
    destinationOrganizationId: string
    spaceIds: string[]
  }) => void
  viewModel: DataMovementPageViewModel
}
</script>

<script setup lang="ts">
import { ArrowRightLeft } from 'lucide-vue-next'

import { BoardIcon, SpaceIcon } from '~/constants/icons'

const props = defineProps<DataMovementPageProps>()
const movableSpaces = computed(() =>
  props.viewModel.spaces.filter((space) => !space.isDefault),
)
const boardCount = computed(() =>
  props.viewModel.spaces.reduce(
    (count, space) => count + space.boards.length,
    0,
  ),
)
const selectedSpaces = ref(new Set<string>())
const selectedBoards = ref(new Set<string>())
const toggle = (selection: Set<string>, id: string) => {
  if (selection.has(id)) {
    selection.delete(id)
  } else {
    selection.add(id)
  }
}

const spaceDialog = ref<HTMLDialogElement>()
const spaceIds = ref<string[]>([])
const spaceOrganization = ref('')
const openSpaceDialog = (ids: string[]) => {
  props.onClearError()
  spaceIds.value = ids
  spaceOrganization.value = props.viewModel.spaceOrganizations[0]?.value ?? ''
  spaceDialog.value?.showModal()
}
const confirmSpaceMove = () =>
  props.onMoveSpaces({
    destinationOrganizationId: spaceOrganization.value,
    spaceIds: spaceIds.value,
  })

const boardDialog = ref<HTMLDialogElement>()
const boardIds = ref<string[]>([])
const boardOrganization = ref(props.viewModel.currentOrganizationId)
const boardSpace = ref('')
const openBoardDialog = (ids: string[]) => {
  props.onClearError()
  boardIds.value = ids
  boardOrganization.value = props.viewModel.currentOrganizationId
  boardSpace.value = ''
  boardDialog.value?.showModal()
}
const changeOrganization = () => {
  boardSpace.value = ''
  props.onChangeOrganization()
}
const loadSpaces = () => {
  if (!props.loadingSpaces && props.destinationSpaces.length === 0) {
    props.onLoadSpaces(boardOrganization.value)
  }
}
const confirmBoardMove = () =>
  props.onMoveBoards({
    boardIds: boardIds.value,
    destinationSpaceId: boardSpace.value,
  })

watch(
  () => props.moving,
  (moving, wasMoving) => {
    if (wasMoving && !moving && !props.error) {
      selectedSpaces.value.clear()
      selectedBoards.value.clear()
      spaceDialog.value?.close()
      boardDialog.value?.close()
    }
  },
)
</script>

<style scoped>
.movement-sections,
.movement-section,
.entity-list,
.board-groups,
.board-group,
.board-list {
  display: grid;
}

.movement-page {
  --movement-tree-line-width: 2px;
}

.movement-sections {
  gap: var(--space-6);
  margin-top: var(--space-6);
}

.movement-section,
.entity-list,
.board-groups,
.board-group,
.board-list {
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
  transition: var(--transition-press);
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

.bulk-bar {
  align-items: center;
  background: var(--color-soft);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  display: flex;
  gap: var(--space-3);
  justify-content: space-between;
  padding: var(--space-2) var(--space-4);
}

.bulk-actions {
  display: flex;
  gap: var(--space-2);
}
</style>
