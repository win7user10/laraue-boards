<template>
  <section class="member-permissions-page">
    <div class="title-row">
      <div class="page-heading">
        <AppBackLink
          label="Back to members"
          :to="organizationRoutes.permissions()" />
        <ShieldCheck class="page-heading-icon" />
        <div class="page-heading-text">
          <h1>{{ viewModel.member.name }}</h1>
        </div>
      </div>
    </div>

    <form
      class="permissions-editor"
      @submit.prevent="submit">
      <p
        v-if="viewModel.member.isOwner"
        class="muted">
        Owner permissions are read-only.
      </p>
      <fieldset :disabled="viewModel.member.isOwner">
        <legend>Administration</legend>
        <p class="muted section-description">
          Controls organization-level management tools.
        </p>
        <div class="permission-grid">
          <label
            v-for="permission in adminPermissionOptions"
            :key="permission.key"
            class="permission-option">
            <input
              v-model="draft.admin[permission.key]"
              type="checkbox" />
            <span>{{ permission.label }}</span>
          </label>
        </div>
      </fieldset>

      <fieldset :disabled="viewModel.member.isOwner">
        <legend>Organization access</legend>
        <p class="muted section-description">
          These permissions apply to every space.
        </p>
        <div class="permission-grid">
          <label
            v-for="permission in globalPermissionOptions"
            :key="permission.key"
            class="permission-option">
            <input
              v-model="draft.global[permission.key]"
              type="checkbox" />
            <span>{{ permission.label }}</span>
          </label>
        </div>
      </fieldset>

      <fieldset :disabled="viewModel.member.isOwner">
        <legend>Direct space access</legend>
        <p class="muted section-description">
          Adds permissions for individual spaces.
        </p>
        <details
          v-for="space in viewModel.spaces"
          :key="space.id"
          class="space-permissions">
          <summary>
            <ChevronRight class="disclosure-icon" />
            <SpaceIcon :style="{ color: space.color }" />
            <strong>{{ space.name }}</strong>
            <span
              v-if="space.isDefault"
              class="muted">
              Default
            </span>
          </summary>
          <div class="permission-grid">
            <label
              v-for="permission in directPermissionOptions"
              :key="permission.key"
              class="permission-option">
              <input
                v-model="draft.direct[space.id]![permission.key]"
                :disabled="space.isDefault && permission.key === 'canDelete'"
                type="checkbox" />
              <span>{{ permission.label }}</span>
            </label>
          </div>
        </details>
      </fieldset>

      <p
        v-if="saved"
        class="form-success">
        Permissions saved.
      </p>
      <p
        v-if="error"
        class="form-error">
        {{ error }}
      </p>
      <div
        v-if="!viewModel.member.isOwner"
        class="form-actions">
        <button
          class="primary"
          :disabled="submitting">
          {{ submitting ? 'Saving…' : 'Save permissions' }}
        </button>
      </div>
    </form>
  </section>
</template>

<script lang="ts">
export type AdminPermissions = {
  canDeleteOrganization: boolean
  canManageAttributes: boolean
  canManageMembers: boolean
  canMoveData: boolean
  canUpdateOrganization: boolean
}

export type GlobalPermissions = {
  canCreateBoards: boolean
  canCreateIssues: boolean
  canCreateSpaces: boolean
  canDeleteBoards: boolean
  canDeleteIssues: boolean
  canDeleteSpaces: boolean
  canRead: boolean
  canUpdateBoards: boolean
  canUpdateIssues: boolean
  canUpdateSpaces: boolean
}

export type DirectSpacePermissions = {
  canCreateBoards: boolean
  canCreateIssues: boolean
  canDelete: boolean
  canDeleteBoards: boolean
  canDeleteIssues: boolean
  canRead: boolean
  canUpdate: boolean
  canUpdateBoards: boolean
  canUpdateIssues: boolean
}

export type MemberPermissions = {
  admin: AdminPermissions
  direct: Record<string, DirectSpacePermissions>
  global: GlobalPermissions
}

export type MemberPermissionsPageViewModel = {
  member: {
    color: string
    id: string
    initials: string
    isAdmin: boolean
    isOwner: boolean
    name: string
  }
  permissions: MemberPermissions
  spaces: Array<{
    color: string
    id: string
    isDefault: boolean
    name: string
  }>
}

