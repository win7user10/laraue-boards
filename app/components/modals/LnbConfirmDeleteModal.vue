<script setup lang="ts">
import LnbModal from "~/components/modals/LnbModal.vue";

const emit = defineEmits<{
  (e: 'close'): void,
  (e: 'delete'): void
}>()

defineProps<{
  title: string
}>()

const { t } = useI18n();
</script>

<template>
  <LnbModal
      @close="emit('close')"
      @apply="emit('delete')"
      @cancel="emit('close')"
      :applyText="t('delete')"
      :title="title">
    <LnbConfirmBody>
      <slot></slot>
    </LnbConfirmBody>
  </LnbModal>
</template>

<style scoped>

</style>