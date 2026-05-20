<script setup lang="ts">
  import type {MessageListDto} from "~/composables/messagesApi";
  import LnbModal from "~/components/modals/LnbModal.vue";
  import LnbModalLabel from "~/components/modals/LnbModalLabel.vue";
  import LnbSelectSpaceModal from "~/components/modals/LnbSelectSpaceModal.vue";
  import LnbSelectEpicModal from "~/components/modals/LnbSelectEpicModal.vue";
  import type {MessageStatusDto} from "~/composables/statusesApi";
  import LnbSelectEntityModal from "~/components/modals/LnbSelectEntityModal.vue";

  const props = defineProps<{
    assignMsg: MessageListDto,
  }>()

  const emits = defineEmits<{
    (e: 'close'): void,
  }>()

  const { t } = useI18n();
  const { state, currentSpace, moveCard } = useBoard();
  const { getStatuses } = useStatusesApi()

  const spaceId = ref<number>(currentSpace.value!.id);
  const epic = ref<EpicListDto>();
  const statuses = ref<MessageStatusDto[]>([])
  const status = ref<MessageStatusDto>();

  const spaces = computed(() => state.value.spaces);
  const getSpaceById = (id: number) => spaces.value.find(p => p.id === id);

  const modals = reactive({
    selectSpace: false,
    selectEpic: false,
    selectStatus: false,
  })

  const selectSpace = (id: number) => {
    spaceId.value = id;
    modals.selectSpace = false;
    epic.value = undefined;
    status.value = undefined;
  }

  const selectEpic = async (value: EpicListDto) => {
    epic.value = value;
    modals.selectEpic = false;
    statuses.value = await getStatuses(value.id);
    status.value = statuses.value[0];
  }

  const selectStatus = (value: MessageStatusDto) => {
    status.value = value;
    modals.selectStatus = false;
  }

  const move = async () => {
    await moveCard(props.assignMsg.id, status.value!.id)
    emits("close");
  }
</script>

<template>
  <LnbModal
    :apply-text="t('move')"
    @apply="move"
    @close="$emit('close')"
    @cancel="$emit('close')"
    :disable-apply="!status"
    :title="t('assignToBoard')">
    <div v-if="assignMsg" class="assign">
      <div class="assign-sender">
        {{ assignMsg.sender }}
      </div>
      <div class="assign-content">
        {{ assignMsg.content }}
      </div>
    </div>

    <!-- Space select row -->
    <LnbModalLabel>{{ t('space') }}</LnbModalLabel>
    <div class="assign-select" @click="modals.selectSpace = true">
      <div class="assign-select-left">
        <div class="assign-select-dot" :style="`background:${getSpaceById(spaceId)?.color||'var(--text3)'}`"></div>
        <div class="assign-select-val">{{getSpaceById(spaceId)?.name || 'No space'}}</div>
      </div>
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" style="width:13px;height:13px;color:var(--text3)"><path d="M5 3l5 5-5 5"/></svg>
    </div>

    <!-- Board select row -->
    <LnbModalLabel>{{ t('board') }}</LnbModalLabel>
    <div class="assign-select" :class="{'assign-select-empty': !epic}" @click="modals.selectEpic = true">
      <div class="assign-select-left">
        <div v-if="epic" class="assign-select-dot" :style="`background:${epic.color}`"></div>
        <div class="assign-select-val" :style="!epic ? 'color:var(--text3)' : ''">
          {{ epic?.name || t('selectBoard') }}
        </div>
      </div>
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" style="width:13px;height:13px;color:var(--text3)"><path d="M5 3l5 5-5 5"/></svg>
    </div>

    <!-- Status select row -->
    <template v-if="!epic?.isDefault">
      <LnbModalLabel>{{ t('status') }}</LnbModalLabel>
      <div class="assign-select" :class="{'assign-select-empty': !status}" @click="modals.selectStatus = true">
        <div class="assign-select-left">
          <div v-if="status" class="assign-select-dot" :style="`background:${status.color}`"></div>
          <div class="assign-select-val" :style="!status ? 'color:var(--text3)' : ''">
            {{status?.name || (epic ? t('selectStatus') : t('selectBoardFirst'))}}
          </div>
        </div>
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" style="width:13px;height:13px;color:var(--text3)"><path d="M5 3l5 5-5 5"/></svg>
      </div>
    </template>

  </LnbModal>

  <LnbSelectSpaceModal
    v-if="modals.selectSpace"
    @select="selectSpace"
    @close="modals.selectSpace = false" />

  <LnbSelectEpicModal
    :spaceId="spaceId"
    v-if="modals.selectEpic"
    @select="selectEpic"
    @close="modals.selectEpic = false" />

  <LnbSelectEntityModal
    v-if="modals.selectStatus"
    :title="t('selectStatus')"
    :initials-count="1"
    :options="statuses"
    @select="selectStatus"
    @close="modals.selectStatus = false" />
</template>

<style scoped>
/* ASSIGN MODAL SELECTS */
.assign-select{display:flex;align-items:center;justify-content:space-between;padding:10px 12px;background:var(--surface3);border:1px solid var(--border);border-radius:var(--radius-sm);cursor:pointer;transition:all 0.15s;-webkit-tap-highlight-color:transparent;margin-bottom: 12px;}
.assign-select:hover{border-color:var(--accent);background:var(--accent-glow)}
.assign-select-empty{opacity:0.7}
.assign-select-left{display:flex;align-items:center;gap:8px;min-width:0}
.assign-select-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
.assign-select-val{font-size:13px;font-weight:600;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.assign {background: var(--surface3); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 8px 11px; margin-bottom: 16px;}
.assign-sender {font-size:11px;color:var(--text3);margin-bottom:4px}
.assign-content {font-size:13px;color:var(--text2);line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
</style>