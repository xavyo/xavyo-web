import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/role-mining', () => ({
	listMiningJobs: vi.fn(),
	getMiningJob: vi.fn(),
	createMiningJob: vi.fn(),
	listCandidates: vi.fn(),
	getSimulation: vi.fn()
}));

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn()
}));

vi.mock('$lib/api/client', () => ({
	ApiError: class extends Error {
		status: number;
		constructor(m: string, s: number) {
			super(m);
			this.status = s;
		}
	}
}));

vi.mock('sveltekit-superforms', () => ({
	superValidate: vi.fn().mockResolvedValue({
		valid: true,
		data: {
			name: 'Test Job',
			min_users: 3,
			min_entitlements: 2,
			confidence_threshold: 0.6,
			include_excessive_privilege: true,
			include_consolidation: true,
			consolidation_threshold: 70,
			deviation_threshold: 50,
			peer_group_attribute: ''
		}
	}),
	message: vi.fn((form, msg, opts) => ({ form, message: msg, ...opts }))
}));

vi.mock('sveltekit-superforms/adapters', () => ({
	zod: vi.fn((schema) => schema)
}));

import { listMiningJobs, getMiningJob, listCandidates, getSimulation } from '$lib/api/role-mining';
import { hasAdminRole } from '$lib/server/auth';
import type { MiningJob } from '$lib/api/types';

const mockListJobs = vi.mocked(listMiningJobs);
const mockGetJob = vi.mocked(getMiningJob);
const mockListCandidates = vi.mocked(listCandidates);
const mockGetSimulation = vi.mocked(getSimulation);
const mockHasAdminRole = vi.mocked(hasAdminRole);

const mockLocals = (admin: boolean) => ({
	accessToken: 'tok',
	tenantId: 'tid',
	user: { roles: admin ? ['admin'] : ['user'] }
});

const mockJob: MiningJob = {
	id: 'job-1',
	tenant_id: 't1',
	name: 'Q1 Analysis',
	status: 'completed',
	progress_percent: 100,
	candidate_count: 5,
	excessive_privilege_count: 3,
	consolidation_suggestion_count: 2,
	created_at: '2026-01-01T00:00:00Z',
	started_at: '2026-01-01T00:01:00Z',
	completed_at: '2026-01-01T00:10:00Z',
	error_message: null,
	created_by: 'admin-1',
	updated_at: '2026-01-01T00:10:00Z',
	parameters: {
		min_users: 3,
		min_entitlements: 2,
		confidence_threshold: 0.6,
		include_excessive_privilege: true,
		include_consolidation: true,
		consolidation_threshold: 70,
		deviation_threshold: 50,
		peer_group_attribute: null
	}
};

describe('Role Mining hub +page.server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockHasAdminRole.mockReturnValue(true);
	});

	describe('load', () => {
		it('redirects non-admin users', async () => {
			mockHasAdminRole.mockReturnValue(false);
			const { load } = await import('./+page.server');
			try {
				await load({
					locals: mockLocals(false),
					url: new URL('http://localhost/governance/role-mining'),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown redirect');
			} catch (e: any) {
				expect(e.status).toBe(302);
				expect(e.location).toBe('/dashboard');
			}
		});

		it('returns jobs with default pagination', async () => {
			mockListJobs.mockResolvedValue({
				items: [mockJob],
				total: 1,
				page: 1,
				page_size: 50
			});

			const { load } = await import('./+page.server');
			const result = (await load({
				locals: mockLocals(true),
				url: new URL('http://localhost/governance/role-mining'),
				fetch: vi.fn()
			} as any)) as any;

			expect(result.jobs.items).toHaveLength(1);
			expect(result.jobs.items[0].name).toBe('Q1 Analysis');
			expect(result.jobs.total).toBe(1);
		});

		it('passes status filter from URL', async () => {
			mockListJobs.mockResolvedValue({ items: [], total: 0, page: 1, page_size: 50 });

			const { load } = await import('./+page.server');
			await load({
				locals: mockLocals(true),
				url: new URL('http://localhost/governance/role-mining?status=pending'),
				fetch: vi.fn()
			} as any);

			expect(mockListJobs).toHaveBeenCalledWith(
				expect.objectContaining({ status: 'pending' }),
				'tok',
				'tid',
				expect.any(Function)
			);
		});

		it('reads pagination from URL searchParams', async () => {
			mockListJobs.mockResolvedValue({ items: [], total: 50, page: 2, page_size: 10 });

			const { load } = await import('./+page.server');
			await load({
				locals: mockLocals(true),
				url: new URL('http://localhost/governance/role-mining?offset=10&limit=10'),
				fetch: vi.fn()
			} as any);

			expect(mockListJobs).toHaveBeenCalledWith(
				expect.objectContaining({ limit: 10, offset: 10 }),
				'tok',
				'tid',
				expect.any(Function)
			);
		});

		it('returns empty items array when API throws', async () => {
			mockListJobs.mockRejectedValue(new Error('API error'));

			const { load } = await import('./+page.server');
			const result = (await load({
				locals: mockLocals(true),
				url: new URL('http://localhost/governance/role-mining'),
				fetch: vi.fn()
			} as any)) as any;

			expect(result.jobs).toEqual({ items: [], total: 0, page: 1, page_size: 50 });
		});

		it('passes correct token and tenantId', async () => {
			mockListJobs.mockResolvedValue({ items: [], total: 0, page: 1, page_size: 50 });
			const mockFetch = vi.fn();

			const { load } = await import('./+page.server');
			await load({
				locals: {
					accessToken: 'my-token',
					tenantId: 'my-tenant',
					user: { roles: ['admin'] }
				},
				url: new URL('http://localhost/governance/role-mining'),
				fetch: mockFetch
			} as any);

			expect(mockListJobs).toHaveBeenCalledWith(
				expect.any(Object),
				'my-token',
				'my-tenant',
				mockFetch
			);
		});

		it('calls hasAdminRole with user roles', async () => {
			mockListJobs.mockResolvedValue({ items: [], total: 0, page: 1, page_size: 50 });

			const { load } = await import('./+page.server');
			await load({
				locals: mockLocals(true),
				url: new URL('http://localhost/governance/role-mining'),
				fetch: vi.fn()
			} as any);

			expect(mockHasAdminRole).toHaveBeenCalledWith(['admin']);
		});
	});
});

