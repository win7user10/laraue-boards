<template>
  <section class="org-picker">
    <div class="picker-card form-page">
      <NuxtLink
        class="logo"
        to="/organizations">
        <img
          alt=""
          class="logo-mark"
          src="/favicon.svg" />
        <span>Laraue Boards</span>
      </NuxtLink>
      <div class="page-heading">
        <AppBackLink
          label="Back to organizations"
          to="/organizations" />
        <div class="page-heading-text">
          <h1>Create organization</h1>
        </div>
      </div>
      <p class="muted">Create a new workspace for your team.</p>
      <form
        @submit.prevent="
          $emit('submit', { name: name.trim(), slug: slug.trim(), color })
        ">
        <label>Name</label>
        <input
          v-model="name"
          required />
        <label>Slug</label>
        <input
          v-model="slug"
          pattern="[a-z0-9-]+"
          placeholder="acme-studio"
          required />
        <label>Color</label>
        <AppColorPicker v-model="color" />
        <p
          v-if="error"
          class="form-error">
          {{ error }}
        </p>
        <div class="form-actions">
          <NuxtLink
            class="secondary"
            to="/organizations">
            Cancel
          </NuxtLink>
          <button
            class="primary"
            :disabled="submitting">
            {{ submitting ? 'Creating…' : 'Create organization' }}
          </button>
        </div>
      </form>
    </div>
  </section>
</template>

<script setup lang="ts">
import { DEFAULT_COLOR } from '../../../../constants/colors'

defineProps<{ error: null | string; submitting: boolean }>()
defineEmits<{
  submit: [input: { color: string; name: string; slug: string }]
}>()
const name = ref('')
const slug = ref('')
const color = ref(DEFAULT_COLOR)
</script>

<style scoped>
.org-picker {
  display: grid;
  min-height: 100vh;
  padding: var(--space-6);
  place-items: center;
}

.picker-card {
  width: min(var(--form-page-max-width), 100%);
}

.picker-card > .logo {
  margin-bottom: 48px;
}
</style>
