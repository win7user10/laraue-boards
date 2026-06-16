<script setup lang="ts">
import {type CategorySummary, useMessagesApi} from "~/composables/messagesApi";
const summaries = ref<CategorySummary[]>([]);
const { getBoardSummary } = useMessagesApi()

const { currentSpace, getOrganizationKey } = useBoard();
const { appState } = useAppState();
const { sortEpics } = useUtils();

watch(() => currentSpace.value, async (newValue) => {
  if (newValue)
    summaries.value = await getBoardSummary(currentSpace.value!.id);
}, { immediate: true })

const { t } = useI18n()

const getToDo = (summary: CategorySummary) => {
  if (summary.columns.length == 1)
    return 0;
  return summary.columns.slice(0, -1)
      .flatMap(x => x.count)
      .reduce((acc, x) => acc + x, 0);
}

const getTotal = (summary: CategorySummary) => {
  return summary.columns
      .flatMap(x => x.count)
      .reduce((acc, x) => acc + x, 0);
}

const getPercent = (summary: CategorySummary) => {
  const total = getTotal(summary);
  return (total - getToDo(summary)) / total * 100;
}

const getEpicUrl = (epicId: number) => {
  const key = getOrganizationKey()
  return `/organizations/${key}/spaces/${currentSpace.value!.key}/${epicId}`
}

const computedSummaries = computed(() => {
  const categoryOrder = appState.value.user?.preferences.epicSortOrder;
  const sorted = sortEpics(summaries.value, categoryOrder)
  return sorted
      .map((x) => {
        return {
          id: x.id,
          name: x.name,
          color: x.color,
          todo: getToDo(x),
          total: getTotal(x),
          percent: getPercent(x),
          columns: x.columns.map(y => {
            return {
              color: y.color,
              count: y.count,
              name: y.name,
              percent: y.count / getTotal(x) * 100
            }
          })
        }
      })
})

</script>

<template>
  <template v-if="currentSpace?.id">
    <LnbBoardHeader>
      <template #title>
        {{ t('stats') }}
      </template>
    </LnbBoardHeader>
    <LnbView v-if="computedSummaries.length > 0">
      <LnbSection :title="t('boardsOverview')"><div class="board-summary-grid">
        <router-link
            v-for="s in computedSummaries"
            :key="s.id"
            class="board-summary-card"
            :style="`--card-color:${s.color}`"
            :to="getEpicUrl(s.id)">
          <div class="bsc-name">{{s.name}}</div>
          <div class="bsc-progress-wrap">
            <div class="bsc-progress-label">{{ s.total }} {{ t('cards', s.total) }}</div>
          </div>
          <div class="bsc-stats">
            <div class="bsc-stat" v-for="c in s.columns">
              <div class="bsc-stat-dot" :style="`background:${c.color}`"></div>
              <span :style="`color:${c.color}`">{{ c.count }} {{ c.name }}</span>
            </div>
          </div>
        </router-link>
      </div>
      </LnbSection>
    </LnbView>
    <LnbEmptyState v-else title="Result is empty" subtitle="No epics to show here"/>
  </template>
  <template v-else>
    <LnbEmptyState title="Oops. Space is not found" subtitle="It can be deleted or never exists. Or you don't have permissions."/>
  </template>
</template>

<style scoped>
/* BOARD SUMMARY CARDS (backlog dashboard) */
.board-summary-grid{display:grid;grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));gap:10px;margin-bottom:4px}
.board-summary-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:12px;cursor:pointer;transition:border-color 0.15s,box-shadow 0.15s;position:relative;overflow:hidden;-webkit-tap-highlight-color:transparent;text-decoration: none;}
.board-summary-card::before{content:'';position:absolute;left:0;top:0;bottom:0;width:3px;background:var(--card-color,var(--accent));border-radius:3px 0 0 3px}
.board-summary-card:hover{border-color:var(--border2);box-shadow:0 2px 12px rgba(0,0,0,0.3)}
.bsc-name{font-size:12px;font-weight:700;color:var(--text);margin-bottom:8px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.bsc-progress-wrap{margin-bottom:6px}
.bsc-progress-label{font-size:10px;color:var(--text3);font-family:'JetBrains Mono',monospace}
.bsc-stats{display:flex;gap:6px;flex-wrap:wrap}
.bsc-stat{display:flex;align-items:center;gap:3px;font-size:10px;font-weight:600}
.bsc-stat-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0}
@media (min-width: 1280px) {
  .board-summary-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>