<template>
  <select
    v-bind="$attrs"
    v-model="model"
    :aria-busy="state.loading"
    :disabled="disabled || !boardId"
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
      Loading statuses…
    </option>
    <option
      v-else-if="state.loaded && visibleOptions.length === 0"
      disabled
      value="__empty">
      No statuses available
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
</template>

<script setup lang="ts">
import type { StatusSelectDeps, StatusSelectOption } from './deps'

const props = withDefaults(
  defineProps<{
    boardId: string
    deps: StatusSelectDeps
    disabled?: boolean
    initialOption?: StatusSelectOption
    placeholder?: string
  }>(),
  {
    disabled: false,
    initialOption: undefined,
    placeholder: 'Select status',
  },
)

defineOptions({ inheritAttrs: false })

const model = defineModel<string>({ required: true })

const state = reactive({
  error: null as null | string,
  loaded: false,
  loading: false,
  options: [] as StatusSelectOption[],
})

const cache = new Map<string, StatusSelectOption[]>()
let loadRequest = 0

const visibleOptions = computed(() => {
  const initial = props.initialOption
  return initial &&
    initial.value === model.value &&
    !state.options.some((option) => option.value === initial.value)
    ? [initial, ...state.options]
    : state.options
})

const load = async () => {
  if (!props.boardId || state.loading) {
    return
  }
  const cached = cache.get(props.boardId)
  if (cached) {
    state.error = null
    state.options = cached
    state.loaded = true
    return
  }

  const boardId = props.boardId
  const requestId = ++loadRequest
  state.error = null
  state.loading = true
  const result = await props.deps.loadStatuses({ boardId })
  if (result.ok) {
    cache.set(boardId, result.value)
  }
  if (requestId !== loadRequest) {
    return
  }

  state.loading = false
  state.loaded = true
  if (!result.ok) {
    state.error = 'Could not load statuses.'
    return
  }

  state.options = result.value
}

watch(
  () => props.boardId,
  () => {
    loadRequest++
    state.error = null
    state.loaded = cache.has(props.boardId)
    state.loading = false
    state.options = cache.get(props.boardId) ?? []
    model.value = ''
  },
)
</script>
