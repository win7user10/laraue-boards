<template>
  <section class="permissions-page">
    <div class="title-row">
      <div class="page-heading">
        <ShieldCheck class="page-heading-icon" />
        <div class="page-heading-text">
          <h1>Permissions</h1>
        </div>
      </div>
    </div>
    <div
      v-if="viewModel.members.length"
      class="member-list">
      <NuxtLink
        v-for="member in viewModel.members"
        :key="member.id"
        :to="organizationRoutes.memberPermissions(member.id)">
        <span class="avatar">
          {{ member.initials }}
        </span>
        <span class="member-name">
          <strong>{{ member.name }}</strong>
          <small class="muted">
            {{ member.isOwner ? 'Owner' : member.isAdmin ? 'Admin' : 'Member' }}
          </small>
        </span>
        <ChevronRight />
      </NuxtLink>
    </div>
    <p
      v-else
      class="empty">
      No organization members found.
    </p>
  </section>
</template>

<script lang="ts">
export type PermissionsPageViewModel = {
  members: Array<{
    color: string
    id: string
    initials: string
    isAdmin: boolean
    isOwner: boolean
    name: string
  }>
}

type PermissionsPageProps = {
  viewModel: PermissionsPageViewModel
}
</script>

<script setup lang="ts">
import { ChevronRight, ShieldCheck } from 'lucide-vue-next'

defineProps<PermissionsPageProps>()
const organizationRoutes = useOrganizationRoutes()
</script>

<style scoped>
.member-list {
  display: grid;
  gap: var(--space-2);
  margin-top: var(--space-6);
}

.member-list a {
  align-items: center;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  color: var(--color-text);
  display: grid;
  gap: var(--space-3);
  grid-template-columns: auto 1fr auto;
  padding: var(--space-3) var(--space-4);
  text-decoration: none;
  transition: var(--transition-press);
}

.member-list a:hover {
  background: var(--color-hover);
}

.member-list a:active {
  translate: 0 var(--press-offset);
}

.member-list a > .lucide:last-child {
  color: var(--color-muted);
}

.member-name {
  display: grid;
  min-width: 0;
}

.member-name > * {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
