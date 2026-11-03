<script setup>
import CountryDistributionsWidget from '@/components/dashboard-widgets/CountryDistributionsWidget.vue';
import MonthlyRevenueWidget from '@/components/dashboard-widgets/MonthlyRevenueWidget.vue';
import StatsWidget from '@/components/dashboard-widgets/StatsWidget.vue';
import TransactionHistoryWidget from '@/components/dashboard-widgets/TransactionHistoryWidget.vue';
import UniqueVisitorWidget from '@/components/dashboard-widgets/UniqueVisitorWidget.vue';
</script>

<template>
    <!-- The breadcrumb already shows the page name, so the heading is for screen readers only. -->
    <h1 class="sr-only">{{ $t('nav.dashboard') }}</h1>
    <div class="grid grid-cols-12 gap-8">
        <StatsWidget />

        <div class="col-span-12 md:col-span-8">
            <UniqueVisitorWidget />
        </div>

        <div class="col-span-12 md:col-span-4">
            <TransactionHistoryWidget />
        </div>

        <div class="col-span-12 md:col-span-4">
            <CountryDistributionsWidget />
        </div>

        <div class="col-span-12 md:col-span-8">
            <MonthlyRevenueWidget />
        </div>
    </div>
</template>
