<template>
  <div class="shell">
    <aside :class="{ open: sidebarOpen }">
      <NuxtLink
        class="logo"
        :to="organizationRoutes.issues()">
        <img
          alt=""
          class="logo-mark"
          src="/favicon.svg" />
        <span>Laraue Boards</span>
      </NuxtLink>
      <div
        class="organization"
        @click="sidebarOpen = false">
        <NuxtLink
          :aria-label="`Switch organization. Current organization: ${viewModel.organization.name}`"
          class="organization-select"
          title="Switch organization"
          to="/organizations">
          <span
            class="entity-avatar"
            :style="{ background: viewModel.organization.color }">
            {{ viewModel.organization.initial }}
          </span>
          <span class="organization-name">
            {{ viewModel.organization.name }}
          </span>
          <ChevronsUpDown class="organization-switch-icon" />
        </NuxtLink>
      </div>
      <nav
        aria-label="Main navigation"
        @click="sidebarOpen = false">
        <NuxtLink
          :class="{
            active: active('organizations-organizationKey-issues'),
          }"
          :to="organizationRoutes.issues()">
          <ClipboardList />
          All issues
        </NuxtLink>
        <div class="nav-title">Spaces</div>
        <div
          v-for="space in viewModel.spaces"
          :key="space.id"
          class="space-group">
          <NuxtLink
            :class="{ active: spaceActive(space) }"
            :to="organizationRoutes.space(space.key)">
            <SpaceIcon :style="{ color: space.color }" />
            {{ space.name }}
          </NuxtLink>
        </div>
        <NuxtLink
          v-if="viewModel.organization.canCreateSpaces"
          :to="organizationRoutes.newSpace()">
          <Plus />
          Create space
        </NuxtLink>
        <div
          v-if="
            viewModel.organization.canUpdate ||
            viewModel.organization.canManage ||
            viewModel.organization.canManageAttributes ||
            viewModel.organization.canMassMove
          "
          class="nav-title">
          Settings
        </div>
        <NuxtLink
          v-if="viewModel.organization.canUpdate"
          :class="{
            active: active('organizations-organizationKey-settings'),
          }"
          :to="organizationRoutes.settings()">
          <Settings />
          General
        </NuxtLink>
        <NuxtLink
          v-if="viewModel.organization.canManage"
          :class="{
            active: within(
              'organizations-organizationKey-settings-permissions',
            ),
          }"
          :to="organizationRoutes.permissions()">
          <ShieldCheck />
          Permissions
        </NuxtLink>
        <NuxtLink
          v-if="viewModel.organization.canManageAttributes"
          :class="{
            active: within('organizations-organizationKey-settings-attributes'),
          }"
          :to="organizationRoutes.attributes()">
          <Tags />
          Attributes
        </NuxtLink>
        <NuxtLink
          v-if="viewModel.organization.canMassMove"
          :class="{
            active: active(
              'organizations-organizationKey-settings-data-movement',
            ),
          }"
          :to="organizationRoutes.dataMovement()">
          <ArrowRightLeft />
          Data movement
        </NuxtLink>
      </nav>
      <div class="sidebar-footer">
        <div class="sidebar-user">
          <span
            class="avatar"
            :style="{ background: viewModel.user.color }">
            {{ viewModel.user.initials }}
          </span>
          <span>
            <strong>{{ viewModel.user.name }}</strong>
            <small class="muted">Signed in</small>
          </span>
        </div>
        <button
          class="secondary sidebar-action"
          type="button"
          @click="toggleTheme">
          <span class="theme-action theme-action--light">
            <Sun />
            Light mode
          </span>
          <span class="theme-action theme-action--dark">
            <Moon />
            Dark mode
          </span>
        </button>
        <button
          class="secondary danger sidebar-action"
          type="button"
          @click="$emit('logout')">
          <LogOut />
          Log out
        </button>
      </div>
    </aside>
    <Transition name="fade">
      <button
        v-if="sidebarOpen"
        aria-label="Close menu"
        class="scrim"
        @click="sidebarOpen = false" />
    </Transition>
    <main>
      <button
        v-if="!sidebarOpen"
        aria-label="Open menu"
        class="icon-btn mobile-menu-button"
        type="button"
        @click="sidebarOpen = true">
        <Menu />
      </button>
      <slot />
    </main>
  </div>
</template>

<script lang="ts">
export type AppLayoutViewModel = {
  organization: {
    canCreateSpaces: boolean
    canManage: boolean
    canManageAttributes: boolean
    canMassMove: boolean
    canUpdate: boolean
    color: string
    id: string
    initial: string
    name: string
  }
  spaces: Array<{
    color: string
    id: string
    key: string
    name: string
  }>
  user: { color: string; initials: string; name: string }
}

type AppLayoutProps = {
  viewModel: AppLayoutViewModel
}
</script>

<script setup lang="ts">
import {
  ArrowRightLeft,
  ChevronsUpDown,
  ClipboardList,
  LogOut,
  Menu,
  Moon,
  Plus,
  Settings,
  ShieldCheck,
  Sun,
  Tags,
} from 'lucide-vue-next'

import { SpaceIcon } from '../../../../constants/icons'

const props = defineProps<AppLayoutProps>()
defineEmits<{ logout: [] }>()
const route = useRoute<OrganizationRouteName>()
const organizationRoutes = useOrganizationRoutes()
const sidebarOpen = ref(false)
const active = (name: OrganizationRouteName) => route.name === name
const within = (name: OrganizationRouteName) => route.name.startsWith(name)
const spaceActive = (space: AppLayoutViewModel['spaces'][number]) =>
  within('organizations-organizationKey-spaces-spaceKey') &&
  'spaceKey' in route.params &&
  route.params.spaceKey === space.key
