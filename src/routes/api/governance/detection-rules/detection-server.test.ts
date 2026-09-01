import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/detection-rules', () => ({
	listDetectionRules: vi.fn(),
	createDetectionRule: vi.fn()
}));

import { GET, POST } from './+server';
import { createDetectionRule, listDetectionRules } from '$lib/api/detection-rules';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/detection-rules', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('GET /api/governance/detection-rules', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('maps page/page_size onto limit/offset', async () => {
		vi.mocked(listDetectionRules).mockResolvedValue({ items: [], total: 0 } as any);
		await GET({
			locals: { accessToken: TOKEN, tenantId: TENANT },
			fetch: vi.fn(),
			url: new URL('http://localhost/api/governance/detection-rules?page=3&page_size=5')
		} as any);
		expect(listDetectionRules).toHaveBeenCalledWith(
			{ rule_type: undefined, is_enabled: undefined, limit: 5, offset: 10 },
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});
});

describe('POST /api/governance/detection-rules', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('creates a rule with required fields', async () => {
		vi.mocked(createDetectionRule).mockResolvedValue({ id: 'r1' } as any);
		const response = await POST(
			makeEvent(
				JSON.stringify({
					name: 'n',
					rule_type: 'inactive',
					is_enabled: true,
					priority: 1
				})
			) as any
		);
		expect(response.status).toBe(201);
		expect(createDetectionRule).toHaveBeenCalled();
	});

	it('does not create on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(createDetectionRule).not.toHaveBeenCalled();
	});

	it('does not create when rule_type is invalid', async () => {
		await expect(
			POST(makeEvent(JSON.stringify({ name: 'n', rule_type: 'other', is_enabled: true, priority: 1 })) as any)
		).rejects.toMatchObject({ status: 400 });
		expect(createDetectionRule).not.toHaveBeenCalled();
	});

	it('accepts numeric-string priority', async () => {
		vi.mocked(createDetectionRule).mockResolvedValue({ id: 'r1' } as any);
		const response = await POST(
			makeEvent(
				JSON.stringify({
					name: 'n',
					rule_type: 'inactive',
					is_enabled: true,
					priority: '4'
				})
			) as any
		);
		expect(response.status).toBe(201);
		expect(createDetectionRule).toHaveBeenCalledWith(
			expect.objectContaining({ priority: 4 }),
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});

	it('rejects NaN priority instead of forwarding it', async () => {
		await expect(
			POST(
				makeEvent(
					JSON.stringify({
						name: 'n',
						rule_type: 'inactive',
						is_enabled: true,
						priority: Number.NaN
					})
				) as any
			)
		).rejects.toMatchObject({ status: 400 });
		expect(createDetectionRule).not.toHaveBeenCalled();
	});
});
