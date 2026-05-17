<script setup lang="ts">
import LnbModal from "~/components/modals/LnbModal.vue";
import LnbModalLabel from "~/components/modals/LnbModalLabel.vue";
import LnbSelectMovementSource from "~/components/modals/movement/LnbSelectMovementSource.vue";
import LnbSelectDestinationSource from "~/components/modals/movement/LnbSelectDestinationSource.vue";

const emits = defineEmits<{
  (e: 'close'): void,
}>()

const { moveSpace, moveSpaceEpics } = useMassMovementApi()
const { showToast } = useAppState()

const massMoveStep = ref(0); // 0=type, 1=source, 2=target, 3=mapping, 4=confirm
const massMoveType = ref<string | null>(null); // 'space'|'spaceEpics'|'epic'|'epicIssues'

const massMoveSpaceSource = ref<DestinationSpace | null>(null); // selected space
const massMoveEpicSource = ref<EpicListDto | null>(null); // selected epic

const massMoveSpaceTarget = ref<DestinationSpace | null>(null); // selected org (null=personal)
const massMoveOrganizationTarget = ref<OrganizationListDto | null>(null); // selected org (null=personal)

const MASS_MOVE_TYPES = [
  { id: 'space',      title: 'Move entire space',         sub: 'Moves the space, all its epics and issues to another organization. Default space can not be moved.' },
  { id: 'spaceEpics', title: 'Move epics from a space',   sub: 'Moves all boards in a space — issues move with them. Backlog is not moving.' },
  { id: 'epic',       title: 'Move a single epic',        sub: 'Moves one board and all its issues to another organization. Backlog can not be moved.' },
];

const massMoveNext = () => {
  if (massMoveStep.value == 5)
    return save();

  massMoveStep.value++;
};

const save = async () => {
  if (massMoveType.value === 'space')
    return moveSpace(massMoveSpaceSource.value!.id, massMoveOrganizationTarget.value!.id)
  if (massMoveType.value === 'spaceEpics')
    return moveSpaceEpics(massMoveSpaceSource.value!.id, massMoveSpaceTarget.value!.id)
  showToast('Move completed', 'success');
  emits('close');
}

const massMoveBack = () => {
  if (massMoveStep.value === 0) {
    emits('close');
    return;
  }

  massMoveStep.value--;
};

const showOnlyNotDefaultSpaces = computed(() => massMoveType.value === 'space')
const sourceType = computed(() => massMoveType.value === 'epic' ? 'epic' : 'space')
const destinationType = computed(() => massMoveType.value === 'space' ? 'organization' : 'space')

const showOnlyNotDefaultEpics = computed(() => massMoveType.value === 'epic')
const excludeCurrentOrganization = computed(() => massMoveType.value === 'space')
const requireCreateSpacesPermission = computed(() => massMoveType.value === 'space')

const isNextStepDisabled = computed(() => {
  if (massMoveStep.value === 0) return !massMoveType.value;
  if (massMoveStep.value === 1)
    switch (massMoveType.value) {
      case 'epic':
        return !massMoveEpicSource.value
      default:
        return !massMoveSpaceSource.value
    }

  if (massMoveStep.value === 2)
    switch (massMoveType.value) {
      case 'epic':
        return !massMoveSpaceTarget.value
      default:
        return !massMoveOrganizationTarget.value
    }

  return false;
})

const massMoveSourceLabel = computed(() => {
  const spaceName = massMoveSpaceSource.value?.name
  const epicName = massMoveEpicSource.value?.name

  return epicName ? `${epicName} (${spaceName})` : spaceName
});

const massMoveOrganizationTargetLabel = computed(() => {
  const organizationName = massMoveOrganizationTarget.value?.name
  const spaceName = massMoveSpaceTarget.value?.name

  return spaceName ? `${spaceName} (${organizationName})` : organizationName
});

const getApplyText = computed(() => {
  return massMoveStep.value === 3 ? 'Confirm Move' : 'Next →';
});

const confirmButton = computed(() => {
  return massMoveStep.value === 3 ? 'warn' : undefined
});

const steps = computed(() => {
  const result = [] as { name: string }[];
  if (massMoveStep.value === 0)
    return result;

  result.push({ name: 'Source' });
  result.push({ name: 'Target' });
  result.push({ name: 'Confirm' });

  return result;
})

