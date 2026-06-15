<script setup lang="ts">
import LnbNavSortPopup from "~/components/popups/LnbNavSortPopup.vue";
import LnbCreateCategoryModal from "~/components/modals/LnbCreateCategoryModal.vue";
import { ref, computed, reactive } from "vue";
import LnbCreateSpaceModal from "~/components/modals/LnbCreateSpaceModal.vue";
import LnbDeleteSpaceModal from "~/components/modals/LnbDeleteSpaceModal.vue";
import LnbEditSpaceModal from "~/components/modals/LnbEditSpaceModal.vue";
import LnbPopup from "~/components/popups/LnbPopup.vue";
import LnbIcon from "~/components/icons/LnbIcon.vue";

const { epics, state, getOrganizationKey, deleteSpace } = useBoard();
const { appState } = useAppState();
const { getSpace } = useSpacesApi();
const route = useRoute();
const { t } = useI18n();

const navSortPopupOpen = ref(false);
const modal = reactive({
  createCategory: false,
  createSpace: false,
  editSpace: false,
  deleteSpace: false,
});

// ── URL helpers ───────────────────────────────────────────────────────────────

const orgUrl = computed(() => `/organizations/${getOrganizationKey()}`);
const attributesUrl = computed(() => `${orgUrl.value}/attributes`);

const spaces = computed(() => state.value.spaces);
const spaceKey = computed(() =>
    route.params.spaceKey as string | undefined
);

const activeSpace = computed(() => {
  return spaces?.value.find(s => s.key === spaceKey.value)
});

const spaceData = ref<SpaceDetailsDto>()
watch(activeSpace, async (newActiveSpace) => {
  if (newActiveSpace)
    spaceData.value = await getSpace(newActiveSpace.id)
  else
    spaceData.value = undefined
})

// ── Nav level ─────────────────────────────────────────────────────────────────

/** 'home' = showing Home + space tabs; 'space' = showing back + Stats + epics */
const navLevel = computed<"home" | "space">(() =>
    spaceKey.value ? "space" : "home"
);

/** Which chip is active within the current level */
const activeChip = computed(() => {
  const path = route.path;
  if (path === orgUrl.value) return "home";
  if (path === `${orgUrl.value}/spaces/${spaceKey.value}`) return "stats";
  if (route.params.boardId) return route.params.boardId as string;
  return null;
});

// ── Navigation ────────────────────────────────────────────────────────────────

const getHomeUrl = computed(() => `${orgUrl.value}`)

const getSpaceUrl = (key: string) => {
  return `${orgUrl.value}/spaces/${key}`;
}

const spaceStatsUrl = computed(() => `${orgUrl.value}/spaces/${spaceKey.value}`)

const getEpicUrl = (id: number) => {
  return `${orgUrl.value}/spaces/${activeSpace.value?.key}/${id}`;
}

const openCreateCategory = () => { modal.createCategory = true; };
const closeCreateCategory = () => { modal.createCategory = false; };

const openCreateSpace = () => { modal.createSpace = true; };
const closeCreateSpace = () => { modal.createSpace = false; closeSpaceMenu(); };

const editingSpace = ref();
const openEditSpace = () => {
  editingSpace.value = activeSpace.value;
  modal.editSpace = true;
};

const closeEditSpace = () => {
  modal.editSpace = false;
  closeSpaceMenu();

  // If navigation key changed, update it in url
  if (editingSpace.value!.key !== spaceKey.value)
    return navigateTo(`${orgUrl.value}/spaces/${editingSpace.value?.key}`);
};

const openDeleteSpace = () => { modal.deleteSpace = true; };
const closeDeleteSpace = () => { modal.deleteSpace = false; };

const deleteSpaceInternal = async () => {
  await deleteSpace(activeSpace.value!.id);
  closeDeleteSpace()
  closeSpaceMenu()
  return navigateTo(orgUrl.value);
}

const closeSpaceMenu = () => { spaceMenuOpen.value = false }

const spaceMenuOpen = ref(false);
const spaceMenuBtnRef = ref<HTMLDivElement>();
const sortBtnRef = ref<HTMLDivElement>();
</script>

