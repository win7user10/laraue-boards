<script setup lang="ts">
import LnbNavSortPopup from "~/components/popups/LnbNavSortPopup.vue";
import {ref} from "vue";
import LnbCreateCategoryModal from "~/components/modals/LnbCreateCategoryModal.vue";

defineProps<{
  canCreateEpics?: boolean,
}>()

const { epics, state, setCategory } = useBoard();
const { getOrganizationKey } = useUtils();
const { appState } = useAppState();
const route = useRoute();
const { t } = useI18n();
const epicId = computed(() => state.value.epicId);
const navSortPopupOpen = ref(false);

const modal = reactive({
  createCategory: false,
});

const openCreateCategory = () => {
  modal.createCategory = true;
}

const closeCreateCategory = () => {
  modal.createCategory = false;
}

const goToStats = () => {
  return navigateTo(organizationsUrl.value);
}

const goToIssues = () => {
  return navigateTo(organizationsUrl.value + '/issues');
}

const goToEpics = () => {
  return navigateTo(organizationsUrl.value + '/boards');
}

const organizationsUrl = computed(() => {
  const key = getOrganizationKey(appState.value.organization!)
  return `/organizations/${key}`
})

const navMode = computed(() => {
  switch (route.path) {
    case organizationsUrl.value:
      return 'stats'
    case organizationsUrl.value + '/boards':
      return 'epics'
    default:
      return 'issues'
  }
});
</script>

<template>
  <div class="nav-wrap">
    <!-- mode switcher -->
    <div class="nav-mode-sw">
      <div class="nav-mode-btn stats" :class="{active: navMode === 'stats'}" @click="goToStats">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12V8M6 12V5M10 12V7M14 12V3"/></svg>
        <span class="nav-mode-label">Stats</span>
      </div>
      <div class="nav-mode-sep"></div>
      <div class="nav-mode-btn issues" :class="{active: navMode === 'issues'}" @click="goToIssues">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="8" cy="8" r="5"/><path d="M5.5 8l2 2 3-3"/></svg>
        <span class="nav-mode-label">Issues</span>
      </div>
      <div class="nav-mode-sep"></div>
      <div class="nav-mode-btn epics" :class="{active: navMode === 'epics'}" @click="goToEpics">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="12" height="12" rx="2"/><path d="M2 7h12"/></svg>
        <span class="nav-mode-label">Epics</span>
      </div>
    </div>

    <!-- NAV TABS -->
    <template v-if="navMode === 'epics'">
      <div class="nav-divider"></div>
      <div class="nav-tabs">
        <div
            v-for="cat in epics"
            class="nav-tab"
            :class="{active: epicId === cat.id}"
            :style="epicId === cat.id ? `--dot-color:${cat.color}` : ''"
            @click="setCategory(cat.id)">
          <span class="dot" :style="`background:${cat.color}`"></span>
          {{ cat.name }}
        </div>
        <div v-if="canCreateEpics" class="nav-tab-add" :title="t('addEpic')" @click="openCreateCategory">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M8 3v10M3 8h10"/>
          </svg>
        </div>
      </div>
    </template>

    <!-- Board nav controls: search + sort — pinned to right edge -->
    <div class="nav-controls">
      <!-- Sort -->
      <div class="nav-ctrl-btn" @click.stop="navSortPopupOpen = !navSortPopupOpen">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 5h10M5 8h6M7 11h2"/></svg>
      </div>
      <LnbNavSortPopup
        v-if="navSortPopupOpen"
        @close="navSortPopupOpen = false"/>
    </div>
  </div>

  <LnbCreateCategoryModal
    @create="closeCreateCategory"
    @close="closeCreateCategory"
    v-if="modal.createCategory"/>
</template>

<style scoped>
/* NAV */
.nav-wrap{background:var(--surface);border-bottom:1px solid var(--border);flex-shrink:0;display:flex;align-items:center;height:44px}
.nav-mode-sw{display:flex;background:var(--surface3);border:1px solid var(--border);border-radius:9px;overflow:hidden;flex-shrink:0;margin:0 8px 0 10px;align-self:center}
.nav-mode-btn{display:flex;align-items:center;gap:5px;padding:5px 11px;font-size:12px;font-weight:700;color:var(--text3);cursor:pointer;transition:all 0.15s;-webkit-tap-highlight-color:transparent;white-space:nowrap;line-height:1}
.nav-mode-btn svg{width:11px;height:11px;flex-shrink:0}
.nav-mode-btn.issues.active{background:var(--accent-glow);color:var(--accent)}
.nav-mode-btn.epics.active{background:rgba(163,113,247,0.15);color:#a371f7}
.nav-mode-btn.stats.active{background:rgba(56,189,148,0.15);color:#38bda0}
.nav-mode-sep{width:1px;background:var(--border);align-self:stretch;flex-shrink:0}
.nav-divider{width:1px;background:var(--border);align-self:stretch;flex-shrink:0;margin:8px 0}
.nav-tabs{display:flex;align-items:center;gap:4px;flex:1;min-width:0;overflow-x:auto;scrollbar-width:none;padding:0 6px}
.nav-tabs::-webkit-scrollbar{display:none}
.nav-tab{display:flex;align-items:center;gap:5px;padding:4px 9px;border-radius:20px;border:1px solid transparent;font-size:12px;font-weight:600;white-space:nowrap;cursor:pointer;color:var(--text2);transition:all 0.15s;-webkit-tap-highlight-color:transparent;flex-shrink:0}
.nav-tab:hover{background:var(--surface3);color:var(--text)}
.nav-tab.active{background: var(--accent-glow);border-color:var(--accent);color:var(--accent)}
.nav-tab .dot{width:6px;height:6px;border-radius:50%;flex-shrink:0}
.nav-tab-add{width:24px;height:24px;border-radius:50%;border:1px dashed var(--border2);display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--text3);flex-shrink:0;transition:all 0.15s;-webkit-tap-highlight-color:transparent}
.nav-tab-add:hover{border-color:#a371f7;color:#a371f7}
.nav-mode-label{display:inline}
@media (max-width:480px){.nav-mode-label{display:none}.nav-mode-btn{padding:5px 9px}}

.nav-controls{display:flex;align-items:center;gap:4px;margin-left:auto;flex-shrink:0; padding: 0 10px;border-left:1px solid var(--border);position: relative;}
.nav-ctrl-btn{width:26px;height:26px;border-radius:var(--radius-sm);border:1px solid transparent;background:transparent;color:var(--text3);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all 0.15s;flex-shrink:0;-webkit-tap-highlight-color:transparent}
.nav-ctrl-btn:hover,.nav-ctrl-btn.active{background:var(--surface3);border-color:var(--border);color:var(--text)}
.nav-ctrl-btn.sort-active{color:var(--accent)}
.nav-ctrl-btn svg{width:13px;height:13px}
</style>