import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/svelte';
import PasswordStrength from './password-strength.svelte';

afterEach(() => cleanup());

describe('PasswordStrength', () => {
	it('renders nothing with empty password', () => {
		const { container } = render(PasswordStrength, { props: { password: '' } });
		expect(container.querySelector('[role="progressbar"]')).toBeNull();
		expect(container.textContent?.trim()).toBe('');
	});

	it('shows "Weak" for short password like "abc"', () => {
		render(PasswordStrength, { props: { password: 'abc' } });
		const bar = screen.getByRole('progressbar');
		expect(bar).toBeTruthy();
		expect(bar.getAttribute('aria-label')).toBe('Password strength: Weak');
		expect(screen.getByText('Weak')).toBeTruthy();
	});

	it('shows "Fair" for medium password like "Br1ghtDay"', () => {
		render(PasswordStrength, { props: { password: 'Br1ghtDay' } });
		const bar = screen.getByRole('progressbar');
		expect(bar.getAttribute('aria-label')).toBe('Password strength: Fair');
		expect(screen.getByText('Fair')).toBeTruthy();
	});

	it('shows "Strong" for good password like "MyP@ssw0rd12"', () => {
		render(PasswordStrength, { props: { password: 'MyP@ssw0rd12' } });
		const bar = screen.getByRole('progressbar');
		expect(bar.getAttribute('aria-label')).toBe('Password strength: Strong');
		expect(screen.getByText('Strong')).toBeTruthy();
	});

	it('shows "Very strong" for excellent password', () => {
		render(PasswordStrength, { props: { password: 'C0mpl3x!P@ss#2026long' } });
		const bar = screen.getByRole('progressbar');
		expect(bar.getAttribute('aria-label')).toBe('Password strength: Very strong');
		expect(screen.getByText('Very strong')).toBeTruthy();
	});

	it('renders feedback when present', () => {
		render(PasswordStrength, { props: { password: 'abc' } });
		// "abc" is short, should have feedback like "Use at least 8 characters"
		expect(screen.getByText('Use at least 8 characters')).toBeTruthy();
	});
});