<template>
  <div class="nav-wrap">
    <div class="nav-row">

      <!-- ── HOME LEVEL: Home + divider + space tabs ── -->
      <template v-if="navLevel === 'home'">
        <nuxt-link
          class="nav-home"
          :class="{ active: activeChip === 'home' }"
          :to="getHomeUrl">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M2 6.5L8 2l6 4.5V14H10v-4H6v4H2z"/>
          </svg>
          {{ t('home') }}
        </nuxt-link>

        <div class="nav-divider"/>

        <nuxt-link
          v-for="sp in spaces"
          :key="sp.id"
          :to="getSpaceUrl(sp.key)"
          class="nav-space">
            <span class="dot" :style="`background:${sp.color}`"/>
          {{ sp.name }}
        </nuxt-link>

        <div
          v-if="appState.organization?.canCreateSpaces"
          class="nav-add"
          :title="t('createSpace')"
          @click="openCreateSpace">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M8 3v10M3 8h10"/>
          </svg>
        </div>
      </template>

      <!-- ── SPACE LEVEL: back + Stats + epics ── -->
      <template v-else>

        <!-- Back -->
        <nuxt-link class="nav-back" :to="getHomeUrl">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.2">
            <path d="M10 3L5 8l5 5"/>
          </svg>
          <span class="dot" :style="`background:${activeSpace?.color}`"/>
          {{ activeSpace?.name }}
        </nuxt-link>

        <!-- Three-dot space menu -->
        <div class="nav-space-menu-wrap" v-if="spaceData?.canUpdate || spaceData?.canDelete">

          <div
            class="nav-space-menu-btn"
            ref="spaceMenuBtnRef"
            :class="{ open: spaceMenuOpen }"
            @click.stop="spaceMenuOpen = !spaceMenuOpen">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="4" cy="8" r="1.2" fill="currentColor"/>
              <circle cx="8" cy="8" r="1.2" fill="currentColor"/>
              <circle cx="12" cy="8" r="1.2" fill="currentColor"/>
            </svg>
          </div>

          <LnbPopup v-if="spaceMenuOpen" :min-width="200" @close="closeSpaceMenu" :parentRef="spaceMenuBtnRef">
            <div class="nav-space-popup-item" @click="openEditSpace" v-if="spaceData?.canUpdate">
              <LnbIcon icon="edit" size="small" />
              {{ t('editSpace') }}
            </div>
            <div class="nav-space-popup-item danger" @click="openDeleteSpace" v-if="spaceData?.canDelete">
              <LnbIcon icon="delete" size="small" />
              {{ t('deleteSpace') }}
            </div>
          </LnbPopup>

        </div>

        <nuxt-link
          class="nav-chip"
          :to="spaceStatsUrl"
          :class="{ active: activeChip === 'stats' }">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M2 12V8M6 12V5M10 12V7M14 12V3"/>
          </svg>
          {{ t('stats') }}
        </nuxt-link>

        <nuxt-link
          v-for="epic in epics"
          :key="epic.id"
          class="nav-chip"
          :class="{ active: activeChip === String(epic.id) }"
          :to="getEpicUrl(epic.id)">
          <span class="dot" :style="`background:${epic.color}`"/>
          <span class="chip-label">{{ epic.name }}</span>
        </nuxt-link>

        <div
            v-if="spaceData?.canCreateEpics"
            class="nav-add"
            :title="t('addEpic')"
            @click="openCreateCategory">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M8 3v10M3 8h10"/>
          </svg>
        </div>
      </template>

    </div>

    <!-- Controls — pinned right -->
    <div class="nav-controls">
      <nuxt-link
        v-if="appState.organization?.canManageAttributes"
        class="nav-ctrl-btn"
        title="Attributes"
        :to="attributesUrl">
        <LnbIcon icon="attr" size="small" />
      </nuxt-link>

      <div
          class="nav-ctrl-btn"
          ref="sortBtnRef"
          title="Sort Epics"
          @click.stop="navSortPopupOpen = !navSortPopupOpen">
        <LnbIcon icon="sort" size="small" />
      </div>

      <LnbNavSortPopup
        v-if="navSortPopupOpen"
        :parentRef="sortBtnRef"
        @close="navSortPopupOpen = false"/>
    </div>
  </div>

  <LnbCreateCategoryModal
    v-if="modal.createCategory"
    @create="closeCreateCategory"
    @close="closeCreateCategory"/>

  <LnbCreateSpaceModal
    v-if="modal.createSpace"
    @create="closeCreateSpace"
    @close="closeCreateSpace"/>

  <LnbEditSpaceModal
    v-if="modal.editSpace"
    :space="activeSpace!"
    @close="closeEditSpace"/>

  <LnbDeleteSpaceModal
    v-if="modal.deleteSpace"
    :space="activeSpace!"
    @delete="deleteSpaceInternal"
    @close="closeDeleteSpace"/>
</template>

<style scoped>
.nav-wrap {
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  height: 40px;
  overflow: hidden;
}

/* Scrollable row */
.nav-row {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
  overflow-x: auto;
  scrollbar-width: none;
  height: 40px;
  padding: 0 4px;
}
.nav-row::-webkit-scrollbar { display: none; }

