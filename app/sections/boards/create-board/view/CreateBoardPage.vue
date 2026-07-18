<template>
  <section class="form-page">
    <div class="page-heading">
      <AppBackLink
        label="Back to space"
        :to="organizationRoutes.space(spaceKey)" />
      <div class="page-heading-text">
        <h1>Create board</h1>
      </div>
    </div>
    <form @submit.prevent="$emit('submit', { name: name.trim(), color })">
      <label>Name</label>
      <input
        v-model="name"
        required />
      <label>Color</label>
      <AppColorPicker v-model="color" />
      <p
        v-if="error"
        class="form-error">
        {{ error }}
      </p>
      <div class="form-actions">
        <button
          class="primary"
          :disabled="submitting">
          {{ submitting ? 'Creating…' : 'Create board' }}
        </button>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import { DEFAULT_COLOR } from '../../../../constants/colors'

defineProps<{ error: null | string; spaceKey: string; submitting: boolean }>()
defineEmits<{ submit: [input: { color: string; name: string }] }>()
const organizationRoutes = useOrganizationRoutes()
const name = ref('')
const color = ref(DEFAULT_COLOR)
</script>
