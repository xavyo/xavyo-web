<script lang="ts">
	import type { NhiSodRule } from '$lib/api/types';
	import Button from '$lib/components/ui/button/button.svelte';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import { Dialog } from 'bits-ui';
	import DialogContent from '$lib/components/ui/dialog/dialog-content.svelte';
	import DialogHeader from '$lib/components/ui/dialog/dialog-header.svelte';
	import DialogTitle from '$lib/components/ui/dialog/dialog-title.svelte';
	import DialogFooter from '$lib/components/ui/dialog/dialog-footer.svelte';
	import { enforcementClass, formatNhiDate } from './nhi-utils';

	interface Props {
		rules: NhiSodRule[];
		nameMap?: Record<string, string>;
		onDelete: (id: string) => Promise<void>;
	}

	let { rules, nameMap = {}, onDelete }: Props = $props();

	function toolName(id: string): string {
		return nameMap[id] ?? id;
	}

	let showDeleteDialog = $state(false);
	let deleteTarget = $state<NhiSodRule | null>(null);
	let deleting = $state(false);

	function confirmDelete(rule: NhiSodRule) {
		deleteTarget = rule;
		showDeleteDialog = true;
	}

	async function handleDelete() {
		if (!deleteTarget) return;
		deleting = true;
		try {
			await onDelete(deleteTarget.id);
			showDeleteDialog = false;
		} finally {
			deleting = false;
		}
	}
</script>

<div class="space-y-4">
	<div class="flex items-center justify-between">
		<p class="text-sm text-muted-foreground">{rules.length} SoD {rules.length === 1 ? 'rule' : 'rules'}</p>
		<a
			href="/nhi/governance/sod/create"
			class="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-xs hover:bg-primary/90"
		>
			Create Rule
		</a>
	</div>

	{#if rules.length === 0}
		<p class="py-8 text-center text-sm text-muted-foreground">No NHI SoD rules configured.</p>
	{:else}
		<div class="overflow-x-auto">
			<table class="w-full text-sm">
				<thead>
					<tr class="border-b border-border text-left">
						<th class="px-3 py-2 font-medium text-muted-foreground">Tool A</th>
						<th class="px-3 py-2 font-medium text-muted-foreground">Tool B</th>
						<th class="px-3 py-2 font-medium text-muted-foreground">Enforcement</th>
						<th class="px-3 py-2 font-medium text-muted-foreground">Description</th>
						<th class="px-3 py-2 font-medium text-muted-foreground">Created</th>
						<th class="px-3 py-2 font-medium text-muted-foreground">Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each rules as rule}
						<tr class="border-b border-border">
							<td class="px-3 py-2 text-sm" title={rule.tool_id_a}>{toolName(rule.tool_id_a)}</td>
							<td class="px-3 py-2 text-sm" title={rule.tool_id_b}>{toolName(rule.tool_id_b)}</td>
							<td class="px-3 py-2">
								<Badge class={enforcementClass(rule.enforcement)}>{rule.enforcement}</Badge>
							</td>
							<td class="px-3 py-2 text-muted-foreground">{rule.description ?? '—'}</td>
							<td class="px-3 py-2 text-muted-foreground">{formatNhiDate(rule.created_at)}</td>
							<td class="px-3 py-2">
								<Button variant="ghost" size="sm" onclick={() => confirmDelete(rule)}>
									Delete
								</Button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>

<Dialog.Root bind:open={showDeleteDialog}>
	<DialogContent>
		<DialogHeader>
			<DialogTitle>Delete SoD Rule</DialogTitle>
		</DialogHeader>
		<p class="py-4 text-sm text-muted-foreground">
			Are you sure you want to delete this SoD rule? This action cannot be undone.
		</p>
		<DialogFooter>
			<Button variant="outline" onclick={() => (showDeleteDialog = false)}>Cancel</Button>
			<Button variant="destructive" onclick={handleDelete} disabled={deleting}>
				{deleting ? 'Deleting...' : 'Delete'}
			</Button>
		</DialogFooter>
	</DialogContent>
</Dialog.Root>
