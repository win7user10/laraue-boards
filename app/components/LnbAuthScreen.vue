<script setup lang="ts">

</script>

<template>
  <div class="auth-screen">
    <div class="card">
      <slot></slot>
    </div>
  </div>
</template>

<style scoped>
.auth-screen{position:fixed;inset:0;background:var(--bg);display:flex;align-items:center;justify-content:center;z-index:99;padding:calc(20px + var(--safe-top)) calc(20px + var(--safe-right)) calc(20px + var(--safe-bottom)) calc(20px + var(--safe-left))}
.card {width:100%;max-width:400px;background:var(--surface);border:1px solid var(--border);border-radius:16px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.4);}
</style>