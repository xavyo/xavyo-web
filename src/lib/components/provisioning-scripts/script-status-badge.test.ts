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

	it('applies warning styling for draft status', () => {
		const { container } = render(ScriptStatusBadge, { props: { status: 'draft' } });
		expect(container.innerHTML).toContain('bg-warning/15');
	});

	it('applies success styling for active status', () => {
		const { container } = render(ScriptStatusBadge, { props: { status: 'active' } });
		expect(container.innerHTML).toContain('bg-success/15');
	});

	it('applies muted styling for inactive status', () => {
		const { container } = render(ScriptStatusBadge, { props: { status: 'inactive' } });
		expect(container.innerHTML).toContain('bg-muted');
	});

	it('falls back to draft styling for unknown status', () => {
		const { container } = render(ScriptStatusBadge, { props: { status: 'unknown_status' } });
		expect(container.innerHTML).toContain('bg-warning/15');
	});
});
