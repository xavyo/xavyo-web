<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';

	let { isInitial = false, isTerminal = false }: { isInitial?: boolean; isTerminal?: boolean } = $props();
</script>

{#if isInitial}
	<Badge variant="default" class="bg-blue-600">Initial</Badge>
{:else if isTerminal}
	<Badge variant="destructive">Terminal</Badge>
{:else}
	<Badge variant="secondary">Intermediate</Badge>
{/if}
