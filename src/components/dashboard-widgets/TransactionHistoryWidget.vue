<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t, n, locale } = useI18n();

// Placeholder transactions until real data is connected. Amount colours are 700 shades in light mode and 400s
// in dark mode, for 4.5:1 contrast on the card.
const transactions = [
    { kind: 'payment', ref: '28492', amount: 250, date: '2025-06-13T11:09', icon: 'pi pi-check', iconColor: '#0F8BFD', amountClass: 'text-cyan-700 dark:text-cyan-400' },
    { kind: 'refund', ref: '94830', amount: -570, date: '2025-06-13T08:22', icon: 'pi pi-refresh', iconColor: '#FC6161', amountClass: 'text-red-700 dark:text-red-400' },
    { kind: 'usersAdded', ref: '5849', count: 8, amount: 50, date: '2025-06-12T14:56', icon: 'pi pi-plus', iconColor: '#0BD18A', amountClass: 'text-green-700 dark:text-green-400' },
    { kind: 'payment', ref: '3382', amount: 3830, date: '2025-06-11T06:11', icon: 'pi pi-check', iconColor: '#0F8BFD', amountClass: 'text-cyan-700 dark:text-cyan-400' },
    { kind: 'payment', ref: '4738', amount: 845, date: '2025-06-11T03:50', icon: 'pi pi-check', iconColor: '#0F8BFD', amountClass: 'text-cyan-700 dark:text-cyan-400' },
    { kind: 'paymentFailed', ref: '60958', amount: 1450, date: '2025-06-10T19:54', icon: 'pi pi-exclamation-triangle', iconColor: '#EC4DBC', amountClass: 'text-pink-700 dark:text-pink-400' },
    { kind: 'payment', ref: '5748', amount: 50, date: '2025-06-09T23:37', icon: 'pi pi-check', iconColor: '#0F8BFD', amountClass: 'text-cyan-700 dark:text-cyan-400' },
    { kind: 'usersRemoved', ref: '5849', count: 32, amount: -240, date: '2025-06-09T20:40', icon: 'pi pi-minus', iconColor: '#FC6161', amountClass: 'text-red-700 dark:text-red-400' }
];

function describe(item) {
    switch (item.kind) {
        case 'refund':
            return t('dashboard.transactions.refund', { ref: item.ref });
        case 'usersAdded':
            return t('dashboard.transactions.usersAdded', { count: item.count, ref: item.ref });
        case 'usersRemoved':
            return t('dashboard.transactions.usersRemoved', { count: item.count, ref: item.ref });
        case 'paymentFailed':
            return t('dashboard.transactions.paymentFailed', { ref: item.ref });
        default:
            return t('dashboard.transactions.payment', { ref: item.ref });
    }
}

const events = computed(() => {
    const dateFormat = new Intl.DateTimeFormat(locale.value, { dateStyle: 'medium', timeStyle: 'short' });

    return transactions.map((item) => ({
        ...item,
        text: describe(item),
        // Failed payments show no sign: no money moved.
        amountText: `${item.kind === 'paymentFailed' ? '' : item.amount > 0 ? '+' : '−'}${n(Math.abs(item.amount), 'currency')}`,
        dateText: dateFormat.format(new Date(item.date))
    }));
});
</script>

<template>
    <div class="card p-0">
        <div class="timeline-header p-4 flex justify-between items-center">
            <h2 class="m-0 text-base font-normal">{{ $t('dashboard.transactionHistory') }}</h2>
            <div class="header-icons">
                <i class="pi pi-refresh ms-2"></i>
                <i class="pi pi-filter ms-2"></i>
            </div>
        </div>
        <div class="timeline-content pb-4">
            <Timeline :value="events" class="customized-timeline py-0 px-4">
                <template #marker="slotProps">
                    <span class="rounded-full p-1 w-8 h-8 flex justify-center items-center text-white" :style="{ backgroundColor: slotProps.item.iconColor }">
                        <i :class="slotProps.item.icon"></i>
                    </span>
                </template>
                <template #content="slotProps">
                    <div class="flex items-center justify-between gap-2">
                        <p class="m-0">{{ slotProps.item.text }}</p>
                        <span :class="['font-bold whitespace-nowrap', slotProps.item.amountClass]">{{ slotProps.item.amountText }}</span>
                    </div>
                    <span class="text-sm text-surface-500 dark:text-surface-400">{{ slotProps.item.dateText }}</span>
                </template>
            </Timeline>
        </div>
        <div class="timeline-footer border-t border-surface-200 dark:border-surface-700 p-4 flex items-center justify-center">
            <a href="#" class="text-primary hover:text-primary-400 duration-200">{{ $t('dashboard.viewAllTransactions') }}</a>
        </div>
    </div>
</template>

<style lang="scss" scoped>
:deep(.customized-timeline) {
    .p-timeline-event:nth-child(even) {
        flex-direction: row !important;

        .p-timeline-event-content {
            text-align: start !important;
        }
    }

    .p-timeline-event-opposite {
        flex: 0;
        padding: 0;
    }

    .p-card {
        margin-top: 1rem;
    }
}
</style>
