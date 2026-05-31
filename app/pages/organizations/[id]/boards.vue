<script setup lang="ts">

import LnbDeleteCardModal from "~/components/modals/LnbDeleteCardModal.vue";
import LnbMoveCardModal from "~/components/modals/LnbMoveCardModal.vue";
import LnbEditCardModal from "~/components/modals/LnbEditCardModal.vue";
import LnbEditCategoryModal from "~/components/modals/LnbEditCategoryModal.vue";
import LnbDeleteCategoryModal from "~/components/modals/LnbDeleteCategoryModal.vue";
import LnbIconBtn from "~/components/icons/LnbIconBtn.vue";
import LnbElementWithHelpLink from "~/components/modals/LnbElementWithHelpLink.vue";

const { editCard, deleteCard, editCategory, deleteCategory, state, dbMessagesCount, anySpaceAvailable, epicTabsAvailable, reloadEpics, currentSpace } = useBoard()
const { t } = useI18n()
const { getDocumentationLink } = useUtils()

const modal = reactive({
  editCard: false,
  assign: false,
  delete: false,
  search: false,
  editCategory: false,
  deleteCategory: false,
});

watch(() => currentSpace.value, async () => {
  await reloadEpics()
}, { immediate: true })

const openEditCard = (message: MessageListDto) => {
  assignMsg.value = message;
  modal.editCard = true;
}

const closeEditCard = () => {
  modal.editCard = false;
}

const editCardInternal = async (value: EditCardRequest) => {
  await editCard(assignMsg.value!.id, value);
  closeEditCard();
}

const assignMsg = ref<MessageListDto | undefined>(undefined);
const openAssignToCategory = (message: MessageListDto) => {
  assignMsg.value = message;
  modal.assign = true;
}

const closeAssignToCategory = () => {
  modal.assign = false;
}

const openDelete = (message: MessageListDto) => {
  assignMsg.value = message;
  modal.delete = true;
}

const closeDelete = () => {
  modal.delete = false;
}

const deleteCardInternal = async () => {
  await deleteCard(assignMsg.value!.id)
  closeDelete();
}


const openEditCategory = () => {
  modal.editCategory = true;
}

const closeEditCategory = () => {
  modal.editCategory = false;
}

const editCategoryInternal = async (request: EditCategoryRequest) => {
  await editCategory(request);
  closeEditCategory();
}

const openDeleteCategory = () => {
  modal.deleteCategory = true;
}

const closeDeleteCategory = () => {
  modal.deleteCategory = false;
}

const deleteCategoryInternal = async () => {
  await deleteCategory();
  closeDeleteCategory();
}

const isBacklog = computed(() => state.value.epics.find(c => state.value.epicId == c.id)?.isDefault);
const currentCategory = computed(() => state.value.currentEpic);
</script>

<template>

  <template v-if="state.epics.length > 0 && state.currentEpic?.canViewIssues">

    <LnbBoardHeader>
      <template v-if="currentCategory" #title>
        <LnbElementWithHelpLink
          :link-href="isBacklog ? getDocumentationLink('/working-alone/backlog') : getDocumentationLink('/concepts/epics')"
          :link-title="isBacklog ? t('learnAboutBacklog') : t('learnAboutEpics')">
          <span :style="`color:${currentCategory.color}`">●</span>
          {{ currentCategory.name }}
        </LnbElementWithHelpLink>
      </template>
      <template #subtitle>
        {{ dbMessagesCount }} {{ t('cards', dbMessagesCount) }}
      </template>
      <template #actions>
        <LnbIconBtn
            v-if="currentCategory?.canUpdate"
            :title="t('editBoard')"
            btnSize="medium"
            iconSize="medium"
            icon="edit"
            @click="openEditCategory" />
        <LnbIconBtn
            v-if="currentCategory?.canDelete"
            type="danger"
            btnSize="medium"
            iconSize="medium"
            :title="t('deleteBoard')"
            icon="delete"
            @click="openDeleteCategory" />
      </template>
    </LnbBoardHeader>

    <template v-if="isBacklog">
      <LnbBacklogView
          @openAssignToCategory="openAssignToCategory"
          @openEdit="openEditCard"
          @openDelete="openDelete" />
    </template>
    <template v-else>
      <LnbBoardView
          @openAssignToCategory="openAssignToCategory"
          @openEdit="openEditCard"
          @openDelete="openDelete"/>
    </template>
  </template>

  <template v-if="!anySpaceAvailable">
    <LnbEmptyState
        :title="t('noAvailableSpaces')"
        :subtitle="t('contactAdminForPermissions')"/>
  </template>

  <template v-if="anySpaceAvailable && !epicTabsAvailable">
    <LnbEmptyState
        :title="t('noAvailableEpicsInSpace')"
        :subtitle="t('contactAdminForPermissions')"/>
  </template>

  <template v-if="anySpaceAvailable && epicTabsAvailable && !state.currentEpic?.canViewIssues">
    <LnbEmptyState
        :title="t('issuesNotAvailableForView')"
        :subtitle="t('contactAdminForPermissions')"/>
  </template>

  <LnbMoveCardModal
      :assign-msg="assignMsg as any"
      @close="closeAssignToCategory"
      v-if="modal.assign" />

  <LnbDeleteCardModal
      @close="closeDelete"
      @delete="deleteCardInternal"
      v-if="modal.delete"/>

  <LnbEditCardModal
      :id="assignMsg!.id"
      :hide-status="(currentCategory?.statuses?.length ?? 0) < 2"
      @edit="editCardInternal"
      @close="closeEditCard"
      :allowEdit="!!currentCategory?.canUpdateIssues"
      v-if="modal.editCard"/>

  <LnbEditCategoryModal
      @close="closeEditCategory"
      @edit="editCategoryInternal"
      v-if="modal.editCategory"/>

  <LnbDeleteCategoryModal
      @close="closeDeleteCategory"
      @delete="deleteCategoryInternal"
      v-if="modal.deleteCategory"/>

</template>

<style scoped>

</style>