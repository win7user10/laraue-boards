<script setup lang="ts">
import LnbModal from "~/components/modals/LnbModal.vue";
import LnbModalLabel from "~/components/modals/LnbModalLabel.vue";
import LnbModalInput from "~/components/modals/LnbModalInput.vue";
import type {EditOrganizationRequest} from "~/composables/organizationsApi";

const props = defineProps<{
  organization: OrganizationListDto
}>()

const emit = defineEmits<{
  (e: 'close'): void,
  (e: 'edit', value: EditOrganizationRequest): void
}>()

const request = ref<EditOrganizationRequest>({
  name: "",
  color: "",
})

onMounted(() => {
  request.value.color = props.organization.color;
  request.value.name = props.organization.name;
})

const { t } = useI18n();

</script>

<template>
  <LnbModal
    :applyText="t('editOrganization')"
    :title="t('editOrganizationTitle')"
    @close="emit('close')"
    @cancel="emit('close')"
    @apply="emit('edit', request)">
    <LnbModalLabel>{{ t('organizationName') }}</LnbModalLabel>
    <LnbModalInput
        focus
        @enter="emit('edit', request)"
        v-model="request.name"
        :placeholder="t('organizationNameExample')"/>
    <LnbModalLabel>{{ t('color') }}</LnbModalLabel>
    <LnbColorPicker
      v-model="request.color"/>
  </LnbModal>
</template>

<style scoped>

</style>