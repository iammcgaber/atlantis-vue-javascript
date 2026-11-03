import { mountWithApp } from '@/test/mount';
import { describe, expect, it } from 'vitest';
import Verification from '../Verification.vue';

describe('Verification page', () => {
    // Regression: rendering the digits through InputOtp's slot dropped its inputmode, so phones showed a text keyboard.
    it('labels each code digit and asks for the numeric keyboard', async () => {
        const { wrapper } = await mountWithApp(Verification, { path: '/auth/verification', routes: [{ name: 'login', path: '/auth/login' }] });
        const digits = wrapper.findAll('.p-inputotp-input');

        expect(digits).toHaveLength(6);
        expect(digits.map((digit) => digit.attributes('inputmode'))).toEqual(Array(6).fill('numeric'));
        expect(digits[0].attributes('aria-label')).toBe('Digit 1 of 6');
    });
});