</script>

<template>
  <LnbModal
    title="Mass move"
    :applyText="getApplyText"
    @close="emits('close')"
    @cancel="massMoveBack"
    :cancel-text="massMoveStep > 0 ? '← Back' : undefined"
    :disable-apply="isNextStepDisabled"
    :confirm-button="confirmButton"
    @apply="massMoveNext">

    <template #head>
      <!-- Step bar -->
      <div class="mmove-step-bar">
        <template v-for="(step, i) in steps">
          <div class="mmove-step" :class="{active: massMoveStep - 1 === i, done: massMoveStep - 1 > i}">
            <div class="mmove-step-num">{{massMoveStep - 1 > i ? '✓' : i + 1}}</div>
            <span>{{ step.name }}</span>
          </div>
          <div v-if="i != steps.length - 1" class="mmove-step-sep"></div>
        </template>
      </div>
    </template>

    <template #default>
      <!-- ── STEP 1: Type ─────────────────────────────────────────────── -->
      <template v-if="massMoveStep === 0">
        <LnbModalLabel>What do you want to move?</LnbModalLabel>
        <div v-for="t in MASS_MOVE_TYPES" :key="t.id"
          class="mmove-option" :class="{ selected: massMoveType === t.id }"
          @click="massMoveType = t.id">
          <div class="mmove-option-icon">
            <svg v-if="t.id==='space'" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="2" width="12" height="12" rx="2"/><path d="M6 2v12M2 6h12"/></svg>
            <svg v-else-if="t.id==='spaceEpics'" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="4" width="12" height="9" rx="1.5"/><path d="M5 4V3M11 4V3"/></svg>
            <svg v-else-if="t.id==='epic'" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="2" width="5" height="12" rx="1"/><rect x="9" y="2" width="5" height="8" rx="1"/></svg>
            <svg v-else viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="8" cy="5" r="2"/><path d="M4 14c0-3 8-3 8 0"/><path d="M12 8h2M13 7v2"/></svg>
          </div>
          <div style="flex:1;min-width:0">
            <div class="mmove-option-title">
              {{t.title}}
            </div>
            <div class="mmove-option-sub">{{t.sub}}</div>
          </div>
          <svg v-if="massMoveType===t.id" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.5" style="width:14px;height:14px;color:var(--accent);flex-shrink:0"><path d="M3 8l4 4 6-7"/></svg>
        </div>
      </template>

      <!-- ── STEP 2: Source ───────────────────────────────────────────── -->
      <template v-else-if="massMoveStep === 1">
        <LnbSelectMovementSource
          :show-only-not-default-spaces="showOnlyNotDefaultSpaces"
          :show-only-not-default-epics="showOnlyNotDefaultEpics"
          :sourceType="sourceType"
          v-model:space="massMoveSpaceSource"
          v-model:epic="massMoveEpicSource" />
      </template>

      <!-- ── STEP 3: Target org ───────────────────────────────────────── -->
      <template v-else-if="massMoveStep === 2">
        <LnbSelectDestinationSource
          :exclude-current-organization="excludeCurrentOrganization"
          :require-create-spaces-permission="requireCreateSpacesPermission"
          :destinationType="destinationType"
          v-model:organization="massMoveOrganizationTarget"
          v-model:space="massMoveSpaceTarget" />
      </template>

      <!-- ── STEP 4: Target space ─────────────────────────────────────── Show spaces where epics can be created -->

      <!-- ── STEP 5: Confirm ──────────────────────────────────────────── -->
      <template v-else-if="massMoveStep === 3">
        <LnbModalLabel>Confirm move</LnbModalLabel>
        <div class="perm-section" style="margin-bottom:12px">
          <div class="mmove-summary-row" style="padding:8px 10px">
            <div class="mmove-summary-label">Action</div>
            <div class="mmove-summary-val">
              {{MASS_MOVE_TYPES.find(t=>t.id===massMoveType)?.title}}
            </div>
          </div>
          <div class="mmove-summary-row" style="padding:8px 10px">
            <div class="mmove-summary-label">Source</div>
            <div class="mmove-summary-val">
              {{massMoveSourceLabel}}
            </div>
          </div>
          <div class="mmove-summary-row" style="padding:8px 10px">
            <div class="mmove-summary-label">Destination</div>
            <div class="mmove-summary-val" style="color:var(--accent)">
              {{ massMoveOrganizationTargetLabel }}
            </div>
          </div>
          <!--<template v-if="massMoveType==='epicIssues' && massMoveSourceStatuses.length">
            <div style="padding:6px 10px 4px;font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;border-top:1px solid var(--border)">Status mapping</div>
            <div v-for="st in massMoveSourceStatuses" :key="st.id" class="mmove-summary-row" style="padding:6px 10px">
              <div style="display:flex;align-items:center;gap:5px;flex:1">
                <div class="mmove-status-dot" :style="`background:${st.color}`"></div>
                <div class="mmove-summary-label" style="min-width:0">{{st.name}}</div>
              </div>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" style="width:12px;height:12px;color:var(--text3);flex-shrink:0"><path d="M3 8h10M9 4l4 4-4 4"/></svg>
              <div style="flex:1;text-align:right">
                <div class="mmove-summary-val" style="font-size:11px">
                  {{massMoveTargetStatuses.find(t=>t.id===(massMoveMappings[st.id]||massMoveTargetStatuses[0]?.id))?.name}}
                </div>
              </div>
            </div>
          </template>-->
        </div>
        <div style="font-size:11px;color:var(--orange);background:rgba(210,153,34,0.1);border:1px solid rgba(210,153,34,0.3);border-radius:8px;padding:8px 10px;line-height:1.5;margin-bottom:4px">
          ⚠ This action cannot be undone. Members of the destination organization will gain access to moved content according to their permissions.
        </div>
      </template>

    </template>
  </LnbModal>
