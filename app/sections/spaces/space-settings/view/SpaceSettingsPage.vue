<template>
  <section class="form-page">
    <div class="title-row">
      <div class="page-heading">
        <AppBackLink
          label="Back to space"
          :to="organizationRoutes.space(viewModel.spaceKey)" />
        <SpaceIcon
          class="page-heading-icon"
          :style="{ color }" />
        <div class="page-heading-text">
          <h1>Edit space</h1>
        </div>
      </div>
    </div>
    <form
      @submit.prevent="
        emit('update', { name: name.trim(), key: keyValue.trim(), color })
      ">
      <label>Name</label>
      <input
        v-model="name"
        :disabled="!viewModel.canUpdate"
        required />
      <label>Key</label>
      <input
        v-model="keyValue"
        :disabled="!viewModel.canUpdate"
        required />
      <label>Color</label>
      <AppColorPicker
        v-model="color"
        :disabled="!viewModel.canUpdate" />
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
          @click="emit('delete')">
          Delete space
        </button>
      </div>
    </form>
  </section>
</template>
<script lang="ts">
export type SpaceSettingsPageViewModel = {
  canDelete: boolean
  canUpdate: boolean
  color: string
  id: string
  name: string
  spaceKey: string
}

type SpaceSettingsPageProps = {
  error: null | string
  submitting: boolean
  viewModel: SpaceSettingsPageViewModel
}
</script>
<script setup lang="ts">
import { SpaceIcon } from '../../../../constants/icons'

const props = defineProps<SpaceSettingsPageProps>()
const emit = defineEmits<{
  delete: []
  update: [input: { color: string; key: string; name: string }]
}>()
const organizationRoutes = useOrganizationRoutes()
const name = ref(props.viewModel.name)
const keyValue = ref(props.viewModel.spaceKey)
const color = ref(props.viewModel.color)
</script>
