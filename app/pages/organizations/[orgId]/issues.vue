<script setup lang="ts">
const { t } = useI18n()
import LnbElementWithHelpLink from "~/components/modals/LnbElementWithHelpLink.vue";
import LnbScrollArea from "~/components/LnbScrollArea.vue";
import LnbSection from "~/components/LnbSection.vue";

const { currentSpace } = useBoard()
const { searchMessages } = useMessagesApi();

const request = ref({
  searchString: '',
  epicId: null as null | number,
})

const pagination = ref(DefaultPagination);
const searchResults = ref<FullPaginatedResult<MessageListDto>>()

const isLoading = ref(true)
const loadMore = async () => {
  if (!searchResults?.value?.hasNextPage || isLoading.value)
    return;
  try {
    isLoading.value = true;
    const item = searchResults.value!;
    const newMessages = await searchMessages({
      searchString: request.value.searchString,
      epicId: request.value.epicId,
      perPage: searchResults.value!.perPage,
      page: searchResults.value!.page + 1,
      spaceId: currentSpace.value!.id
    })
    item.data.push(...newMessages.data);
    item.page = newMessages.page;
    item.hasNextPage = newMessages.hasNextPage
  } finally {
    isLoading.value = false;
  }
}

const currentSpaceId = computed(() => currentSpace.value?.id)
const fetchSearchResults = async () => {
  isLoading.value = true;
  try {
    searchResults.value = await searchMessages({
      epicId: request.value.epicId,
      searchString: request.value.searchString,
      page: pagination.value.page,
      perPage: pagination.value.perPage,
      spaceId: currentSpace.value!.id
    });
  } finally {
    isLoading.value = false;
  }
}

watch(currentSpaceId, async (newValue) => {
  if (newValue)
    await fetchSearchResults();
}, { immediate: true })

watch(request, async () => {
  if (currentSpaceId.value)
    await fetchSearchResults();
}, { deep: true })

</script>

<template>
  <LnbBoardHeader>
    <template #title>
      <LnbElementWithHelpLink link-href="asd" link-title="asd">
        All Issues
      </LnbElementWithHelpLink>
    </template>
    <template #subtitle>
      55 issues across 1 epics
    </template>
  </LnbBoardHeader>
  <LnbView>
    <LnbSection :title="t('search')">
      <LnbScrollArea
          :load-next="() => loadMore()"
          :can-load-more="() => searchResults?.hasNextPage ?? false">
        <template v-if="searchResults?.data">
          <LnbCard
              v-for="searchResult in searchResults.data"
              :deleteButton="false"
              :assignButton="false"
              :highlightText="request.searchString"
              :message="searchResult"/>
        </template>
      </LnbScrollArea>
    </LnbSection>
  </LnbView>
</template>

<style scoped>

</style>