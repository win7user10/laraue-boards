<template>
  <form
    class="attribute-editor"
    @submit.prevent="submit">
    <label for="edit-attribute-name">Name</label>
    <input
      id="edit-attribute-name"
      v-model="draft.name"
      maxlength="64"
      required />

    <label>Color</label>
    <AppColorPicker v-model="draft.color" />

    <fieldset v-if="draft.data.type === 'list'">
      <legend>Options</legend>
      <TransitionGroup
        name="list"
        tag="div">
        <div
          v-for="(option, index) in draft.data.listValues"
          :key="option.key"
          class="attribute-option">
          <input
            v-model="option.name"
            :aria-label="`Option ${index + 1}`"
            maxlength="64"
            required />
          <button
            :aria-label="`Remove option ${index + 1}`"
            class="icon-btn danger"
            :disabled="draft.data.listValues.length === 1"
            type="button"
            @click="draft.data.listValues.splice(index, 1)">
            <Trash2 />
          </button>
        </div>
      </TransitionGroup>
      <button
        class="secondary add-option"
        type="button"
        @click="addOption">
        <Plus />
        Add option
      </button>
    </fieldset>

    <p
      v-if="error"
      class="form-error">
      {{ error }}
    </p>
    <div class="form-actions">
      <button
        class="primary"
        :disabled="submitting">
        {{ submitting ? 'Saving…' : 'Save changes' }}
      </button>
      <button
        class="secondary danger"
        :disabled="submitting"
        type="button"
        @click="remove">
        <Trash2 />
        Delete attribute
      </button>
    </div>
  </form>
</template>

<script lang="ts">
import type {
  Attribute,
  UpdateAttributeInput,
} from '~/sections/organizations/attributes/attribute/AttributePage.deps'

type EditAttributeFormProps = {
  error: null | string
  onDelete: (id: string) => void
  onSubmit: (input: UpdateAttributeInput) => void
  submitting: boolean
  viewModel: Attribute
}
</script>

<script setup lang="ts">
import { Plus, Trash2 } from 'lucide-vue-next'

const props = defineProps<EditAttributeFormProps>()

type DraftListValue = { id: null | string; key: number; name: string }
type AttributeDraft = {
  color: string
  data: { listValues: DraftListValue[]; type: 'list' } | { type: 'text' }
  name: string
}

let nextOptionKey = 0
const draft = reactive<AttributeDraft>(toDraft(props.viewModel))

function toDraft(viewModel: Attribute): AttributeDraft {
  return viewModel.data.type === 'list'
    ? {
        color: viewModel.color,
        data: {
          listValues:
            viewModel.data.listValues.length > 0
              ? viewModel.data.listValues.map((option) => ({
                  id: option.id,
                  key: nextOptionKey++,
                  name: option.name,
                }))
              : [{ id: null, key: nextOptionKey++, name: '' }],
          type: viewModel.data.type,
        },
        name: viewModel.name,
      }
    : {
        color: viewModel.color,
        data: { type: viewModel.data.type },
        name: viewModel.name,
      }
}

function addOption() {
  if (draft.data.type === 'list') {
    draft.data.listValues.push({
      id: null,
      key: nextOptionKey++,
      name: '',
    })
  }
}

function submit() {
  const value = draft
  props.onSubmit(
    value.data.type === 'list'
      ? {
          color: value.color,
          data: {
            listValues: value.data.listValues.map((option) => ({
              id: option.id,
              name: option.name.trim(),
            })),
            type: value.data.type,
          },
          id: props.viewModel.id,
          name: value.name.trim(),
        }
      : {
          color: value.color,
          data: { type: value.data.type },
          id: props.viewModel.id,
          name: value.name.trim(),
        },
  )
}

function remove() {
  if (confirm(`Delete attribute "${props.viewModel.name}"?`)) {
    props.onDelete(props.viewModel.id)
  }
}

watch(
  () => props.viewModel,
  (viewModel) => {
    Object.assign(draft, toDraft(viewModel))
  },
)
</script>

<style scoped>
.attribute-editor fieldset {
  border: 0;
  margin: var(--space-5) 0 0;
  padding: 0;
}

.attribute-editor legend {
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--space-2);
}

.attribute-option {
  align-items: center;
  display: grid;
  gap: var(--space-2);
  grid-template-columns: minmax(0, 1fr) auto;
  margin-bottom: var(--space-2);
}

.add-option {
  margin-top: var(--space-2);
}
</style>
