<template>
  <section class="form-page">
    <div class="title-row">
      <div class="page-heading">
        <AppBackLink
          label="Back to attributes"
          :to="organizationRoutes.attributes()" />
        <Tags
          class="page-heading-icon"
          :style="{ color: viewModel.EditAttributeForm.color }" />
        <div class="page-heading-text">
          <h1>{{ viewModel.EditAttributeForm.name }}</h1>
        </div>
      </div>
    </div>
    <EditAttributeForm
      :error="error"
      :saved="saved"
      :submitting="submitting"
      :view-model="viewModel.EditAttributeForm"
      @delete="emit('delete', $event)"
      @submit="emit('update', $event)" />
  </section>
</template>

<script lang="ts">
import type {
  EditAttributeFormInput,
  EditAttributeFormViewModel,
} from './components/EditAttributeForm.vue'

export type AttributePageViewModel = {
  EditAttributeForm: EditAttributeFormViewModel
}

type AttributePageProps = {
  error: null | string
  saved: boolean
  submitting: boolean
  viewModel: AttributePageViewModel
}
</script>

<script setup lang="ts">
import { Tags } from 'lucide-vue-next'

import EditAttributeForm from './components/EditAttributeForm.vue'

defineProps<AttributePageProps>()
const emit = defineEmits<{
  delete: [id: string]
  update: [input: EditAttributeFormInput]
}>()
const organizationRoutes = useOrganizationRoutes()
</script>
