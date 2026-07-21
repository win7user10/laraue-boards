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
      :on-delete="props.onDelete"
      :on-submit="props.onUpdate"
      :saved="saved"
      :submitting="submitting"
      :view-model="viewModel.EditAttributeForm" />
  </section>
</template>

<script lang="ts">
import type {
  EditAttributeFormInput,
  EditAttributeFormViewModel,
} from '~/sections/organizations/attributes/attribute/components/EditAttributeForm.vue'

export type AttributePageViewModel = {
  EditAttributeForm: EditAttributeFormViewModel
}

type AttributePageProps = {
  error: null | string
  onDelete: (id: string) => void
  onUpdate: (input: EditAttributeFormInput) => void
  saved: boolean
  submitting: boolean
  viewModel: AttributePageViewModel
}
</script>

<script setup lang="ts">
import { Tags } from 'lucide-vue-next'

import EditAttributeForm from '~/sections/organizations/attributes/attribute/components/EditAttributeForm.vue'

const props = defineProps<AttributePageProps>()
const organizationRoutes = useOrganizationRoutes()
</script>
