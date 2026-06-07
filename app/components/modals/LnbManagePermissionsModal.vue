<script setup lang="ts">
import LnbModal from "~/components/modals/LnbModal.vue";
import type { PermittableSpace, UserPermissions } from "~/composables/organizationsApi";
import LnbPermissionSectionTitle from "~/components/modals/permissions/LnbPermissionSectionTitle.vue";
import LnbPermissionSectionRow from "~/components/modals/permissions/LnbPermissionSectionRow.vue";

const { getRoleKey, hasFlag, addFlag, deleteFlag } = useUtils()
const { getUserPermissions } = useOrganizationsApi()
const emit = defineEmits<{
  (e: 'close'): void,
  (e: 'update', value: UserPermissions): void,
}>()

const props = defineProps<{
  member: OrganizationMember,
  permittableEntities: PermittableSpace[],
}>()

const { t } = useI18n()

const GLOBAL_READ_PERM    = [{ id: 0,  name: t('readAbbreviation') }]
const GLOBAL_SPACES_PERMS = [{ id: 1,  name: t('createAbbreviation') }, { id: 2,  name: t('updateAbbreviation') }, { id: 3,  name: t('deleteAbbreviation') }]
const GLOBAL_EPICS_PERMS  = [{ id: 4,  name: t('createAbbreviation') }, { id: 5,  name: t('updateAbbreviation') }, { id: 6,  name: t('deleteAbbreviation') }]
const GLOBAL_ISSUES_PERMS = [{ id: 7,  name: t('createAbbreviation') }, { id: 8,  name: t('updateAbbreviation') }, { id: 9,  name: t('deleteAbbreviation') }]

const DIRECT_READ_PERM    = [{ id: 13, name: t('readAbbreviation') }]
const DIRECT_SELF_PERMS   = [{ id: 11, name: t('updateAbbreviation') }, { id: 12, name: t('deleteAbbreviation') }]
const DIRECT_EPICS_PERMS  = [{ id: 4,  name: t('createAbbreviation') }, { id: 5,  name: t('updateAbbreviation') }, { id: 6,  name: t('deleteAbbreviation') }]
const DIRECT_ISSUES_PERMS = [{ id: 7,  name: t('createAbbreviation') }, { id: 8,  name: t('updateAbbreviation') }, { id: 9,  name: t('deleteAbbreviation') }]

const GLOBAL_KEY_MAP: Record<number, keyof GlobalAccessLevel> = {
  0: 'canRead',
  1: 'canCreateSpaces',
  2: 'canUpdateSpaces',
  3: 'canDeleteSpaces',
  4: 'canCreateEpics',
  5: 'canUpdateEpics',
  6: 'canDeleteEpics',
  7: 'canCreateIssues',
  8: 'canUpdateIssues',
  9: 'canDeleteIssues',
}

const DIRECT_KEY_MAP: Record<number, keyof DirectSpaceAccessLevel> = {
  13: 'canRead',
  11: 'canUpdate',
  12: 'canDelete',
  4:  'canCreateEpics',
  5:  'canUpdateEpics',
  6:  'canDeleteEpics',
  7:  'canCreateIssues',
  8:  'canUpdateIssues',
  9:  'canDeleteIssues',
}

// Global inheritance maps
const EPIC_INHERITED_FROM_SPACES: Partial<Record<keyof GlobalAccessLevel, keyof GlobalAccessLevel>> = {
  canCreateEpics: 'canCreateSpaces',
  canUpdateEpics: 'canUpdateSpaces',
  canDeleteEpics: 'canDeleteSpaces',
}

const ISSUE_INHERITED_FROM_SPACES: Partial<Record<keyof GlobalAccessLevel, keyof GlobalAccessLevel>> = {
  canCreateIssues: 'canCreateSpaces',
  canUpdateIssues: 'canUpdateSpaces',
  canDeleteIssues: 'canDeleteSpaces',
}

