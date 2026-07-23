<template>
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
      Loading boards…
    </option>
    <option
      v-else-if="state.loaded && visibleOptions.length === 0"
      disabled
      value="__empty">
      No boards available
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
import type { BoardSelectDeps, BoardSelectOption } from './deps'

const props = withDefaults(
  defineProps<{
    deps: BoardSelectDeps
    disabled?: boolean
    initialOption?: BoardSelectOption
    placeholder?: string
    spaceId: string
  }>(),
  {
    disabled: false,
    initialOption: undefined,
    placeholder: 'Select board',
  },
)

defineOptions({ inheritAttrs: false })

const model = defineModel<string>({ required: true })

const state = reactive({
  error: null as null | string,
  loaded: false,
  loading: false,
  options: [] as BoardSelectOption[],
})

const cache = new Map<string, BoardSelectOption[]>()

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
  const result = await props.deps.loadBoards({ spaceId })
  if (result.ok) {
    cache.set(spaceId, result.value)
  }
  if (requestId !== loadRequest) {
    return
  }

  state.loading = false
  state.loaded = true
  if (!result.ok) {
    state.error = 'Could not load boards.'
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
