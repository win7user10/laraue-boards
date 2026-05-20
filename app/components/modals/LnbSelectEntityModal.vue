<script setup lang="ts" generic="T extends IOption">

import LnbModalListOpts from "~/components/modals/LnbModalListOpts.vue";
import LnbModalListOpt from "~/components/modals/LnbModalListOpt.vue";
import LnbModal from "~/components/modals/LnbModal.vue";
import type {IOption} from "~/components/modals/definitions";

defineProps<{
  title: string;
  initialsCount: number;
  options: T[]
}>()

const emit = defineEmits<{
  (e: 'close'): void,
  (e: 'select', value: T): void
}>()

</script>

<template>
  <LnbModal
    @close="emit('close')"
    @cancel="emit('close')"
    :title="title">
    <LnbModalListOpts>
      <LnbModalListOpt
        v-for="option in options"
        :key="option.id"
        :name="option.name"
        @click="emit('select', option)">
        <template #avatar>
          <LnbCardAvatar :color="option.color">
            {{ option.name.slice(0, initialsCount).toLocaleUpperCase() }}
          </LnbCardAvatar>
        </template>
      </LnbModalListOpt>
    </LnbModalListOpts>
  </LnbModal>
</template>

<style scoped>

</style>