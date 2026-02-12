<script lang="ts">
	import type { CorrelationRule } from '$lib/api/types';
	import { deleteCorrelationRuleClient } from '$lib/api/correlation-client';
	import Button from '$lib/components/ui/button/button.svelte';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import { Dialog } from 'bits-ui';
	import DialogContent from '$lib/components/ui/dialog/dialog-content.svelte';
	import DialogHeader from '$lib/components/ui/dialog/dialog-header.svelte';
	import DialogTitle from '$lib/components/ui/dialog/dialog-title.svelte';
	import DialogFooter from '$lib/components/ui/dialog/dialog-footer.svelte';
	import RuleForm from './rule-form.svelte';
	import { addToast } from '$lib/stores/toast.svelte';
	import { Plus, Pencil, Trash2, Check } from 'lucide-svelte';

	interface Props {
		rules: CorrelationRule[];
		connectorId: string;
		onRuleCreated?: () => void;
		onRuleUpdated?: () => void;
		onRuleDeleted?: () => void;
	}

	let { rules, connectorId, onRuleCreated, onRuleUpdated, onRuleDeleted }: Props = $props();

	// Sort rules by tier then priority
	let sortedRules = $derived(
		[...rules].sort((a, b) => {
			if (a.tier !== b.tier) return a.tier - b.tier;
			return a.priority - b.priority;
		})
	);

	// Create dialog state
	let showCreateDialog = $state(false);

	// Edit dialog state
	let showEditDialog = $state(false);
	let editTarget = $state<CorrelationRule | null>(null);

	// Delete dialog state
	let showDeleteDialog = $state(false);
	let deleteTarget = $state<CorrelationRule | null>(null);
	let deleting = $state(false);

	function openEdit(rule: CorrelationRule) {
		editTarget = rule;
		showEditDialog = true;
	}

	function confirmDelete(rule: CorrelationRule) {
		deleteTarget = rule;
		showDeleteDialog = true;
	}

	async function handleDelete() {
		if (!deleteTarget) return;
		deleting = true;
		try {
			await deleteCorrelationRuleClient(connectorId, deleteTarget.id);
			addToast('success', 'Correlation rule deleted');
			showDeleteDialog = false;
			deleteTarget = null;
			onRuleDeleted?.();
		} catch (err) {
			addToast('error', err instanceof Error ? err.message : 'Failed to delete rule');
		} finally {
			deleting = false;
		}
	}

	function handleCreateSuccess() {
		showCreateDialog = false;
		onRuleCreated?.();
	}

	function handleEditSuccess() {
		showEditDialog = false;
		editTarget = null;
		onRuleUpdated?.();
	}

	function matchTypeBadgeClass(matchType: string): string {
		switch (matchType) {
			case 'exact':
				return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
			case 'fuzzy':
				return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
			case 'expression':
				return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
			default:
				return '';
		}
	}
</script>

