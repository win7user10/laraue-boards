<script setup lang="ts">

import type {CreateCardRequest} from "~/composables/messagesApi";
import LnbModalTextarea from "~/components/modals/LnbModalTextarea.vue";
import LnbModal from "~/components/modals/LnbModal.vue";
import LnbModalLabel from "~/components/modals/LnbModalLabel.vue";
import LnbModalAttributeInput from "~/components/modals/LnbModalAttributeInput.vue";

const emit = defineEmits<{
  (e: 'close'): void,
  (e: 'create', value: CreateCardRequest): void
}>()

const { t } = useI18n();
const { getAttributes } = useOrganizationsApi()
const attributes = await getAttributes();

const props = defineProps<{
  statusId: number,
}>()

const newCard = ref<CreateCardRequest>({
  content: "",
  statusId: props.statusId,
  attributeValues: {}
})

const createCard = () => {
  emit("create", newCard.value)
}

const updateAttributeValue = (id: number, value: string | number | undefined) => {
  if (!value)
    delete newCard.value.attributeValues[id]
  else
    newCard.value.attributeValues[id] = value.toString();
}

</script>

<template>
  <LnbModal
    :applyText="t('create')"
    :title="t('createCard')"
    @apply="createCard"
    @cancel="emit('close')"
    @close="emit('close')">
    <LnbModalLabel>{{ t('text') }}</LnbModalLabel>
    <LnbModalTextarea
      @enter="createCard"
      focus
      v-model="newCard.content"
      :placeholder="t('contentExample')"/>

    <LnbModalAttributeInput
      v-for="attribute in attributes"
      :color="attribute.color"
      :name="attribute.name"
      :type="attribute.type"
      :list-values="attribute.listValues"
      :model-value="newCard.attributeValues[attribute.id]"
      @update:modelValue="updateAttributeValue(attribute.id, $event)" />
  </LnbModal>
</template>

<style scoped>

</style>