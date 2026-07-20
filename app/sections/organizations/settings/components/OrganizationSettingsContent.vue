<template>
  <section class="form-page">
    <div class="title-row">
      <div class="page-heading">
        <Settings class="page-heading-icon" />
        <div class="page-heading-text">
          <h1>General settings</h1>
        </div>
      </div>
    </div>
    <form
      @submit.prevent="
        props.onSubmit({
          id: viewModel.id,
          name: name.trim(),
          color,
          slug: viewModel.slug,
        })
      ">
      <label>Name</label>
      <input
        v-model="name"
        :disabled="!viewModel.canUpdate"
        required />
      <label>Color</label>
      <AppColorPicker
        v-model="color"
        :disabled="!viewModel.canUpdate" />
      <p
        v-if="saved"
        class="form-success">
        Changes saved.
      </p>
      <p
        v-if="error"
        class="form-error">
        {{ error }}
      </p>
      <div
        v-if="viewModel.canUpdate"
        class="form-actions">
        <button
          class="primary"
          :disabled="submitting">
          {{ submitting ? 'Saving…' : 'Save changes' }}
        </button>
      </div>
    </form>
  </section>
</template>

<script lang="ts">
export type OrganizationSettingsPageViewModel = {
  canUpdate: boolean
  color: string
  id: string
  name: string
  slug: string
  slugPostfix: string
}

type OrganizationSettingsPageProps = {
  error: null | string
  onSubmit: (input: {
    color: string
    id: string
    name: string
    slug: string
  }) => void
  saved: boolean
  submitting: boolean
  viewModel: OrganizationSettingsPageViewModel
}
</script>

<script setup lang="ts">
import { Settings } from 'lucide-vue-next'

const props = defineProps<OrganizationSettingsPageProps>()
const name = ref(props.viewModel.name)
const color = ref(props.viewModel.color)
</script>

<style scoped>
.form-page > form {
  margin-top: var(--space-6);
}
</style>
