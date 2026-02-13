import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/svelte';
import ScriptStatusBadge from './script-status-badge.svelte';

describe('ScriptStatusBadge', () => {
	afterEach(cleanup);

	it('renders "Draft" label for draft status', () => {
		render(ScriptStatusBadge, { props: { status: 'draft' } });
		expect(screen.getByText('Draft')).toBeTruthy();
	});

	it('renders "Active" label for active status', () => {
		render(ScriptStatusBadge, { props: { status: 'active' } });
		expect(screen.getByText('Active')).toBeTruthy();
	});

	it('renders "Inactive" label for inactive status', () => {
		render(ScriptStatusBadge, { props: { status: 'inactive' } });
		expect(screen.getByText('Inactive')).toBeTruthy();
	});

	it('renders raw status value for unknown status', () => {
		render(ScriptStatusBadge, { props: { status: 'archived' } });
		expect(screen.getByText('archived')).toBeTruthy();
	});

	it('applies yellow styling for draft status', () => {
		const { container } = render(ScriptStatusBadge, { props: { status: 'draft' } });
		const badge = container.querySelector('[class*="bg-yellow"]');
		expect(badge).toBeTruthy();
	});

	it('applies green styling for active status', () => {
		const { container } = render(ScriptStatusBadge, { props: { status: 'active' } });
		const badge = container.querySelector('[class*="bg-green"]');
		expect(badge).toBeTruthy();
	});

	it('applies gray styling for inactive status', () => {
		const { container } = render(ScriptStatusBadge, { props: { status: 'inactive' } });
		const badge = container.querySelector('[class*="bg-gray"]');
		expect(badge).toBeTruthy();
	});

	it('falls back to draft styling for unknown status', () => {
		const { container } = render(ScriptStatusBadge, { props: { status: 'unknown_status' } });
		const badge = container.querySelector('[class*="bg-yellow"]');
		expect(badge).toBeTruthy();
	});
});
