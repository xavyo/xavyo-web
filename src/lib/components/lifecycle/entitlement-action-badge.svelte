<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';

	let { action }: { action: string } = $props();
</script>

{#if action === 'none'}
	<Badge variant="outline">None</Badge>
{:else if action === 'pause'}
	<Badge variant="default" class="bg-yellow-600">Pause</Badge>
{:else if action === 'revoke'}
	<Badge variant="destructive">Revoke</Badge>
{:else}
	<Badge variant="outline">{action}</Badge>
{/if}
