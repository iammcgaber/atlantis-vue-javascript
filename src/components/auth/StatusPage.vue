<script setup>
import { useLayoutStore } from '@/stores/layout';
import { computed } from 'vue';

// Full-screen status page in Atlantis's style (Error / Access Denied / Not Found): a large coloured
// word, a smaller second line and a message over the exception background.
defineProps({
    title: { type: String, required: true },
    subtitle: { type: String, default: '' },
    message: { type: String, required: true },
    // PrimeVue palette name for the headings, e.g. 'red', 'blue', 'orange'.
    color: { type: String, default: 'primary' },
    severity: { type: String, default: undefined }
});

const layout = useLayoutStore();
const APP_NAME = 'Atlantis'; // brand name, not translated
const logo = computed(() => (layout.isDarkTheme ? 'light' : 'dark'));
// Shades with at least 3:1 (large text) on the page background: 600/700 in light mode, 400/500 in dark mode.
const shades = computed(() => (layout.isDarkTheme ? { title: 400, subtitle: 500 } : { title: 600, subtitle: 700 }));
</script>

<template>
    <div :class="['min-h-screen', layout.isDarkTheme ? 'layout-dark' : 'layout-light']" :style="{ backgroundColor: 'var(--surface-ground)', backgroundImage: 'var(--exception-pages-image)', backgroundRepeat: 'no-repeat', backgroundSize: 'contain' }">
        <main class="min-h-screen flex flex-col items-center justify-center px-8 py-16 text-center">
            <!-- One heading, so screen readers hear "Access denied" rather than two separate parts. -->
            <h1 class="m-0 mb-10 font-black leading-none">
                <span class="block uppercase text-8xl sm:text-[140px]" :style="{ color: `var(--p-${color}-${shades.title})` }">{{ title }}</span>
                <span v-if="subtitle" class="block text-5xl sm:text-[80px]" :style="{ color: `var(--p-${color}-${shades.subtitle})` }">{{ subtitle }}</span>
            </h1>
            <p class="text-2xl sm:text-3xl max-w-md m-0">{{ message }}</p>
            <div class="mt-12">
                <slot>
                    <Button asChild v-slot="slotProps" :severity>
                        <RouterLink to="/" :class="[slotProps.class, 'font-medium']">{{ $t('status.goToDashboard') }}</RouterLink>
                    </Button>
                </slot>
            </div>
            <div class="flex items-center mt-16">
                <img :src="`/layout/images/logo/logo-${logo}.png`" alt="" style="width: 34px" />
                <img :src="`/layout/images/logo/appname-${logo}.png`" :alt="APP_NAME" class="ms-4" style="width: 72px" />
            </div>
        </main>
    </div>
</template>
