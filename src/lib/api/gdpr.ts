import { apiClient } from './client';
import type { GdprReport, UserDataProtectionSummary } from './types';

export async function getGdprReport(
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<GdprReport> {
	return apiClient<GdprReport>('/governance/gdpr/report', {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function getUserDataProtection(
	userId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<UserDataProtectionSummary> {
	return apiClient<UserDataProtectionSummary>(`/governance/gdpr/users/${userId}/data-protection`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}
