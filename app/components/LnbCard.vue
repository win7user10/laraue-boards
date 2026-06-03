<script setup lang="ts">
  import {useUtils} from "~/composables/utils";
  import {MediaType} from "~/composables/messagesApi";
  import LnbIconBtn from "~/components/icons/LnbIconBtn.vue";
  import LnbEditCardModal from "~/components/modals/LnbEditCardModal.vue";
  import LnbDeleteCardModal from "~/components/modals/LnbDeleteCardModal.vue";
  import LnbMoveCardModal from "~/components/modals/LnbMoveCardModal.vue";

  const props = defineProps<{
    message: MessageListDto,
    assignButton?: boolean,
    deleteButton?: boolean,
    navigateToEpicButton?: boolean,
    highlightText?: string,
  }>()

  const emits = defineEmits<{
    (e: 'update', message: EditCardRequest): void,
  }>()

  const { getImageUrl } = useUtils()
  const { t } = useI18n();
  const { openMedia, deleteCard, editCard, getOrganizationKey } = useBoard();

  const hlTextChunks = computed<TextChunk[]>(() => {
    const content = props.message.content ?? '';
    const highlightText = props.highlightText?.trim();
    if (!highlightText || !content)
      return [{ content, isHighlighted: false }];

    const result: TextChunk[] = [];
    const searchStr = highlightText.toLowerCase();
    const contentLower = content.toLowerCase();

    let currentIndex = 0;
    let searchIndex = contentLower.indexOf(searchStr, currentIndex);

    while (searchIndex !== -1) {
      // Add non-highlighted text before the match
      if (searchIndex > currentIndex) {
        result.push({
          content: content.substring(currentIndex, searchIndex),
          isHighlighted: false
        });
      }

      // Add the highlighted match
      result.push({
        content: content.substring(searchIndex, searchIndex + highlightText.length),
        isHighlighted: true
      });

      // Move current index past this match
      currentIndex = searchIndex + highlightText.length;

      // Search for next occurrence
      searchIndex = contentLower.indexOf(searchStr, currentIndex);
    }
    // Add remaining text after last match
    if (currentIndex < content.length) {
      result.push({
        content: content.substring(currentIndex),
        isHighlighted: false
      });
    }

    return result;
  })

  interface TextChunk {
    content: string;
    isHighlighted: boolean;
  }

  const modal = reactive({
    editCard: false,
    delete: false,
    assign: false,
  });

  const openDelete = () => {
    modal.delete = true;
  }

  const closeDelete = () => {
    modal.delete = false;
  }

  const deleteCardInternal = async () => {
    await deleteCard(props.message.id)
    closeDelete();
  }

  const openEditCard = () => {
    modal.editCard = true;
  }

  const closeEditCard = () => {
    modal.editCard = false;
  }

  const editCardInternal = async (value: EditCardRequest) => {
    await editCard(props.message.id, value);
    emits("update", value);
    closeEditCard();
  }

  const openAssignToCategory = () => {
    modal.assign = true;
  }

  const closeAssignToCategory = () => {
    modal.assign = false;
  }

  const getEpicUrl = computed(() => {
    const organizationKey = getOrganizationKey();
    const spaceKey = props.message.key.split('-')[0]
    return `/organizations/${organizationKey}/spaces/${spaceKey}/${props.message.epicId}`
  })
</script>

