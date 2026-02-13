import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import DestinationTypeBadge from './destination-type-badge.svelte';

describe('DestinationTypeBadge', () => {
	it('renders "Syslog TLS" for syslog_tcp_tls', () => {
		const { container } = render(DestinationTypeBadge, { props: { type: 'syslog_tcp_tls' } });
		expect(screen.getByText('Syslog TLS')).toBeTruthy();
		const badge = container.querySelector('span')!;
		expect(badge.className).toContain('purple');
	});

	it('renders "Syslog UDP" for syslog_udp', () => {
		const { container } = render(DestinationTypeBadge, { props: { type: 'syslog_udp' } });
		expect(screen.getByText('Syslog UDP')).toBeTruthy();
		const badge = container.querySelector('span')!;
		expect(badge.className).toContain('indigo');
	});

	it('renders "Webhook" for webhook', () => {
		const { container } = render(DestinationTypeBadge, { props: { type: 'webhook' } });
		expect(screen.getByText('Webhook')).toBeTruthy();
		const badge = container.querySelector('span')!;
		expect(badge.className).toContain('cyan');
	});

	it('renders "Splunk HEC" for splunk_hec', () => {
		const { container } = render(DestinationTypeBadge, { props: { type: 'splunk_hec' } });
		expect(screen.getByText('Splunk HEC')).toBeTruthy();
		const badge = container.querySelector('span')!;
		expect(badge.className).toContain('orange');
	});

	it('handles unknown type gracefully', () => {
		const { container } = render(DestinationTypeBadge, {
			props: { type: 'unknown_type' as any }
		});
		expect(screen.getByText('unknown_type')).toBeTruthy();
		const badge = container.querySelector('span')!;
		expect(badge.className).toContain('gray');
	});
});
