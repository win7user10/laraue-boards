<script setup lang="ts">

import {useBoard} from "~/composables/boardState";

const props = defineProps<{
  statusId: number;
}>()

const board = useBoard();
const scrollableEl = ref(null);

useInfiniteScroll(scrollableEl, async () => {
  await board.loadNextCards(props.statusId);
}, {
  distance: 90,
  canLoadMore: () => board.state.value.messages
      .find(s => s.statusId === props.statusId)
      ?.items
      .hasNext ?? false
});
</script>

<template>
  <div class="col-drag-area" ref="scrollableEl">
    <slot></slot>
  </div>
</template>

<style scoped>

.col-drag-area { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 6px; min-height: 60px; -webkit-overflow-scrolling: touch; scrollbar-width: thin; scrollbar-color: var(--border) transparent; transition: background 0.15s; }
.col-drag-area::-webkit-scrollbar { width: 3px; }
.col-drag-area::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }
.col-drag-area.drag-over { background: var(--accent-glow); }

</style>