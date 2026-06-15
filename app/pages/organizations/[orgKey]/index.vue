<script setup lang="ts">
import type {SearchIssueDto} from "~/composables/messagesApi";

const { t } = useI18n()
import LnbScrollArea from "~/components/LnbScrollArea.vue";
import LnbSection from "~/components/LnbSection.vue";
import type {IssueEdited} from "~/composables/boardState";
import LnbFilters from "~/components/LnbFilters.vue";

const { state } = useBoard()
const { searchMessages } = useMessagesApi();

const request = ref({
  searchString: '',
  epicIds: [] as Array<number>,
  spaceIds: [] as Array<number>,
  filters: {} as { [key: string]: any },
})

const pagination = ref(DefaultPagination);
const searchResults = ref<ShortPaginatedResult<SearchIssueDto>>()

const isLoading = ref(true)
const loadMore = async () => {
  if (!searchResults?.value?.hasNextPage || isLoading.value)
    return;
  try {
    isLoading.value = true;
    const item = searchResults.value!;
    const newMessages = await searchMessages({
      searchString: request.value.searchString,
      epicIds: request.value.epicIds,
      perPage: searchResults.value!.perPage,
      page: searchResults.value!.page + 1,
      spaceIds: request.value.spaceIds,
      filters: request.value.filters,
    })
    item.data.push(...newMessages.data);
    item.page = newMessages.page;
    item.hasNextPage = newMessages.hasNextPage
  } finally {
    isLoading.value = false;
  }
}

const fetchSearchResults = async () => {
  isLoading.value = true;
  try {
    searchResults.value = await searchMessages({
      epicIds: request.value.epicIds,
      searchString: request.value.searchString,
      page: pagination.value.page,
      perPage: pagination.value.perPage,
      spaceIds: request.value.spaceIds,
      filters: request.value.filters,
    });
  } finally {
    isLoading.value = false;
  }
}

onMounted(async () => {
  await fetchSearchResults();
})

watch(request, async () => {
  await fetchSearchResults();
}, { deep: true })

const updateIssue = (source: SearchIssueDto, value: IssueEdited) => {
  source.content = value.content;
  source.attributes = value.attributes;
}

</script>

<template>
  <LnbBoardHeader>
    <template #title>
      {{ t('homeTitle') }}
    </template>
    <template #actions>
      <LnbBoardSearch v-model="request.searchString" />
    </template>
  </LnbBoardHeader>
  <LnbView>
    <LnbSection>

      <div class="filters">
        <LnbFilterSelectPill
            :options="state.spaces"
            :label="t('space')"
            :no-filter-title="t('allSpaces')"
            v-model="request.spaceIds"/>

        <LnbFilters v-model="request.filters"/>
      </div>

      <LnbScrollArea v-if="(searchResults?.data.length ?? 0) > 0"
        :load-next="() => loadMore()"
        :can-load-more="() => searchResults?.hasNextPage ?? false">
        <LnbCard
          v-for="searchResult in searchResults!.data"
          navigateToEpicButton
          :highlightText="request.searchString"
          :message="searchResult"
          @update="updateIssue(searchResult, $event)">
          <template #footer>
            <LnbCardTag :color="searchResult.space.color">
              {{ searchResult.space.name }}
            </LnbCardTag>
            <LnbCardTag :color="searchResult.epic.color">
              {{ searchResult.epic.name }}
            </LnbCardTag>
            <LnbCardTag v-if="searchResult.status" :color="searchResult.status.color">
              {{ searchResult.status.name }}
            </LnbCardTag>
          </template>
        </LnbCard>
      </LnbScrollArea>

      <LnbEmptyState v-else
        :title="t('noSearchResults')"
        subtitle="Try to change filters to see results"/>

    </LnbSection>
  </LnbView>
</template>

<style scoped>
.filters { display: flex; gap: 10px; margin-bottom: 8px; }
</style>