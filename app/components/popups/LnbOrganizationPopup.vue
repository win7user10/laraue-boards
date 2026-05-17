<script setup lang="ts">
import LnbPopup from "~/components/popups/LnbPopup.vue";
import {ref} from "vue";
import {useOrganizationsApi} from "~/composables/organizationsApi";

const emits = defineEmits<{
  (e: 'close'): void,
}>()

const { login } = useOrganizationsApi()
const { setOrganizationToken } = useLocalStorageUtils()
const { appState } = useAppState()
const { getOrganizations } = useBoard()
const { setOrganization } = useInitUser()
const organizations = ref<OrganizationListDto[]>([]);
const updateOrganizations = async () => {
  organizations.value = await getOrganizations();
}

await updateOrganizations()

// TODO - this code is repeated in AUTH snippet
const loginOrg = async (id: number) => {
  const token = await login(id)
  await setOrganizationToken(token)

  const { getOrganization } = useOrganizationsApi()
  const organization = await getOrganization()
  await setOrganization(organization)

  emits('close')
}

</script>

<template>
  <!-- Space popup -->
  <LnbPopup @close="emits('close')" :min-width="260">

    <!-- Orgs -->
    <div v-for="org in organizations" :key="org.id" class="org-switcher-item" :class="{active: appState.organization?.id===org.id}" @click="loginOrg(org.id)">
      <LnbCardAvatar :color="org.color">
        {{org.name.toUpperCase().slice(0, 2)}}
      </LnbCardAvatar>
      <div style="flex:1;min-width:0">
        <div class="org-switcher-name">{{org.name}}</div>
      </div>
    </div>

  </LnbPopup>
</template>

<style scoped>
.org-switcher-item{display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:8px;cursor:pointer;transition:background 0.12s;-webkit-tap-highlight-color:transparent}
.org-switcher-item:hover{background:var(--surface3)}
.org-switcher-item.active{background:var(--accent-glow)}
.org-switcher-name{font-size:12px;font-weight:600;color:var(--text);flex:1}
.org-switcher-check svg{width:12px;height:12px;color:var(--accent)}
</style>