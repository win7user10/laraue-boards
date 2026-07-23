import type { Ref } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'

export const useUnsavedChangesWarning = (dirty: Readonly<Ref<boolean>>) => {
  const confirmUnsavedChanges = () =>
    !dirty.value || confirm('You have unsaved changes. Leave this page?')

  onBeforeRouteLeave(confirmUnsavedChanges)
  onMounted(() => window.addEventListener('beforeunload', warnBeforeUnload))
  onBeforeUnmount(() => window.removeEventListener('beforeunload', warnBeforeUnload))

  function warnBeforeUnload(event: BeforeUnloadEvent) {
    if (dirty.value) {
      event.preventDefault()
    }
  }

  return { confirmUnsavedChanges }
}
