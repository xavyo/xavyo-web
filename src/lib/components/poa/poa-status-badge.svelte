<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import type { PoaStatus } from '$lib/api/types';

	interface Props {
		status: PoaStatus;
	}

	let { status }: Props = $props();

	const statusConfig: Record<PoaStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
		pending: { label: 'Pending', variant: 'secondary' },
		active: { label: 'Active', variant: 'default' },
		expired: { label: 'Expired', variant: 'outline' },
		revoked: { label: 'Revoked', variant: 'destructive' }
	};

	const config = $derived(statusConfig[status] ?? { label: status, variant: 'outline' as const });
</script>

<Badge variant={config.variant}>{config.label}</Badge>
