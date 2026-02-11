<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import type { NhiLifecycleState } from '$lib/api/types';

	let { state }: { state: NhiLifecycleState } = $props();

	const labelMap: Record<NhiLifecycleState, string> = {
		active: 'Active',
		inactive: 'Inactive',
		suspended: 'Suspended',
		deprecated: 'Deprecated',
		archived: 'Archived'
	};
</script>

{#if state === 'active'}
	<Badge variant="default">{labelMap[state]}</Badge>
{:else if state === 'inactive'}
	<Badge variant="outline">{labelMap[state]}</Badge>
{:else if state === 'suspended'}
	<Badge class="border-transparent bg-orange-500 text-white shadow-xs hover:bg-orange-500/80">{labelMap[state]}</Badge>
{:else if state === 'deprecated'}
	<Badge class="border-transparent bg-amber-500 text-white shadow-xs hover:bg-amber-500/80">{labelMap[state]}</Badge>
{:else if state === 'archived'}
	<Badge variant="secondary">{labelMap[state]}</Badge>
{/if}
