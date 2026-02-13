import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import EntitlementActionBadge from './entitlement-action-badge.svelte';

describe('EntitlementActionBadge', () => {
	it('renders None badge for none action', () => {
		render(EntitlementActionBadge, { props: { action: 'none' } });
		expect(screen.getByText('None')).toBeDefined();
	});

	it('renders Pause badge for pause action', () => {
		render(EntitlementActionBadge, { props: { action: 'pause' } });
		expect(screen.getByText('Pause')).toBeDefined();
	});

	it('renders Revoke badge for revoke action', () => {
		render(EntitlementActionBadge, { props: { action: 'revoke' } });
		expect(screen.getByText('Revoke')).toBeDefined();
	});

	it('renders raw action text for unknown action', () => {
		render(EntitlementActionBadge, { props: { action: 'unknown' } });
		expect(screen.getByText('unknown')).toBeDefined();
	});
});
