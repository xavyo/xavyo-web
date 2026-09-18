<script lang="ts">
	import type { MicroCertificationStatus } from '$lib/api/types';

	interface Props {
		status: MicroCertificationStatus;
		size?: 'sm' | 'md';
	}

	let { status, size = 'md' }: Props = $props();

	const colorMap: Record<MicroCertificationStatus, string> = {
		pending: 'bg-warning/15 text-warning',
		approved: 'bg-success/15 text-success',
		revoked: 'bg-destructive/15 text-destructive',
		auto_revoked: 'bg-destructive/15 text-destructive',
		flagged_for_review: 'bg-warning/15 text-warning',
		skipped: 'bg-muted text-muted-foreground ',
		expired: 'bg-warning/15 text-warning'
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

	const badgeColor = $derived(colorMap[status] ?? 'bg-muted text-muted-foreground ');
	const sizeClass = $derived(size === 'sm' ? 'text-xs px-1.5 py-0.5' : 'text-sm px-2 py-1');
</script>

<span class="inline-flex items-center rounded-full font-medium {badgeColor} {sizeClass}" data-testid="cert-status-badge">
	{labelMap[status] ?? status}
</span>
