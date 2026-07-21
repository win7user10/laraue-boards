<template>
  <div class="issue-attachments">
    <strong>Attachments</strong>
    <div
      v-if="attachments.length || pendingPreviews.length"
      class="issue-attachment-gallery">
      <button
        v-for="(attachment, index) in attachments"
        :key="`${attachment.previewUrl}-${index}`"
        :aria-label="`Open attachment ${index + 1}`"
        class="issue-attachment-open"
        type="button"
        @click="
          openLightbox(attachment.originalUrl, `Attachment ${index + 1}`)
        ">
        <img
          :alt="`Attachment ${index + 1}`"
          :src="attachment.previewUrl" />
      </button>
      <div
        v-for="(preview, index) in pendingPreviews"
        :key="preview.url"
        class="issue-attachment-preview">
        <button
          :aria-label="`Open ${preview.file.name}`"
          class="issue-attachment-open"
          :disabled="disabled"
          type="button"
          @click="openLightbox(preview.url, preview.file.name)">
          <img
            :alt="preview.file.name"
            :src="preview.url" />
          <span>{{ preview.file.name }}</span>
        </button>
        <button
          v-if="!disabled"
          :aria-label="`Remove ${preview.file.name}`"
          class="icon-btn issue-attachment-remove"
          type="button"
          @click="removeFile(index)">
          <X />
        </button>
        <div
          v-if="disabled"
          aria-label="Uploading attachment"
          class="issue-attachment-uploading"
          role="status">
          <LoaderCircle />
        </div>
      </div>
    </div>
    <input
      :id="inputId"
      ref="inputEl"
      accept="image/png,image/jpeg,.png,.jpg,.jpeg"
      class="issue-attachment-input"
      :disabled="disabled"
      multiple
      type="file"
      @change="changeFiles" />
    <div
      class="issue-attachment-actions">
      <label
        :aria-disabled="disabled"
        class="secondary issue-attachment-picker"
        :class="{ 'issue-attachment-picker--disabled': disabled }"
        :for="inputId">
        <ImagePlus />
        {{ files.length ? 'Choose other images' : 'Choose images' }}
      </label>
      <button
        v-if="files.length"
        class="secondary"
        :disabled="disabled"
        type="button"
        @click="clearFiles">
        Clear
      </button>
    </div>
    <Teleport to="body">
      <dialog
        ref="lightboxEl"
        aria-label="Attachment preview"
        class="issue-attachment-lightbox"
        @click="closeLightboxFromBackdrop"
        @close="activeAttachment = null">
        <button
          aria-label="Close attachment preview"
          class="icon-btn issue-attachment-lightbox-close"
          type="button"
          @click="closeLightbox">
          <X />
        </button>
        <img
          v-if="activeAttachment"
          :alt="activeAttachment.alt"
          :src="activeAttachment.url" />
      </dialog>
    </Teleport>
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
import { ImagePlus, LoaderCircle, X } from 'lucide-vue-next'

const props = defineProps<IssueAttachmentsProps>()
const activeAttachment = ref<null | { alt: string; url: string }>(null)
const inputId = useId()
const inputEl = ref<HTMLInputElement>()
const lightboxEl = ref<HTMLDialogElement>()
const pendingPreviews = ref<Array<{ file: File; url: string }>>([])

watch(
  () => props.files,
  (files) => {
    revokePreviews()
    pendingPreviews.value = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }))
  },
  { immediate: true },
)

onBeforeUnmount(revokePreviews)

function changeFiles(event: Event) {
  props.onChange(Array.from((event.target as HTMLInputElement).files ?? []))
}

function clearFiles() {
  if (inputEl.value) {
    inputEl.value.value = ''
  }
  props.onChange([])
}

function removeFile(index: number) {
  if (inputEl.value) {
    inputEl.value.value = ''
  }
  props.onChange(props.files.filter((_, fileIndex) => fileIndex !== index))
}

function revokePreviews() {
  for (const preview of pendingPreviews.value) {
    URL.revokeObjectURL(preview.url)
  }
}

async function openLightbox(url: string, alt: string) {
  activeAttachment.value = { alt, url }
  await nextTick()
  lightboxEl.value?.showModal()
}

function closeLightbox() {
  lightboxEl.value?.close()
}

function closeLightboxFromBackdrop(event: MouseEvent) {
  if (event.target === lightboxEl.value) {
    closeLightbox()
  }
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

.issue-attachment-gallery > .issue-attachment-open,
.issue-attachment-preview {
  aspect-ratio: 1;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-control);
  overflow: hidden;
  position: relative;
}

.issue-attachment-open {
  background: transparent;
  border: 0;
  color: inherit;
  cursor: zoom-in;
  height: 100%;
  padding: 0;
  width: 100%;
}

.issue-attachment-open:disabled {
  cursor: wait;
}

.issue-attachment-gallery img {
  height: 100%;
  object-fit: cover;
  width: 100%;
}

.issue-attachment-preview .issue-attachment-open > span {
  background: color-mix(in srgb, var(--color-surface) 88%, transparent);
  bottom: 0;
  font-size: var(--font-size-caption);
  inset-inline: 0;
  overflow: hidden;
  padding: var(--space-1) var(--space-2);
  position: absolute;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.issue-attachment-uploading {
  align-items: center;
  background: color-mix(in srgb, var(--color-surface) 65%, transparent);
  display: flex;
  inset: 0;
  justify-content: center;
  position: absolute;
}

.issue-attachment-uploading svg {
  animation: var(--animation-spin);
  color: var(--color-accent);
  height: 32px;
  width: 32px;
}

.issue-attachment-remove {
  position: absolute;
  right: var(--space-1);
  top: var(--space-1);
  z-index: 1;
}

.issue-attachment-remove svg {
  height: 16px;
  width: 16px;
}

.issue-attachment-input {
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  height: 1px;
  overflow: hidden;
  position: absolute;
  white-space: nowrap;
  width: 1px;
}

.issue-attachment-actions {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.issue-attachment-picker {
  cursor: pointer;
  margin: 0;
}

.issue-attachment-picker--disabled {
  cursor: not-allowed;
  opacity: 0.5;
  pointer-events: none;
}

.issue-attachments:has(.issue-attachment-input:focus-visible)
  .issue-attachment-picker {
  border-color: var(--color-accent);
  box-shadow: var(--shadow-focus);
}

.issue-attachment-picker svg {
  height: 18px;
  width: 18px;
}

.issue-attachment-lightbox {
  background: #000000eb;
  border: 0;
  box-sizing: border-box;
  height: 100dvh;
  inset: 0;
  margin: 0;
  max-height: none;
  max-width: none;
  overflow: hidden;
  padding: var(--space-8);
  width: 100vw;
}

.issue-attachment-lightbox::backdrop {
  background: transparent;
}

.issue-attachment-lightbox > img {
  height: 100%;
  object-fit: contain;
  width: 100%;
}

.issue-attachment-lightbox-close {
  position: fixed;
  right: var(--space-4);
  top: var(--space-4);
  z-index: 1;
}
</style>
