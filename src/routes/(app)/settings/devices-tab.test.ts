import { describe, it, expect, afterEach, vi, beforeEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/svelte';
import DevicesTab from './devices-tab.svelte';

const mockDevices = {
	items: [
		{
			id: 'device-1',
			device_fingerprint: 'fp-abc',
			device_name: 'MacBook Pro',
			device_type: 'desktop',
			browser: 'Chrome',
			browser_version: '120.0',
			os: 'macOS',
			os_version: '14.0',
			is_trusted: true,
			trust_expires_at: '2025-01-01T00:00:00Z',
			is_current: true,
			first_seen_at: '2024-01-01T00:00:00Z',
			last_seen_at: new Date().toISOString(),
			login_count: 42
		},
		{
			id: 'device-2',
			device_fingerprint: 'fp-def',
			device_name: 'iPhone 15',
			device_type: 'mobile',
			browser: 'Safari',
			browser_version: '17.0',
			os: 'iOS',
			os_version: '17.0',
			is_trusted: false,
			trust_expires_at: null,
			is_current: false,
			first_seen_at: '2024-06-01T00:00:00Z',
			last_seen_at: new Date().toISOString(),
			login_count: 5
		}
	],
	total: 2
};

describe('DevicesTab', () => {
	beforeEach(() => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve(mockDevices)
			})
		);
	});

	afterEach(() => {
		cleanup();
		vi.restoreAllMocks();
	});

	it('shows loading state initially', () => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockReturnValue(new Promise(() => {}))
		);
		const { container } = render(DevicesTab);
		const pulsingElements = container.querySelectorAll('.animate-pulse');
		expect(pulsingElements.length).toBeGreaterThan(0);
	});

	it('shows device info after fetch', async () => {
		render(DevicesTab);
		expect(await screen.findByText('MacBook Pro')).toBeTruthy();
		expect(await screen.findByText('iPhone 15')).toBeTruthy();
	});

	it('shows trust status badge for trusted device', async () => {
		render(DevicesTab);
		expect(await screen.findByText('Trusted')).toBeTruthy();
	});

	it('shows untrusted badge for untrusted device', async () => {
		render(DevicesTab);
		expect(await screen.findByText('Untrusted')).toBeTruthy();
	});

	it('shows current device indicator', async () => {
		render(DevicesTab);
		expect(await screen.findByText('Current device')).toBeTruthy();
	});
});
