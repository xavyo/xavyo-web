<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';

	let { isInitial = false, isTerminal = false }: { isInitial?: boolean; isTerminal?: boolean } = $props();
</script>

{#if isInitial}
	<Badge variant="default" class="bg-info text-info-foreground">Initial</Badge>
{:else if isTerminal}
	<Badge variant="destructive">Terminal</Badge>
{:else}
	<Badge variant="secondary">Intermediate</Badge>
{/if}
