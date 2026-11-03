<script setup>
import { useLayoutStore } from '@/stores/layout';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

const layout = useLayoutStore();
const { t, locale } = useI18n();

// Placeholder data until real data is connected: plan and actual per month, by year.
const data = {
    2025: { plan: [630, 630, 695, 695, 695, 760, 760, 760, 840, 840, 840, 840], actual: [600, 671, 660, 665, 700, 610, 810, 790, 710, 860, 810, 780] },
    2024: { plan: [580, 580, 620, 620, 620, 680, 680, 680, 730, 730, 730, 730], actual: [550, 592, 600, 605, 630, 649, 660, 690, 710, 720, 730, 780] }
};
const years = Object.keys(data).sort().reverse();
const selectedYear = ref(years[0]);

const growth = 620076;
const avgCustomer = 1120;

// Rebuilt when the language, theme or primary colour changes, so labels and colours follow.
const visitorChart = computed(() => {
    void layout.config.primary;
    void layout.isDarkTheme;
    const documentStyle = getComputedStyle(document.documentElement);
    const monthFormat = new Intl.DateTimeFormat(locale.value, { month: 'short' });

    return {
        labels: Array.from({ length: 12 }, (_, month) => monthFormat.format(new Date(2025, month, 1))),
        datasets: [
            {
                label: t('dashboard.plan'),
                data: data[selectedYear.value].plan,
                borderColor: ['#FC6161'],
                pointBorderColor: 'transparent',
                pointBackgroundColor: 'transparent',
                type: 'line',
                fill: false,
                barPercentage: 0.5,
                stepped: true
            },
            {
                label: t('dashboard.growthActual'),
                data: data[selectedYear.value].actual,
                backgroundColor: documentStyle.getPropertyValue('--primary-color'),
                fill: true,
                barPercentage: 0.5
            }
        ]
    };
});

const visitorChartOptions = computed(() => {
    void layout.isDarkTheme;
    const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text-color');

    return {
        plugins: {
            legend: { position: 'top', align: 'end', labels: { color: textColor } }
        },
        responsive: true,
        maintainAspectRatio: false,
        hover: { mode: 'index' },
        scales: {
            y: { ticks: { color: textColor }, min: 500, max: 900, grid: { display: false } },
            x: { ticks: { color: textColor }, barPercentage: 0.5, grid: { display: false } }
        }
    };
});
</script>

<template>
    <div class="card widget-visitor-graph">
        <div class="card-header leading-loose">
            <h2 class="m-0 text-base font-normal">{{ $t('dashboard.uniqueVisitorGraph') }}</h2>
            <Select v-model="selectedYear" :options="years" :ariaLabel="$t('dashboard.year')"></Select>
        </div>
        <div class="graph-content grid grid-cols-12 gap-4 mt-6">
            <div class="col-span-12 md:col-span-6">
                <div class="text-3xl font-semibold">{{ $n(growth, 'currencyWhole') }}</div>
                <div class="font-semibold my-4 uppercase">{{ $t('dashboard.mrrGrowth') }}</div>
                <p class="text-surface-500 dark:text-surface-400">
                    {{ $t('dashboard.mrrGrowthDescription') }} <a href="#" class="text-primary underline! hover:text-primary-400 duration-200">{{ $t('dashboard.learnMore') }}</a>
                </p>
            </div>
            <div class="col-span-12 md:col-span-6">
                <div class="text-3xl font-semibold">{{ $n(avgCustomer, 'currencyWhole') }}</div>
                <div class="font-semibold my-4 uppercase">{{ $t('dashboard.avgMrrPerCustomer') }}</div>
                <p class="text-surface-500 dark:text-surface-400">
                    {{ $t('dashboard.avgMrrPerCustomerDescription') }} <a href="#" class="text-primary underline! hover:text-primary-400 duration-200">{{ $t('dashboard.learnMore') }}</a>
                </p>
            </div>
        </div>
        <div class="graph">
            <h3 class="text-xl font-semibold mt-6 mb-0">{{ $t('dashboard.revenue') }}</h3>
            <Chart type="bar" :height="380" :data="visitorChart" :options="visitorChartOptions" id="visitor-chart"></Chart>
        </div>
    </div>
</template>
