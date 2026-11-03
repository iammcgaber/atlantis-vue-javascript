<script setup>
import { useLayoutStore } from '@/stores/layout';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

const layout = useLayoutStore();
const { t, locale } = useI18n();

const YEAR = 2025;

// Placeholder data until real data is connected: one value per month of each period.
const periods = [
    { id: 'h1', months: [0, 1, 2, 3, 4, 5, 6], sales: [37, 34, 21, 27, 10, 18, 15], revenue: [31, 27, 30, 37, 23, 29, 20], expenses: [21, 7, 13, 3, 19, 11, 6], customers: [47, 31, 35, 20, 46, 39, 25] },
    { id: 'h2', months: [7, 8, 9, 10, 11], sales: [31, 27, 30, 37, 23], revenue: [47, 31, 35, 20, 46], expenses: [37, 34, 21, 27, 10], customers: [21, 7, 13, 3, 19] }
];
const selectedPeriod = ref(periods[0].id);
const period = computed(() => periods.find((p) => p.id === selectedPeriod.value));

const monthName = (month, style) => new Intl.DateTimeFormat(locale.value, { month: style }).format(new Date(YEAR, month, 1));

const periodOptions = computed(() =>
    periods.map((p) => ({
        id: p.id,
        label: t('dashboard.monthRange', { start: monthName(p.months[0], 'long'), end: monthName(p.months.at(-1), 'long'), year: YEAR })
    }))
);

const series = computed(() => [
    { key: 'sales', label: t('dashboard.series.sales'), color: '#EEE500', background: 'rgba(238, 229, 0, 0.05)' },
    { key: 'revenue', label: t('dashboard.series.revenue'), color: '#00D0DE', background: 'rgba(0, 208, 222, 0.05)' },
    { key: 'expenses', label: t('dashboard.series.expenses'), color: '#FC6161', background: 'rgba(253, 72, 74, 0.05)' },
    { key: 'customers', label: t('dashboard.series.customers'), color: '#0F8BFD', background: 'rgba(15, 139, 253, 0.05)' }
]);

// Rebuilt when the language or the period changes, so labels follow.
const revenueChart = computed(() => ({
    labels: period.value.months.map((month) => monthName(month, 'long')),
    datasets: series.value.map((s) => ({
        label: s.label,
        data: period.value[s.key],
        borderColor: s.color,
        pointBackgroundColor: s.color,
        backgroundColor: s.background,
        fill: true,
        tension: 0.4
    }))
}));

const revenueChartOptions = computed(() => {
    void layout.isDarkTheme;
    const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text-color');

    return {
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: textColor } } },
        responsive: true,
        hover: { mode: 'index' },
        scales: {
            x: { ticks: { color: textColor } },
            y: { ticks: { color: textColor, min: 0, max: 60, stepSize: 5 } }
        }
    };
});
</script>

<template>
    <div class="card">
        <div class="card-header leading-loose">
            <h2 class="m-0 text-base font-normal">{{ $t('dashboard.monthlyRevenue') }}</h2>
            <Select v-model="selectedPeriod" :options="periodOptions" optionLabel="label" optionValue="id" :ariaLabel="$t('dashboard.period')"></Select>
        </div>
        <div class="graph">
            <Chart type="line" :height="426" :data="revenueChart" :options="revenueChartOptions" id="revenue-chart"></Chart>
        </div>
    </div>
</template>
