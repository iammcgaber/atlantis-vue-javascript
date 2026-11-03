<script setup>
import { useLayoutStore } from '@/stores/layout';
import { computed } from 'vue';

// Atlantis's sign-in page: illustration on the left (from md up), logo, title and the form on the right.
const props = defineProps({
    title: { type: String, required: true },
    subtitle: { type: String, default: '' },
    // Illustration in public/demo/images/pages: login, register, forgot-password, newpassword, verification or lock.
    image: { type: String, default: 'login' }
});

const layout = useLayoutStore();
const APP_NAME = 'Atlantis'; // brand name, not translated
const scheme = computed(() => (layout.isDarkTheme ? 'dark' : 'light'));
const illustration = computed(() => `url('/demo/images/pages/${props.image}-on${scheme.value}.png')`);
const logo = computed(() => (layout.isDarkTheme ? 'light' : 'dark'));
</script>

<template>
    <div :class="['flex min-h-screen', layout.isDarkTheme ? 'layout-dark' : 'layout-light']">
        <div class="w-6/12 h-screen hidden md:block shrink sticky top-0" :style="{ maxWidth: '490px', backgroundImage: illustration, backgroundRepeat: 'no-repeat', backgroundSize: 'cover' }" aria-hidden="true"></div>
        <main
            class="w-full min-h-screen flex flex-col items-center md:items-start justify-center px-8 md:px-[10%] py-16 relative"
            :style="{ backgroundColor: 'var(--surface-ground)', backgroundImage: 'var(--exception-pages-image)', backgroundRepeat: 'no-repeat', backgroundSize: 'contain' }"
        >
            <div class="w-full max-w-[22rem]">
                <router-link to="/" class="flex items-center mb-12">
                    <img :src="`/layout/images/logo/logo-${logo}.png`" alt="" style="width: 45px" />
                    <img :src="`/layout/images/logo/appname-${logo}.png`" :alt="APP_NAME" class="ms-4" style="width: 100px" />
                </router-link>
                <div class="mb-8">
                    <h1 class="mt-0 mb-2 text-surface-900 dark:text-surface-0 text-2xl font-semibold">{{ title }}</h1>
                    <p v-if="subtitle" class="m-0 text-surface-500 dark:text-surface-400">{{ subtitle }}</p>
                </div>
                <slot />
            </div>

            <footer class="flex items-center mt-16">
                <div class="flex items-center pe-6 me-6 border-e border-surface-200 dark:border-surface-700">
                    <img src="/layout/images/logo/logo-gray.png" alt="" style="width: 22px" />
                    <img src="/layout/images/logo/appname-gray.png" :alt="APP_NAME" class="ms-2" style="width: 45px" />
                </div>
                <span class="text-sm text-surface-500 dark:text-surface-400">{{ $t('auth.copyright', { year: new Date().getFullYear() }) }}</span>
            </footer>
        </main>
    </div>
</template>
