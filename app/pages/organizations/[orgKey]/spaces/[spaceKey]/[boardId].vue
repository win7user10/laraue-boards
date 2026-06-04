<script setup lang="ts">

import LnbEditCategoryModal from "~/components/modals/LnbEditCategoryModal.vue";
import LnbDeleteCategoryModal from "~/components/modals/LnbDeleteCategoryModal.vue";
import LnbIconBtn from "~/components/icons/LnbIconBtn.vue";
import LnbElementWithHelpLink from "~/components/modals/LnbElementWithHelpLink.vue";
import LnbCreateCardModal from "~/components/modals/LnbCreateCardModal.vue";

const { editCategory, deleteCategory, state, dbMessagesCount, reloadEpics, currentSpace, trySetCategory, isLoading, search, createCard } = useBoard()
const { t } = useI18n()
const { getDocumentationLink } = useUtils()
const { params } = useRoute()

const modal = reactive({
  search: false,
  editCategory: false,
  deleteCategory: false,
  createIssue: false,
});

const getEpicId = () => {
  return Number.parseInt(params.boardId as string);
}

const epicNotFound = ref(false)

watch(() => currentSpace.value, async () => {
  await reloadEpics()
  epicNotFound.value = !trySetCategory(getEpicId())
}, { immediate: true })

const openEditCategory = () => {
  modal.editCategory = true;
}

const closeEditCategory = () => {
  modal.editCategory = false;
}

const openCreateIssue = () => {
  modal.createIssue = true;
}

const closeCreateIssue = () => {
  modal.createIssue = false;
}

const createIssueInternal = async (request: CreateCardRequest) => {
  await createCard(request);
  closeCreateIssue();
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

const showSearch = computed(() => searchString.value || dbMessagesCount.value > 0 || isLoading.value)
const searchString = ref('')

const searchInternal = async (value: string) => {
  searchString.value = value
  await search(value);
}
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
        <LnbBoardSearch
          v-if="showSearch"
          @update:modelValue="searchInternal($event)"
          :modelValue="searchString"/>
        <LnbIconBtn
          v-if="currentCategory?.canUpdate"
          :title="t('editBoard')"
          btnSize="medium"
          iconSize="medium"
          icon="edit"
          @click="openEditCategory" />
        <LnbIconBtn
          v-if="currentCategory?.canCreateIssues && isBacklog"
          :title="t('createCard')"
          btnSize="medium"
          iconSize="medium"
          icon="add"
          @click="openCreateIssue" />
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
      <LnbBacklogView />
    </template>
    <template v-else>
      <LnbBoardView />
    </template>
  </template>

  <template v-if="epicNotFound">
    <LnbEmptyState
        title="Oops! The board is not exists or not accessible"
        subtitle="Use navigation to move to available boards or contact your admin to get the permissions"/>
  </template>

  <LnbEditCategoryModal
    @close="closeEditCategory"
    @edit="editCategoryInternal"
    v-if="modal.editCategory"/>

  <LnbDeleteCategoryModal
    @close="closeDeleteCategory"
    @delete="deleteCategoryInternal"
    v-if="modal.deleteCategory"/>

  <LnbCreateCardModal
    @close="closeCreateIssue"
    @create="createIssueInternal"
    :status-id="currentCategory!.statuses[0]!.id"
    v-if="modal.createIssue"/>

</template>

<style scoped>

</style>