<script setup lang="ts">
import LnbPopup from "~/components/popups/LnbPopup.vue";
import LnbPopupItem from "~/components/popups/LnbPopupItem.vue";
import LnbPopupItemDivider from "~/components/popups/LnbPopupItemDivider.vue";
import LnbCreateSpaceModal from "~/components/modals/LnbCreateSpaceModal.vue";
import LnbIconBtn from "~/components/icons/LnbIconBtn.vue";
import LnbEditSpaceModal from "~/components/modals/LnbEditSpaceModal.vue";
import LnbDeleteSpaceModal from "~/components/modals/LnbDeleteSpaceModal.vue";
import LnbSpacePopupItem from "~/components/LnbSpacePopupItem.vue";

const emits = defineEmits<{
  (e: 'close'): void,
}>()

const { t } = useI18n()

const { currentSpace, spaces, reloadBoard, reloadEpics, deleteSpace, getOrganizationKey } = useBoard()
const { updateSpaceId, appState } = useAppState()
const { updateSelectedSpace } = useOrganizationsApi()
const modals = reactive({
  createSpace: false,
  editSpace: false,
  deleteSpace: false,
})

const setSpaceInternal = async (id: number) => {
  // change state
  updateSpaceId(id)
  await updateSelectedSpace(id)
  await reloadEpics()

  closePopup()

  const key = getOrganizationKey()
  return navigateTo(`/organizations/${key}`)
}

const closeCreateSpace = () => {
  modals.createSpace = false
  closePopup()
}

const editingSpace = ref<SpaceListDto>()
const openEditSpace = (space: SpaceListDto) => {
  editingSpace.value = space;
  modals.editSpace = true;
}

const openDeleteSpace = (space: SpaceListDto) => {
  editingSpace.value = space;
  modals.deleteSpace = true;
}

const deleteSpaceInternal = async () => {
  await deleteSpace(editingSpace.value!.id);
  modals.deleteSpace = false;
}

const closeEditSpace = () => {
  modals.editSpace = false;
  closePopup();
}

const closeDeleteSpace = () => {
  modals.deleteSpace = false;
  closePopup();
}

const closePopup = () => {
  emits('close')
}

</script>

<template>
  <!-- Space popup -->
  <LnbPopup @close="emits('close')" :min-width="260">

    <!-- Spaces -->
    <LnbPopupItem
      class="space-popup-wrapper"
      v-for="s in spaces"
      :active="currentSpace?.id === s.id"
      :key="s.id" @click="setSpaceInternal(s.id)">
      <LnbSpacePopupItem :color="s.color" :name="s.name" />
      <div class="space-popup-item-controls">
        <LnbIconBtn v-if="s.canUpdate" @click.stop="openEditSpace(s)" :title="t('edit')" icon="edit" icon-size="mini" btn-size="mini" />
        <LnbIconBtn v-if="s.canDelete" @click.stop="openDeleteSpace(s)" :title="t('delete')" icon="delete" icon-size="mini" btn-size="mini" />
      </div>
    </LnbPopupItem>

    <template v-if="appState.organization?.canCreateSpaces">
      <LnbPopupItemDivider />

      <LnbPopupItem @click="modals.createSpace = true" class="space-popup-add">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M8 3v10M3 8h10"/></svg>
        {{ t('newSpace') }}
      </LnbPopupItem>
    </template>

  </LnbPopup>
  <LnbCreateSpaceModal
    v-if="modals.createSpace"
    @close="closeCreateSpace"/>
  <LnbEditSpaceModal
    v-if="modals.editSpace"
    :space="editingSpace!"
    @close="closeEditSpace"/>
  <LnbDeleteSpaceModal
    v-if="modals.deleteSpace"
    :space="editingSpace!"
    @delete="deleteSpaceInternal"
    @close="closeDeleteSpace"/>
</template>

<style scoped>
.space-popup-add{display:flex;align-items:center;gap:8px;padding: 8px 10px;border-radius:8px;cursor:pointer;font-size:11px;font-weight:600;color:var(--accent);transition:background 0.12s;-webkit-tap-highlight-color:transparent}
.space-popup-add:hover{background:var(--accent-glow)}
.space-popup-add svg{width:13px;height:13px}
.space-popup-wrapper{justify-content: space-between;}
.space-popup-item-controls{display: flex;margin-right: -5px;}
</style>