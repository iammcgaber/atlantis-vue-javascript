<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

// Placeholder figures until real data is connected. Numbers are formatted for the current language.
const stats = computed(() => [
    { key: 'conversionRate', label: t('dashboard.conversionRate'), change: -0.006, value: 0.0081, format: 'percent', color: '#fc6161', shadow: 'rgba(252, 97, 97, 0.3)', icon: 'pi pi-arrow-down', image: 'rate' },
    { key: 'avgOrderValue', label: t('dashboard.avgOrderValue'), change: 0.042, value: 306.2, format: 'currency', color: '#0bd18a', shadow: 'rgba(11, 209, 138, 0.3)', icon: 'pi pi-arrow-up', image: 'value' },
    { key: 'orderQuantity', label: t('dashboard.orderQuantity'), change: 0.021, value: 1620, format: 'integer', color: '#00d0de', shadow: 'rgba(0, 208, 222, 0.3)', icon: 'pi pi-minus', image: 'quantity' }
]);
</script>

<template>
    <div v-for="stat in stats" :key="stat.key" class="col-span-12 md:col-span-4">
        <div class="card relative h-28 rounded-xl p-4">
            <h2 class="m-0 text-sm font-medium leading-none">{{ stat.label }}</h2>
            <div class="relative z-10 flex justify-between">
                <div class="flex justify-between items-center">
                    <div class="flex justify-center items-center h-8 min-w-20 rounded p-2 me-4 text-black" :style="{ backgroundColor: stat.color, boxShadow: `0px 6px 20px ${stat.shadow}` }">
                        <i :class="stat.icon" class="w-8"></i>
                        <span class="leading-tight">{{ $n(Math.abs(stat.change), 'percent') }}</span>
                    </div>
                    <div class="leading-loose text-3xl">{{ $n(stat.value, stat.format) }}</div>
                </div>
            </div>
            <img class="absolute bottom-3.5 end-3" :src="`/demo/images/ecommerce-dashboard/${stat.image}.svg`" alt="" />
        </div>
    </div>
</template>
