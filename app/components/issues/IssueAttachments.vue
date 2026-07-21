<template>
  <div class="issue-attachments">
    <label :for="inputId">Attachments</label>
    <div
      v-if="attachments.length"
      class="issue-attachment-gallery">
      <a
        v-for="(attachment, index) in attachments"
        :key="`${attachment.previewUrl}-${index}`"
        :aria-label="`Open attachment ${index + 1}`"
        :href="attachment.originalUrl"
        rel="noopener"
        target="_blank">
        <img
          :alt="`Attachment ${index + 1}`"
          :src="attachment.previewUrl" />
      </a>
    </div>
    <input
      :id="inputId"
      ref="inputEl"
      accept="image/png,image/jpeg,.png,.jpg,.jpeg"
      :disabled="disabled"
      multiple
      type="file"
      @change="changeFiles" />
    <div
      v-if="files.length"
      class="issue-attachment-selection">
      <ul>
        <li
          v-for="file in files"
          :key="`${file.name}-${file.size}-${file.lastModified}`">
          {{ file.name }}
        </li>
      </ul>
      <button
        class="secondary"
        :disabled="disabled"
        type="button"
        @click="clearFiles">
        Clear
      </button>
    </div>
  </div>
</template>

<script lang="ts">
export type IssueAttachmentViewModel = {
  originalUrl: string
  previewUrl: string
}

type IssueAttachmentsProps = {
  attachments: IssueAttachmentViewModel[]
  disabled: boolean
  files: File[]
  onChange: (files: File[]) => void
}
</script>

<script setup lang="ts">
const props = defineProps<IssueAttachmentsProps>()
const inputId = useId()
const inputEl = ref<HTMLInputElement>()

function changeFiles(event: Event) {
  props.onChange(Array.from((event.target as HTMLInputElement).files ?? []))
}

function clearFiles() {
  if (inputEl.value) {
    inputEl.value.value = ''
  }
  props.onChange([])
}
</script>

<style scoped>
.issue-attachments {
  display: grid;
  gap: var(--space-2);
  margin-top: var(--space-4);
}

.issue-attachment-gallery {
  display: grid;
  gap: var(--space-2);
  grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
}

.issue-attachment-gallery a {
  aspect-ratio: 1;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-control);
  overflow: hidden;
}

.issue-attachment-gallery img {
  height: 100%;
  object-fit: cover;
  width: 100%;
}

.issue-attachment-selection {
  align-items: start;
  display: flex;
  gap: var(--space-3);
  justify-content: space-between;
}

.issue-attachment-selection ul {
  margin: 0;
  min-width: 0;
  overflow-wrap: anywhere;
  padding-left: var(--space-5);
}
</style>
