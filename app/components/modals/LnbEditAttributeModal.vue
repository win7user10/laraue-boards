<script setup lang="ts">
import {type UpdateAttributeListValueDto, useOrganizationsApi} from "~/composables/organizationsApi";
import LnbModalLabel from "~/components/modals/LnbModalLabel.vue";
import LnbModal from "~/components/modals/LnbModal.vue";
import LnbModalInput from "~/components/modals/LnbModalInput.vue";
import LnbIconBtn from "~/components/icons/LnbIconBtn.vue";
import LnbColorPicker from "~/components/LnbColorPicker.vue";

const emit = defineEmits<{
  (e: 'close'): void,
  (e: 'edit'): void,
}>()

const { getEmptyErrorsObject } = useUtils()
const { t } = useI18n()
const { updateAttribute } = useOrganizationsApi()

const props = defineProps<{
  attribute: AttributeDto
}>()

const request = ref<UpdateAttributeRequest>({
  name: '',
  color: '',
  listValues: [] as UpdateAttributeListValueDto[],
})

const type = ref<AttributeType>()
const id = ref<number>()

onMounted(() => {
  request.value.color = props.attribute.color;
  request.value.name = props.attribute.name;
  request.value.listValues = props.attribute.listValues.map(x => {
    return {
      id: x.id,
      name: x.name
    }});

  type.value = props.attribute.type;
  id.value = props.attribute.id;
})


const updateOptionValue = (index: number, value: string) => {
  request.value.listValues![index]!.name = value
}

const deleteOptionValue = (index: number) => {
  request.value.listValues.splice(index, 1)
}

const addOption = () => {
  request.value.listValues.push({
    name: ''
  })
}

const errors = ref(getEmptyErrorsObject())

const updateAttributeInternal = async () => {
  try {
    await updateAttribute(id.value!, request.value)
    emit('edit')
  } catch (error) {
    if (error instanceof ApiError && error.status === 400) {
      errors.value = error.errors;
    } else {
      throw error;
    }
  }
}
</script>

<template>
  <LnbModal
      title="Edit attribute"
      apply-text="Edit"
      @cancel="emit('close')"
      @close="emit('close')"
      @apply="updateAttributeInternal">

    <LnbModalLabel>
      {{ t('name') }}
    </LnbModalLabel>
    <LnbModalInput
      :errors="errors['Name']"
      focus
      v-model="request.name"
      @enter="updateAttributeInternal"
      :placeholder="t('attributeNameExample')"/>

    <template v-if="type === AttributeType.List">
      <LnbModalLabel>
        {{ t('options') }}
      </LnbModalLabel>

      <div
        class="attr-select-option"
        v-for="(optionValue, i) in request.listValues">

        <LnbInput
          :modelValue="optionValue.name"
          :placeholder="t('optionValue')"
          @enter="updateAttributeInternal"
          @update:modelValue="updateOptionValue(i, $event)"/>

        <div class="attr-del">
          <LnbIconBtn
            @click="deleteOptionValue(i)"
            type="danger"
            icon="delete"
            :title="t('delete')"
            btn-size="mini"
            icon-size="mini" />
        </div>

      </div>

      <LnbButton
          style="width: 100%; margin-bottom: 12px; font-size: 12px; padding: 7px;"
          :name="t('addOption')"
          @click="addOption"
          type="ghost" />
    </template>

    <LnbModalLabel>
      {{ t('color') }}
    </LnbModalLabel>
    <LnbColorPicker
        v-model="request.color"/>

  </LnbModal>
</template>

<style scoped>
.attr-select-option{display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:var(--radius-sm);border:1px solid var(--border);background:var(--surface2);margin-bottom:4px}
.attr-select-option input{flex:1;background:transparent;border:none;color:var(--text);font-family:'Inter',sans-serif;font-size:12px;outline:none}
</style>