<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t, locale } = useI18n();

// Placeholder data until real data is connected. Country names come from Intl in the current language.
const countries = [
    { region: 'US', share: 0.25, color: 'var(--p-cyan-400)', shadow: 'rgba(0, 208, 222, 0.3)' },
    { region: 'JP', share: 0.17, color: 'var(--p-red-400)', shadow: 'rgba(252, 97, 97, 0.3)' },
    { region: 'AU', share: 0.15, color: 'var(--p-yellow-400)', shadow: 'rgba(238, 229, 0, 0.3)' },
    { region: 'CN', share: 0.08, color: 'var(--p-blue-400)', shadow: 'rgba(15, 139, 253, 0.3)' },
    { region: null, share: 0.05, color: 'var(--p-gray-400)', shadow: 'transparent' }
];

const rows = computed(() => {
    const names = new Intl.DisplayNames([locale.value], { type: 'region' });

    return countries.map((country) => ({ ...country, name: country.region ? names.of(country.region) : t('dashboard.otherCountries') }));
});

const countryChart = {
    datasets: [
        {
            data: [30, 18, 36, 54, 61],
            backgroundColor: ['#0F8BFD', '#545C6B', '#EC4DBC', '#EEE500', '#FC6161'],
            hoverBackgroundColor: ['#0F8BFD', '#545C6B', '#EC4DBC', '#EEE500', '#FC6161'],
            borderColor: 'transparent',
            fill: true
        }
    ]
};

const countryChartOptions = {
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: false
        }
    }
};
</script>

<template>
    <div class="card">
        <h2 class="m-0 text-base font-medium leading-loose">{{ $t('dashboard.countryDistributions') }}</h2>
        <div class="flex justify-center mb-8">
            <Chart type="doughnut" :height="225" :data="countryChart" :options="countryChartOptions" class="w-9/12" id="country-chart"></Chart>
        </div>
        <ul class="m-0 p-0 border-0 outline-0 list-none">
            <li v-for="row in rows" :key="row.region ?? 'other'" class="flex justify-between items-center py-2 border-b border-surface-200 dark:border-surface-700">
                <div class="flex justify-between items-center">
                    <div class="w-8 h-8 rounded me-2" :style="{ backgroundColor: row.color, boxShadow: `0px 0px 10px ${row.shadow}` }"></div>
                    <span>{{ row.name }}</span>
                </div>
                <span>{{ $n(row.share, 'percentWhole') }}</span>
            </li>
        </ul>
    </div>
</template>
