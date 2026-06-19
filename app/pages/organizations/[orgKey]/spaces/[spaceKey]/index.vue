<script setup lang="ts">
import { type CategorySummary, useMessagesApi } from "~/composables/messagesApi";

const summaries = ref<CategorySummary[]>([]);
const { getBoardSummary } = useMessagesApi();
const { currentSpace, getOrganizationKey } = useBoard();
const { appState } = useAppState();
const { sortEpics } = useUtils();

watch(
    () => currentSpace.value,
    async (newValue) => {
      if (newValue) {
        summaries.value = await getBoardSummary(currentSpace.value!.id);
      }
    },
    { immediate: true }
);

const { t } = useI18n();

const getToDo = (summary: CategorySummary) => {
  if (summary.columns.length === 1) return 0;
  return summary.columns
      .slice(0, -1)
      .flatMap((x) => x.count)
      .reduce((acc, x) => acc + x, 0);
};

const getTotal = (summary: CategorySummary) => {
  return summary.columns
      .flatMap((x) => x.count)
      .reduce((acc, x) => acc + x, 0);
};

const getPercent = (summary: CategorySummary) => {
  const total = getTotal(summary);
  if (total === 0) return 0;
  return ((total - getToDo(summary)) / total) * 100;
};

const getEpicUrl = (epicId: number) => {
  const key = getOrganizationKey();
  return `/organizations/${key}/spaces/${currentSpace.value!.key}/${epicId}`;
};

const getRingSegments = (
    columns: { percent: number; color: string }[],
    radius = 19
) => {
  const circumference = 2 * Math.PI * radius;
  let accumulated = 0;
  return columns
      .filter((c) => c.percent > 0)
      .map((c) => {
        const dashLength = (c.percent / 100) * circumference;
        const segment = {
          color: c.color,
          dashArray: `${dashLength} ${circumference - dashLength}`,
          // Negative accumulated length shifts this segment clockwise
          // so it starts exactly where the previous segment ended.
          dashOffset: -accumulated,
        };
        accumulated += dashLength;
        return segment;
      });
};

const computedSummaries = computed(() => {
  const categoryOrder = appState.value.user?.preferences.epicSortOrder;
  const sorted = sortEpics(summaries.value, categoryOrder);
  return sorted.map((x) => {
    const total = getTotal(x);
    const columns = x.columns.map((y) => ({
      color: y.color,
      count: y.count,
      name: y.name,
      percent: total > 0 ? (y.count / total) * 100 : 0,
    }));
    return {
      id: x.id,
      name: x.name,
      color: x.color,
      todo: getToDo(x),
      total,
      percent: getPercent(x),
      columns,
      ring: getRingSegments(columns),
    };
  });
});
</script>

<template>
  <template v-if="currentSpace?.id">
    <LnbBoardHeader>
      <template #title>
        {{ t("stats") }}
      </template>
    </LnbBoardHeader>
    <LnbView v-if="computedSummaries.length > 0">
      <LnbSection :title="t('boardsOverview')">
        <div class="board-summary-grid">
          <router-link
              v-for="s in computedSummaries"
              :key="s.id"
              class="board-summary-card"
              :style="`--card-color:${s.color}`"
              :to="getEpicUrl(s.id)"
          >
            <!-- Card header: title + total count -->
            <div class="bsc-header">
              <div class="bsc-name">{{ s.name }}</div>
              <div class="bsc-progress-label">
                {{ s.total }} {{ t("cards", s.total) }}
              </div>
            </div>

            <!-- Body: donut ring + legend -->
            <div class="bsc-body">
              <!--
                SVG donut ring
                - r=19 so stroke (width 5) stays inside the 48px viewBox
                  with a clean 1.5px gap from the edge on each side
                - rotate(-90) starts segments at 12 o'clock
                - dominant-baseline="central" + y="24" perfectly centres text
              -->
              <svg
                  class="bsc-ring"
                  viewBox="0 0 48 48"
                  width="52"
                  height="52"
                  aria-hidden="true"
              >
                <!-- Background track -->
                <circle
                    cx="24"
                    cy="24"
                    r="19"
                    fill="none"
                    stroke="var(--border)"
                    stroke-width="5"
                />
                <!-- Colored segments -->
                <circle
                    v-for="(seg, i) in s.ring"
                    :key="i"
                    cx="24"
                    cy="24"
                    r="19"
                    fill="none"
                    :stroke="seg.color"
                    stroke-width="5"
                    stroke-linecap="butt"
                    :stroke-dasharray="seg.dashArray"
                    :stroke-dashoffset="seg.dashOffset"
                    transform="rotate(-90 24 24)"
                />
                <!-- Centre percentage -->
                <text
                    x="24"
                    y="24"
                    text-anchor="middle"
                    dominant-baseline="central"
                    font-size="9"
                    fill="var(--text)"
                    font-family="'JetBrains Mono', monospace"
                    font-weight="600"
                >{{ Math.round(s.percent) }}%</text>
              </svg>

              <!-- Legend -->
              <div class="bsc-legend">
                <div
                    v-for="(c, i) in s.columns"
                    :key="c.name"
                    class="bsc-stat"
                >
                  <span
                      class="bsc-stat-dot"
                      :style="{ background: c.color }"
                  ></span>
                  <!--
                    Last column is always the "to-do / remaining" bucket.
                    Use a muted text color there so completed stages stand out.
                  -->
                  <span
                      :style="{
                        color: i === s.columns.length - 1
                          ? 'var(--text3)'
                          : c.color,
                      }"
                  >{{ c.count }} {{ c.name }}</span>
                </div>
              </div>
            </div>
          </router-link>
        </div>
      </LnbSection>
    </LnbView>
    <LnbEmptyState
        v-else
        title="Result is empty"
        subtitle="No epics to show here"
    />
  </template>
  <template v-else>
    <LnbEmptyState
        title="Oops. Space is not found"
        subtitle="It can be deleted or never exists. Or you don't have permissions."
    />
  </template>
</template>

<style scoped>
/* ── Grid ────────────────────────────────────────────────────────────── */
.board-summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 10px;
  margin-bottom: 4px;
}

@media (min-width: 1280px) {
  .board-summary-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* ── Card ─────────────────────────────────────────────────────────────── */
.board-summary-card {
  background: var(--surface);
  /* Thinner border reads more refined than 1px */
  border: 0.5px solid var(--border);
  border-radius: var(--radius);
  padding: 12px 14px;
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s;
  position: relative;
  overflow: hidden;
  -webkit-tap-highlight-color: transparent;
  text-decoration: none;
  display: block;
}

/* Left accent stripe in the epic's own color */
.board-summary-card::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: var(--card-color, var(--accent));
  border-radius: 3px 0 0 3px;
}

.board-summary-card:hover {
  border-color: var(--border2);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
}

/* ── Card header ──────────────────────────────────────────────────────── */
.bsc-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 10px;
}

.bsc-name {
  font-size: 12px;
  font-weight: 600;
  color: var(--text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}

.bsc-progress-label {
  font-size: 10px;
  color: var(--text3);
  font-family: "JetBrains Mono", monospace;
  white-space: nowrap;
  flex-shrink: 0;
}

/* ── Card body: ring + legend ─────────────────────────────────────────── */
.bsc-body {
  display: flex;
  align-items: center;
  gap: 14px;
}

.bsc-ring {
  flex-shrink: 0;
}

.bsc-legend {
  display: flex;
  flex-direction: column;
  gap: 3px;
  flex: 1;
  min-width: 0;
}

.bsc-stat {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-weight: 500;
  white-space: nowrap;
}

.bsc-stat-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}
</style>