</template>

<style scoped>
.mmove-step-bar{display:flex;align-items:center;gap:0;margin-bottom:16px}
.mmove-step{display:flex;align-items:center;gap:4px;font-size:11px;font-weight:700;color:var(--text3);flex-shrink:0}
.mmove-step.active{color:var(--accent)}
.mmove-step.done{color:var(--green)}
.mmove-step-num{width:20px;height:20px;border-radius:50%;border:2px solid currentColor;display:flex;align-items:center;justify-content:center;font-size:9px;flex-shrink:0}
.mmove-step-sep{flex:1;height:1px;background:var(--border);margin:0 4px}
.mmove-option{display:flex;align-items:flex-start;gap:10px;padding:10px 12px;border:1px solid var(--border);border-radius:var(--radius-sm);cursor:pointer;margin-bottom:6px;transition:all 0.12s;-webkit-tap-highlight-color:transparent}
.mmove-option:hover{border-color:var(--accent);background:var(--accent-glow)}
.mmove-option.selected{border-color:var(--accent);background:var(--accent-glow)}
.mmove-option-icon{width:32px;height:32px;border-radius:8px;background:var(--surface3);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.mmove-option-icon svg{width:16px;height:16px;color:var(--text2)}
.mmove-option.selected .mmove-option-icon{background:var(--accent);color:#fff}
.mmove-option.selected .mmove-option-icon svg{color:#fff}
.mmove-option-title{font-size:12px;font-weight:700;color:var(--text);margin-bottom:2px}
.mmove-option-sub{font-size:10px;color:var(--text3);line-height:1.4}
.mmove-status-row{display:flex;align-items:center;gap:8px;padding:8px 10px;border-bottom:1px solid var(--border)}
.mmove-status-row:last-child{border-bottom:none}
.mmove-status-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
.mmove-status-name{font-size:12px;font-weight:600;color:var(--text);flex:1;min-width:0}
.mmove-status-arrow{color:var(--text3);flex-shrink:0}
.mmove-status-arrow svg{width:14px;height:14px}
.mmove-status-select{background:var(--surface3);border:1px solid var(--border);border-radius:6px;padding:4px 8px;font-size:11px;color:var(--text);outline:none;cursor:pointer;max-width:120px}
.mmove-summary-row{display:flex;gap:6px;padding:6px 0;font-size:12px;border-bottom:1px solid var(--border)}
.mmove-summary-row:last-child{border-bottom:none}
.mmove-summary-label{color:var(--text3);min-width:80px;flex-shrink:0}
.mmove-summary-val{color:var(--text);font-weight:600}
.space-switcher-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0}
.perm-section{border:1px solid var(--border);border-radius:var(--radius);margin-bottom:8px;overflow:hidden}
</style>