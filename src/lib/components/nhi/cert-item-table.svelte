<script lang="ts">
	import type { NhiCertificationItem, NhiCertItemDecision } from '$lib/api/types';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { EmptyState } from '$lib/components/ui/empty-state';

	let {
		items,
		campaignStatus = 'active',
		onDecide,
		onBulkDecide,
		selectedIds = $bindable([])
	}: {
		items: NhiCertificationItem[];
		campaignStatus?: string;
		onDecide?: (itemId: string, decision: NhiCertItemDecision, notes?: string) => void;
		onBulkDecide?: (itemIds: string[], decision: NhiCertItemDecision) => void;
		selectedIds?: string[];
	} = $props();

	let selectAll = $state(false);

	function toggleSelectAll() {
		selectAll = !selectAll;
		if (selectAll) {
			selectedIds = items.filter((i) => !i.decision).map((i) => i.id);
		} else {
			selectedIds = [];
		}
	}

	function toggleItem(id: string) {
		if (selectedIds.includes(id)) {
			selectedIds = selectedIds.filter((i) => i !== id);
		} else {
			selectedIds = [...selectedIds, id];
		}
	}

	const decisionVariants: Record<string, string> = {
		certify: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
		revoke: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
		flag: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
	};
</script>

{#if items.length === 0}
	<EmptyState title="No certification items" description="No NHI entities are in scope for this campaign." />
{:else}
	{#if selectedIds.length > 0 && onBulkDecide && campaignStatus === 'active'}
		<div class="mb-4 flex items-center gap-2 rounded-md border bg-muted/50 p-3">
			<span class="text-sm font-medium">{selectedIds.length} selected</span>
			<Button size="sm" variant="default" onclick={() => onBulkDecide(selectedIds, 'certify')}>Certify Selected</Button>
			<Button size="sm" variant="destructive" onclick={() => onBulkDecide(selectedIds, 'revoke')}>Revoke Selected</Button>
			<Button size="sm" variant="outline" onclick={() => onBulkDecide(selectedIds, 'flag')}>Flag Selected</Button>
		</div>
	{/if}
	<div class="rounded-md border">
		<table class="w-full text-sm">
			<thead>
				<tr class="border-b bg-muted/50">
					{#if campaignStatus === 'active'}
						<th class="w-10 px-4 py-3">
							<input type="checkbox" checked={selectAll} onchange={toggleSelectAll} class="rounded" />
						</th>
					{/if}
					<th class="px-4 py-3 text-left font-medium">NHI Name</th>
					<th class="px-4 py-3 text-left font-medium">Type</th>
					<th class="px-4 py-3 text-left font-medium">Decision</th>
					<th class="px-4 py-3 text-left font-medium">Decided At</th>
					{#if campaignStatus === 'active'}
						<th class="px-4 py-3 text-left font-medium">Actions</th>
					{/if}
				</tr>
			</thead>
			<tbody>
				{#each items as item}
					<tr class="border-b">
						{#if campaignStatus === 'active'}
							<td class="px-4 py-3">
								{#if !item.decision}
									<input type="checkbox" checked={selectedIds.includes(item.id)} onchange={() => toggleItem(item.id)} class="rounded" />
								{/if}
							</td>
						{/if}
						<td class="px-4 py-3 font-medium">{item.nhi_name ?? item.nhi_id}</td>
						<td class="px-4 py-3">{item.nhi_type ?? '—'}</td>
						<td class="px-4 py-3">
							{#if item.decision}
								<Badge class={decisionVariants[item.decision] ?? ''}>{item.decision}</Badge>
							{:else}
								<span class="text-muted-foreground">Pending</span>
							{/if}
						</td>
						<td class="px-4 py-3 text-muted-foreground">
							{item.decided_at ? new Date(item.decided_at).toLocaleString() : '—'}
						</td>
						{#if campaignStatus === 'active'}
							<td class="px-4 py-3">
								{#if !item.decision && onDecide}
									<div class="flex gap-1">
										<Button size="sm" variant="outline" onclick={() => onDecide(item.id, 'certify')}>Certify</Button>
										<Button size="sm" variant="destructive" onclick={() => onDecide(item.id, 'revoke')}>Revoke</Button>
										<Button size="sm" variant="ghost" onclick={() => onDecide(item.id, 'flag')}>Flag</Button>
									</div>
								{/if}
							</td>
						{/if}
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}
