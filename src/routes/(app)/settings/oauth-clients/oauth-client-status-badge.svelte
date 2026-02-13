<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';

	let { isActive }: { isActive: boolean } = $props();
</script>

{#if isActive}
	<Badge variant="default">Active</Badge>
{:else}
	<Badge variant="destructive">Inactive</Badge>
{/if}