/* Shared dot */
.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* Vertical divider between Home and spaces */
.nav-divider {
  width: 1px;
  background: var(--border);
  align-self: stretch;
  flex-shrink: 0;
  margin: 9px 3px;
}

/* Home tab */
.nav-home {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 0 10px;
  height: 40px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text2);
  border-bottom: 2px solid transparent;
  white-space: nowrap;
  cursor: pointer;
  flex-shrink: 0;
  transition: color 0.15s;
  -webkit-tap-highlight-color: transparent;
  text-decoration: none;
}
.nav-home svg { width: 13px; height: 13px; flex-shrink: 0; }
.nav-home.active { color: var(--accent); border-bottom-color: var(--accent); }

/* Space tabs (home level) */
.nav-space {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 0 9px;
  height: 40px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text2);
  border-bottom: 2px solid transparent;
  white-space: nowrap;
  cursor: pointer;
  flex-shrink: 0;
  transition: color 0.15s;
  -webkit-tap-highlight-color: transparent;
  text-decoration: none;
}
.nav-space:hover { color: var(--text); }

/* Back button (space level) */
.nav-back {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 0 8px 0 6px;
  height: 40px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text2);
  border-right: 1px solid var(--border);
  white-space: nowrap;
  cursor: pointer;
  flex-shrink: 0;
  -webkit-tap-highlight-color: transparent;
  text-decoration: none;
}
.nav-back svg { width: 14px; height: 14px; flex-shrink: 0; }
.nav-back:hover { color: var(--text); }

/* Three-dot menu */
.nav-space-menu-wrap {
  position: relative;
  display: flex;
  align-items: center;
  padding: 0 3px;
  flex-shrink: 0;
  border-right: 1px solid var(--border);
  align-self: stretch;
}
.nav-space-menu-btn {
  width: 22px;
  height: 22px;
  border-radius: 5px;
  border: 1px solid transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text3);
  transition: all 0.15s;
  -webkit-tap-highlight-color: transparent;
}
.nav-space-menu-btn svg { width: 13px; height: 13px; }
.nav-space-menu-btn:hover,
.nav-space-menu-btn.open {
  background: var(--surface3);
  border-color: var(--border);
  color: var(--text);
}
.nav-space-popup-item{display:flex;align-items:center;gap:8px;padding:7px 9px;border-radius:7px;cursor:pointer;font-size:12px;font-weight:600;color:var(--text2);transition:background 0.12s;-webkit-tap-highlight-color:transparent}
.nav-space-popup-item svg { width: 13px; height: 13px; flex-shrink: 0; }
.nav-space-popup-item:hover { background: var(--surface3); color: var(--text); }
.nav-space-popup-item.danger { color: var(--red); }
.nav-space-popup-item.danger:hover { background: rgba(248,81,73,0.1); }

/* Stats + epic chips (space level) */
.nav-chip {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 0 9px;
  height: 40px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text2);
  border-bottom: 2px solid transparent;
  white-space: nowrap;
  cursor: pointer;
  flex-shrink: 0;
  transition: color 0.15s;
  -webkit-tap-highlight-color: transparent;
  text-decoration: none;
}
.nav-chip svg { width: 13px; height: 13px; flex-shrink: 0; }
.nav-chip.active { color: var(--text); border-bottom-color: var(--accent); }
.nav-chip:hover { color: var(--text); }
.chip-label {
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 90px;
}

/* Add button (spaces + epics) */
.nav-add {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 1px dashed var(--border2);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text3);
  flex-shrink: 0;
  transition: all 0.15s;
  margin-left: 2px;
  -webkit-tap-highlight-color: transparent;
}
.nav-add svg { width: 10px; height: 10px; }
.nav-add:hover { border-color: var(--accent); color: var(--accent); }

/* Controls pinned right */
.nav-controls {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  padding: 0 8px;
  border-left: 1px solid var(--border);
  align-self: stretch;
  position: relative;
}
.nav-ctrl-btn {
  width: 26px;
  height: 26px;
  border-radius: var(--radius-sm);
  border: 1px solid transparent;
  background: transparent;
  color: var(--text3);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s;
  flex-shrink: 0;
  -webkit-tap-highlight-color: transparent;
}
.nav-ctrl-btn:hover,
.nav-ctrl-btn.active { background: var(--surface3); border-color: var(--border); color: var(--text); }
.nav-ctrl-btn svg { width: 13px; height: 13px; }

/* Hide labels on mobile */
@media (max-width: 480px) {
  .nav-home span:not(.dot) { display: none; }
}
</style>