<script setup>
import { useLayoutStore } from '@/stores/layout';
import { onClickOutside, useIntersectionObserver, useMediaQuery, useTimeoutFn } from '@vueuse/core';
import { computed, nextTick, ref, shallowRef, watch } from 'vue';
import { useRoute } from 'vue-router';
import AppMenu from './AppMenu.vue';

const BREAKPOINT = 992;
const layout = useLayoutStore();

// The pin button only does something in the modes where the menu expands on hover.
const canAnchor = computed(() => ['reveal', 'drawer'].includes(layout.config.menuMode));
const route = useRoute();
const menuContainerRef = ref(null);
const sidebarRef = ref(null);
const isDesktopScreen = useMediaQuery(`(min-width: ${BREAKPOINT}px)`);
const activeRootItem = shallowRef(null); // root item of the open overlay submenu, watched for scrolling out of view

watch(
    () => route.path,
    (newPath) => {
        if (layout.hasOverlaySubmenu && layout.isDesktop()) layout.ui.activePath = null;
        else layout.ui.activePath = newPath;

        layout.ui.overlayMenuActive = false;
        layout.ui.mobileMenuActive = false;
        layout.ui.menuHoverActive = false;
    },
    { immediate: true }
);

// Crossing the desktop breakpoint resets overlay submenus (slim, horizontal, …).
watch(isDesktopScreen, () => {
    if (layout.hasOverlaySubmenu) {
        layout.ui.activePath = layout.isDesktop() ? null : route.path;
        layout.ui.menuHoverActive = false;
        activeRootItem.value = null;
    }
});

// Clicking outside the sidebar (and the topbar menu button) closes an open overlay menu or submenu.
onClickOutside(
    sidebarRef,
    () => {
        if (!layout.isDesktop() || !layout.hasOpenOverlay) return;

        layout.ui.overlayMenuActive = false;

        if (layout.hasOverlaySubmenu) {
            layout.ui.activePath = null;
            layout.ui.menuHoverActive = false;
        }
    },
    { ignore: ['.topbar-menubutton'] }
);

// Close an open overlay submenu once its root item scrolls out of the menu.
watch(
    () => layout.hasOpenOverlaySubmenu,
    async (open) => {
        if (!open || !layout.isDesktop()) {
            activeRootItem.value = null;
            return;
        }

        await nextTick();
        activeRootItem.value = menuContainerRef.value?.querySelector('.layout-root-menuitem.active-menuitem') ?? null;
    }
);

useIntersectionObserver(
    activeRootItem,
    (entries) => {
        if (entries.some((entry) => !entry.isIntersecting) && layout.isDesktop() && layout.hasOverlaySubmenu && layout.ui.activePath) {
            layout.ui.activePath = null;
        }
    },
    { root: menuContainerRef, threshold: 0 }
);

// Reveal / drawer modes: expand on hover, collapse shortly after the pointer leaves.
const { start: scheduleCollapse, stop: cancelCollapse, isPending: collapsePending } = useTimeoutFn(() => (layout.ui.sidebarExpanded = false), 300, { immediate: false });

const onMouseEnter = () => {
    if (!layout.ui.anchored) {
        cancelCollapse();
        layout.ui.sidebarExpanded = true;
    }
};

const onMouseLeave = () => {
    if (!layout.ui.anchored && !collapsePending.value) scheduleCollapse();
};

const onAnchorToggle = () => {
    layout.ui.anchored = !layout.ui.anchored;
};

const onMenuScroll = () => {
    if (menuContainerRef.value) {
        if (layout.isHorizontal) {
            menuContainerRef.value.style.setProperty('--menu-scroll-x', `-${menuContainerRef.value.scrollLeft}px`);
        } else if (layout.isSlim || layout.isSlimPlus) {
            menuContainerRef.value.style.setProperty('--menu-scroll-y', `-${menuContainerRef.value.scrollTop}px`);
        }
    }

    if (layout.hasOverlaySubmenu && layout.isDesktop()) {
        layout.ui.activePath = null;
    }
};

const logo = () => {
    return layout.isDarkTheme ? 'light' : 'dark';
};
</script>

<template>
    <nav ref="sidebarRef" class="layout-sidebar" :aria-label="$t('a11y.mainMenu')" @mouseenter="onMouseEnter" @mouseleave="onMouseLeave">
        <div class="sidebar-header">
            <router-link :to="{ name: 'dashboard' }" class="app-logo" :aria-label="$t('a11y.homeLink')">
                <div class="app-logo-small h-8">
                    <img class="inline-block!" :src="`/layout/images/logo/logo-${logo()}.png`" alt="" />
                </div>
                <div class="app-logo-normal">
                    <img class="h-8 inline-block!" :src="`/layout/images/logo/logo-${logo()}.png`" alt="" />
                    <img class="h-8 ms-4 inline-block!" :src="`/layout/images/logo/appname-${logo()}.png`" alt="" />
                </div>
            </router-link>
            <!-- Pins the menu open; only the reveal and drawer modes show it. -->
            <Button v-if="canAnchor" class="layout-sidebar-anchor z-20" type="button" :aria-label="$t('a11y.pinMenu')" :aria-pressed="layout.ui.anchored" @click="onAnchorToggle"></Button>
        </div>
        <div ref="menuContainerRef" class="layout-menu-container" @scroll="onMenuScroll">
            <AppMenu />
        </div>
    </nav>
</template>
