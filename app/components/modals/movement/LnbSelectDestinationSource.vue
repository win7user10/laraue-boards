<script setup lang="ts">

import LnbModalListOpts from "~/components/modals/LnbModalListOpts.vue";
import LnbModalLabel from "~/components/modals/LnbModalLabel.vue";
import LnbModalListOpt from "~/components/modals/LnbModalListOpt.vue";

const props = defineProps<{
  excludeCurrentOrganization: boolean,
  requireCreateSpacesPermission: boolean,
  destinationType: 'organization' | 'space'
  organization?: OrganizationListDto | null,
  space?: DestinationSpace | null,
}>()

const emit = defineEmits<{
  (e: 'update:organization', value: OrganizationListDto | null): void
  (e: 'update:space', value: DestinationSpace | null): void
}>()

const { getOrganizations } = useBoard()
const { appState } = useAppState()
const { getDestinationSpaces } = useMassMovementApi()
const organizations = await getOrganizations()

const allowedOrganizationsToMove = computed(() => {
  let result = organizations;
  if (props.excludeCurrentOrganization)
    result = result.filter(o => o.id != appState.value.organization!.id)
  if (props.requireCreateSpacesPermission)
    result = result.filter(o => o.canCreateSpaces)

  return result;
})

const spaces = ref<DestinationSpace[]>([])
watch(() => props.organization, async (newVal) => {
  spaces.value = newVal ? await getDestinationSpaces(newVal.id) : []
}, { immediate: true, deep: true })

const updateOrganization = (organization: OrganizationListDto) => {
  emit('update:organization', organization)
  emit('update:space', null)
}
</script>

<template>

  <LnbModalLabel>New organization</LnbModalLabel>
  <LnbModalListOpts>
    <LnbModalListOpt
        v-for="org in allowedOrganizationsToMove"
        :class="{selected: organization?.id === org.id}"
        @click="updateOrganization(org)"
        :key="org.id"
        :name="org.name">
      <template #avatar>
        <LnbCardAvatar :color="org.color">
          {{ org.name.toUpperCase().slice(0, 2) }}
        </LnbCardAvatar>
      </template>
    </LnbModalListOpt>
  </LnbModalListOpts>

  <template v-if="destinationType === 'space' && organization">
    <LnbModalLabel>New space</LnbModalLabel>

    <LnbModalListOpts>
      <LnbModalListOpt
          v-for="item in spaces"
          :class="{selected: item.id === space?.id}"
          @click="emit('update:space', item)"
          :key="item.id"
          :name="item.name">
        <template #avatar>
          <LnbCardAvatar :color="item.color">
            {{ item.name.toUpperCase().slice(0, 2) }}
          </LnbCardAvatar>
        </template>
      </LnbModalListOpt>
    </LnbModalListOpts>
  </template>
</template>

<style scoped>
.selected { border-color:var(--accent);background:var(--accent-glow) }
</style>