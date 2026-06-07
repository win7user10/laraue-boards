<script setup lang="ts">

import LnbButton from "~/components/LnbButton.vue";
import type {FetchError} from "ofetch";
import {useOrganizationsApi} from "~/composables/organizationsApi";
import {ref} from "vue";
import LnbAuthScreen from "~/components/LnbAuthScreen.vue";

const { t } = useI18n();

definePageMeta({
  middleware: 'auth'
})

const { join } = useOrganizationsApi()

const joinCode = ref('')
const joinCodeError = ref('')

const { query } = useRoute()
onMounted(async() => {
  const code = query.code as string;
  if (code) {
    joinCode.value = code;
    await submitJoinCode()
    return navigateTo("/organizations")
  }
})

const submitJoinCode = async () => {
  try {
    await join(joinCode.value)
  } catch (_error) {
    const error = _error as FetchError;
    if (error.status === 404)
      joinCodeError.value = t('noOrgWithSuchCode');
    else if (error.status === 406)
      joinCodeError.value = t('userIsAlreadyMember');
    else
      throw _error;
  }
}

const moveBack = () => {
  navigateTo('/organizations');
}

</script>

<template>
  <LnbAuthScreen>
    <div style="background:var(--surface3);border:1px solid var(--border);border-radius:10px;padding:12px;display:flex;flex-direction:column;gap:8px">
      <div style="font-size:12px;font-weight:700;color:var(--text)">
        {{ t('enterInviteCode') }}
      </div>
      <div style="font-size:11px;color:var(--text3)">
        {{ t('askOwner') }}
      </div>
      <input
          class="auth-input"
          v-model="joinCode"
          :placeholder="t('exampleInviteCode')"
          style="text-transform:uppercase;letter-spacing:2px;font-family:'JetBrains Mono',monospace;margin-bottom:0;font-size:14px"
          @keyup.enter="submitJoinCode"
      />
      <div v-if="joinCodeError" style="font-size:11px;color:var(--red)">{{ joinCodeError }}</div>
      <div style="display:flex;gap:6px">
        <LnbButton
            @click="moveBack"
            :name="t('backToOrganizations')"
            type="ghost"/>
        <LnbButton
            :name="t('joinOrganization')"
            type="primary"
            @click="submitJoinCode"/>
      </div>
    </div>
  </LnbAuthScreen>
</template>

<style scoped>
.auth-input{width:100%;background:var(--surface3);border:1px solid var(--border);border-radius:8px;padding:10px 14px;font-size:14px;color:var(--text);outline:none;margin-bottom:10px;transition:border-color 0.15s;font-family:'Inter',sans-serif}
</style>