<div class="space-y-4">
	<div class="flex items-center justify-between">
		<p class="text-sm text-muted-foreground">
			{rules.length} correlation {rules.length === 1 ? 'rule' : 'rules'}
		</p>
		<Button size="sm" onclick={() => (showCreateDialog = true)}>
			<Plus class="mr-1 h-4 w-4" />
			Add Rule
		</Button>
	</div>

	{#if rules.length === 0}
		<div class="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
			<p class="mb-2 text-sm font-medium text-muted-foreground">No correlation rules configured</p>
			<p class="mb-4 text-xs text-muted-foreground">
				Add rules to define how connector accounts are matched to identities.
			</p>
			<Button size="sm" onclick={() => (showCreateDialog = true)}>
				<Plus class="mr-1 h-4 w-4" />
				Add Rule
			</Button>
		</div>
	{:else}
		<div class="overflow-x-auto rounded-md border">
			<table class="w-full text-sm">
				<thead>
					<tr class="border-b bg-muted/50 text-left">
						<th class="px-3 py-2 font-medium text-muted-foreground">Name</th>
						<th class="px-3 py-2 font-medium text-muted-foreground">Mapping</th>
						<th class="px-3 py-2 font-medium text-muted-foreground">Match Type</th>
						<th class="px-3 py-2 font-medium text-muted-foreground">Threshold</th>
						<th class="px-3 py-2 font-medium text-muted-foreground">Weight</th>
						<th class="px-3 py-2 font-medium text-muted-foreground">Tier</th>
						<th class="px-3 py-2 font-medium text-muted-foreground">Definitive</th>
						<th class="px-3 py-2 font-medium text-muted-foreground">Status</th>
						<th class="px-3 py-2 font-medium text-muted-foreground">Priority</th>
						<th class="px-3 py-2 font-medium text-muted-foreground">Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each sortedRules as rule (rule.id)}
						<tr class="border-b transition-colors hover:bg-muted/50">
							<td class="px-3 py-2 font-medium">{rule.name}</td>
							<td class="px-3 py-2 text-muted-foreground">
								<span class="font-mono text-xs">{rule.source_attribute}</span>
								<span class="mx-1 text-muted-foreground/50">&rarr;</span>
								<span class="font-mono text-xs">{rule.target_attribute}</span>
							</td>
							<td class="px-3 py-2">
								<Badge class={matchTypeBadgeClass(rule.match_type)}>{rule.match_type}</Badge>
							</td>
							<td class="px-3 py-2 text-muted-foreground">{Math.round(rule.threshold * 100)}%</td>
							<td class="px-3 py-2 text-muted-foreground">{rule.weight}</td>
							<td class="px-3 py-2 text-muted-foreground">{rule.tier}</td>
							<td class="px-3 py-2">
								{#if rule.is_definitive}
									<Check class="h-4 w-4 text-green-600 dark:text-green-400" />
								{:else}
									<span class="text-muted-foreground/40">--</span>
								{/if}
							</td>
							<td class="px-3 py-2">
								{#if rule.is_active}
									<Badge class="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Active</Badge>
								{:else}
									<Badge class="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">Inactive</Badge>
								{/if}
							</td>
							<td class="px-3 py-2 text-muted-foreground">{rule.priority}</td>
							<td class="px-3 py-2">
								<div class="flex items-center gap-1">
									<Button variant="ghost" size="icon" onclick={() => openEdit(rule)} title="Edit rule">
										<Pencil class="h-4 w-4" />
									</Button>
									<Button variant="ghost" size="icon" onclick={() => confirmDelete(rule)} title="Delete rule">
										<Trash2 class="h-4 w-4 text-destructive" />
									</Button>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>

<!-- Create Rule Dialog -->
<Dialog.Root bind:open={showCreateDialog}>
	<DialogContent class="max-w-2xl">
		<DialogHeader>
			<DialogTitle>Add Correlation Rule</DialogTitle>
		</DialogHeader>
		<RuleForm
			{connectorId}
			onSuccess={handleCreateSuccess}
			onCancel={() => (showCreateDialog = false)}
		/>
	</DialogContent>
</Dialog.Root>

<!-- Edit Rule Dialog -->
<Dialog.Root bind:open={showEditDialog}>
	<DialogContent class="max-w-2xl">
		<DialogHeader>
			<DialogTitle>Edit Correlation Rule</DialogTitle>
		</DialogHeader>
		{#if editTarget}
			<RuleForm
				{connectorId}
				rule={editTarget}
				onSuccess={handleEditSuccess}
				onCancel={() => {
					showEditDialog = false;
					editTarget = null;
				}}
			/>
		{/if}
	</DialogContent>
</Dialog.Root>

<!-- Delete Confirmation Dialog -->
<Dialog.Root bind:open={showDeleteDialog}>
	<DialogContent>
		<DialogHeader>
			<DialogTitle>Delete Correlation Rule</DialogTitle>
		</DialogHeader>
		<p class="py-4 text-sm text-muted-foreground">
			Are you sure you want to delete the rule <strong>{deleteTarget?.name}</strong>? This action
			cannot be undone.
		</p>
		<DialogFooter>
			<Button
				variant="outline"
				onclick={() => {
					showDeleteDialog = false;
					deleteTarget = null;
				}}
			>
				Cancel
			</Button>
			<Button variant="destructive" onclick={handleDelete} disabled={deleting}>
				{deleting ? 'Deleting...' : 'Delete'}
			</Button>
		</DialogFooter>
	</DialogContent>
</Dialog.Root>