const ISSUE_INHERITED_FROM_EPICS: Partial<Record<keyof GlobalAccessLevel, keyof GlobalAccessLevel>> = {
  canCreateIssues: 'canCreateEpics',
  canUpdateIssues: 'canUpdateEpics',
  canDeleteIssues: 'canDeleteEpics',
}

const SELF_KEY_TO_GLOBAL: Partial<Record<keyof DirectSpaceAccessLevel, keyof GlobalAccessLevel>> = {
  canUpdate: 'canUpdateSpaces',
  canDelete: 'canDeleteSpaces',
}

const DIRECT_EPIC_KEY_TO_GLOBAL: Partial<Record<keyof DirectSpaceAccessLevel, keyof GlobalAccessLevel>> = {
  canCreateEpics: 'canCreateEpics',
  canUpdateEpics: 'canUpdateEpics',
  canDeleteEpics: 'canDeleteEpics',
}

const DIRECT_ISSUE_KEY_TO_GLOBAL: Partial<Record<keyof DirectSpaceAccessLevel, keyof GlobalAccessLevel>> = {
  canCreateIssues: 'canCreateIssues',
  canUpdateIssues: 'canUpdateIssues',
  canDeleteIssues: 'canDeleteIssues',
}

// Direct inheritance maps (same-operation, top-down)
// epic key → space key that would inherit into it
const EPIC_INHERITED_FROM_DIRECT_SPACE: Partial<Record<keyof DirectSpaceAccessLevel, keyof DirectSpaceAccessLevel>> = {
  canUpdateEpics: 'canUpdate',
  canDeleteEpics: 'canDelete',
}

const ISSUE_INHERITED_FROM_DIRECT_SPACE: Partial<Record<keyof DirectSpaceAccessLevel, keyof DirectSpaceAccessLevel>> = {
  canUpdateIssues: 'canUpdate',
  canDeleteIssues: 'canDelete',
}

const ISSUE_INHERITED_FROM_DIRECT_EPIC: Partial<Record<keyof DirectSpaceAccessLevel, keyof DirectSpaceAccessLevel>> = {
  canCreateIssues: 'canCreateEpics',
  canUpdateIssues: 'canUpdateEpics',
  canDeleteIssues: 'canDeleteEpics',
}

const ADMIN_PERMS = [
  {
    name: t('organization'),
    perms: [
      { id: AdminAccessLevel.UpdateOrganization, name: t('update') },
      { id: AdminAccessLevel.DeleteOrganization, name: t('delete') },
    ],
  },
  {
    name: t('permissions'),
    perms: [
      { id: AdminAccessLevel.Manage, name: t('manage') },
    ],
  },
]

const permissions = ref(await getUserPermissions(props.member.organizationUserId))

const permittedRows = computed(() => props.permittableEntities)

// ── Global ────────────────────────────────────────────────────────────────────

const getGlobalBool = (id: number): boolean => {
  const key = GLOBAL_KEY_MAP[id]
  if (!key) return false
  return permissions.value.global[key] as boolean
}

const toggleGlobal = (id: number) => {
  const key = GLOBAL_KEY_MAP[id]
  if (!key) return
      ;(permissions.value.global as any)[key] = !permissions.value.global[key]
}

const isGlobalReadInherited = (): boolean =>
    permissions.value.global.canCreateSpaces ||
    permissions.value.global.canUpdateSpaces ||
    permissions.value.global.canDeleteSpaces ||
    permissions.value.global.canCreateEpics  ||
    permissions.value.global.canUpdateEpics  ||
    permissions.value.global.canDeleteEpics  ||
    permissions.value.global.canCreateIssues ||
    permissions.value.global.canUpdateIssues ||
    permissions.value.global.canDeleteIssues

const isGlobalEpicsInherited = (id: number): boolean => {
  const key = GLOBAL_KEY_MAP[id]
  if (!key) return false
  return !!permissions.value.global[EPIC_INHERITED_FROM_SPACES[key]!]
}

