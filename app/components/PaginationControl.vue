<template>
  <div
    v-if="page > 1 || hasNextPage"
    aria-label="Pagination"
    class="pagination"
    role="navigation">
    <button
      aria-label="Previous page"
      class="secondary"
      :disabled="page === 1"
      type="button"
      @click="$emit('update:page', page - 1)">
      <ChevronLeft />
    </button>
    <input
      aria-label="Page number"
      min="1"
      type="number"
      :value="page"
      @change="changePage" />
    <button
      aria-label="Next page"
      class="secondary"
      :disabled="!hasNextPage"
      type="button"
      @click="$emit('update:page', page + 1)">
      <ChevronRight />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

defineProps<{ hasNextPage: boolean; page: number }>()
const emit = defineEmits<{ 'update:page': [page: number] }>()
const changePage = (event: Event) =>
  emit(
    'update:page',
    Math.max(
      1,
      Math.trunc(Number((event.target as HTMLInputElement).value)) || 1,
    ),
  )
</script>

<style scoped>
.pagination {
  align-items: center;
  display: flex;
  gap: var(--space-2);
  justify-content: flex-end;
  margin-top: var(--space-4);
}

.pagination input {
  appearance: textfield;
  text-align: center;
  width: 64px;
}

.pagination input::-webkit-inner-spin-button,
.pagination input::-webkit-outer-spin-button {
  appearance: none;
  margin: 0;
}

@media (max-width: 760px) {
  .pagination {
    justify-content: center;
  }
}
</style>
