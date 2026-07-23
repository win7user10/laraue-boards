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
      Loading organizations…
    </option>
    <option
      v-else-if="state.loaded && visibleOptions.length === 0"
      disabled
      value="__empty">
      No organizations available
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
import type { OrganizationSelectDeps, OrganizationSelectOption } from './deps'

const props = withDefaults(
  defineProps<{
    deps: OrganizationSelectDeps
    disabled?: boolean
    initialOption?: OrganizationSelectOption
    placeholder?: string
  }>(),
  {
    disabled: false,
    initialOption: undefined,
    placeholder: 'Select organization',
  },
)

defineOptions({ inheritAttrs: false })

const model = defineModel<string>({ required: true })

const state = reactive({
  error: null as null | string,
  loaded: false,
  loading: false,
  options: [] as OrganizationSelectOption[],
})

let cache: OrganizationSelectOption[] | undefined

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
  if (cache) {
    state.options = cache
    state.loaded = true
    return
  }

  state.error = null
  state.loading = true
  const result = await props.deps.loadOrganizations()
  state.loading = false
  state.loaded = true
  if (!result.ok) {
    state.error = 'Could not load organizations.'
    return
  }

  cache = result.value
  state.options = result.value
}
</script>
