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
        <div class="read-permission">
          <strong>Read</strong>
          <label class="permission-option">
            <input
              aria-label="Read organization"
              :checked="draft.global.canRead || globalReadInherited"
              :disabled="globalReadInherited"
              :title="globalReadInherited ? 'Inherited' : undefined"
              type="checkbox"
              @change="draft.global.canRead = !draft.global.canRead" />
            <span>Read organization</span>
          </label>
        </div>
        <table class="permission-table">
          <thead>
            <tr>
              <th scope="col">Resource</th>
              <th
                v-for="column in permissionColumns"
                :key="column"
                scope="col">
                {{ column }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in globalPermissionRows"
              :key="row.label">
              <th scope="row">{{ row.label }}</th>
              <td
                v-for="(cell, index) in row.cells"
                :key="permissionColumns[index]">
                <input
                  :aria-label="`${permissionColumns[index]} ${row.label}`"
                  :checked="cell.checked"
                  :disabled="cell.inherited"
                  :title="cell.inherited ? 'Inherited' : undefined"
                  type="checkbox"
                  @change="draft.global[cell.key] = !draft.global[cell.key]" />
              </td>
            </tr>
          </tbody>
        </table>
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
          <div class="direct-permissions">
            <div class="read-permission">
              <strong>Read</strong>
              <label class="permission-option">
                <input
                  :aria-label="`Read ${space.name}`"
                  :checked="
                    draft.direct[space.id]!.canRead ||
                    directPermissionTables[space.id]!.readInherited
                  "
                  :disabled="directPermissionTables[space.id]!.readInherited"
                  :title="
                    directPermissionTables[space.id]!.readInherited
                      ? 'Inherited'
                      : undefined
                  "
                  type="checkbox"
                  @change="
                    draft.direct[space.id]!.canRead =
                      !draft.direct[space.id]!.canRead
                  " />
                <span>Read space</span>
              </label>
            </div>
            <table class="permission-table">
              <thead>
                <tr>
                  <th scope="col">Resource</th>
                  <th
                    v-for="column in permissionColumns"
                    :key="column"
                    scope="col">
                    {{ column }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="row in directPermissionTables[space.id]!.rows"
                  :key="row.label">
                  <th scope="row">{{ row.label }}</th>
                  <td
                    v-for="(cell, index) in row.cells"
                    :key="permissionColumns[index]">
                    <span
                      v-if="!cell"
                      class="muted">
                      —
                    </span>
                    <input
                      v-else
                      :aria-label="`${permissionColumns[index]} ${row.label} in ${space.name}`"
                      :checked="cell.checked"
                      :disabled="cell.unavailable || cell.inherited"
                      :title="
                        cell.unavailable
                          ? 'Not allowed'
                          : cell.inherited
                            ? 'Inherited'
                            : undefined
                      "
                      type="checkbox"
                      @change="
                        draft.direct[space.id]![cell.key] =
                          !draft.direct[space.id]![cell.key]
                      " />
                  </td>
                </tr>
              </tbody>
            </table>
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
const permissionColumns = ['Create', 'Update', 'Delete'] as const
const permissionDefinitions: Array<{
  directKeys: Array<keyof DirectSpacePermissions | null>
  directLabel: string
  globalKeys: Array<keyof GlobalPermissions>
  globalLabel: string
}> = [
  {
    directKeys: [null, 'canUpdate', 'canDelete'],
    directLabel: 'Space',
    globalKeys: ['canCreateSpaces', 'canUpdateSpaces', 'canDeleteSpaces'],
    globalLabel: 'Spaces',
  },
  {
    directKeys: ['canCreateBoards', 'canUpdateBoards', 'canDeleteBoards'],
    directLabel: 'Boards',
    globalKeys: ['canCreateBoards', 'canUpdateBoards', 'canDeleteBoards'],
    globalLabel: 'Boards',
  },
  {
    directKeys: ['canCreateIssues', 'canUpdateIssues', 'canDeleteIssues'],
    directLabel: 'Issues',
    globalKeys: ['canCreateIssues', 'canUpdateIssues', 'canDeleteIssues'],
    globalLabel: 'Issues',
  },
]

const draft = ref(structuredClone(toRaw(props.viewModel.permissions)))
// Each row inherits the same operation from the rows above it.
const globalPermissionRows = computed(() => {
  const inherited = [false, false, false]
  return permissionDefinitions.map((definition) => ({
    cells: definition.globalKeys.map((key, index) => {
      const cell = {
        checked: draft.value.global[key] || inherited[index]!,
        inherited: inherited[index]!,
        key,
      }
      inherited[index] = cell.checked
      return cell
    }),
    label: definition.globalLabel,
  }))
})
const globalReadInherited = computed(() =>
  globalPermissionRows.value.some((row) =>
    row.cells.some((cell) => cell.checked),
  ),
)
const directPermissionTables = computed(() =>
  Object.fromEntries(
    props.viewModel.spaces.map((space) => {
      const inherited = [false, false, false]
      const rows = permissionDefinitions.map((definition, rowIndex) => ({
        cells: definition.directKeys.map((key, index) => {
          if (!key) {
            return null
          }
          const cell = {
            inherited:
              globalPermissionRows.value[rowIndex]!.cells[index]!.checked ||
              inherited[index]!,
            key,
            unavailable: space.isDefault && key === 'canDelete',
          }
          const checked =
            !cell.unavailable &&
            (draft.value.direct[space.id]![key] || cell.inherited)
          inherited[index] = checked
          return { ...cell, checked }
        }),
        label: definition.directLabel,
      }))
      return [
        space.id,
        {
          readInherited:
            draft.value.global.canRead ||
            globalReadInherited.value ||
            rows.some((row) =>
              row.cells.some((cell) => cell?.checked ?? false),
            ),
          rows,
        },
      ]
    }),
  ),
)
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

.read-permission {
  align-items: center;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-control);
  display: flex;
  justify-content: space-between;
  padding: var(--space-3);
}

.permission-table {
  border: 1px solid var(--color-border);
  border-collapse: separate;
  border-radius: var(--radius-control);
  border-spacing: 0;
  margin-top: var(--space-3);
  overflow: hidden;
  table-layout: fixed;
  width: 100%;
}

.permission-table th,
.permission-table td {
  border-bottom: 1px solid var(--color-border);
  padding: var(--space-3);
}

.permission-table tr:last-child > * {
  border-bottom: 0;
}

.permission-table th {
  font-weight: var(--font-weight-semibold);
  text-align: left;
}

.permission-table thead th {
  background: var(--color-hover);
  color: var(--color-muted);
  font-size: var(--font-size-small);
}

.permission-table :is(th, td):not(:first-child) {
  text-align: center;
  width: 18%;
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

.direct-permissions {
  padding: var(--space-4) 0 var(--space-1) var(--space-6);
}

@media (max-width: 760px) {
  .permissions-editor {
    margin-top: var(--space-4);
  }

  .permission-grid {
    grid-template-columns: 1fr;
  }

  .permission-table th,
  .permission-table td {
    padding: var(--space-2);
  }

  .direct-permissions {
    padding-left: 0;
  }
}
</style>
