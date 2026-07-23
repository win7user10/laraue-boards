<template>
  <form @submit.prevent="submit">
      <label>Name</label>
      <input
        v-model="state.name"
        :disabled="!viewModel.canUpdate"
        required />
      <label>Color</label>
      <AppColorPicker
        v-model="state.color"
        :disabled="!viewModel.canUpdate" />
      <label>Columns</label>
      <DragDropProvider
        :plugins="defaultPreset.plugins"
        :sensors="sensors"
        @drag-end="handleDragEnd">
        <div class="column-settings">
          <BoardColumnSetting
            v-for="(column, index) in state.columns"
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
</template>

<script setup lang="ts">
import { defaultPreset, PointerActivationConstraints } from '@dnd-kit/dom'
import { arrayMove } from '@dnd-kit/helpers'
import { DragDropProvider, KeyboardSensor, PointerSensor } from '@dnd-kit/vue'
import type { DragEndEvent } from '@dnd-kit/vue'
import { isSortable } from '@dnd-kit/vue/sortable'
import { Plus } from 'lucide-vue-next'

import { DEFAULT_COLOR } from '~/constants/colors'
import type {
  BoardSettingsColumnDraft,
  BoardSettingsPageData,
} from '~/sections/boards/board-settings/BoardSettingsPage.deps'
import BoardColumnSetting from '~/sections/boards/board-settings/components/BoardColumnSetting/BoardColumnSetting.vue'

const props = defineProps<{
  error: null | string
  onDelete: () => void
  onUpdate: (input: {
    color: string
    columns: BoardSettingsColumnDraft[]
    name: string
  }) => void
  submitting: boolean
  viewModel: BoardSettingsPageData
}>()
type BoardColumnDraft = BoardSettingsColumnDraft & { key: string }
const state = reactive<{
  color: string
  columns: BoardColumnDraft[]
  name: string
  newColumnId: number
}>({
  color: props.viewModel.color,
  columns: toDraftColumns(props.viewModel.columns),
  name: props.viewModel.name,
  newColumnId: 0,
})
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

function toDraftColumns(columns: BoardSettingsPageData['columns']) {
  return columns.map((column) => ({
    ...column,
    key: `column-${column.id}`,
  }))
}

function addColumn() {
  state.newColumnId += 1
  state.columns.push({
    color: DEFAULT_COLOR,
    id: null,
    key: `new-column-${state.newColumnId}`,
    name: 'New column',
  })
}

function removeColumn(key: string) {
  state.columns = state.columns.filter((column) => column.key !== key)
}

function handleDragEnd(event: DragEndEvent) {
  const source = event.operation.source
  if (!event.canceled && isSortable(source)) {
    state.columns = arrayMove(state.columns, source.initialIndex, source.index)
  }
}

function submit() {
  props.onUpdate({
    color: state.color,
    columns: state.columns.map(({ color, id, name }) => ({ color, id, name })),
    name: state.name.trim(),
  })
}

watch(
  () => props.viewModel,
  (value) => {
    state.name = value.name
    state.color = value.color
    state.columns = toDraftColumns(value.columns)
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
