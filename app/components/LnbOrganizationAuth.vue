<script setup lang="ts">
import { useOrganizationsApi } from "~/composables/organizationsApi";
import LnbCreateOrganizationModal from "~/components/modals/LnbCreateOrganizationModal.vue";
import {ref} from "vue";
import LnbEditOrganizationModal from "~/components/modals/LnbEditOrganizationModal.vue";
import LnbDeleteOrganizationModal from "~/components/modals/LnbDeleteOrganizationModal.vue";
import LnbButton from "~/components/LnbButton.vue";
import type { FetchError } from 'ofetch';
import LnbElementWithHelpLink from "~/components/modals/LnbElementWithHelpLink.vue";

const { appState } = useAppState()
const { setOrganizationToken } = useLocalStorageUtils()
const { getDocumentationLink } = useUtils()
const { setOrganization } = useInitUser()
const { getOrganizations, createOrganization, editOrganization, deleteOrganization, login, join } = useOrganizationsApi()
const { t } = useI18n()
const authUser = appState.value.user

const organizations = ref<OrganizationListDto[]>([]);
const updateOrganizations = async () => {
  organizations.value = await getOrganizations();
}

await updateOrganizations()

const modals = reactive({
  createOrganization: false,
  editOrganization: false,
  deleteOrganization: false
})

const joinCodeOpen = ref(false)
const joinCode = ref('')
const joinCodeError = ref('')

const submitJoinCode = async () => {
  try {
    await join(joinCode.value)
    await updateOrganizations()
    joinCodeOpen.value = false;
  } catch (_error) {
    const error = _error as FetchError;
    if (error.status === 404)
      joinCodeError.value = t('noOrgWithSuchCode');
    if (error.status === 406)
      joinCodeError.value = t('userIsAlreadyMember');
  }
}

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
  const id = await createOrganization(request)
  organizations.value.push({
    id: id,
    name: request.name,
    color: request.color,
    isPersonal: false,
    canUpdate: true,
    canDelete: true,
    canCreateSpaces: true,
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
  const token = await login(id)
  await setOrganizationToken(token)

  const { getOrganization } = useOrganizationsApi()
  const organization = await getOrganization()
  await setOrganization(organization)
}
</script>

<template>
  <div class="auth-screen">
    <div class="org-select-card">
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
        <template v-if="!joinCodeOpen">
          <div class="org-item" style="border-style:dashed;justify-content:center;gap:8px" @click="joinCodeOpen=true;joinCode='';joinCodeError=''">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" style="width:15px;height:15px;color:var(--text3)">
              <path d="M3 6h10M3 10h10M6 3v10M10 3v10" opacity="0.5"/>
              <rect x="2" y="2" width="12" height="12" rx="2"/>
            </svg>
            <span style="font-size:13px;font-weight:600;color:var(--text3)">
              {{ t('joinWithCode') }}
            </span>
          </div>
        </template>
        <template v-else>
          <div style="background:var(--surface3);border:1px solid var(--border);border-radius:10px;padding:12px;display:flex;flex-direction:column;gap:8px">
            <div style="font-size:12px;font-weight:700;color:var(--text)">
              {{ t('enterInviteCode') }}
            </div>
            <div style="font-size:11px;color:var(--text3)">
              {{ t('askOwner') }}
            </div>
            <input
                class="auth-input"
                v-model="joinCode"
                :placeholder="t('exampleInviteCode')"
                style="text-transform:uppercase;letter-spacing:2px;font-family:'JetBrains Mono',monospace;margin-bottom:0;font-size:14px"
                @keyup.enter="submitJoinCode"
                @keyup.escape="joinCodeOpen=false"
            />
            <div v-if="joinCodeError" style="font-size:11px;color:var(--red)">{{ joinCodeError }}</div>
            <div style="display:flex;gap:6px">
              <LnbButton
                :name="t('cancel')"
                type="ghost"
                @click="joinCodeOpen=false"/>
              <LnbButton
                :name="t('joinOrganization')"
                type="primary"
                @click="submitJoinCode"/>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
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
/* AUTH SCREENS */
.auth-screen{position:fixed;inset:0;background:var(--bg);display:flex;align-items:center;justify-content:center;z-index:99;padding:calc(20px + var(--safe-top)) calc(20px + var(--safe-right)) calc(20px + var(--safe-bottom)) calc(20px + var(--safe-left))}
/* Org selection screen */
.org-select-card{width:100%;max-width:400px;background:var(--surface);border:1px solid var(--border);border-radius:16px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.4)}
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
.org-enter-btn{width:26px;height:26px;border-radius:6px;background:var(--accent);color:#fff;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.org-enter-btn svg{width:12px;height:12px}
.auth-input{width:100%;background:var(--surface3);border:1px solid var(--border);border-radius:8px;padding:10px 14px;font-size:14px;color:var(--text);outline:none;margin-bottom:10px;transition:border-color 0.15s;font-family:'Inter',sans-serif}
</style>