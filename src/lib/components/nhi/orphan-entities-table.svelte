<script lang="ts">
	import type { OrphanNhiEntity } from '$lib/api/types';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import { nhiTypeClass, nhiEntityPath } from './nhi-utils';

	interface Props {
		entities: OrphanNhiEntity[];
	}

	let { entities }: Props = $props();

	function reasonClass(reason: string): string {
		if (reason.includes('does not exist')) return 'text-red-500';
		if (reason.includes('not active')) return 'text-yellow-500';
		return 'text-muted-foreground';
	}
</script>

<div class="space-y-4">
	<p class="text-sm text-muted-foreground">{entities.length} orphaned entities detected</p>

	{#if entities.length === 0}
		<p class="py-8 text-center text-sm text-muted-foreground">No orphaned NHI entities detected.</p>
	{:else}
		<div class="overflow-x-auto">
			<table class="w-full text-sm">
				<thead>
					<tr class="border-b border-border text-left">
						<th class="px-3 py-2 font-medium text-muted-foreground">Name</th>
						<th class="px-3 py-2 font-medium text-muted-foreground">Type</th>
						<th class="px-3 py-2 font-medium text-muted-foreground">Owner ID</th>
						<th class="px-3 py-2 font-medium text-muted-foreground">Reason</th>
					</tr>
				</thead>
				<tbody>
					{#each entities as entity}
						<tr class="border-b border-border">
							<td class="px-3 py-2">
								<a href={nhiEntityPath(entity.nhi_type, entity.id)} class="font-medium text-primary hover:underline">
									{entity.name}
								</a>
							</td>
							<td class="px-3 py-2">
								<Badge class={nhiTypeClass(entity.nhi_type)}>{entity.nhi_type}</Badge>
							</td>
							<td class="px-3 py-2 font-mono text-xs text-muted-foreground">
								{entity.owner_id ?? '—'}
							</td>
							<td class="px-3 py-2">
								<span class={reasonClass(entity.reason)}>{entity.reason}</span>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>
