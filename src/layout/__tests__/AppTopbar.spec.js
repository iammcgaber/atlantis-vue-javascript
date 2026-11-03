import { useLayoutStore } from '@/stores/layout';
import { mountWithApp } from '@/test/mount';
import { afterEach, describe, expect, it } from 'vitest';
import AppTopbar from '../AppTopbar.vue';

const routes = [
    { name: 'dashboard', path: '/' },
    { name: 'settings', path: '/settings' }
];

describe('AppTopbar', () => {
    afterEach(() => localStorage.clear());

    // Regression: removing the old search code also removed the menu button's handler.
    it('toggles the menu from the menu button', async () => {
        Object.defineProperty(window, 'innerWidth', { configurable: true, writable: true, value: 1280 });
        const { wrapper } = await mountWithApp(AppTopbar, { routes });
        const layout = useLayoutStore();

        await wrapper.get('.topbar-menubutton').trigger('click');
        expect(layout.ui.staticMenuInactive).toBe(true);

        await wrapper.get('.topbar-menubutton').trigger('click');
        expect(layout.ui.staticMenuInactive).toBe(false);
    });

    it('opens the Today drawer', async () => {
        const { wrapper } = await mountWithApp(AppTopbar, { routes });

        await wrapper.get('.layout-rightmenu-button').trigger('click');
        expect(useLayoutStore().ui.profileSidebarVisible).toBe(true);
    });

    // The profile menu was a link without href (v-styleclass), so the keyboard couldn't reach it.
    it('opens the account menu from a button, and closes it with Escape', async () => {
        const { wrapper } = await mountWithApp(AppTopbar, { routes, attachTo: document.body });
        const button = wrapper.get('button[aria-controls="profile-menu"]');

        expect(button.attributes('aria-expanded')).toBe('false');
        await button.trigger('click');
        expect(button.attributes('aria-expanded')).toBe('true');
        expect(wrapper.find('#profile-menu').text()).toContain('Settings');

        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        await wrapper.vm.$nextTick();

        expect(button.attributes('aria-expanded')).toBe('false');
        expect(document.activeElement).toBe(button.element);
        wrapper.unmount();
    });
});
