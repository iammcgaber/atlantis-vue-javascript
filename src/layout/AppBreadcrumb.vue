<script setup>
import { useLayoutStore } from '@/stores/layout';
import PageSearch from './PageSearch.vue';
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

const route = useRoute();
const layout = useLayoutStore();
const { t, te } = useI18n();

const breadcrumbRoutes = ref([]);

function setBreadcrumbRoutes() {
    if (route.meta.breadcrumb) {
        breadcrumbRoutes.value = route.meta.breadcrumb;

        return;
    }

    breadcrumbRoutes.value = route.fullPath
        .split('/')
        .filter((item) => item !== '')
        .filter((item) => isNaN(Number(item)))
        .map((item) => item.charAt(0).toUpperCase() + item.slice(1));
}

function onSidebarButtonClick() {
    layout.ui.profileSidebarVisible = true;
}

watch(
    route,
    () => {
        setBreadcrumbRoutes();
    },
    { immediate: true }
);
</script>

<template>
    <div class="layout-breadcrumb flex items-center relative h-12">
        <nav :aria-label="$t('a11y.breadcrumb')">
            <ol class="relative z-20">
                <template v-for="(breadcrumbRoute, i) in breadcrumbRoutes" :key="breadcrumbRoute">
                    <li :aria-current="i === breadcrumbRoutes.length - 1 ? 'page' : undefined">{{ te(breadcrumbRoute) ? t(breadcrumbRoute) : breadcrumbRoute }}</li>
                    <li v-if="i !== breadcrumbRoutes.length - 1" class="layout-breadcrumb-chevron" aria-hidden="true">/</li>
                </template>
            </ol>
        </nav>
        <ul class="breadcrumb-menu flex items-center justify-end lg:hidden absolute end-0 top-0 z-40 h-12 w-screen">
            <li class="w-full m-0 ms-4">
                <PageSearch variant="breadcrumb" />
            </li>
            <li class="right-panel-button relative">
                <Button type="button" :label="$t('today.title')" style="min-width: 6.7rem" icon="pi pi-bookmark" class="layout-rightmenu-button hidden! md:inline-flex! font-normal -me-2" @click="onSidebarButtonClick()"></Button>
                <Button type="button" style="width: 3.286rem" icon="pi pi-bookmark" :aria-label="$t('today.title')" class="layout-rightmenu-button flex! md:hidden! font-normal -me-2" @click="onSidebarButtonClick()"></Button>
            </li>
        </ul>
    </div>
</template>
