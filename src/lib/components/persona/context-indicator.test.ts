import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/svelte';
import ContextIndicator from './context-indicator.svelte';

describe('ContextIndicator', () => {
	afterEach(cleanup);

	it('renders badge when active with persona name', () => {
		render(ContextIndicator, { props: { personaName: 'Admin Persona', isActive: true } });
		expect(screen.getByText('Acting as: Admin Persona')).toBeTruthy();
	});

	it('does not render when not active', () => {
		const { container } = render(ContextIndicator, {
			props: { personaName: 'Admin Persona', isActive: false }
		});
		expect(container.textContent?.trim()).toBe('');
	});

	it('does not render when active but persona name is null', () => {
		const { container } = render(ContextIndicator, {
			props: { personaName: null, isActive: true }
		});
		expect(container.textContent?.trim()).toBe('');
	});

	it('does not render when active but persona name is undefined', () => {
		const { container } = render(ContextIndicator, {
			props: { isActive: true }
		});
		expect(container.textContent?.trim()).toBe('');
	});

	it('does not render when both props are false/null', () => {
		const { container } = render(ContextIndicator, {
			props: { personaName: null, isActive: false }
		});
		expect(container.textContent?.trim()).toBe('');
	});

	it('applies indigo styling classes', () => {
		const { container } = render(ContextIndicator, {
			props: { personaName: 'Test Persona', isActive: true }
		});
		const badge = container.querySelector('[class*="indigo"]');
		expect(badge).toBeTruthy();
	});

	it('renders different persona names correctly', () => {
		render(ContextIndicator, { props: { personaName: 'Developer Role', isActive: true } });
		expect(screen.getByText('Acting as: Developer Role')).toBeTruthy();
	});
});
