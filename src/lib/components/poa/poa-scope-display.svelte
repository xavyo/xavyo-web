<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import type { PoaScope } from '$lib/api/types';

	interface Props {
		scope: PoaScope;
	}

	let { scope }: Props = $props();

	const hasApps = $derived(scope.application_ids.length > 0);
	const hasWorkflows = $derived(scope.workflow_types.length > 0);
</script>

<div class="space-y-2">
	<div>
		<span class="text-sm font-medium text-muted-foreground">Applications:</span>
		{#if hasApps}
			<div class="mt-1 flex flex-wrap gap-1">
				{#each scope.application_ids as appId}
					<Badge variant="outline">{appId}</Badge>
				{/each}
			</div>
		{:else}
			<span class="ml-1 text-sm text-muted-foreground">All applications</span>
		{/if}
	</div>
	<div>
		<span class="text-sm font-medium text-muted-foreground">Workflow types:</span>
		{#if hasWorkflows}
			<div class="mt-1 flex flex-wrap gap-1">
				{#each scope.workflow_types as wfType}
					<Badge variant="secondary">{wfType}</Badge>
				{/each}
			</div>
		{:else}
			<span class="ml-1 text-sm text-muted-foreground">All workflow types</span>
		{/if}
	</div>
</div>
