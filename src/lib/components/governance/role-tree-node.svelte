<script lang="ts">
	import type { RoleTreeNode } from '$lib/api/types';
	import { Badge } from '$lib/components/ui/badge';
	import { ChevronRight, ChevronDown } from 'lucide-svelte';

	interface Props {
		node: RoleTreeNode;
		expandedIds: Set<string>;
		onToggle: (id: string) => void;
	}

	let { node, expandedIds, onToggle }: Props = $props();

	const isExpanded = $derived(expandedIds.has(node.id));
	const hasChildren = $derived(node.children.length > 0);
</script>

<div>
	<div
		class="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted/50"
		style="padding-left: {node.depth * 24 + 8}px"
	>
		<!-- Expand/collapse toggle -->
		{#if hasChildren}
			<button
				class="flex h-5 w-5 items-center justify-center rounded hover:bg-muted"
				onclick={() => onToggle(node.id)}
				aria-label={isExpanded ? 'Collapse' : 'Expand'}
			>
				{#if isExpanded}
					<ChevronDown class="h-4 w-4" />
				{:else}
					<ChevronRight class="h-4 w-4" />
				{/if}
			</button>
		{:else}
			<span class="w-5"></span>
		{/if}

		<!-- Role name (link to detail) -->
		<a
			href="/governance/roles/{node.id}"
			class="font-medium text-primary hover:underline"
		>
			{node.name}
		</a>

		<!-- Badges -->
		{#if node.is_abstract}
			<Badge variant="secondary" class="text-xs">Abstract</Badge>
		{/if}

		<div class="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
			<span title="Direct entitlements">{node.direct_entitlement_count} direct</span>
			<span title="Effective entitlements">{node.effective_entitlement_count} effective</span>
			<span title="Assigned users">{node.assigned_user_count} users</span>
		</div>
	</div>

	<!-- Recursive children -->
	{#if isExpanded && hasChildren}
		{#each node.children as child (child.id)}
			<svelte:self node={child} {expandedIds} {onToggle} />
		{/each}
	{/if}
</div>
