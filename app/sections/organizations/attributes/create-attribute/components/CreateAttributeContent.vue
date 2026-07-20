<template>
  <section class="form-page">
    <div class="title-row">
      <div class="page-heading">
        <AppBackLink
          label="Back to attributes"
          :to="organizationRoutes.attributes()" />
        <Tags class="page-heading-icon" />
        <div class="page-heading-text">
          <h1>Create attribute</h1>
        </div>
      </div>
    </div>
    <CreateAttributeForm
      :error="error"
      :on-submit="props.onSubmit"
      :submitting="submitting" />
  </section>
</template>

<script lang="ts">
import type { CreateAttributeFormInput } from '~/sections/organizations/attributes/create-attribute/components/CreateAttributeForm.vue'

type CreateAttributePageProps = {
  error: null | string
  onSubmit: (input: CreateAttributeFormInput) => void
  submitting: boolean
}
</script>

<script setup lang="ts">
import { Tags } from 'lucide-vue-next'

import CreateAttributeForm from '~/sections/organizations/attributes/create-attribute/components/CreateAttributeForm.vue'

const props = defineProps<CreateAttributePageProps>()
const organizationRoutes = useOrganizationRoutes()
</script>
