<template>
  <NuxtLink
    class="issue-list-row"
    :to="to">
    <div class="issue-list-row-top">
      <label
        v-if="canMove"
        class="row-select-target"
        @click.stop>
        <input
          aria-label="Select issue"
          :checked="selected"
          class="row-select"
          type="checkbox"
          @change="props.onToggleSelection" />
      </label>
      <span class="issue-key">{{ issueKey }}</span>
      <span
        class="issue-location"
        :title="spaceName ? `${spaceName} / ${boardName}` : boardName">
        <span
          v-if="spaceName"
          class="issue-location-part">
          <SpaceIcon :style="{ color: spaceColor }" />
          <span class="truncate">{{ spaceName }}</span>
        </span>
        <span v-if="spaceName">/</span>
        <span class="issue-location-part">
          <BoardIcon :style="{ color: boardColor }" />
          <span class="truncate">{{ boardName }}</span>
        </span>
      </span>
      <span
        class="status-pill"
        :title="status">
        <i
          class="dot"
          :style="{ background: statusColor }" />
        <span class="truncate">{{ status }}</span>
      </span>
      <button
        v-if="canMove"
        aria-label="Move to board"
        class="icon-btn row-move"
        title="Move to board"
        type="button"
        @click.stop.prevent="props.onMove">
        <ArrowRightLeft />
      </button>
    </div>
    <div class="issue-list-row-content">
      <p class="issue-content">{{ content }}</p>
      <span
        class="issue-person"
        :title="assignee">
        <span
          class="avatar"
          :style="{ background: assigneeColor }">
          {{ assigneeInitial }}
        </span>
        <span class="truncate">{{ assignee }}</span>
      </span>
    </div>
  </NuxtLink>
</template>

<script lang="ts">
import type { RouteLocationRaw } from 'vue-router'

type IssueListRowProps = {
  assignee: string
  assigneeColor: string
  assigneeInitial: string
  boardColor: string
  boardName: string
  canMove: boolean
  content: string
  issueKey: string
  onMove: () => void
  onToggleSelection: () => void
  selected: boolean
  spaceColor?: string
  spaceName?: string
  status: string
  statusColor: string
  to: RouteLocationRaw
}
</script>

<script setup lang="ts">
import { ArrowRightLeft } from 'lucide-vue-next'

import { BoardIcon, SpaceIcon } from '~/constants/icons'

const props = defineProps<IssueListRowProps>()
</script>

<style scoped>
.issue-list-row {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  color: var(--color-text);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  min-width: 0;
  padding: var(--space-3) var(--space-4);
  text-decoration: none;
  transition: var(--transition-press);
}

.issue-list-row:hover {
  border-color: var(--color-accent);
}

.issue-list-row:has(.row-select:checked) {
  background: color-mix(
    in srgb,
    var(--color-accent-soft) 55%,
    var(--color-surface)
  );
  border-color: color-mix(
    in srgb,
    var(--color-accent) 45%,
    var(--color-border)
  );
}

.issue-list-row:active {
  translate: 0 var(--press-offset);
}

.issue-list-row-top {
  align-items: center;
  color: var(--color-muted);
  display: flex;
  font-size: var(--font-size-small);
  gap: var(--space-3);
}

.row-select-target {
  align-items: center;
  cursor: pointer;
  display: inline-flex;
  flex-shrink: 0;
  height: var(--control-height-compact);
  justify-content: center;
  margin: -9px;
  width: var(--control-height-compact);
}

.row-move,
.issue-key {
  flex-shrink: 0;
}

.issue-list-row-content {
  align-items: flex-start;
  display: flex;
  gap: var(--space-3);
  min-width: 0;
}

.issue-content {
  -webkit-box-orient: vertical;
  display: -webkit-box;
  flex: 1;
  font-weight: var(--font-weight-semibold);
  -webkit-line-clamp: 1;
  line-height: 1.4;
  margin: 0;
  min-width: 0;
  overflow: hidden;
}

.truncate {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.issue-location,
.issue-location-part {
  align-items: center;
  display: inline-flex;
  min-width: 0;
}

.issue-location {
  flex: 1;
  gap: 6px;
}

.issue-location-part {
  gap: var(--space-1);
}

.issue-location .lucide {
  height: 13px;
  width: 13px;
}

.issue-person {
  align-items: center;
  color: var(--color-muted);
  display: inline-flex;
  flex-shrink: 0;
  font-size: var(--font-size-small);
  gap: var(--space-2);
  min-width: 0;
}

.issue-person .avatar {
  font-size: 10px;
  height: 20px;
  width: 20px;
}

.status-pill {
  align-items: center;
  background: var(--color-soft);
  border-radius: var(--radius-pill);
  color: var(--color-muted);
  display: inline-flex;
  flex-shrink: 0;
  font-size: var(--font-size-caption);
  font-weight: var(--font-weight-semibold);
  gap: 5px;
  max-width: 160px;
  padding: 2px var(--space-2);
  white-space: nowrap;
}

@media (max-width: 500px) {
  .issue-list-row-top {
    flex-wrap: wrap;
  }

  .issue-location {
    flex-basis: 100%;
    order: 1;
  }

  .status-pill {
    flex-shrink: 1;
    margin-left: auto;
    min-width: 0;
  }

  .issue-person {
    max-width: 40%;
  }
}
</style>
