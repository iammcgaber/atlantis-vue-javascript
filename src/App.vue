<script setup>
import { authClient } from '@/auth/client';
import { flagsIdentityChanged, identifyFlagsUser } from '@/flags';
import AppLockScreen from '@/layout/AppLockScreen.vue';
import { useLockStore } from '@/stores/lock';
import { computed, watch } from 'vue';

const lock = useLockStore();
const session = authClient.useSession();

// Feature flags follow the signed-in user and their role (no-op until Flagsmith is configured).
watch(
    () => session.value.data?.user,
    (user, previous) => {
        if (flagsIdentityChanged(user, previous)) identifyFlagsUser(user ?? null);
    }
);

// Covers the app while the session is still loading too, so a reload doesn't flash the page.
const showLockScreen = computed(() => lock.locked && (session.value.isPending || Boolean(session.value.data)));
</script>

<template>
    <div class="contents" :inert="showLockScreen || undefined">
        <router-view />
    </div>
    <AppLockScreen v-if="showLockScreen" :user="session.data?.user" />
</template>
