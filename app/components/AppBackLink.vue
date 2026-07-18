<template>
  <NuxtLink
    :aria-label="label"
    class="icon-btn"
    :to="to">
    <ArrowLeft />
  </NuxtLink>
</template>

<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'
import type { RouteLocationRaw } from 'vue-router'

defineProps<{ label: string; to: RouteLocationRaw }>()
</script>
