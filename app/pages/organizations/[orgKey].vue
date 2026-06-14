<script setup lang="ts">
import {onMounted, ref} from "vue";
import LnbFabItem from "~/components/LnbFabItem.vue";
import {useBoard} from "~/composables/boardState";
import LnbNavLoader from "~/components/LnbNavLoader.vue";
import LnbTopbar from "~/components/LnbTopbar.vue";
import LnbMassMoveModal from "~/components/modals/movement/LnbMassMoveModal.vue";
import LnbNav from "~/components/LnbNav.vue";

const { state } = useBoard()
const { appState } = useAppState()

definePageMeta({
  middleware: 'org-auth'
})

const { t } = useI18n();
const { params } = useRoute()
const board = useBoard();
const { loginOrganization } = useAuth();

onMounted(async () => {
  const orgKey = params.orgKey;
  if (!orgKey) {
    console.log("Org parameter is not found")
    return navigateTo('/organizations');
  }

  const orgKeys = (orgKey as string).split("-")

  const slug = orgKeys[0];
  const slugPostfix = orgKeys[1];

  console.log(slug, slugPostfix)

  const organization = appState.value.organization!;
  // Current org opening, do nothing, just reloading the board
  if (organization.slug === slug && organization.slugPostfix === slugPostfix) {
    console.log("Use auth of selected org")
    await board.reloadSpaces();
    return;
  }

  // Not current org, but the org is available for user
  const available = await board.getOrganizations();
  const organizationToSwitch = available.find(o => o.slug === slug && o.slugPostfix === slugPostfix);
  if (organizationToSwitch) {
    console.log("Change auth to available org")
    await loginOrganization(organizationToSwitch.id, false)
    await board.reloadSpaces();
    return;
  }

  // Selected org is not found or forbidden
  console.log("Org in path is not available")
  return navigateTo('/organizations');
});

watch(() => appState.value.organization?.id, (val) => {
  if (val) board.reloadSpaces()
})

watch(() => state.value.epicId, async () => {
  await board.reloadCategory();
  await board.reloadBoard(true);
})

const modal = reactive({
  createCard: false,
  createCategory: false,
  massMove: false,
});

const closeFab = () => {
  fabOpen.value = false;
}

const fabOpen = ref(false);

const closeMassMove = () => {
  modal.massMove = false;
  closeFab()
}

const openMassMove = () => {
  modal.massMove = true;
}
</script>

<template>
  <LnbTopbar />
  <LnbNavLoader />
  <LnbNav />

  <NuxtPage/>

  <LnbMassMoveModal
    v-if="modal.massMove"
    @close="closeMassMove"/>

  <LnbMediaViewer
    v-if="board.state.value.openedMedia.length > 0" />

  <!-- FAB backdrop -->
  <div class="fab-backdrop" v-if="fabOpen" @click="fabOpen=false"></div>

  <!-- FAB speed-dial -->
  <div class="fab-wrap" v-if="appState.organization?.canMassMove">
    <div class="fab-main" :class="{open: fabOpen}" @click="fabOpen=!fabOpen">
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3v10M3 8h10"/></svg>
    </div>
    <div class="fab-items" v-if="fabOpen">
      <LnbFabItem v-if="appState.organization?.canMassMove" :title="t('massMoveTitle')" @click="openMassMove">
        <path d="M2 4h8M2 8h8M2 12h8"></path><path d="M12 3l3 3-3 3"></path>
      </LnbFabItem>
    </div>
  </div>
</template>

<style scoped>

/* FAB */
.fab-wrap{position:fixed;bottom:calc(20px + var(--safe-bottom));right:calc(16px + var(--safe-right));z-index:90;display:flex;flex-direction:column-reverse;align-items:flex-end;gap:10px}
.fab-main{width:52px;height:52px;border-radius:50%;background:var(--accent);color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 4px 20px rgba(47,129,247,0.45);transition:transform 0.2s,background 0.2s;-webkit-tap-highlight-color:transparent;flex-shrink:0;border:none}
.fab-main:hover{background:var(--accent2)}
.fab-main.open{transform:rotate(45deg)}
.fab-main svg{width:22px;height:22px}
.fab-items{display:flex;flex-direction:column-reverse;gap:8px;align-items:flex-end}
.fab-backdrop{position:fixed;inset:0;z-index:89;background:rgba(0,0,0,0);cursor:default}
</style>