<template>
  <div class="msg-card"
      :style="`--card-color: ${props.message.senderColor}`"
      :data-card-id="props.message.id"
      @click="openEditCard">
    <div class="card-header">
      <div class="card-avatar" :style="`background:${props.message.senderColor}22; color:${props.message.senderColor}`">
        {{ props.message.senderInitial?.toLocaleUpperCase() }}
      </div>
      <div class="card-sender">{{ props.message.sender }}</div>
      <div class="card-key">{{ props.message.key }}</div>
      <!--<div class="card-time">{{ formatDate(props.message.time) }}</div>-->
    </div>
    <div class="card-text">
      <template v-for="chunk in hlTextChunks">
        <span class="search-hl" v-if="chunk.isHighlighted">{{ chunk.content }}</span>
        <template v-else>{{ chunk.content }}</template>
      </template>
    </div>
    <div
      v-if="props.message.media.length"
      class="card-media"
      data-sortable-ignore="true"
      :class="{'card-media-only': !props.message.content}">
      <template v-for="(mediaInfo, i) in props.message.media.slice(0, 4)" :key="i">
        <div class="card-media-thumb" @click.stop="openMedia(props.message.media, i)">
          <img v-if="mediaInfo.previewFileId" :src="getImageUrl(mediaInfo.previewFileId)" />
          <div class="play-icon" v-if="mediaInfo.type == MediaType.Video">
            <svg viewBox="0 0 16 16" fill="currentColor"><path d="M4 3l10 5-10 5V3z"/></svg>
          </div>
          <div class="media-count" v-if="i===3 && props.message.media.length > 4">
            +{{props.message.media.length - 4}}
          </div>
        </div>
      </template>
    </div>
    <div class="card-footer">
      <slot name="footer"></slot>
      <div class="card-actions">
        <nuxt-link v-if="props.navigateToEpicButton"
          :to="getEpicUrl">
          <LnbIconBtn
            :title="t('navigateToEpic')"
            btnSize="small"
            iconSize="mini"
            bordered
            icon="logout" />
        </nuxt-link>
        <LnbIconBtn
          v-if="assignButton"
          :title="t('assignToBoard')"
          btnSize="small"
          iconSize="mini"
          bordered
          icon="move"
          @click.stop="openAssignToCategory" />
        <LnbIconBtn
          v-if="deleteButton"
          :title="t('delete')"
          bordered
          btnSize="small"
          iconSize="mini"
          type="danger"
          icon="delete"
          @click.stop="openDelete" />
      </div>
    </div>
  </div>

  <LnbDeleteCardModal
    @close="closeDelete"
    @delete="deleteCardInternal"
    v-if="modal.delete"/>

  <LnbEditCardModal
    :id="message.id"
    @edit="editCardInternal"
    @close="closeEditCard"
    v-if="modal.editCard"/>

  <LnbMoveCardModal
    :assign-msg="message"
    @close="closeAssignToCategory"
    v-if="modal.assign" />

</template>

<style scoped>
  /* ── MESSAGE CARD ── */
  .msg-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 11px 13px;
    transition: border-color 0.15s, box-shadow 0.15s, opacity 0.15s;
    position: relative;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
    cursor: pointer;
  }
  .msg-card:active {
    cursor: grab;
  }
  .msg-card::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background: var(--card-color, var(--accent));
    border-radius: 3px 0 0 3px;
  }
  .msg-card.sortable-ghost {
    opacity: 0.2;
    border: 1.5px dashed var(--accent) !important;
    background: var(--surface2) !important;
  }
  .msg-card.sortable-chosen {
    box-shadow: 0 8px 32px rgba(0,0,0,0.6);
    border-color: var(--accent);
    transform: scale(1.02);
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 6px;
  }
  .card-avatar {
    width: 26px; height: 26px;
    border-radius: 50%;
    font-size: 11px;
    font-weight: 700;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    background: var(--surface3);
    color: var(--text);
  }
  .card-sender { font-size: 12px; font-weight: 700; color: var(--text); flex: 1; }
  .card-time { font-size: 10px; color: var(--text3); font-family: 'JetBrains Mono', monospace; }
  .card-key {font-size:9px;font-family:'JetBrains Mono',monospace;color:var(--accent);font-weight:700;opacity:0.8;}
  .card-text {
    font-size: 13px;
    color: var(--text2);
    line-height: 1.45;
    margin-bottom: 8px;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .card-footer {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
  }
  .card-actions {
    margin-left: auto;
    display: flex;
    gap: 4px;
  }
  .msg-card:hover .card-actions { opacity: 1; }
  .card-action-btn {
    width: 22px; height: 22px;
    border-radius: 4px;
    border: 1px solid var(--border);
    background: var(--surface2);
    color: var(--text3);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    transition: all 0.15s;
  }
  .card-action-btn:hover { background: var(--surface3); color: var(--text); border-color: var(--border2); }
  .card-action-btn.danger:hover { background: var(--red-glow); color: var(--red); border-color: var(--red); }
  .card-action-btn svg { width: 11px; height: 11px; }
  :deep(.search-hl){color:var(--accent);background:var(--accent-glow);border-radius:2px;padding:0 2px}

  /* CARD MEDIA STRIP */
  .card-media{display:flex;gap:5px;overflow-x:auto;margin-bottom:8px;scrollbar-width:none;border-radius:var(--radius-sm);-webkit-overflow-scrolling:touch}
  .card-media::-webkit-scrollbar{display:none}
  .card-media-thumb{position:relative;width:72px;height:72px;min-width:72px;border-radius:6px;overflow:hidden;background:var(--surface3);flex-shrink:0;cursor:pointer}
  .card-media-thumb img,.card-media-thumb video{width:100%;height:100%;object-fit:cover;display:block}
  .card-media-thumb .play-icon{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.35)}
  .card-media-thumb .play-icon svg{width:22px;height:22px;color:#fff;filter:drop-shadow(0 1px 3px rgba(0,0,0,0.5))}
  .card-media-thumb .media-count{position:absolute;inset:0;background:rgba(0,0,0,0.55);display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:800;color:#fff}
  .card-media-only{margin-bottom:0}
</style>