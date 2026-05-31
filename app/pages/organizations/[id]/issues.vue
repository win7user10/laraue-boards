<script setup lang="ts">

import LnbElementWithHelpLink from "~/components/modals/LnbElementWithHelpLink.vue";
</script>

<template>
  <LnbBoardHeader>
    <template #title>
      <LnbElementWithHelpLink link-href="asd" link-title="asd">
        All Issues
      </LnbElementWithHelpLink>
    </template>
    <template #subtitle>
      55 issues across 1 epics
    </template>
  </LnbBoardHeader>
</template>

<style scoped>

</style>