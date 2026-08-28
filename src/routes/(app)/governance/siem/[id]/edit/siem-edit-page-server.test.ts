import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(false)
}));

vi.mock('$lib/api/siem', () => ({
	getSiemDestination: vi.fn(),
	updateSiemDestination: vi.fn()
}));

vi.mock('sveltekit-superforms', () => ({
	superValidate: vi.fn().mockResolvedValue({ valid: true, data: {} }),
	message: vi.fn()
}));

vi.mock('sveltekit-superforms/adapters', () => ({
	zod: vi.fn((schema: unknown) => schema)
}));

vi.mock('$lib/schemas/siem', () => ({
	updateSiemDestinationSchema: {}
}));

import { load } from './+page.server';
import { getSiemDestination } from '$lib/api/siem';
import { hasAdminRole } from '$lib/server/auth';

describe('SIEM edit +page.server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(false);
		vi.mocked(getSiemDestination).mockResolvedValue({
			id: 'd1',
			name: 'Splunk',
			endpoint_host: 'splunk.example.com',
			endpoint_port: 8088,
			export_format: 'json',
			event_type_filter: [],
			rate_limit_per_second: 1000,
			queue_buffer_size: 10000,
			circuit_breaker_threshold: 5,
			circuit_breaker_cooldown_secs: 60,
			enabled: true
		} as any);
	});

	it('does not redirect a non-admin JWT user', async () => {
		const result = await load({
			params: { id: 'd1' },
			locals: { accessToken: 'tok', tenantId: 'tid', user: { roles: ['user'] } },
			fetch: vi.fn()
		} as any);
		expect(result.form).toBeDefined();
		expect(getSiemDestination).toHaveBeenCalled();
	});
});
