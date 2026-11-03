<script setup>
import StatusPage from '@/components/auth/StatusPage.vue';
</script>

<template>
    <StatusPage :title="$t('status.access')" :subtitle="$t('status.denied')" :message="$t('status.accessDeniedMessage')" color="orange" severity="warn" />
</template>
