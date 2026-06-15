<script setup lang="ts">
  import LnbNavLoader from "~/components/LnbNavLoader.vue";
  import LnbButton from "~/components/LnbButton.vue";

  const props = defineProps<{
    title: string,
    applyText?: string,
    cancelText?: string,
    fullHeight?: boolean,
    disableApply?: boolean,
    subtitle?: string,
    confirmButton?: "ghost" | "primary" | "warn",
  }>()

  const emit = defineEmits<{
    (e: 'close'): void,
    (e: 'cancel'): void,
    (e: 'apply'): Promise<void>,
    (e: 'scroll'): void,
  }>()

  const { t } = useI18n();
  const { addLoadingKey, removeLoadingKey, appState } = useAppState();

  const close = () => {
    emit('close')
  }

  const cancel = () => {
    emit('cancel')
  }

  const apply = async () => {
    const key = 'modalApply'
    addLoadingKey(key)
    try {
      await emit('apply')
    } finally {
      removeLoadingKey(key)
    }
  }

  const isLoading = computed(() => appState.value.isLoading)
</script>

<template>
  <transition name="fade">
    <div class="modal-overlay" @click.self="close">
      <div class="modal" :class="{ 'modal-full': fullHeight }">
        <div class="modal-head">
          <div class="modal-handle"></div>
          <div class="modal-title">{{ title }}</div>
          <div class="modal-subtitle" v-if="subtitle">{{ subtitle }}</div>
          <slot name="head"></slot>
        </div>
        <div class="modal-body">
          <slot></slot>
          <div class="modal-btns">

            <LnbButton
              :name="cancelText ?? t('cancel')"
              @click="cancel"
              :disabled="isLoading"
              type="ghost"/>

            <LnbButton
              v-if="applyText"
              :name="applyText"
              @click="apply"
              :disabled="isLoading || disableApply"
              :type="confirmButton ?? 'primary'"/>

          </div>
          <div class="modal-loader">
            <LnbNavLoader v-if="isLoading" />
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
/* ── MODAL ── */
.modal-overlay {
  position: fixed; inset: 0;
  width: 100vw;
  max-width: 100vw;
  background: rgba(0,0,0,0.7);
  z-index: 100;
  display: flex;
  align-items: flex-end;
  animation: fade-in 0.15s;
  cursor: default;
}
@keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
.modal {
  width: 100%;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px 16px 0 0;
  animation: slide-up 0.22s cubic-bezier(0.34,1.4,0.64,1);
  display: flex;
  flex-direction: column;
  max-height: 88dvh;
}
.modal.modal-full{
  height:92vh
}
@keyframes slide-up { from { transform: translateY(60px); opacity: 0; } to { transform: none; opacity: 1; } }
.modal-head {
  padding: 14px calc(max(16px, var(--safe-right))) 0 calc(max(16px, var(--safe-left)));
  flex-shrink: 0;
}
.modal-body {
  overflow-y: auto;
  padding: 0 calc(max(16px, var(--safe-right))) calc(max(20px, var(--safe-bottom))) calc(max(16px, var(--safe-left)));
  flex: 1;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  scrollbar-color: var(--border) transparent;
}

.modal-handle {
  width: 36px; height: 4px;
  background: var(--border2);
  border-radius: 2px;
  margin: 0 auto 16px;
}
.modal-title { font-size: 16px; font-weight: 700; margin-bottom: 14px; color: var(--text); }
.modal-subtitle{font-size:11px;color:var(--text3);margin-bottom:14px;margin-top:-14px;}
.modal-btns { display: flex; gap: 8px; }
.modal-loader { padding-top: 5px }

</style>