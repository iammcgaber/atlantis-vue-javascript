<script setup>
import { authClient } from '@/auth/client';
import { useAvatar } from '@/auth/useAvatar';
import { useSignOut } from '@/auth/useSignOut';
import { useLayoutStore } from '@/stores/layout';
import { useLockStore } from '@/stores/lock';
import { onClickOutside, onKeyStroke } from '@vueuse/core';
import { ref, useTemplateRef } from 'vue';
import AppBreadcrumb from './AppBreadcrumb.vue';
import AppSidebar from './AppSidebar.vue';
import PageSearch from './PageSearch.vue';

const layout = useLayoutStore();
const lock = useLockStore();
const session = authClient.useSession();
const avatar = useAvatar();
const signOut = useSignOut();
const profileMenuOpen = ref(false);
const profileItem = useTemplateRef('profileItem');
const profileButton = useTemplateRef('profileButton');

function closeProfileMenu({ refocus = false } = {}) {
    if (!profileMenuOpen.value) return;
    profileMenuOpen.value = false;
    if (refocus) profileButton.value?.focus();
}

onClickOutside(profileItem, () => closeProfileMenu());
onKeyStroke('Escape', () => closeProfileMenu({ refocus: true }));

function lockScreen() {
    closeProfileMenu();
    lock.lock();
}

function signOutFromMenu() {
    closeProfileMenu();
    signOut();
}

const onSidebarButtonClick = () => {
    layout.ui.profileSidebarVisible = true;
};
</script>

<template>
    <header class="layout-topbar">
        <div class="topbar-start">
            <Button ref="menubutton" type="button" class="topbar-menubutton p-trigger" text rounded severity="secondary" :aria-label="$t('a11y.toggleMenu')" @click="layout.toggleMenu">
                <i class="pi pi-bars" aria-hidden="true"></i>
            </Button>

            <div class="topbar-breadcrumb">
                <AppBreadcrumb />
            </div>
        </div>
        <div class="layout-topbar-menu-section">
            <AppSidebar />
        </div>
        <div class="topbar-end">
            <ul class="topbar-menu">
                <li class="hidden! lg:block!">
                    <PageSearch />
                </li>

                <li ref="profileItem" class="profile-item topbar-item">
                    <!-- A disclosure (button + list of links), so it works with the keyboard and screen readers. -->
                    <button
                        ref="profileButton"
                        type="button"
                        class="cursor-pointer p-0 border-0 bg-transparent"
                        :aria-label="$t('topbar.accountMenu')"
                        :aria-expanded="profileMenuOpen"
                        aria-controls="profile-menu"
                        @click="profileMenuOpen = !profileMenuOpen"
                    >
                        <img class="rounded-full object-cover" :src="avatar" alt="" />
                    </button>

                    <Transition enter-active-class="p-anchored-overlay-enter-active" leave-active-class="p-anchored-overlay-leave-active">
                        <ul v-if="profileMenuOpen" id="profile-menu" class="topbar-menu active-topbar-menu p-6! w-60 z-50 rounded top-full! bottom-auto! mt-2 end-0 start-auto!">
                            <li v-if="session.data" class="m-0! mb-4! text-sm text-surface-600 dark:text-surface-400 truncate">{{ session.data.user.email }}</li>
                            <li class="m-0! mb-4!">
                                <router-link :to="{ name: 'settings' }" class="flex items-center hover:text-primary duration-200" @click="closeProfileMenu()">
                                    <i class="pi pi-fw pi-cog me-2" aria-hidden="true"></i>
                                    <span>{{ $t('nav.settings') }}</span>
                                </router-link>
                            </li>
                            <li class="m-0! mb-4!">
                                <button type="button" class="flex items-center p-0! w-auto! h-auto! rounded-none! bg-transparent border-0 cursor-pointer text-inherit hover:text-primary duration-200" @click="lockScreen">
                                    <i class="pi pi-fw pi-lock me-2" aria-hidden="true"></i>
                                    <span>{{ $t('topbar.lock') }}</span>
                                </button>
                            </li>
                            <li class="m-0!">
                                <button type="button" class="flex items-center p-0! w-auto! h-auto! rounded-none! bg-transparent border-0 cursor-pointer text-inherit hover:text-primary duration-200" @click="signOutFromMenu">
                                    <i class="pi pi-fw pi-sign-out me-2" aria-hidden="true"></i>
                                    <span>{{ $t('common.signOut') }}</span>
                                </button>
                            </li>
                        </ul>
                    </Transition>
                </li>

                <li class="right-panel-button relative hidden! lg:block!">
                    <Button type="button" :label="$t('today.title')" style="min-width: 5.7rem" icon="pi pi-bookmark" class="layout-rightmenu-button hidden! md:inline-flex! font-normal" @click="onSidebarButtonClick"></Button>
                    <Button type="button" icon="pi pi-bookmark" :aria-label="$t('today.title')" class="layout-rightmenu-button md:hidden! font-normal" @click="onSidebarButtonClick"></Button>
                </li>
            </ul>
        </div>
    </header>
</template>
