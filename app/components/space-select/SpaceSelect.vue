<template>
  <select
    v-bind="$attrs"
    v-model="model"
    :aria-busy="state.loading"
    :disabled="disabled"
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
      Loading spaces…
    </option>
    <option
      v-else-if="state.loaded && visibleOptions.length === 0"
      disabled
      value="__empty">
      No spaces available
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
import type { SpaceSelectDeps, SpaceSelectOption } from './deps'

const props = withDefaults(
  defineProps<{
    deps: SpaceSelectDeps
    disabled?: boolean
    initialOption?: SpaceSelectOption
    organizationId?: string
    placeholder?: string
  }>(),
  {
    disabled: false,
    initialOption: undefined,
    organizationId: undefined,
    placeholder: 'Select space',
  },
)

defineOptions({ inheritAttrs: false })

const model = defineModel<string>({ required: true })

const state = reactive({
  error: null as null | string,
  loaded: false,
  loading: false,
  options: [] as SpaceSelectOption[],
})

const cache = new Map<string, SpaceSelectOption[]>()

let loadRequest = 0

const cacheKey = computed(() => props.organizationId ?? '')

const visibleOptions = computed(() => {
  const initial = props.initialOption
  return initial &&
    initial.value === model.value &&
    !state.options.some((option) => option.value === initial.value)
    ? [initial, ...state.options]
    : state.options
})

const load = async () => {
  if (state.loading) {
    return
  }
  const cached = cache.get(cacheKey.value)
  if (cached) {
    state.error = null
    state.options = cached
    state.loaded = true
    return
  }

  const key = cacheKey.value
  const organizationId = props.organizationId
  const requestId = ++loadRequest
  state.error = null
  state.loading = true
  const result = await props.deps.loadSpaces({
    organizationId,
  })
  if (result.ok) {
    cache.set(key, result.value)
  }
  if (requestId !== loadRequest) {
    return
  }

  state.loading = false
  state.loaded = true
  if (!result.ok) {
    state.error = 'Could not load spaces.'
    return
  }

  state.options = result.value
}

watch(
  () => props.organizationId,
  () => {
    loadRequest++
    state.error = null
    state.loaded = cache.has(cacheKey.value)
    state.loading = false
    state.options = cache.get(cacheKey.value) ?? []
    model.value = ''
  },
)
</script>
