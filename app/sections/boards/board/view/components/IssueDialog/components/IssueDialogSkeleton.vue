<template>
  <div
    aria-label="Loading issue"
    class="issue-dialog-skeleton"
    role="status">
    <div class="skeleton-header">
      <span class="skeleton skeleton-title" />
      <span class="skeleton skeleton-link" />
      <span class="skeleton skeleton-close" />
    </div>
    <div class="skeleton-content">
      <div class="skeleton-main">
        <span class="skeleton skeleton-label" />
        <span class="skeleton skeleton-text" />
      </div>
      <div class="skeleton-side">
        <div
          v-for="field in 6"
          :key="field"
          class="skeleton-field-group">
          <span class="skeleton skeleton-label" />
          <span class="skeleton skeleton-field" />
        </div>
        <div class="skeleton-field-group">
          <span class="skeleton skeleton-label" />
          <div class="skeleton-person">
            <span class="skeleton skeleton-avatar" />
            <span class="skeleton skeleton-name" />
          </div>
        </div>
        <div class="skeleton-dates">
          <div class="skeleton-field-group">
            <span class="skeleton skeleton-label" />
            <span class="skeleton skeleton-date" />
          </div>
          <div class="skeleton-field-group">
            <span class="skeleton skeleton-label" />
            <span class="skeleton skeleton-date" />
          </div>
        </div>
      </div>
    </div>
    <div class="skeleton-actions">
      <span class="skeleton skeleton-button skeleton-button--delete" />
      <div class="skeleton-actions-end">
        <span class="skeleton skeleton-button" />
        <span class="skeleton skeleton-button skeleton-button--primary" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.issue-dialog-skeleton {
  animation: issue-dialog-pulse 1.4s ease-in-out infinite;
  display: grid;
  gap: 0;
  grid-template-rows: auto minmax(0, 1fr) auto;
  min-height: calc(
    var(--issue-dialog-min-height) - var(--issue-dialog-padding-block) -
      var(--issue-dialog-padding-block) - 2px
  );
}

.skeleton {
  background: color-mix(in srgb, var(--color-border) 40%, var(--color-surface));
  border-radius: var(--radius-control);
  display: block;
}

.skeleton-title {
  height: 28px;
  width: 104px;
}

.skeleton-header,
.skeleton-person,
.skeleton-actions,
.skeleton-actions-end {
  align-items: center;
  display: flex;
  gap: var(--space-2);
}

.skeleton-header {
  padding-bottom: var(--space-4);
}

.skeleton-link {
  border-radius: var(--radius-pill);
  height: var(--icon-size);
  width: var(--icon-size);
}

.skeleton-close {
  height: var(--control-height-compact);
  margin-left: auto;
  width: var(--control-height-compact);
}

.skeleton-content {
  display: grid;
  gap: var(--space-6);
  grid-template-columns: minmax(0, 5fr) minmax(0, 3fr);
  min-height: 0;
  padding: var(--space-6) var(--space-1) var(--space-1);
}

.skeleton-main {
  display: grid;
  gap: var(--space-2);
  grid-template-rows: auto minmax(0, 1fr);
  min-height: 0;
}

.skeleton-text {
  height: 100%;
}

.skeleton-side {
  align-content: start;
  display: grid;
  gap: var(--space-5);
  min-height: 0;
  overflow: hidden;
}

.skeleton-field-group {
  display: grid;
  gap: var(--space-2);
}

.skeleton-label {
  border-radius: var(--radius-small);
  height: 14px;
  margin-block: 3px 4px;
  width: 72px;
}

.skeleton-field {
  height: var(--control-height);
}

.skeleton-avatar {
  height: 28px;
  width: 28px;
}

.skeleton-person {
  min-height: var(--control-height);
}

.skeleton-name {
  height: 14px;
  width: 104px;
}

.skeleton-dates {
  display: grid;
  gap: var(--space-2);
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.skeleton-date {
  height: 14px;
  width: 120px;
}

.skeleton-actions {
  justify-content: space-between;
  padding-top: var(--space-4);
}

.skeleton-button {
  height: var(--control-height);
  width: 80px;
}

.skeleton-button--delete {
  width: 76px;
}

.skeleton-button--primary {
  width: 128px;
}

@keyframes issue-dialog-pulse {
  50% {
    opacity: 0.45;
  }
}

@media (max-width: 760px) {
  .skeleton-content {
    grid-template-columns: 1fr;
  }

  .skeleton-side {
    display: none;
  }
}
</style>
