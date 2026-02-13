import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup, screen } from '@testing-library/svelte';
import SlaIndicator from './sla-indicator.svelte';

describe('SlaIndicator', () => {
	afterEach(() => { cleanup(); });

	it('shows SLA Breached with red class when breached', () => {
		render(SlaIndicator, {
			props: { slaDeadline: '2025-06-01T12:00:00Z', slaBreached: true, slaWarningSent: false }
		});
		expect(screen.getByText('SLA Breached')).toBeTruthy();
		const label = screen.getByText('SLA Breached');
		expect(label.className).toContain('text-red-600');
	});

	it('shows SLA At Risk with orange class when warning sent but not breached', () => {
		render(SlaIndicator, {
			props: { slaDeadline: '2025-06-01T12:00:00Z', slaBreached: false, slaWarningSent: true }
		});
		expect(screen.getByText('SLA At Risk')).toBeTruthy();
		const label = screen.getByText('SLA At Risk');
		expect(label.className).toContain('text-orange-600');
	});

	it('shows On Track with green class when normal', () => {
		render(SlaIndicator, {
			props: { slaDeadline: '2025-06-01T12:00:00Z', slaBreached: false, slaWarningSent: false }
		});
		expect(screen.getByText('On Track')).toBeTruthy();
		const label = screen.getByText('On Track');
		expect(label.className).toContain('text-green-600');
	});

	it('prioritizes breached over warning sent', () => {
		render(SlaIndicator, {
			props: { slaDeadline: '2025-06-01T12:00:00Z', slaBreached: true, slaWarningSent: true }
		});
		expect(screen.getByText('SLA Breached')).toBeTruthy();
		expect(screen.queryByText('SLA At Risk')).toBeFalsy();
	});

	it('does not show deadline text when deadline is null', () => {
		const { container } = render(SlaIndicator, {
			props: { slaDeadline: null, slaBreached: false, slaWarningSent: false }
		});
		expect(screen.getByText('On Track')).toBeTruthy();
		// Only the status label span should be present, no deadline span
		const spans = container.querySelectorAll('span');
		expect(spans.length).toBe(1);
	});

	it('shows formatted date when deadline is provided', () => {
		render(SlaIndicator, {
			props: { slaDeadline: '2025-06-15T14:30:00Z', slaBreached: false, slaWarningSent: false }
		});
		// The deadline should be rendered as a second span with formatted date
		const spans = document.querySelectorAll('span');
		expect(spans.length).toBe(2);
		// The second span should contain some date text (locale-dependent)
		expect(spans[1].textContent).toContain('Jun');
		expect(spans[1].textContent).toContain('15');
		expect(spans[1].textContent).toContain('2025');
	});

	it('renders inside a flex column container', () => {
		const { container } = render(SlaIndicator, {
			props: { slaDeadline: null, slaBreached: false, slaWarningSent: false }
		});
		const div = container.querySelector('div');
		expect(div?.className).toContain('flex');
		expect(div?.className).toContain('flex-col');
	});
});
