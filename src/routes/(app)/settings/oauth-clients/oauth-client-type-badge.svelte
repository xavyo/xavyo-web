<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';

	let { clientType }: { clientType: string } = $props();
</script>

{#if clientType === 'confidential'}
	<Badge variant="secondary">Confidential</Badge>
{:else}
	<Badge variant="outline">Public</Badge>
{/if}