type MemberPermissionsPageProps = {
  error: null | string
  saved: boolean
  submitting: boolean
  viewModel: MemberPermissionsPageViewModel
}
</script>

<script setup lang="ts">
import { ChevronRight, ShieldCheck } from 'lucide-vue-next'

import { SpaceIcon } from '../../../../../constants/icons'

const props = defineProps<MemberPermissionsPageProps>()
const emit = defineEmits<{
  submit: [permissions: MemberPermissions]
}>()
const organizationRoutes = useOrganizationRoutes()
const adminPermissionOptions: Array<{
  key: keyof AdminPermissions
  label: string
}> = [
  { key: 'canManageMembers', label: 'Manage members and permissions' },
  { key: 'canUpdateOrganization', label: 'Edit organization' },
  { key: 'canDeleteOrganization', label: 'Delete organization' },
  { key: 'canMoveData', label: 'Move spaces and boards' },
  { key: 'canManageAttributes', label: 'Manage attributes' },
]
const globalPermissionOptions: Array<{
  key: keyof GlobalPermissions
  label: string
}> = [
  { key: 'canRead', label: 'Read organization' },
  { key: 'canCreateSpaces', label: 'Create spaces' },
  { key: 'canUpdateSpaces', label: 'Update spaces' },
  { key: 'canDeleteSpaces', label: 'Delete spaces' },
  { key: 'canCreateBoards', label: 'Create boards' },
  { key: 'canUpdateBoards', label: 'Update boards' },
  { key: 'canDeleteBoards', label: 'Delete boards' },
  { key: 'canCreateIssues', label: 'Create issues' },
  { key: 'canUpdateIssues', label: 'Update issues' },
  { key: 'canDeleteIssues', label: 'Delete issues' },
]
const directPermissionOptions: Array<{
  key: keyof DirectSpacePermissions
  label: string
}> = [
  { key: 'canRead', label: 'Read space' },
  { key: 'canUpdate', label: 'Update space' },
  { key: 'canDelete', label: 'Delete space' },
  { key: 'canCreateBoards', label: 'Create boards' },
  { key: 'canUpdateBoards', label: 'Update boards' },
  { key: 'canDeleteBoards', label: 'Delete boards' },
  { key: 'canCreateIssues', label: 'Create issues' },
  { key: 'canUpdateIssues', label: 'Update issues' },
  { key: 'canDeleteIssues', label: 'Delete issues' },
]

const draft = ref(structuredClone(toRaw(props.viewModel.permissions)))
watch(
  () => props.viewModel.permissions,
  (permissions) => {
    draft.value = structuredClone(toRaw(permissions))
  },
)
const submit = () => emit('submit', structuredClone(toRaw(draft.value)))
</script>

<style scoped>
.member-permissions-page {
  overflow: visible;
}

.permissions-editor {
  display: grid;
  gap: var(--space-5);
  margin-top: var(--space-6);
}

fieldset {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  margin: 0;
  padding: var(--space-4);
}

legend {
  font-weight: var(--font-weight-semibold);
  padding: 0 var(--space-2);
}

.section-description {
  margin-bottom: var(--space-4);
}

.permission-grid {
  display: grid;
  gap: var(--space-3);
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.permission-option {
  align-items: center;
  display: flex;
  font-weight: var(--font-weight-medium);
  gap: var(--space-2);
  margin: 0;
}

.space-permissions {
  border-bottom: 1px solid var(--color-border);
  padding: var(--space-3) 0;
}

.space-permissions:last-child {
  border-bottom: 0;
}

.space-permissions summary {
  align-items: center;
  border-radius: var(--radius-control);
  cursor: pointer;
  display: flex;
  gap: var(--space-2);
  list-style: none;
  padding: var(--space-2);
}

.space-permissions summary:hover {
  background: var(--color-hover);
}

.space-permissions summary::-webkit-details-marker {
  display: none;
}

.space-permissions .disclosure-icon {
  transition: transform var(--duration-fast) var(--ease-standard);
}

.space-permissions[open] .disclosure-icon {
  transform: rotate(90deg);
}

.space-permissions .permission-grid {
  padding: var(--space-4) 0 var(--space-1) var(--space-6);
}

@media (max-width: 760px) {
  .permissions-editor {
    margin-top: var(--space-4);
  }

  .permission-grid {
    grid-template-columns: 1fr;
  }
}
</style>
