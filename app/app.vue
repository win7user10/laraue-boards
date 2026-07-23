<template>
  <NuxtRouteAnnouncer />
  <NuxtLoadingIndicator
    color="var(--color-accent)"
    :height="3" />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
useHead({
  link: [{ href: '/favicon.svg', rel: 'icon', type: 'image/svg+xml' }],
  titleTemplate: (title) => (title ? `${title} · Laraue Boards` : 'Laraue Boards'),
})
</script>
