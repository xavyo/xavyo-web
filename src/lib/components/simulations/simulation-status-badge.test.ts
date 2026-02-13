import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/svelte';
import SimulationStatusBadge from './simulation-status-badge.svelte';

describe('SimulationStatusBadge', () => {
	afterEach(cleanup);

	// --- Status badges ---

	it('renders draft status badge', () => {
		render(SimulationStatusBadge, { props: { value: 'draft', type: 'status' } });
		expect(screen.getByText('draft')).toBeTruthy();
	});

	it('renders executed status badge', () => {
		render(SimulationStatusBadge, { props: { value: 'executed', type: 'status' } });
		expect(screen.getByText('executed')).toBeTruthy();
	});

	it('renders applied status badge', () => {
		render(SimulationStatusBadge, { props: { value: 'applied', type: 'status' } });
		expect(screen.getByText('applied')).toBeTruthy();
	});

	it('renders cancelled status badge', () => {
		render(SimulationStatusBadge, { props: { value: 'cancelled', type: 'status' } });
		expect(screen.getByText('cancelled')).toBeTruthy();
	});

	// --- Severity badges ---

	it('renders critical severity badge', () => {
		render(SimulationStatusBadge, { props: { value: 'critical', type: 'severity' } });
		expect(screen.getByText('critical')).toBeTruthy();
	});

	it('renders high severity badge', () => {
		render(SimulationStatusBadge, { props: { value: 'high', type: 'severity' } });
		expect(screen.getByText('high')).toBeTruthy();
	});

	it('renders medium severity badge', () => {
		render(SimulationStatusBadge, { props: { value: 'medium', type: 'severity' } });
		expect(screen.getByText('medium')).toBeTruthy();
	});

	it('renders low severity badge', () => {
		render(SimulationStatusBadge, { props: { value: 'low', type: 'severity' } });
		expect(screen.getByText('low')).toBeTruthy();
	});

	// --- Impact type badges ---

	it('renders violation impact type badge', () => {
		render(SimulationStatusBadge, { props: { value: 'violation', type: 'impact' } });
		expect(screen.getByText('violation')).toBeTruthy();
	});

	it('renders entitlement_gain impact type badge with spaces', () => {
		render(SimulationStatusBadge, { props: { value: 'entitlement_gain', type: 'impact' } });
		expect(screen.getByText('entitlement gain')).toBeTruthy();
	});

	it('renders entitlement_loss impact type badge with spaces', () => {
		render(SimulationStatusBadge, { props: { value: 'entitlement_loss', type: 'impact' } });
		expect(screen.getByText('entitlement loss')).toBeTruthy();
	});

	it('renders no_change impact type badge with spaces', () => {
		render(SimulationStatusBadge, { props: { value: 'no_change', type: 'impact' } });
		expect(screen.getByText('no change')).toBeTruthy();
	});

	it('renders warning impact type badge', () => {
		render(SimulationStatusBadge, { props: { value: 'warning', type: 'impact' } });
		expect(screen.getByText('warning')).toBeTruthy();
	});

	// --- Underscore replacement ---

	it('replaces underscores with spaces in display value', () => {
		render(SimulationStatusBadge, { props: { value: 'some_multi_word_value', type: 'status' } });
		expect(screen.getByText('some multi word value')).toBeTruthy();
	});

	// --- CSS classes ---

	it('applies blue CSS class for executed status', () => {
		render(SimulationStatusBadge, { props: { value: 'executed', type: 'status' } });
		const badge = screen.getByText('executed');
		expect(badge.className).toContain('bg-blue-100');
	});

	it('applies green CSS class for applied status', () => {
		render(SimulationStatusBadge, { props: { value: 'applied', type: 'status' } });
		const badge = screen.getByText('applied');
		expect(badge.className).toContain('bg-green-100');
	});

	it('applies red CSS class for cancelled status', () => {
		render(SimulationStatusBadge, { props: { value: 'cancelled', type: 'status' } });
		const badge = screen.getByText('cancelled');
		expect(badge.className).toContain('bg-red-100');
	});

	it('applies red CSS class for critical severity', () => {
		render(SimulationStatusBadge, { props: { value: 'critical', type: 'severity' } });
		const badge = screen.getByText('critical');
		expect(badge.className).toContain('bg-red-100');
	});

	it('applies orange CSS class for high severity', () => {
		render(SimulationStatusBadge, { props: { value: 'high', type: 'severity' } });
		const badge = screen.getByText('high');
		expect(badge.className).toContain('bg-orange-100');
	});

	it('applies yellow CSS class for medium severity', () => {
		render(SimulationStatusBadge, { props: { value: 'medium', type: 'severity' } });
		const badge = screen.getByText('medium');
		expect(badge.className).toContain('bg-yellow-100');
	});

	it('applies green CSS class for low severity', () => {
		render(SimulationStatusBadge, { props: { value: 'low', type: 'severity' } });
		const badge = screen.getByText('low');
		expect(badge.className).toContain('bg-green-100');
	});

	it('applies red CSS class for violation impact type', () => {
		render(SimulationStatusBadge, { props: { value: 'violation', type: 'impact' } });
		const badge = screen.getByText('violation');
		expect(badge.className).toContain('bg-red-100');
	});

	it('applies green CSS class for entitlement_gain impact type', () => {
		render(SimulationStatusBadge, { props: { value: 'entitlement_gain', type: 'impact' } });
		const badge = screen.getByText('entitlement gain');
		expect(badge.className).toContain('bg-green-100');
	});

	// --- Unknown / fallback ---

	it('falls back to muted style for unknown status value', () => {
		render(SimulationStatusBadge, { props: { value: 'unknown_status', type: 'status' } });
		const badge = screen.getByText('unknown status');
		expect(badge.className).toContain('bg-muted');
	});

	it('falls back to muted style for unknown severity value', () => {
		render(SimulationStatusBadge, { props: { value: 'unknown_sev', type: 'severity' } });
		const badge = screen.getByText('unknown sev');
		expect(badge.className).toContain('bg-muted');
	});

	it('falls back to muted style for unknown impact type value', () => {
		render(SimulationStatusBadge, { props: { value: 'unknown_impact', type: 'impact' } });
		const badge = screen.getByText('unknown impact');
		expect(badge.className).toContain('bg-muted');
	});

	// --- Default type is status ---

	it('defaults to status type when type prop is omitted', () => {
		render(SimulationStatusBadge, { props: { value: 'draft' } });
		const badge = screen.getByText('draft');
		expect(badge.className).toContain('bg-muted');
	});
});
