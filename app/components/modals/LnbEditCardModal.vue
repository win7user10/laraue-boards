<script setup lang="ts">
import type {EditCardRequest} from "~/composables/messagesApi";
import LnbModalTextarea from "~/components/modals/LnbModalTextarea.vue";
import {ref} from "vue";
import {useUtils} from "~/composables/utils";
import LnbModal from "~/components/modals/LnbModal.vue";
import LnbModalLabel from "~/components/modals/LnbModalLabel.vue";

const props = defineProps<{
  id: number,
}>()

const { t } = useI18n();

const emit = defineEmits<{
  (e: 'close'): void,
  (e: 'edit', request: EditCardRequest): void
}>()

const { formatDate } = useUtils()
const { getMessage } = useMessagesApi()

const request = ref<EditCardRequest>({
  content: ''
})

const data = ref<MessageDetailDto>()

onMounted(async () => {
  data.value = await getMessage(props.id);
  request.value.content = data.value.content;
})
</script>

<template>
  <LnbModal
    :applyText="data?.canEdit ? t('save') : undefined"
    :title="''"
    @apply="emit('edit', request)"
    @cancel="emit('close')"
    @close="emit('close')">

    <LnbDetailMeta>
      <LnbDetailRow :label="t('sender')">
        {{ data?.sender }}
      </LnbDetailRow>

      <LnbDetailRow :label="t('created')">
        {{ formatDate(data?.time) }}
      </LnbDetailRow>

      <LnbDetailRow :label="t('category')" v-if="data?.epicName">
        <span>
          <span :style="{color: data?.epicColor}">●</span>
          {{ data?.epicName }}
        </span>
      </LnbDetailRow>

      <LnbDetailRow :label="t('status')" v-if="data?.statusName">
        <span>
          <span :style="{color: data?.statusColor}">●</span>
          {{ data?.statusName }}
        </span>
      </LnbDetailRow>
    </LnbDetailMeta>

    <LnbModalLabel>{{ t('text') }}</LnbModalLabel>
    <LnbModalTextarea
      @enter="emit('edit', request)"
      v-model="request.content"
      :disabled="!data?.canEdit"
      :placeholder="t('contentExample')"/>
  </LnbModal>
</template>

<style scoped>

</style>