const isGlobalIssuesInherited = (id: number): boolean => {
  const key = GLOBAL_KEY_MAP[id]
  if (!key) return false
  return !!permissions.value.global[ISSUE_INHERITED_FROM_SPACES[key]!] ||
      !!permissions.value.global[ISSUE_INHERITED_FROM_EPICS[key]!]
}

// ── Direct ────────────────────────────────────────────────────────────────────

const hasDirectSpacePermission = (spaceId: number): boolean =>
    !!permissions.value.direct[spaceId]

const getOrAddSpacePermission = (spaceId: number): DirectSpaceAccessLevel => {
  if (!hasDirectSpacePermission(spaceId))
    permissions.value.direct[spaceId] = {
      canRead:         false,
      canUpdate:       false,
      canDelete:       false,
      canCreateEpics:  false,
      canUpdateEpics:  false,
      canDeleteEpics:  false,
      canCreateIssues: false,
      canUpdateIssues: false,
      canDeleteIssues: false,
    }
  return permissions.value.direct[spaceId]!
}

const getDirectBool = (spaceId: number, id: number): boolean => {
  const key = DIRECT_KEY_MAP[id]
  if (!key || !hasDirectSpacePermission(spaceId)) return false
  return permissions.value.direct[spaceId]![key] as boolean
}

const toggleDirect = (spaceId: number, id: number) => {
  const key = DIRECT_KEY_MAP[id]
  if (!key) return
  const space = getOrAddSpacePermission(spaceId)
  ;(space as any)[key] = !space[key]
}

const isDirectReadInherited = (spaceId: number): boolean => {
  if (permissions.value.global.canRead || isGlobalReadInherited()) return true
  if (!hasDirectSpacePermission(spaceId)) return false
  const s = permissions.value.direct[spaceId]!
  return s.canUpdate       ||
      s.canDelete       ||
      s.canCreateEpics  ||
      s.canUpdateEpics  ||
      s.canDeleteEpics  ||
      s.canCreateIssues ||
      s.canUpdateIssues ||
      s.canDeleteIssues
}

const isDirectSelfInherited = (_spaceId: number, id: number): boolean => {
  const key = DIRECT_KEY_MAP[id]
  if (!key) return false
  return !!permissions.value.global[SELF_KEY_TO_GLOBAL[key]!]
}

const isDirectEpicsInherited = (spaceId: number, id: number): boolean => {
  const key = DIRECT_KEY_MAP[id]
  if (!key) return false
  if (isGlobalEpicsInherited(id)) return true
  if (!!permissions.value.global[DIRECT_EPIC_KEY_TO_GLOBAL[key]!]) return true
  if (!hasDirectSpacePermission(spaceId)) return false
  const spaceKey = EPIC_INHERITED_FROM_DIRECT_SPACE[key]
  return !!spaceKey && !!permissions.value.direct[spaceId]![spaceKey]
}

const isDirectIssuesInherited = (spaceId: number, id: number): boolean => {
  const key = DIRECT_KEY_MAP[id]
  if (!key) return false
  if (isGlobalIssuesInherited(id)) return true
  if (!!permissions.value.global[DIRECT_ISSUE_KEY_TO_GLOBAL[key]!]) return true
  if (!hasDirectSpacePermission(spaceId)) return false
  const s = permissions.value.direct[spaceId]!
  const spaceKey = ISSUE_INHERITED_FROM_DIRECT_SPACE[key]
  if (!!spaceKey && !!s[spaceKey]) return true
  const epicKey = ISSUE_INHERITED_FROM_DIRECT_EPIC[key]
  return !!epicKey && !!s[epicKey]
}

// ── Admin (bitflags) ──────────────────────────────────────────────────────────

const toggleAdminFlag = (id: number) => {
  if (hasFlag(permissions.value.admin, id))
    permissions.value.admin = deleteFlag(permissions.value.admin, id)
  else
    permissions.value.admin = addFlag(permissions.value.admin, id)
}

// ── Tabs / expand ─────────────────────────────────────────────────────────────

enum PermissionTab { Global, Direct, Admin }

const tab = ref(PermissionTab.Global)
const expandedSpaces = ref<Set<number>>(new Set())

