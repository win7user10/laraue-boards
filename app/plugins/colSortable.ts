import Sortable from 'sortablejs';

export default defineNuxtPlugin((nuxtApp) => {
    // Register a simple directive
    nuxtApp.vueApp.directive('col-sortable', {
        mounted(el, binding) {
            const { onColMoved, applySort } = binding.value;
            if (!applySort)
                return;
            el._colSortable = Sortable.create(el, {
                animation: 180,
                delay: 150,
                delayOnTouchOnly: true,
                touchStartThreshold: 4,
                handle: '.col-header',           // drag only from header
                filter: '.add-col-btn',          // don't drag the add button
                draggable: '.board-col',
                ghostClass: 'col-sortable-ghost',
                chosenClass: 'col-sortable-chosen',
                onEnd(evt) {
                    const statusId = evt.item.dataset.statusId;
                    onColMoved(statusId, evt.newIndex);
                    // Vue re-renders from state, remove the physically moved node
                    // evt.item.remove();
                }
            });
        },
        updated(el, binding) {
            if (el._colSortable) {
                el._colSortable.option('onEnd', (evt: { item: { dataset: { statusId: any; }; remove: () => void; }; newIndex: any; }) => {
                    const statusId = evt.item.dataset.statusId;
                    binding.value.onColMoved(statusId, evt.newIndex);
                    // evt.item.remove();
                });
            }
        },
        beforeUnmount(el) {
            if (el._colSortable) { el._colSortable.destroy(); el._colSortable=null; }
        }
    });
})