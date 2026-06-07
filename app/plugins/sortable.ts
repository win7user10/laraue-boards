import Sortable from 'sortablejs';

export default defineNuxtPlugin((nuxtApp) => {
    // Register a simple directive
    nuxtApp.vueApp.directive('sortable', {
        mounted(el, binding) {
            const { statusId, onCardMoved, applySort } = binding.value;
            if (!applySort)
                return;

            el._sortableInstance = Sortable.create(el, {
                group: 'cards',
                sort: false,                  // no reordering within column
                animation: 150,
                delay: 150,
                delayOnTouchOnly: true,
                touchStartThreshold: 4,
                ghostClass: 'sortable-ghost',
                chosenClass: 'sortable-chosen',
                onAdd(evt) {
                    const cardId = evt.item.dataset.cardId;
                    onCardMoved(cardId, statusId);
                    evt.item.remove();          // Vue re-renders from state
                }
            });
            el._sortableMeta = { statusId, onCardMoved };
        },
        updated(el, binding) {
            // Keep metadata fresh when Vue re-renders (e.g. board switch)
            el._sortableMeta = binding.value;
            if (el._sortableInstance) {
                const { onCardMoved, statusId } = binding.value;
                el._sortableInstance.option('onAdd', (evt: { item: { dataset: { cardId: any; }; remove: () => void; }; }) => {
                    const cardId = evt.item.dataset.cardId;
                    onCardMoved(cardId, statusId);
                    evt.item.remove();
                });
            }
        },
        beforeUnmount(el) {
            if (el._sortableInstance) { el._sortableInstance.destroy(); el._sortableInstance = null; }
        }
    });
})