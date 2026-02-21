import type { GdprReport, UserDataProtectionSummary } from './types';

export async function fetchGdprReport(
	fetchFn: typeof fetch = fetch
): Promise<GdprReport> {
	const res = await fetchFn('/api/governance/gdpr/report');
	if (!res.ok) throw new Error(`Failed to fetch GDPR report: ${res.status}`);
	return res.json();
}

export async function fetchUserDataProtection(
	userId: string,
	fetchFn: typeof fetch = fetch
): Promise<UserDataProtectionSummary> {
	const res = await fetchFn(`/api/governance/gdpr/users/${userId}/data-protection`);
	if (!res.ok) throw new Error(`Failed to fetch user data protection: ${res.status}`);
	return res.json();
}
