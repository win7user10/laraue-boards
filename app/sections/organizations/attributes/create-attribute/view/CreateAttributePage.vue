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
      :submitting="submitting"
      @submit="emit('submit', $event)" />
  </section>
</template>

<script lang="ts">
import type { CreateAttributeFormInput } from './components/CreateAttributeForm.vue'

type CreateAttributePageProps = {
  error: null | string
  submitting: boolean
}
</script>

<script setup lang="ts">
import { Tags } from 'lucide-vue-next'

import CreateAttributeForm from './components/CreateAttributeForm.vue'

defineProps<CreateAttributePageProps>()
const emit = defineEmits<{
  submit: [input: CreateAttributeFormInput]
}>()
const organizationRoutes = useOrganizationRoutes()
</script>