const toggleTheme = () => {
  const root = document.documentElement
  const theme = root.dataset.theme === 'dark' ? 'light' : 'dark'
  root.dataset.theme = theme
  localStorage.setItem('theme', theme)
}
</script>

<style scoped>
.shell {
  --layout-content-padding: var(--space-6);

  align-items: start;
  background: var(--color-workspace);
  border-inline: 1px solid var(--color-divider);
  box-shadow: var(--shadow-workspace);
  display: grid;
  grid-template-columns: 240px minmax(0, 1fr);
  margin-inline: auto;
  max-width: var(--workspace-max-width);
  min-height: 100vh;
}

aside {
  background: var(--color-surface);
  border-right: 1px solid var(--color-divider);
  display: flex;
  flex-direction: column;
  height: 100dvh;
  overflow-y: auto;
  padding: var(--space-4) var(--space-3);
  position: sticky;
  top: 0;
  width: 100%;
}

aside .logo {
  padding: var(--space-1) var(--space-2) var(--space-5);
}

nav {
  margin-bottom: var(--space-4);
  overflow: hidden auto;
}

nav a,
nav button {
  align-items: center;
  background: transparent;
  border: 0;
  border-radius: var(--radius-control);
  color: var(--color-muted);
  display: flex;
  gap: var(--space-2);
  margin: 2px 0;
  padding: var(--space-2) var(--space-3);
  text-align: left;
  text-decoration: none;
  transition: var(--transition-press);
  width: 100%;
}

nav a:hover,
nav button:hover {
  background: var(--color-soft);
  color: var(--color-text);
}

nav a:active,
nav button:active {
  translate: 0 var(--press-offset);
}

nav a.active,
nav button.active {
  background: var(--color-accent-soft);
  color: var(--color-accent);
  font-weight: var(--font-weight-bold);
}

.nav-title {
  color: var(--color-muted);
  font-size: var(--font-size-caption);
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.08em;
  padding: var(--space-5) var(--space-3) var(--space-2);
  text-transform: uppercase;
}

main {
  display: grid;
  grid-column: 2;
  height: 100dvh;
  min-width: 0;
  overflow: auto;
  padding: var(--layout-content-padding);
  position: relative;
  scrollbar-gutter: stable;
  width: 100%;
}

main :deep(.page-load-state) {
  min-height: 0;
  padding: 0;
}

.mobile-menu-button {
  display: none;
}

.mobile-menu-button:hover {
  background: var(--color-hover);
}

.scrim {
  background: #10182880;
  border: 0;
  border-radius: 0;
  inset: 0;
  position: fixed;
  z-index: 29;
}

.sidebar-footer {
  border-top: 1px solid var(--color-divider);
  display: grid;
  gap: var(--space-2);
  margin-top: auto;
  padding-top: var(--space-3);
}

.sidebar-user {
  align-items: center;
  display: flex;
  gap: var(--space-2);
  min-width: 0;
  padding: var(--space-2);
}

.sidebar-user > span:last-child {
  display: grid;
  min-width: 0;
}

.sidebar-user strong,
.sidebar-user small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sidebar-action {
  justify-content: flex-start;
  width: 100%;
}

.theme-action {
  align-items: center;
  display: flex;
  gap: var(--space-2);
}

.theme-action--light {
  display: none;
}

:global(:root[data-theme='dark'] .theme-action--dark) {
  display: none;
}

:global(:root[data-theme='dark'] .theme-action--light) {
  display: flex;
}

.organization {
  align-items: center;
  background: var(--color-soft);
  border-radius: var(--radius-control);
  color: var(--color-text);
  display: flex;
  font-weight: var(--font-weight-bold);
  gap: var(--space-2);
  margin-bottom: var(--space-5);
  min-width: 0;
  position: relative;
  width: 100%;
}

.organization-select {
  align-items: center;
  border: 1px solid transparent;
  border-radius: var(--radius-control);
  color: inherit;
  display: flex;
  gap: var(--space-2);
  min-width: 0;
  padding: var(--space-2) var(--space-3);
  text-decoration: none;
  transition: var(--transition-press);
  width: 100%;
}

.organization-select:hover {
  border-color: var(--color-border);
}

.organization-select:active {
  translate: 0 var(--press-offset);
}

.organization-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.organization-switch-icon {
  color: var(--color-muted);
  flex-shrink: 0;
}

@media (max-width: 760px) {
  .shell {
    --layout-content-padding: var(--space-3);

    border-inline: 0;
    box-shadow: none;
    display: block;
    padding: 0;
  }

  :global(body:has(aside.open)) {
    overflow: hidden;
  }

  aside {
    border-radius: 0;
    height: 100dvh;
    inset: 0 auto 0 0;
    overflow-y: auto;
    overscroll-behavior-y: contain;
    position: fixed;
    transform: translateX(-100%);
    transition: transform var(--duration-base) var(--ease-standard);
    width: 280px;
    z-index: 30;
  }

  aside.open {
    box-shadow: 0 0 40px #00000059;
    transform: none;
  }

  main {
    grid-column: auto;
    width: 100%;
  }

  main :deep(.page-heading) {
    padding-left: calc(var(--control-height-compact) + var(--space-2));
  }

  .mobile-menu-button {
    display: inline-flex;
    left: var(--layout-content-padding);
    position: absolute;
    top: calc(var(--layout-content-padding) + var(--space-1));
    z-index: 28;
  }
}
</style>
