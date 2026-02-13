/**
 * Shared utility functions for NHI governance components.
 */

export function nhiTypeClass(t: string): string {
	switch (t) {
		case 'tool':
			return 'bg-blue-600 text-white hover:bg-blue-600/80';
		case 'agent':
			return 'bg-purple-600 text-white hover:bg-purple-600/80';
		case 'service_account':
			return 'bg-teal-600 text-white hover:bg-teal-600/80';
		default:
			return '';
	}
}

export function nhiTypeLabel(t: string): string {
	switch (t) {
		case 'tool':
			return 'Tools';
		case 'agent':
			return 'Agents';
		case 'service_account':
			return 'Service Accounts';
		default:
			return t;
	}
}

export function riskLevelClass(level: string): string {
	switch (level) {
		case 'critical':
			return 'bg-red-600 text-white hover:bg-red-600/80';
		case 'high':
			return 'bg-orange-500 text-white hover:bg-orange-500/80';
		case 'medium':
			return 'bg-yellow-500 text-white hover:bg-yellow-500/80';
		case 'low':
			return 'bg-green-600 text-white hover:bg-green-600/80';
		default:
			return '';
	}
}

export function campaignStatusClass(s: string): string {
	switch (s) {
		case 'active':
			return 'bg-green-600 text-white hover:bg-green-600/80';
		case 'completed':
			return 'bg-blue-600 text-white hover:bg-blue-600/80';
		case 'cancelled':
			return 'bg-red-500 text-white hover:bg-red-500/80';
		default:
			return '';
	}
}

export function enforcementClass(e: string): string {
	return e === 'prevent'
		? 'bg-red-600 text-white hover:bg-red-600/80'
		: 'bg-yellow-500 text-white hover:bg-yellow-500/80';
}

export function formatNhiDate(d: string | null): string {
	if (!d) return '—';
	return new Date(d).toLocaleDateString();
}

export function nhiEntityPath(nhiType: string, id: string): string {
	const segment = nhiType === 'service_account' ? 'service-accounts' : nhiType + 's';
	return `/nhi/${segment}/${id}`;
}
