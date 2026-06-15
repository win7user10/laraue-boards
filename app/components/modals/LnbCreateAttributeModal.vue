<script setup lang="ts">
import LnbModal from "~/components/modals/LnbModal.vue";
import LnbModalLabel from "~/components/modals/LnbModalLabel.vue";
import LnbModalInput from "~/components/modals/LnbModalInput.vue";
import LnbColorPicker from "~/components/LnbColorPicker.vue";
import LnbModalList from "~/components/modals/LnbModalList.vue";
import LnbIconBtn from "~/components/icons/LnbIconBtn.vue";

const { t } = useI18n();
const { getEmptyErrorsObject } = useUtils();
const { getRandomColor } = useAppState();
const { createAttribute } = useOrganizationsApi();

const emit = defineEmits<{
  (e: 'close'): void,
  (e: 'create'): void,
}>()

const newAttribute = ref<CreateAttributeRequest>({
  name: '',
  color: getRandomColor(),
  listValues: [] as NewAttributeListValueDto[],
  type: AttributeType.Text,
})

const attributeTypes = [
  { id: AttributeType.Text, name: t('attributeType_0') },
  { id: AttributeType.List, name: t('attributeType_1') },
]

const errors = ref(getEmptyErrorsObject())
const addOption = () => {
  newAttribute.value.listValues.push({
    name: ''
  })
}

const updateAttributeType = (value: number) => {
  newAttribute.value.type = value;
  if (newAttribute.value.listValues.length == 0)
    addOption();
}

const updateOptionValue = (index: number, value: string) => {
  newAttribute.value.listValues![index]!.name = value
}

const deleteOptionValue = (index: number) => {
  newAttribute.value.listValues.splice(index, 1)
}

const createAttributeInternal = async () => {
  try {
    await createAttribute(newAttribute.value)
    emit('create')
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
    title="Add attribute"
    apply-text="Create"
    @cancel="emit('close')"
    @close="emit('close')"
    @apply="createAttributeInternal">

    <LnbModalLabel>
      {{ t('name') }}
    </LnbModalLabel>
    <LnbModalInput
      :errors="errors['Name']"
      focus
      @enter="createAttributeInternal"
      v-model="newAttribute.name"
      :placeholder="t('attributeNameExample')"/>

    <LnbModalLabel>
      {{ t('type') }}
    </LnbModalLabel>
    <LnbModalList
      :options="attributeTypes"
      :modelValue="newAttribute.type"
      @update:modelValue="updateAttributeType" />

    <template v-if="newAttribute.type === AttributeType.List">
      <LnbModalLabel>
        {{ t('options') }}
      </LnbModalLabel>

      <div
        class="attr-select-option"
        v-for="(optionValue, i) in newAttribute.listValues">

        <LnbInput
          :modelValue="optionValue.name"
          :placeholder="t('optionValue')"
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
      v-model="newAttribute.color"/>

  </LnbModal>
</template>

<style scoped>
.attr-select-option{display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:var(--radius-sm);border:1px solid var(--border);background:var(--surface2);margin-bottom:4px}
.attr-select-option input{flex:1;background:transparent;border:none;color:var(--text);font-family:'Inter',sans-serif;font-size:12px;outline:none}
</style>