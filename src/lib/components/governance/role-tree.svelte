<script lang="ts">
	import type { RoleTreeNode } from '$lib/api/types';
	import RoleTreeNodeComponent from './role-tree-node.svelte';
	import { Button } from '$lib/components/ui/button';
	import EmptyState from '$lib/components/ui/empty-state/empty-state.svelte';
	import { ChevronsDownUp, ChevronsUpDown } from 'lucide-svelte';

	interface Props {
		roots: RoleTreeNode[];
	}

	let { roots }: Props = $props();

	let expandedIds = $state<Set<string>>(new Set());

	function toggleNode(id: string) {
		const next = new Set(expandedIds);
		if (next.has(id)) {
			next.delete(id);
		} else {
			next.add(id);
		}
		expandedIds = next;
	}

	function collectAllIds(nodes: RoleTreeNode[]): string[] {
		const ids: string[] = [];
		for (const node of nodes) {
			if (node.children.length > 0) {
				ids.push(node.id);
				ids.push(...collectAllIds(node.children));
			}
		}
		return ids;
	}

	function expandAll() {
		expandedIds = new Set(collectAllIds(roots));
	}

	function collapseAll() {
		expandedIds = new Set();
	}
</script>

{#if roots.length === 0}
	<EmptyState title="No roles found" description="Create your first governance role to see the hierarchy." />
{:else}
	<div class="mb-3 flex gap-2">
		<Button variant="outline" size="sm" onclick={expandAll}>
			<ChevronsUpDown class="mr-1 h-3 w-3" />
			Expand All
		</Button>
		<Button variant="outline" size="sm" onclick={collapseAll}>
			<ChevronsDownUp class="mr-1 h-3 w-3" />
			Collapse All
		</Button>
	</div>

	<div class="rounded-md border">
		{#each roots as root (root.id)}
			<RoleTreeNodeComponent node={root} {expandedIds} onToggle={toggleNode} />
		{/each}
	</div>
{/if}
