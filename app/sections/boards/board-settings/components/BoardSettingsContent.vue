<template>
  <section class="form-page">
    <div class="title-row">
      <div class="page-heading">
        <AppBackLink
          label="Back to board"
          :to="organizationRoutes.board(spaceKey, viewModel.id)" />
        <BoardIcon
          class="page-heading-icon"
          :style="{ color }" />
        <div class="page-heading-text">
          <h1>Edit board</h1>
        </div>
      </div>
    </div>
    <form @submit.prevent="submit">
      <label>Name</label>
      <input
        v-model="name"
        :disabled="!viewModel.canUpdate"
        required />
      <label>Color</label>
      <AppColorPicker
        v-model="color"
        :disabled="!viewModel.canUpdate" />
      <label>Columns</label>
      <DragDropProvider
        :plugins="defaultPreset.plugins"
        :sensors="sensors"
        @drag-end="handleDragEnd">
        <div class="column-settings">
          <BoardColumnSetting
            v-for="(column, index) in columns"
            :id="column.key"
            :key="column.key"
            :can-update="viewModel.canUpdate"
            :color="column.color"
            :disabled="submitting"
            :index="index"
            :name="column.name"
            :on-delete="() => removeColumn(column.key)"
            :on-update-color="(value) => (column.color = value)"
            :on-update-name="(value) => (column.name = value)" />
        </div>
      </DragDropProvider>
      <button
        v-if="viewModel.canUpdate"
        class="secondary add-column"
        :disabled="submitting"
        type="button"
        @click="addColumn">
        <Plus />
        Add column
      </button>
      <p
        v-if="error"
        class="form-error">
        {{ error }}
      </p>
      <div class="form-actions">
        <button
          v-if="viewModel.canUpdate"
          class="primary"
          :disabled="submitting"
          type="submit">
          {{ submitting ? 'Saving…' : 'Save changes' }}
        </button>
        <button
          v-if="viewModel.canDelete"
          class="secondary danger"
          :disabled="submitting"
          type="button"
          @click="props.onDelete">
          Delete board
        </button>
      </div>
    </form>
  </section>
</template>

<script lang="ts">
export type BoardSettingsPageViewModel = {
  canDelete: boolean
  canUpdate: boolean
  color: string
  columns: Array<{ color: string; id: string; name: string }>
  id: string
  name: string
}

type BoardSettingsPageProps = {
  error: null | string
  onDelete: () => void
  onUpdate: (input: {
    color: string
    columns: Array<{ color: string; id: null | string; name: string }>
    name: string
  }) => void
  spaceKey: string
  submitting: boolean
  viewModel: BoardSettingsPageViewModel
}
</script>
<script setup lang="ts">
import { defaultPreset, PointerActivationConstraints } from '@dnd-kit/dom'
import { arrayMove } from '@dnd-kit/helpers'
import { DragDropProvider, KeyboardSensor, PointerSensor } from '@dnd-kit/vue'
import type { DragEndEvent } from '@dnd-kit/vue'
import { isSortable } from '@dnd-kit/vue/sortable'
import { Plus } from 'lucide-vue-next'

import { DEFAULT_COLOR } from '~/constants/colors'
import { BoardIcon } from '~/constants/icons'
import BoardColumnSetting from '~/sections/boards/board-settings/components/BoardColumnSetting/BoardColumnSetting.vue'

const props = defineProps<BoardSettingsPageProps>()
const organizationRoutes = useOrganizationRoutes()
const name = ref(props.viewModel.name)
const color = ref(props.viewModel.color)
type BoardColumnDraft = {
  color: string
  id: null | string
  key: string
  name: string
}
let newColumnId = 0
const columns = ref<BoardColumnDraft[]>(toDraftColumns(props.viewModel.columns))
const sensors = [
  PointerSensor.configure({
    activationConstraints: (event) =>
      event.pointerType === 'touch'
        ? [new PointerActivationConstraints.Delay({ tolerance: 5, value: 250 })]
        : [new PointerActivationConstraints.Distance({ value: 6 })],
    preventActivation: () => false,
  }),
  KeyboardSensor,
]

function toDraftColumns(columns: BoardSettingsPageViewModel['columns']) {
  return columns.map((column) => ({
    ...column,
    key: `column-${column.id}`,
  }))
}

function addColumn() {
  newColumnId += 1
  columns.value.push({
    color: DEFAULT_COLOR,
    id: null,
    key: `new-column-${newColumnId}`,
    name: 'New column',
  })
}

function removeColumn(key: string) {
  columns.value = columns.value.filter((column) => column.key !== key)
}

function handleDragEnd(event: DragEndEvent) {
  const source = event.operation.source
  if (!event.canceled && isSortable(source)) {
    columns.value = arrayMove(columns.value, source.initialIndex, source.index)
  }
}

function submit() {
  props.onUpdate({
    color: color.value,
    columns: columns.value.map(({ color, id, name }) => ({ color, id, name })),
    name: name.value.trim(),
  })
}

watch(
  () => props.viewModel,
  (value) => {
    name.value = value.name
    color.value = value.color
    columns.value = toDraftColumns(value.columns)
  },
)
</script>

<style scoped>
.column-settings {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.add-column {
  margin-top: var(--space-2);
}
</style>
