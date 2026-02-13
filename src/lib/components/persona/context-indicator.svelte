<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';

	let { personaName, isActive = false }: { personaName?: string | null; isActive?: boolean } = $props();
</script>

{#if isActive && personaName}
	<Badge class="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400">
		Acting as: {personaName}
	</Badge>
{/if}
