<script setup lang="ts">
  import LnbCreateAttributeModal from "~/components/modals/LnbCreateAttributeModal.vue";
  import LnbIconBtn from "~/components/icons/LnbIconBtn.vue";
  import LnbEditAttributeModal from "~/components/modals/LnbEditAttributeModal.vue";
  import LnbConfirmDeleteModal from "~/components/modals/LnbConfirmDeleteModal.vue";

  const { t } = useI18n();
  const { deleteAttribute } = useOrganizationsApi();
  const { getAttributes } = useOrganizationsApi()
  const modals = reactive({
    addAttribute: false,
    editAttribute: false,
    deleteAttribute: false,
  })

  const openAddAttribute = () => {
    modals.addAttribute = true;
  }

  const attributes = ref<AttributeDto[]>([]);
  const fetchAttributes = async () => {
    attributes.value = await getAttributes();
  }

  const onCreateAttribute = async () => {
    await fetchAttributes()
    modals.addAttribute = false;
  }

  const onEditAttribute = async () => {
    await fetchAttributes()
    modals.editAttribute = false;
  }

  const onConfirmDeleteAttribute = async () => {
    const id = selected.value!.id
    await deleteAttribute(id)
    attributes.value.splice(attributes.value.indexOf(selected.value!), 1)
    modals.deleteAttribute = false;
  }

  onMounted(() => {
    return fetchAttributes()
  })

  const openDelete = (attribute: AttributeDto) => {
    selected.value = attribute
    modals.deleteAttribute = true;
  }

  const selected = ref<AttributeDto>()
  const openEdit = (attribute: AttributeDto) => {
    selected.value = attribute
    modals.editAttribute = true;
  }
</script>

<template>

  <LnbBoardHeader>
    <template #title>
      {{ t('attributesTitle') }}
    </template>
    <template #subtitle>
      {{ attributes.length }} {{ t('customField', attributes.length) }} · {{ t('orgWide') }}
    </template>
    <template #actions>
      <LnbIconBtn
        :title="t('addAttribute')"
        btnSize="medium"
        iconSize="medium"
        icon="add"
        @click="openAddAttribute" />
    </template>
  </LnbBoardHeader>

  <LnbView>
    <div
      @click="openEdit(attribute)"
      v-for="attribute in attributes"
      :key="attribute.id"
      class="attr-row-card">
      <div class="attr-row-dot" :style="`background:${attribute.color}`"></div>
      <div class="attr-row-info">
        <div class="attr-row-name">
          {{ attribute.name }}
        </div>
        <div class="attr-row-meta">
          <span class="attr-type-badge">
          {{ t('attributeType_' + attribute.type) }}
          </span>
          <span
            v-for="listValue in attribute.listValues"
            :key="listValue.id"
            class="attr-opt-tag"
            :style="{
              background: attribute.color + '22',
              borderColor: attribute.color + '44',
              color: attribute.color,
            }">
              {{listValue.name}}
          </span>
        </div>
      </div>
      <div class="card-actions">
        <LnbIconBtn
          @click.stop="openDelete(attribute)"
          :title="t('delete')"
          type="danger"
          icon="delete"
          icon-size="mini"
          btn-size="small"
          bordered />
      </div>
    </div>
  </LnbView>


  <LnbCreateAttributeModal
    v-if="modals.addAttribute"
    @close="modals.addAttribute = false"
    @create="onCreateAttribute"/>

  <LnbEditAttributeModal
    v-if="modals.editAttribute"
    :attribute="selected!"
    @close="modals.editAttribute = false"
    @edit="onEditAttribute"/>

  <LnbConfirmDeleteModal
    v-if="modals.deleteAttribute"
    @close="modals.deleteAttribute = false"
    title="Delete Attribute"
    @delete="onConfirmDeleteAttribute">
    Attribute and all values in issues related to this attribute will be deleted permanently.
  </LnbConfirmDeleteModal>
</template>

<style scoped>
/* ATTRIBUTES PAGE */
.attr-row-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:11px 13px;display:flex;align-items:center;gap:10px;cursor:pointer;transition:border-color 0.15s;flex-shrink:0}
.attr-row-card:hover{border-color:var(--border2)}
.attr-row-dot{width:9px;height:9px;border-radius:50%;flex-shrink:0}
.attr-row-info{flex:1;min-width:0}
.attr-row-name{font-size:13px;font-weight:600;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.attr-row-meta{display:flex;align-items:center;gap:5px;margin-top:3px;flex-wrap:wrap}
.attr-type-badge{background:var(--surface3);border:1px solid var(--border);border-radius:4px;padding:1px 6px;font-size:10px;font-weight:600;color:var(--text2);flex-shrink:0}
.attr-opt-tag{border-radius:20px;padding:1px 7px;font-size:10px;border:1px solid transparent}
.card-actions{margin-left:auto;display:flex;gap:4px}
</style>