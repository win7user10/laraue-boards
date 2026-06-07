<script setup lang="ts">
import LnbModalListOpts from "~/components/modals/LnbModalListOpts.vue";
import LnbModalLabel from "~/components/modals/LnbModalLabel.vue";
import LnbModalListOpt from "~/components/modals/LnbModalListOpt.vue";

const props = defineProps<{
  showOnlyNotDefaultSpaces: boolean,
  showOnlyNotDefaultEpics: boolean,
  sourceType: 'space' | 'epic'
  space?: DestinationSpace | null,
  epic?: EpicListDto | null,
}>()

const emit = defineEmits<{
  (e: 'update:space', value: DestinationSpace): void
  (e: 'update:epic', value: EpicListDto): void
}>()

const { t } = useI18n()
const { spaces } = useBoard()
const { loadSpaceEpics } = useSpacesApi()
const allowedSpacesForMove = computed(() => {
  return props.showOnlyNotDefaultSpaces ? spaces.value.filter(s => !s.isDefault) : spaces.value;
})

const epics = ref<EpicListDto[]>([])
watch(() => props.space, async (newVal) => {
  epics.value = newVal ? await loadSpaceEpics(newVal.id) : []
}, { immediate: true, deep: true })

const allowedEpicsForMove = computed(() => {
  return props.showOnlyNotDefaultEpics ? epics.value.filter(s => !s.isDefault) : epics.value;
})
</script>

<template>

  <!-- Select Space Source -->
  <LnbModalLabel>
    {{ t('selectSpace') }}
  </LnbModalLabel>

  <!-- Spaces -->
  <LnbModalListOpts>
    <LnbModalListOpt
        v-for="s in allowedSpacesForMove"
        :class="{selected: space?.id === s.id}"
        :name="s.name"
        :color="s.color"
        sub=""
        @click="emit('update:space', s)" />
    <div v-if="!allowedSpacesForMove.length" class="empty">
      {{ t('noAllowedSpacesToMove') }}
    </div>
  </LnbModalListOpts>

  <!-- Select Epic Source -->
  <template v-if="sourceType === 'epic' && space">

    <LnbModalLabel>
      Select epic
    </LnbModalLabel>

    <LnbModalListOpts>
      <LnbModalListOpt
        v-for="s in allowedEpicsForMove"
        :class="{selected: epic?.id === s.id}"
        :name="s.name"
        :color="s.color"
        sub=""
        @click="emit('update:epic', s)" />
      <div v-if="!allowedEpicsForMove.length" class="empty">
        {{ t('noAllowedEpicsToMove') }}
      </div>
    </LnbModalListOpts>

  </template>

</template>

<style scoped>
  .selected { border-color:var(--accent);background:var(--accent-glow) }
  .empty { text-align:center;padding:16px 0;font-size:12px;color:var(--text3) }
</style>