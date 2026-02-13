<script lang="ts">
	import type { MicroCertificationStatus } from '$lib/api/types';

	interface Props {
		status: MicroCertificationStatus;
		size?: 'sm' | 'md';
	}

	let { status, size = 'md' }: Props = $props();

	const colorMap: Record<MicroCertificationStatus, string> = {
		pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
		approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
		revoked: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
		auto_revoked: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
		flagged_for_review: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
		skipped: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
		expired: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
	};

	const labelMap: Record<MicroCertificationStatus, string> = {
		pending: 'Pending',
		approved: 'Approved',
		revoked: 'Revoked',
		auto_revoked: 'Auto-Revoked',
		flagged_for_review: 'Flagged',
		skipped: 'Skipped',
		expired: 'Expired'
	};

	const badgeColor = $derived(colorMap[status] ?? 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400');
	const sizeClass = $derived(size === 'sm' ? 'text-xs px-1.5 py-0.5' : 'text-sm px-2 py-1');
</script>

<span class="inline-flex items-center rounded-full font-medium {badgeColor} {sizeClass}" data-testid="cert-status-badge">
	{labelMap[status] ?? status}
</span>
