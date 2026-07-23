<template>
  <div class="assignee-select">
    <span
      class="avatar"
      :style="{ background: selectedOption.color }">
      {{ selectedOption.initials }}
    </span>
    <select
      v-bind="$attrs"
      v-model="model"
      :aria-busy="state.loading"
      :disabled="disabled || !spaceId"
      @focus="load">
      <option
        disabled
        value="">
        {{ placeholder }}
      </option>
      <option
        v-if="state.loading"
        disabled
        value="__loading">
        Loading assignees…
      </option>
      <option
        v-else-if="state.loaded && visibleOptions.length === 0"
        disabled
        value="__empty">
        No assignees available
      </option>
      <option
        v-for="option in visibleOptions"
        :key="option.value"
        :value="option.value">
        {{ option.label }}
      </option>
    </select>
    <p
      v-if="state.error"
      class="form-error">
      {{ state.error }}
    </p>
  </div>
</template>

<script setup lang="ts">
import type { AssigneeSelectDeps, AssigneeSelectOption } from './deps'

const props = withDefaults(
  defineProps<{
    deps: AssigneeSelectDeps
    disabled?: boolean
    initialOption?: AssigneeSelectOption
    placeholder?: string
    spaceId: string
  }>(),
  {
    disabled: false,
    initialOption: undefined,
    placeholder: 'Select assignee',
  },
)

defineOptions({ inheritAttrs: false })

const model = defineModel<string>({ required: true })

const state = reactive({
  error: null as null | string,
  loaded: false,
  loading: false,
  options: [] as AssigneeSelectOption[],
})

const cache = new Map<string, AssigneeSelectOption[]>()

let loadRequest = 0

const visibleOptions = computed(() => {
  const initial = props.initialOption
  return initial &&
    initial.value === model.value &&
    !state.options.some((option) => option.value === initial.value)
    ? [initial, ...state.options]
    : state.options
})

const selectedOption = computed(
  () =>
    visibleOptions.value.find((option) => option.value === model.value) ?? {
      color: 'var(--color-muted)',
      initials: '?',
    },
)

const load = async () => {
  if (!props.spaceId || state.loading) {
    return
  }
  const cached = cache.get(props.spaceId)
  if (cached) {
    state.error = null
    state.options = cached
    state.loaded = true
    return
  }

  const spaceId = props.spaceId
  const requestId = ++loadRequest
  state.error = null
  state.loading = true
  const result = await props.deps.loadAssignees({ spaceId })
  if (result.ok) {
    cache.set(spaceId, result.value)
  }
  if (requestId !== loadRequest) {
    return
  }

  state.loading = false
  state.loaded = true
  if (!result.ok) {
    state.error = 'Could not load assignees.'
    return
  }

  state.options = result.value
}

watch(
  () => props.spaceId,
  () => {
    loadRequest++
    state.error = null
    state.loaded = cache.has(props.spaceId)
    state.loading = false
    state.options = cache.get(props.spaceId) ?? []
    model.value = ''
  },
)
</script>

<style scoped>
.assignee-select {
  align-items: center;
  display: grid;
  gap: var(--space-2);
  grid-template-columns: auto minmax(0, 1fr);
  min-height: var(--control-height);
}

.avatar {
  font-size: var(--font-size-caption);
  height: 28px;
  width: 28px;
}

.form-error {
  grid-column: 1 / -1;
}
</style>