describe('Job detail +page.server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockHasAdminRole.mockReturnValue(true);
	});

	it('redirects non-admin users', async () => {
		mockHasAdminRole.mockReturnValue(false);
		const { load } = await import('./jobs/[id]/+page.server');
		try {
			await load({
				params: { id: 'job-1' },
				locals: mockLocals(false),
				fetch: vi.fn()
			} as any);
			expect.fail('should have thrown redirect');
		} catch (e: any) {
			expect(e.status).toBe(302);
		}
	});

	it('returns job and candidates for completed job', async () => {
		mockGetJob.mockResolvedValue(mockJob);
		mockListCandidates.mockResolvedValue({
			items: [
				{
					id: 'cand-1',
					job_id: 'job-1',
					proposed_name: 'Eng Read-Only',
					confidence_score: 85,
					member_count: 10,
					entitlement_ids: ['e1'],
					user_ids: ['u1'],
					promotion_status: 'pending',
					promoted_role_id: null,
					dismissed_reason: null,
					created_at: '2026-01-01T00:00:00Z'
				}
			],
			total: 1,
			page: 1,
			page_size: 50
		});

		const { load } = await import('./jobs/[id]/+page.server');
		const result = (await load({
			params: { id: 'job-1' },
			locals: mockLocals(true),
			fetch: vi.fn()
		} as any)) as any;

		expect(result.job.name).toBe('Q1 Analysis');
		expect(result.candidates.items).toHaveLength(1);
	});

	it('returns empty candidates for pending job', async () => {
		mockGetJob.mockResolvedValue({ ...mockJob, status: 'pending' as const });

		const { load } = await import('./jobs/[id]/+page.server');
		const result = (await load({
			params: { id: 'job-1' },
			locals: mockLocals(true),
			fetch: vi.fn()
		} as any)) as any;

		expect(result.job.status).toBe('pending');
		expect(result.candidates.items).toHaveLength(0);
		expect(mockListCandidates).not.toHaveBeenCalled();
	});

	it('throws 404 when job not found', async () => {
		mockGetJob.mockRejectedValue(new Error('not found'));

		const { load } = await import('./jobs/[id]/+page.server');
		try {
			await load({
				params: { id: 'nonexistent' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);
			expect.fail('should have thrown');
		} catch (e: any) {
			expect(e.status).toBe(404);
		}
	});
});

describe('Simulation detail +page.server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockHasAdminRole.mockReturnValue(true);
	});

	it('redirects non-admin users', async () => {
		mockHasAdminRole.mockReturnValue(false);
		const { load } = await import('./simulations/[id]/+page.server');
		try {
			await load({
				params: { id: 'sim-1' },
				locals: mockLocals(false),
				fetch: vi.fn()
			} as any);
			expect.fail('should have thrown redirect');
		} catch (e: any) {
			expect(e.status).toBe(302);
		}
	});

	it('returns simulation for admin', async () => {
		mockGetSimulation.mockResolvedValue({
			id: 'sim-1',
			tenant_id: 't1',
			name: 'Test Simulation',
			scenario_type: 'add_entitlement',
			target_role_id: 'role-1',
			changes: { entitlement_id: 'ent-1' },
			status: 'draft',
			affected_users: [],
			access_gained: null,
			access_lost: null,
			applied_by: null,
			applied_at: null,
			created_by: 'admin-1',
			created_at: '2026-02-01T10:00:00Z'
		} as any);

		const { load } = await import('./simulations/[id]/+page.server');
		const result = (await load({
			params: { id: 'sim-1' },
			locals: mockLocals(true),
			fetch: vi.fn()
		} as any)) as any;

		expect(result.simulation.name).toBe('Test Simulation');
		expect(result.simulation.status).toBe('draft');
	});

	it('throws 404 when simulation not found', async () => {
		mockGetSimulation.mockRejectedValue(new Error('not found'));

		const { load } = await import('./simulations/[id]/+page.server');
		try {
			await load({
				params: { id: 'nonexistent' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);
			expect.fail('should have thrown');
		} catch (e: any) {
			expect(e.status).toBe(404);
		}
	});
});

describe('Create mining job +page.server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockHasAdminRole.mockReturnValue(true);
	});

	it('redirects non-admin users', async () => {
		mockHasAdminRole.mockReturnValue(false);
		const { load } = await import('./create/+page.server');
		try {
			await load({
				locals: mockLocals(false)
			} as any);
			expect.fail('should have thrown redirect');
		} catch (e: any) {
			expect(e.status).toBe(302);
			expect(e.location).toBe('/dashboard');
		}
	});

	it('returns supervalidated form for admin', async () => {
		const { load } = await import('./create/+page.server');
		const result = (await load({
			locals: mockLocals(true)
		} as any)) as any;

		expect(result.form).toBeDefined();
		expect(result.form.valid).toBe(true);
	});
});
