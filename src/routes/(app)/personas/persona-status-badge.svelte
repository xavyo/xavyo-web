<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import type { PersonaStatus } from '$lib/api/types';

	let { status }: { status: PersonaStatus } = $props();

	const labelMap: Record<PersonaStatus, string> = {
		draft: 'Draft',
		active: 'Active',
		expiring: 'Expiring',
		expired: 'Expired',
		suspended: 'Suspended',
		archived: 'Archived'
	};
</script>

{#if status === 'draft'}
	<Badge variant="outline">{labelMap[status]}</Badge>
{:else if status === 'active'}
	<Badge variant="default">{labelMap[status]}</Badge>
{:else if status === 'expiring'}
	<Badge class="border-transparent bg-amber-500 text-white shadow-xs hover:bg-amber-500/80">{labelMap[status]}</Badge>
{:else if status === 'expired'}
	<Badge variant="destructive">{labelMap[status]}</Badge>
{:else if status === 'suspended'}
	<Badge class="border-transparent bg-orange-500 text-white shadow-xs hover:bg-orange-500/80">{labelMap[status]}</Badge>
{:else if status === 'archived'}
	<Badge variant="secondary">{labelMap[status]}</Badge>
{/if}
