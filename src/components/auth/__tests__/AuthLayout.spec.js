import { useLayoutStore } from '@/stores/layout';
import { mountWithApp } from '@/test/mount';
import { afterEach, describe, expect, it } from 'vitest';
import AuthLayout from '../AuthLayout.vue';

describe('AuthLayout', () => {
    afterEach(() => localStorage.clear());

    it('shows the title, subtitle and slot', async () => {
        const { wrapper } = await mountWithApp(AuthLayout, { props: { title: 'Log in', subtitle: 'Please enter your details' }, slots: { default: '<form id="f" />' } });

        expect(wrapper.get('h1').text()).toBe('Log in');
        expect(wrapper.text()).toContain('Please enter your details');
        expect(wrapper.find('#f').exists()).toBe(true);
    });

    it('picks the illustration for the page and the colour scheme', async () => {
        const { wrapper } = await mountWithApp(AuthLayout, { props: { title: 'Locked', image: 'lock' } });
        const illustration = () => wrapper.get('[aria-hidden="true"]').attributes('style');

        expect(illustration()).toContain('/demo/images/pages/lock-ondark.png');

        useLayoutStore().config.darkTheme = false;
        await wrapper.vm.$nextTick();

        expect(illustration()).toContain('/demo/images/pages/lock-onlight.png');
    });
});
