<script setup lang="ts">
import type {EditCardRequest} from "~/composables/messagesApi";
import LnbModalTextarea from "~/components/modals/LnbModalTextarea.vue";
import {ref} from "vue";
import {useUtils} from "~/composables/utils";
import LnbModal from "~/components/modals/LnbModal.vue";
import LnbModalLabel from "~/components/modals/LnbModalLabel.vue";
import LnbIconBtn from "~/components/icons/LnbIconBtn.vue";
import LnbModalInput from "~/components/modals/LnbModalInput.vue";
import LnbFilterChips from "~/components/modals/LnbFilterChips.vue";

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
const filledAttributes = computed(() => {
  return data.value?.attributeValues.filter(attribute => attribute.value)
})

const attributes = computed(() => {
  return data.value?.attributeValues
})

onMounted(async () => {
  data.value = await getMessage(props.id);
  request.value.content = data.value.content;
})

const editMode = ref(false)
</script>

<template>
  <LnbModal
    :applyText="data?.canEdit ? t('save') : undefined"
    :title="''"
    @apply="emit('edit', request)"
    @cancel="emit('close')"
    @close="emit('close')">

    <div class="modal-title">
      <div>
        <span
            class="card-key"
            :style="{
            background: data?.spaceColor + '22',
            borderColor: data?.spaceColor,
            color: data?.spaceColor,
          }">
          {{ data?.key }}
        </span>
      </div>
      <LnbIconBtn
        :title="t('editMode')"
        @click="editMode = !editMode"
        icon="edit"
        icon-size="mini"
        btn-size="medium"
        bordered/>
    </div>

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

      <LnbDetailRow v-if="!editMode" v-for="attribute in filledAttributes" :key="attribute.id" :label="attribute.name">
        <span v-if="attribute.value">
          <span :style="{color: attribute?.color}">● </span>
          <template v-if="attribute.type === AttributeType.Text">
            {{ attribute.value }}
          </template>
          <template v-if="attribute.type === AttributeType.List">
            {{ attribute.value ? attribute.listValues?.find(x => x.id === Number(attribute.value))?.name : '' }}
          </template>
        </span>
      </LnbDetailRow>

    </LnbDetailMeta>


    <template v-if="editMode" v-for="attribute in attributes" :key="attribute.id">
      <LnbModalLabel style="display: flex; align-items: center; gap: 8px;">
        <LnbSwitcherDot :color="attribute.color" />
        {{ attribute.name }}
      </LnbModalLabel>
      <LnbModalInput
        v-if="attribute.type == AttributeType.Text"
        placeholder="Enter Attribute Value..."
        v-model="attribute.value"/>
      <LnbFilterChips
        v-if="attribute.type == AttributeType.List"
        :color="attribute.color"
        :options="attribute.listValues!"
        v-model="attribute.value"/>
    </template>

    <LnbModalLabel>{{ t('text') }}</LnbModalLabel>
    <LnbModalTextarea
      @enter="emit('edit', request)"
      v-model="request.content"
      :disabled="!data?.canEdit"
      :placeholder="t('contentExample')"/>
  </LnbModal>
</template>

<style scoped>
  .modal-title {padding: 2px 0 10px; display: flex; justify-content: space-between;}
  .card-key {font-size:12px;font-family:'JetBrains Mono',monospace;font-weight:700;border-radius:4px;padding:2px 7px}
</style>