import { mountWithApp } from '@/test/mount';
import { describe, expect, it } from 'vitest';
import ErrorPage from '../Error.vue';

describe('Error page', () => {
    it('shows 404 / not found for unknown paths', async () => {
        const { wrapper } = await mountWithApp(ErrorPage, { path: '/nope', props: { notFound: true } });

        expect(wrapper.get('h1').text()).toContain('404');
        expect(wrapper.text()).toContain('Not Found');
        expect(wrapper.text()).toContain("doesn't exist");
    });

    it('turns an ?error= code into a readable reason', async () => {
        const { wrapper } = await mountWithApp(ErrorPage, { path: '/auth/error?error=INVALID_TOKEN' });

        expect(wrapper.get('h1').text()).toContain('Error'); // shown in capitals by CSS
        expect(wrapper.text()).toContain('Something went wrong (invalid token).');
    });

    it('links back to the dashboard', async () => {
        const { wrapper } = await mountWithApp(ErrorPage, { path: '/auth/error' });

        expect(wrapper.text()).toContain('Something went wrong!');
        expect(wrapper.get('a').attributes('href')).toBe('/');
    });
});
