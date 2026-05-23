<script setup lang="ts">
import LnbElementWithHelpLink from "~/components/modals/LnbElementWithHelpLink.vue";
import { useOrganizationsApi } from "~/composables/organizationsApi";
import LnbCreateOrganizationModal from "~/components/modals/LnbCreateOrganizationModal.vue";
import {ref} from "vue";
import LnbEditOrganizationModal from "~/components/modals/LnbEditOrganizationModal.vue";
import LnbDeleteOrganizationModal from "~/components/modals/LnbDeleteOrganizationModal.vue";

definePageMeta({
  middleware: 'auth'
})

const { appState } = useAppState()
const { getDocumentationLink } = useUtils()
const { loginOrganization } = useAuth()
const { getOrganizations, createOrganization, editOrganization, deleteOrganization } = useOrganizationsApi()
const { t } = useI18n()
const authUser = appState.value.user

const organizations = ref<OrganizationListDto[]>([]);
const updateOrganizations = async () => {
  organizations.value = await getOrganizations();
}

onMounted(() => {
  return updateOrganizations()
})

const modals = reactive({
  createOrganization: false,
  editOrganization: false,
  deleteOrganization: false
})

const editingOrganization = ref<OrganizationListDto>()
const openEditOrganization = (org: OrganizationListDto) => {
  editingOrganization.value = org
  modals.editOrganization = true;
}

const openDeleteOrganization = (org: OrganizationListDto) => {
  editingOrganization.value = org
  modals.deleteOrganization = true;
}

const openCreateOrganization = () => {
  modals.createOrganization = true;
}

const createOrganizationInternal = async (request: CreateOrganizationRequest) => {
  const result = await createOrganization(request)
  organizations.value.push({
    id: result.id,
    name: request.name,
    color: request.color,
    isPersonal: false,
    canUpdate: true,
    canDelete: true,
    canCreateSpaces: true,
    slug: result.slug,
    slugPostfix: result.slugPostfix,
  })
  modals.createOrganization = false;
}

const editOrganizationInternal = async (request: EditOrganizationRequest) => {
  await editOrganization(editingOrganization.value!.id, request)
  editingOrganization.value!.color = request.color
  editingOrganization.value!.name = request.name
  modals.editOrganization = false;
}

const deleteOrganizationInternal = async () => {
  await deleteOrganization(editingOrganization.value!.id)

  const index = organizations.value.findIndex(o => o.id === editingOrganization.value!.id)
  organizations.value.splice(index, 1)

  modals.deleteOrganization = false;
}

const loginOrg = async (id: number) => {
  await loginOrganization(id)
}

const moveJoinByCode = () => {
  return navigateTo('/organizations/join');
}
</script>