const toggleDirectSpace = (id: number) =>
    expandedSpaces.value.has(id)
        ? expandedSpaces.value.delete(id)
        : expandedSpaces.value.add(id)

</script>

<template>
  <LnbModal
      :title="t('editPermissions')"
      @close="emit('close')"
      @cancel="emit('close')"
      @apply="emit('update', permissions)"
      :apply-text="t('save')">

    <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;margin-top:14px;">
      <LnbCardAvatar :color="member.color">
        {{ props.member.initials?.toUpperCase() }}
      </LnbCardAvatar>
      <div>
        <div style="font-size:13px;font-weight:700;color:var(--text)">{{ member.firstName }} {{ member.lastName }}</div>
        <div style="font-size:10px;color:var(--text3)">@{{ member.username }} · {{ getRoleKey(member) }}</div>
      </div>
    </div>

    <!-- Tabs -->
    <div style="display:flex;gap:4px;margin-bottom:12px">
      <div class="org-panel-tab" :class="{ active: tab === PermissionTab.Global }" @click="tab = PermissionTab.Global">
        {{ t('organization') }}
      </div>
      <div class="org-panel-tab" :class="{ active: tab === PermissionTab.Direct }" @click="tab = PermissionTab.Direct">
        {{ t('bySpace') }}
      </div>
      <div class="org-panel-tab" :class="{ active: tab === PermissionTab.Admin  }" @click="tab = PermissionTab.Admin">
        {{ t('administrative') }}
      </div>
    </div>

    <!-- ── Global tab ── -->
    <div v-if="tab === PermissionTab.Global">
      <div style="font-size:11px;color:var(--text3);background:var(--surface3);border-radius:8px;padding:8px 10px;margin-bottom:12px;line-height:1.5">
        {{ t('globalTitle') }}
        <br> {{ t('globalReadDescription') }}
      </div>

      <div class="perm-section">
        <LnbPermissionSectionTitle :title="t('read')" :column-names="GLOBAL_READ_PERM.map(x => x.name)" />
        <LnbPermissionSectionRow
            :title="t('all')"
            :columns="GLOBAL_READ_PERM"
            :checked="id => getGlobalBool(id)"
            :inherited="_ => isGlobalReadInherited()"
            @change="id => toggleGlobal(id)" />

        <LnbPermissionSectionTitle :title="t('modification')" :column-names="GLOBAL_SPACES_PERMS.map(x => x.name)" />
        <LnbPermissionSectionRow
            :title="t('spaces')"
            :columns="GLOBAL_SPACES_PERMS"
            :checked="id => getGlobalBool(id)"
            :inherited="_ => false"
            @change="id => toggleGlobal(id)" />

        <LnbPermissionSectionRow
            :title="t('epics')"
            :columns="GLOBAL_EPICS_PERMS"
            :checked="id => getGlobalBool(id)"
            :inherited="id => isGlobalEpicsInherited(id)"
            @change="id => toggleGlobal(id)" />

        <LnbPermissionSectionRow
            :title="t('issues')"
            :columns="GLOBAL_ISSUES_PERMS"
            :checked="id => getGlobalBool(id)"
            :inherited="id => isGlobalIssuesInherited(id)"
            @change="id => toggleGlobal(id)" />
      </div>
    </div>

    <!-- ── Direct tab ── -->
    <div v-if="tab === PermissionTab.Direct">
      <div style="font-size:10px;color:var(--text3);margin-bottom:10px;line-height:1.5;background:var(--surface3);padding:8px 10px;border-radius:8px">
        {{ t('directTitle') }}
        <br> {{ t('directDescription') }}
      </div>

      <div class="perm-section" style="margin-bottom:8px" v-for="permission in permittedRows" :key="permission.id">

        <div style="display:flex;align-items:center;padding:8px 10px;background:var(--surface3);cursor:pointer;border-bottom:1px solid var(--border)"
             @click="toggleDirectSpace(permission.id)">
          <div style="display:flex;align-items:center;gap:6px;flex:1;min-width:0">
            <div style="width:9px;height:9px;border-radius:50%;flex-shrink:0" :style="{ background: permission.color }"></div>
            <div style="font-size:12px;font-weight:700;color:var(--text)">{{ permission.name }}</div>
          </div>
          <div class="perm-expand-btn" :class="{ open: expandedSpaces.has(permission.id) }">
            <svg viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 2l4 3-4 3"/></svg>
            {{ expandedSpaces.has(permission.id) ? t('hide') : t('show') }}
          </div>
        </div>

        <template v-if="expandedSpaces.has(permission.id)">
          <LnbPermissionSectionTitle :title="t('readSpaceEntities')" :column-names="DIRECT_READ_PERM.map(x => x.name)" />
          <LnbPermissionSectionRow
              :title="t('all')"
              :columns="DIRECT_READ_PERM"
              :checked="id => getDirectBool(permission.id, id)"
              :inherited="_ => isDirectReadInherited(permission.id)"
              @change="id => toggleDirect(permission.id, id)" />

          <LnbPermissionSectionTitle :title="t('spaceModification')" :column-names="DIRECT_SELF_PERMS.map(x => x.name)" />
          <LnbPermissionSectionRow
              :title="t('access')"
              :columns="DIRECT_SELF_PERMS"
              :checked="id => getDirectBool(permission.id, id)"
              :inherited="id => isDirectSelfInherited(permission.id, id)"
              @change="id => toggleDirect(permission.id, id)" />

          <LnbPermissionSectionTitle :title="t('childrenModification')" :column-names="DIRECT_EPICS_PERMS.map(x => x.name)" />
          <LnbPermissionSectionRow
              :title="t('epics')"
              :columns="DIRECT_EPICS_PERMS"
              :checked="id => getDirectBool(permission.id, id)"
              :inherited="id => isDirectEpicsInherited(permission.id, id)"
              @change="id => toggleDirect(permission.id, id)" />
          <LnbPermissionSectionRow
              :title="t('issues')"
              :columns="DIRECT_ISSUES_PERMS"
              :checked="id => getDirectBool(permission.id, id)"
              :inherited="id => isDirectIssuesInherited(permission.id, id)"
              @change="id => toggleDirect(permission.id, id)" />
        </template>

      </div>
    </div>

    <!-- ── Admin tab (bitflags) ── -->
    <div v-if="tab === PermissionTab.Admin" class="perm-section">
      <template v-for="adminPerm in ADMIN_PERMS" :key="adminPerm.name">
        <LnbPermissionSectionTitle :title="adminPerm.name" :column-names="['']" />
        <LnbPermissionSectionRow
            v-for="perm in adminPerm.perms"
            :key="perm.id"
            :title="perm.name"
            :columns="[perm]"
            :checked="id => hasFlag(permissions.admin, id)"
            :inherited="_ => false"
            @change="id => toggleAdminFlag(id)" />
      </template>
    </div>

  </LnbModal>
</template>
<style scoped>
.perm-section{border:1px solid var(--border);border-radius:var(--radius);margin-bottom:8px;overflow:hidden}
.perm-expand-btn{display:flex;align-items:center;gap:3px;font-size:10px;font-weight:700;color:var(--text3);cursor:pointer;padding:2px 6px;border-radius:10px;border:1px solid var(--border);background:var(--surface3);transition:all 0.12s;flex-shrink:0;-webkit-tap-highlight-color:transparent}
.perm-expand-btn:hover{border-color:var(--accent);color:var(--accent)}
.perm-expand-btn svg{width:9px;height:9px;transition:transform 0.15s}
.perm-expand-btn.open svg{transform:rotate(90deg)}
.org-panel-tab{padding:5px 12px;border-radius:20px;font-size:12px;font-weight:600;cursor:pointer;border:1px solid transparent;color:var(--text3);transition:all 0.15s;-webkit-tap-highlight-color:transparent}
.org-panel-tab.active{background:var(--accent-glow);border-color:var(--accent);color:var(--accent)}
</style>