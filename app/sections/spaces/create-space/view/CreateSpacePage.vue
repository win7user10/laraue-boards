<template>
  <section class="form-page">
    <div class="page-heading">
      <div class="page-heading-text">
        <h1>Create space</h1>
      </div>
    </div>
    <form
      @submit.prevent="
        $emit('submit', { name: name.trim(), key: key.trim(), color })
      ">
      <label>Name</label>
      <input
        v-model="name"
        required />
      <label>Key</label>
      <input
        v-model="key"
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
          {{ submitting ? 'Creating…' : 'Create space' }}
        </button>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import { DEFAULT_COLOR } from '../../../../constants/colors'

defineProps<{ error: null | string; submitting: boolean }>()
defineEmits<{ submit: [input: { color: string; key: string; name: string }] }>()
const name = ref('')
const key = ref('')
const color = ref(DEFAULT_COLOR)
</script>
