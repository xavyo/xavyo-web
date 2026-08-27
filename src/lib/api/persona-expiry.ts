import { apiClient } from './client';
import type {
	ExtendPersonaRequest,
	ExtendPersonaResponse,
	ExpiringPersona,
	ExpiringPersonaListResponse,
	PropagateAttributesResponse
} from './types';

function asRecord(value: unknown): Record<string, unknown> {
	return value && typeof value === 'object' && !Array.isArray(value)
		? (value as Record<string, unknown>)
		: {};
}

function asString(value: unknown): string {
	return typeof value === 'string' ? value : value == null ? '' : String(value);
}

function asNumber(value: unknown, fallback = 0): number {
	return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function asNullableString(value: unknown): string | null {
	if (value == null) return null;
	return typeof value === 'string' ? value : String(value);
}

/** Map advertised API / legacy handler shapes onto the web list contract. */
export function mapExpiringPersonaList(
	raw: unknown,
	params: { limit?: number; offset?: number } = {}
): ExpiringPersonaListResponse {
	const obj = asRecord(raw);
	const rawItems = Array.isArray(obj.items)
		? obj.items
		: Array.isArray(obj.personas)
			? obj.personas
			: [];
	const items: ExpiringPersona[] = rawItems.map((row) => {
		const r = asRecord(row);
		return {
			id: asString(r.id ?? r.persona_id),
			name: asString(r.name ?? r.persona_name),
			archetype_name: asNullableString(r.archetype_name),
			valid_until: asString(r.valid_until),
			days_until_expiry: asNumber(r.days_until_expiry ?? r.days_remaining),
			assigned_user_name: asNullableString(r.assigned_user_name ?? r.physical_user_name)
		};
	});
	return {
		items,
		total: asNumber(obj.total ?? obj.expiring_count, items.length),
		limit: asNumber(obj.limit, params.limit ?? items.length),
		offset: asNumber(obj.offset, params.offset ?? 0)
	};
}

/** Map advertised API / persona-body fallback onto ExtendPersonaResponse. */
export function mapExtendPersonaResponse(raw: unknown): ExtendPersonaResponse {
	const obj = asRecord(raw);
	const status: ExtendPersonaResponse['status'] =
		obj.status === 'pending_approval' ? 'pending_approval' : 'approved';
	let persona: Record<string, unknown> | null = null;
	if (obj.persona && typeof obj.persona === 'object' && !Array.isArray(obj.persona)) {
		persona = obj.persona as Record<string, unknown>;
	} else if (typeof obj.id === 'string') {
		persona = obj;
	}
	return {
		status,
		persona,
		approval_request_id: typeof obj.approval_request_id === 'string' ? obj.approval_request_id : null
	};
}

/** Map advertised API / persona-body fallback onto PropagateAttributesResponse. */
export function mapPropagateAttributesResponse(raw: unknown): PropagateAttributesResponse {
	const obj = asRecord(raw);
	return {
		persona_id: asString(obj.persona_id ?? obj.id),
		attributes_updated: asNumber(obj.attributes_updated ?? obj.attributes_updated_count)
	};
}

export async function listExpiringPersonas(
	params: { days_ahead?: number; limit?: number; offset?: number },
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<ExpiringPersonaListResponse> {
	const searchParams = new URLSearchParams();
	if (params.days_ahead !== undefined) searchParams.set('days_ahead', String(params.days_ahead));
	if (params.limit !== undefined) searchParams.set('limit', String(params.limit));
	if (params.offset !== undefined) searchParams.set('offset', String(params.offset));
	const qs = searchParams.toString();
	const raw = await apiClient<unknown>(`/governance/personas/expiring${qs ? `?${qs}` : ''}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
	return mapExpiringPersonaList(raw, params);
}

export async function extendPersona(
	personaId: string,
	body: ExtendPersonaRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<ExtendPersonaResponse> {
	const raw = await apiClient<unknown>(`/governance/personas/${personaId}/extend`, {
		method: 'POST',
		token,
		tenantId,
		body,
		fetch: fetchFn
	});
	return mapExtendPersonaResponse(raw);
}

export async function propagateAttributes(
	personaId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<PropagateAttributesResponse> {
	const raw = await apiClient<unknown>(
		`/governance/personas/${personaId}/propagate-attributes`,
		{
			method: 'POST',
			token,
			tenantId,
			fetch: fetchFn
		}
	);
	return mapPropagateAttributesResponse(raw);
}
