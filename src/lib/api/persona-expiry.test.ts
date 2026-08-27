import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./client', () => ({
	apiClient: vi.fn(),
	ApiError: class ApiError extends Error {
		status: number;
		constructor(message: string, status: number) {
			super(message);
			this.status = status;
		}
	}
}));

import { apiClient } from './client';
import {
	listExpiringPersonas,
	extendPersona,
	propagateAttributes,
	mapExpiringPersonaList,
	mapExtendPersonaResponse,
	mapPropagateAttributesResponse
} from './persona-expiry';

const mockApiClient = vi.mocked(apiClient);

describe('Persona Expiry API', () => {
	const mockFetch = vi.fn();
	const token = 'test-token';
	const tenantId = 'test-tenant';

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('mapExpiringPersonaList', () => {
		it('maps advertised API items/total/limit/offset onto the web list', () => {
			const mapped = mapExpiringPersonaList({
				items: [
					{
						id: 'p1',
						persona_name: 'Ops',
						archetype_name: 'Operator',
						valid_until: '2026-09-01T00:00:00Z',
						days_remaining: 4,
						physical_user_name: 'Ada'
					}
				],
				total: 9,
				limit: 1,
				offset: 2
			});
			expect(mapped).toEqual({
				items: [
					{
						id: 'p1',
						name: 'Ops',
						archetype_name: 'Operator',
						valid_until: '2026-09-01T00:00:00Z',
						days_until_expiry: 4,
						assigned_user_name: 'Ada'
					}
				],
				total: 9,
				limit: 1,
				offset: 2
			});
		});

		it('maps legacy personas/expiring_count so the UI is not empty', () => {
			const mapped = mapExpiringPersonaList(
				{
					personas: [{ persona_id: 'p2', persona_name: 'Dev', valid_until: '2026-10-01', days_remaining: 12 }],
					expiring_count: 5
				},
				{ limit: 50, offset: 0 }
			);
			expect(mapped.items).toHaveLength(1);
			expect(mapped.items[0].id).toBe('p2');
			expect(mapped.items[0].name).toBe('Dev');
			expect(mapped.total).toBe(5);
			expect(mapped.limit).toBe(50);
			expect(mapped.offset).toBe(0);
		});
	});

	describe('mapExtendPersonaResponse', () => {
		it('passes through advertised status/persona/approval_request_id', () => {
			expect(
				mapExtendPersonaResponse({
					status: 'pending_approval',
					persona: { id: 'p1' },
					approval_request_id: 'ar1'
				})
			).toEqual({
				status: 'pending_approval',
				persona: { id: 'p1' },
				approval_request_id: 'ar1'
			});
		});

		it('treats a bare persona body as an approved extension', () => {
			const mapped = mapExtendPersonaResponse({ id: 'p1', persona_name: 'Ops' });
			expect(mapped.status).toBe('approved');
			expect(mapped.persona).toMatchObject({ id: 'p1' });
			expect(mapped.approval_request_id).toBeNull();
		});
	});

	describe('mapPropagateAttributesResponse', () => {
		it('maps persona_id and attributes_updated', () => {
			expect(mapPropagateAttributesResponse({ persona_id: 'p1', attributes_updated: 3 })).toEqual({
				persona_id: 'p1',
				attributes_updated: 3
			});
		});

		it('maps a persona body id when attributes_updated is missing', () => {
			expect(mapPropagateAttributesResponse({ id: 'p1' })).toEqual({
				persona_id: 'p1',
				attributes_updated: 0
			});
		});
	});

	describe('listExpiringPersonas', () => {
		it('calls GET /governance/personas/expiring without params', async () => {
			mockApiClient.mockResolvedValue({ items: [], total: 0, limit: 50, offset: 0 });

			const result = await listExpiringPersonas({}, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/personas/expiring', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual({ items: [], total: 0, limit: 50, offset: 0 });
		});

		it('includes days_ahead and pagination params in query string', async () => {
			mockApiClient.mockResolvedValue({ items: [], total: 0, limit: 20, offset: 0 });

			await listExpiringPersonas({ days_ahead: 30, limit: 20, offset: 0 }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('/governance/personas/expiring');
			expect(calledPath).toContain('days_ahead=30');
			expect(calledPath).toContain('limit=20');
			expect(calledPath).toContain('offset=0');
		});

		it('maps API personas[] so page load is not empty', async () => {
			mockApiClient.mockResolvedValue({
				personas: [{ persona_id: 'p1', persona_name: 'Ops', valid_until: '2026-09-01', days_remaining: 3 }],
				expiring_count: 1
			});
			const result = await listExpiringPersonas({ limit: 50 }, token, tenantId, mockFetch);
			expect(result.items).toHaveLength(1);
			expect(result.items[0].id).toBe('p1');
			expect(result.items[0].name).toBe('Ops');
			expect(result.total).toBe(1);
		});
	});

	describe('extendPersona', () => {
		it('calls POST /governance/personas/:id/extend with body', async () => {
			const body = { new_valid_until: '2026-12-31', reason: 'Project extended' };
			const mockResult = { status: 'approved', persona: { id: 'persona-1' }, approval_request_id: null };
			mockApiClient.mockResolvedValue(mockResult);

			const result = await extendPersona('persona-1', body as any, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/personas/persona-1/extend', {
				method: 'POST',
				token,
				tenantId,
				body,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResult);
		});
	});

	describe('propagateAttributes', () => {
		it('calls POST /governance/personas/:id/propagate-attributes', async () => {
			const mockResult = { persona_id: 'persona-1', attributes_updated: 5 };
			mockApiClient.mockResolvedValue(mockResult);

			const result = await propagateAttributes('persona-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/personas/persona-1/propagate-attributes',
				{
					method: 'POST',
					token,
					tenantId,
					fetch: mockFetch
				}
			);
			expect(result).toEqual(mockResult);
		});
	});
});
