<script setup lang="ts">
import LnbModal from "~/components/modals/LnbModal.vue";
import LnbModalLabel from "~/components/modals/LnbModalLabel.vue";
import LnbManagePermissionsModal from "~/components/modals/LnbManagePermissionsModal.vue";
import type {UserPermissions} from "~/composables/organizationsApi";
import LnbRevokeAccessModal from "~/components/modals/LnbRevokeAccessModal.vue";
const { appState, showToast } = useAppState()
const { getRoleKey } = useUtils()
const { getOrganizationMembers, getPermittableEntities, setUserPermissions, getJoinCode, regenerateJoinCode, revokeAccess } = useOrganizationsApi()
const organization = computed(() => appState.value.organization)
const url = useRequestURL()

const members = ref(await getOrganizationMembers());
const permittableEntities = await getPermittableEntities();
const joinCode = ref(await getJoinCode())
const joinLink = computed(() => {
  return joinCode.value ? `${url.origin}/organizations/join?code=${joinCode.value}` : ''
})

const copyInviteLink = () => {
  navigator.clipboard?.writeText(joinLink.value);
  showToast(t('inviteCodeCopied'), 'success');
}

const regenerateLink = async () => {
  joinCode.value = await regenerateJoinCode();
  showToast(t('inviteCodeRegenerated'), 'success');
}

const modals = reactive({
  editPermissions: false,
  revokeAccess: false,
})

const editingMember = ref<OrganizationMember>()
const openEditPermissions = (member: OrganizationMember) => {
  modals.editPermissions = true
  editingMember.value = member
}

const updateUserPermissions = async (value: UserPermissions) => {
  await setUserPermissions(editingMember.value!.organizationUserId, value)
  modals.editPermissions = false
  editingMember.value = undefined;
}

const openRevokeAccess = (member: OrganizationMember) => {
  editingMember.value = member
  modals.revokeAccess = true
}

const revokeAccessInternal = async () => {
  const id = editingMember.value!.organizationUserId;
  await revokeAccess(id)

  const memberIndex = members.value.findIndex(m => m.organizationUserId === id)
  members.value.splice(memberIndex, 1)

  modals.revokeAccess = false
  showToast(t('accessRevoked'), 'danger');
}

const emit = defineEmits<{
  (e: 'close'): void,
}>()

const { t } = useI18n();

</script>

<template>
  <LnbModal
    :title="t('manageOrganization')"
    :subtitle="organization?.name"
    @cancel="emit('close')"
    @close="emit('close')">
    <!-- Invite link card -->
    <div class="invite-card" v-if="joinCode">
      <div class="invite-card-label">
        {{ t('inviteCode') }}
      </div>
      <div class="invite-link-row">
        <div class="invite-link-val">{{ joinLink }}</div>
        <div class="invite-link-btn" @click="copyInviteLink">
          {{ t('copy') }}
        </div>
      </div>
      <div class="invite-link-actions">
        <span class="invite-link-action" @click="copyInviteLink">
          📋 {{ t('copyCode') }}
        </span>
        <span style="color:var(--border2);margin:0 4px">·</span>
        <span class="invite-link-action danger" @click="regenerateLink">
          🔄 {{ t('regenerate') }}
        </span>
      </div>
    </div>
    <!-- Member list -->
    <LnbModalLabel>
      {{ t('members') }}
    </LnbModalLabel>
    <div v-for="m in members" :key="m.organizationUserId" class="member-row">
      <LnbCardAvatar :color="m.color">
        {{ m.initials?.toLocaleUpperCase() }}
      </LnbCardAvatar>
      <div class="member-info">
        <div class="member-name">{{m.firstName}} {{m.lastName}}</div>
        <div class="member-handle">@{{m.username}}</div>
      </div>
      <div class="member-role" :class="getRoleKey(m)">
        {{ t(getRoleKey(m)) }}
      </div>
      <div class="member-actions">
        <div class="member-action-btn" v-if="!m.isOwner" :title="t('editPermissions')" @click="openEditPermissions(m)">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8">
            <rect x="2" y="11" width="3" height="3" rx="0.5"/>
            <rect x="6.5" y="6" width="3" height="8" rx="0.5"/>
            <rect x="11" y="2" width="3" height="12" rx="0.5"/>
          </svg>
        </div>
        <div class="member-action-btn danger" v-if="!m.isOwner" :title="t('revokeAccess')" @click="openRevokeAccess(m)">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M3 8h10M9 4l4 4-4 4"/><path d="M6 3H3v10h3" opacity=".4"/>
          </svg>
        </div>
      </div>
    </div>
  </LnbModal>
  <LnbManagePermissionsModal
    v-if="modals.editPermissions"
    @close="modals.editPermissions = false"
    @update="updateUserPermissions"
    :permittableEntities="permittableEntities"
    :member="editingMember!" />
  <LnbRevokeAccessModal
    v-if="modals.revokeAccess"
    @close="modals.revokeAccess = false"
    @revoke="revokeAccessInternal" />
</template>

<style scoped>
/* Invite link card */
.invite-card{background:var(--surface3);border:1px solid var(--border);border-radius:var(--radius);padding:12px 14px;margin-bottom:16px}
.invite-card-label{font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:0.6px;margin-bottom:6px}
.invite-link-row{display:flex;align-items:center;gap:8px}
.invite-link-val{flex:1;font-size:11px;font-family:'JetBrains Mono',monospace;color:var(--accent);background:var(--surface2);border:1px solid var(--border);border-radius:6px;padding:7px 10px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.invite-link-btn{padding:7px 12px;border-radius:6px;border:1px solid var(--border);background:var(--surface2);font-size:11px;font-weight:700;color:var(--text2);cursor:pointer;white-space:nowrap;transition:all 0.15s;-webkit-tap-highlight-color:transparent;flex-shrink:0}
.invite-link-btn:hover{border-color:var(--accent);color:var(--accent)}
.invite-link-actions{display:flex;gap:6px;margin-top:8px;align-items: center;}
.invite-link-action{font-size:11px;font-weight:600;color:var(--text3);cursor:pointer;transition:color 0.12s;-webkit-tap-highlight-color:transparent}
.invite-link-action:hover{color:var(--text)}
.invite-link-action.danger:hover{color:var(--red)}
/* Member list */
.member-row{display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--border)}
.member-row:last-child{border-bottom:none}
.member-info{flex:1;min-width:0}
.member-name{font-size:13px;font-weight:600;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.member-handle{font-size:10px;color:var(--text3);font-family:'JetBrains Mono',monospace}
.member-role{font-size:10px;font-weight:700;padding:2px 8px;border-radius:10px;flex-shrink:0}
.member-role.owner{background:var(--accent-glow);color:var(--accent);border:1px solid var(--accent)}
.member-role.admin{background:rgba(163,113,247,0.15);color:#a371f7;border:1px solid rgba(163,113,247,0.3)}
.member-role.member{background:var(--surface3);color:var(--text3);border:1px solid var(--border)}
.member-actions{display:flex;gap:4px;flex-shrink:0}
.member-action-btn{width:28px;height:28px;border-radius:6px;border:1px solid var(--border);background:var(--surface3);color:var(--text3);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all 0.15s;-webkit-tap-highlight-color:transparent}
.member-action-btn:hover{border-color:var(--accent);color:var(--accent)}
.member-action-btn.danger:hover{border-color:var(--red);color:var(--red)}
.member-action-btn svg{width:13px;height:13px}
</style>