<template>
  <LnbAuthScreen>
    <div class="org-select-head">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
        <LnbCardAvatar :color="authUser?.color">
          {{authUser?.initials}}
        </LnbCardAvatar>
        <div>
          <div style="font-size:13px;font-weight:700;color:var(--text)">{{authUser?.firstName}} {{authUser?.lastName}}</div>
          <div style="font-size:11px;color:var(--text3)">@{{authUser?.username}}</div>
        </div>
      </div>
      <LnbElementWithHelpLink
          :linkTitle="t('learnAboutOrganizations')"
          :linkHref="getDocumentationLink('/concepts/organizations')">
        <div class="org-select-title">
          {{ t('chooseWorkspace') }}
        </div>
      </LnbElementWithHelpLink>
      <div class="org-select-sub">{{ t('selectWhereYouWantToWork') }}</div>
    </div>
    <LnbNavLoader />
    <div class="org-select-body">
      <!-- User's organizations -->
      <div v-for="org in organizations" :key="org.id" class="org-item" @click="loginOrg(org.id)">
        <div class="org-item-avatar" :style="`background:${org.color}`">
          {{ org.isPersonal ? authUser?.initials?.toLocaleUpperCase() : org.name.toLocaleUpperCase().slice(0, 2) }}
        </div>
        <div class="org-item-info" style="cursor:pointer">
          <div class="org-item-name">{{ org.name }}</div>
          <div class="org-item-sub">{{ org.isPersonal ? t('yourPrivateBoards') : '' }}</div>
        </div>
        <div class="org-item-actions">
          <div class="org-item-btn"
               title="Edit"
               @click.stop="openEditOrganization(org)"
               v-if="org.canUpdate">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M11.5 2.5l2 2L5 13H3v-2L11.5 2.5z"/></svg>
          </div>
          <div
              class="org-item-btn danger"
              title="Delete"
              @click.stop="openDeleteOrganization(org)"
              v-if="org.canDelete">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 4h10M6 4V3h4v1M5 4l.5 9h5l.5-9"/></svg>
          </div>
        </div>
      </div>
      <!-- Create new org -->
      <div class="org-item" style="border-style:dashed;justify-content:center;gap:8px" @click="openCreateOrganization">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" style="width:15px;height:15px;color:var(--text3)"><path d="M8 3v10M3 8h10"/></svg>
        <span style="font-size:13px;font-weight:600;color:var(--text3)">{{ t('newOrganization') }}</span>
      </div>

      <!-- Divider -->
      <div style="display:flex;align-items:center;gap:8px;margin:4px 0">
        <div style="flex:1;height:1px;background:var(--border)"></div>
        <div style="font-size:10px;color:var(--text3);font-weight:600">
          {{ t('or') }}
        </div>
        <div style="flex:1;height:1px;background:var(--border)"></div>
      </div>

      <!-- Join by code -->
      <div class="org-item" style="border-style:dashed;justify-content:center;gap:8px" @click="moveJoinByCode">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" style="width:15px;height:15px;color:var(--text3)">
          <path d="M3 6h10M3 10h10M6 3v10M10 3v10" opacity="0.5"/>
          <rect x="2" y="2" width="12" height="12" rx="2"/>
        </svg>
        <span style="font-size:13px;font-weight:600;color:var(--text3)">
          {{ t('joinWithCode') }}
        </span>
      </div>

    </div>
  </LnbAuthScreen>

  <LnbCreateOrganizationModal
      v-if="modals.createOrganization"
      @create="createOrganizationInternal"
      @close="modals.createOrganization = false"/>
  <LnbEditOrganizationModal
      v-if="modals.editOrganization"
      :organization="editingOrganization!"
      @edit="editOrganizationInternal"
      @close="modals.editOrganization = false"/>
  <LnbDeleteOrganizationModal
      v-if="modals.deleteOrganization"
      @delete="deleteOrganizationInternal"
      @close="modals.deleteOrganization = false"/>

</template>

<style scoped>
/* Org selection screen */
.org-select-head{padding:20px 20px 16px;border-bottom:1px solid var(--border)}
.org-select-title{font-size:16px;font-weight:800;color:var(--text);margin-bottom:2px}
.org-select-sub{font-size:12px;color:var(--text3)}
.org-select-body{padding:12px}
.org-item{display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:10px;border:1px solid var(--border);background:var(--surface3);margin-bottom:8px;cursor:pointer;transition:all 0.15s;-webkit-tap-highlight-color:transparent}
.org-item:hover{border-color:var(--accent);background:var(--accent-glow)}
.org-item.personal{border-style:dashed}
.org-item-avatar{width:38px;height:38px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;flex-shrink:0;color:#fff}
.org-item-info{flex:1;min-width:0}
.org-item-name{font-size:13px;font-weight:700;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.org-item-sub{font-size:11px;color:var(--text3)}
.org-item-actions{display:flex;gap:4px;flex-shrink:0}
.org-item-btn{width:26px;height:26px;border-radius:6px;border:1px solid var(--border);background:var(--surface2);color:var(--text3);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all 0.15s;flex-shrink:0;-webkit-tap-highlight-color:transparent}
.org-item-btn:hover{border-color:var(--accent);color:var(--accent)}
.org-item-btn.danger:hover{border-color:var(--red);color:var(--red)}
.org-item-btn svg{width:12px;height:12px}
.org-enter-btn svg{width:12px;height:12px}
</style>