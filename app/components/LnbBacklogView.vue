<script setup lang="ts">
import type {MessageListDto} from "~/composables/messagesApi";
import LnbEmptyState from "~/components/LnbEmptyState.vue";
import LnbScrollArea from "~/components/LnbScrollArea.vue";
import {useBoard} from "~/composables/boardState";
import LnbView from "~/components/LnbView.vue";
import LnbSection from "~/components/LnbSection.vue";

const emits = defineEmits<{
  (e: 'openAssignToCategory', message: MessageListDto): void,
  (e: 'openDelete', message: MessageListDto): void,
  (e: 'openEdit', message: MessageListDto): void,
}>()

const { state, loadNextCards } = useBoard()

const backlog = computed(() => {
  return state.value.messages.length > 0
      ? state.value.messages[0]
      : undefined
})

const backlogMessagesResult = computed(() => {
  return backlog.value?.items
})

const searchString = computed(() => state.value.searchString)

const statusId = computed(() => backlog.value?.statusId);
const { t } = useI18n();
</script>

<template>
  <LnbView>
    <template v-if="backlogMessagesResult?.data.length === 0">
      <LnbEmptyState
          v-if="backlogMessagesResult?.data.length === 0"
          :title="t('backlogEmpty')"
          :subtitle="t('backlogEmptySubtitle')"/>
    </template>
    <template v-else-if="statusId">
      <LnbSection :title="t('unassignedTitle')">
        <LnbScrollArea
          :load-next="() => loadNextCards(statusId!)"
          :can-load-more="() => backlogMessagesResult?.hasNext ?? false">
          <LnbCard
              v-for="msg in backlogMessagesResult?.data"
              :deleteButton="!!state.currentEpic?.canDeleteIssues"
              :message="msg as any"
              :key="msg.id"
              :assignButton="!!state.currentEpic?.canUpdateIssues"
              :highlightText="searchString"
              @openDelete="emits('openDelete', $event)"
              @openAssignToCategory="emits('openAssignToCategory', $event)"
              @openEdit="emits('openEdit', $event)"
              :sender-color="msg.senderColor"/>
        </LnbScrollArea>
      </LnbSection>
    </template>
  </LnbView>
</template>

<style scoped>
</style>