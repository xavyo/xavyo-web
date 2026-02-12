<script lang="ts">
	import type {
		IdentityCorrelationRule,
		CorrelationMatchType,
		CorrelationAlgorithm,
		CreateIdentityCorrelationRuleRequest
	} from '$lib/api/types';
	import {
		createIdentityCorrelationRuleClient,
		updateIdentityCorrelationRuleClient,
		deleteIdentityCorrelationRuleClient
	} from '$lib/api/correlation-client';
	import Button from '$lib/components/ui/button/button.svelte';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import { Dialog } from 'bits-ui';
	import DialogContent from '$lib/components/ui/dialog/dialog-content.svelte';
	import DialogHeader from '$lib/components/ui/dialog/dialog-header.svelte';
	import DialogTitle from '$lib/components/ui/dialog/dialog-title.svelte';
	import DialogFooter from '$lib/components/ui/dialog/dialog-footer.svelte';
	import { Plus, Pencil, Trash2 } from 'lucide-svelte';

	interface Props {
		rules: IdentityCorrelationRule[];
		onRuleCreated?: () => void;
		onRuleUpdated?: () => void;
		onRuleDeleted?: () => void;
	}

	let { rules, onRuleCreated, onRuleUpdated, onRuleDeleted }: Props = $props();

	// Dialog state
	let showFormDialog = $state(false);
	let showDeleteDialog = $state(false);
	let editingRule = $state<IdentityCorrelationRule | null>(null);
	let deleteTarget = $state<IdentityCorrelationRule | null>(null);
	let processing = $state(false);

	// Form fields
	let formName = $state('');
	let formAttribute = $state('');
	let formMatchType = $state<CorrelationMatchType>('exact');
	let formAlgorithm = $state<CorrelationAlgorithm>('levenshtein');
	let formThreshold = $state(0.8);
	let formWeight = $state(1);
	let formPriority = $state(1);

	let isEditing = $derived(editingRule !== null);

	function matchTypeClass(matchType: string): string {
		switch (matchType) {
			case 'exact':
				return 'border-transparent bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
			case 'fuzzy':
				return 'border-transparent bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
			case 'expression':
				return 'border-transparent bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
			default:
				return '';
		}
	}

	function resetForm() {
		formName = '';
		formAttribute = '';
		formMatchType = 'exact';
		formAlgorithm = 'levenshtein';
		formThreshold = 0.8;
		formWeight = 1;
		formPriority = 1;
		editingRule = null;
	}

	function openCreateDialog() {
		resetForm();
		showFormDialog = true;
	}

	function openEditDialog(rule: IdentityCorrelationRule) {
		editingRule = rule;
		formName = rule.name;
		formAttribute = rule.attribute;
		formMatchType = rule.match_type;
		formAlgorithm = rule.algorithm ?? 'levenshtein';
		formThreshold = rule.threshold;
		formWeight = rule.weight;
		formPriority = rule.priority;
		showFormDialog = true;
	}

	function confirmDelete(rule: IdentityCorrelationRule) {
		deleteTarget = rule;
		showDeleteDialog = true;
	}

	async function handleSubmit() {
		processing = true;
		try {
			if (isEditing && editingRule) {
				await updateIdentityCorrelationRuleClient(editingRule.id, {
					name: formName,
					attribute: formAttribute,
					match_type: formMatchType,
					algorithm: formMatchType === 'fuzzy' ? formAlgorithm : null,
					threshold: formThreshold,
					weight: formWeight,
					priority: formPriority
				});
				showFormDialog = false;
				resetForm();
				onRuleUpdated?.();
			} else {
				const body: CreateIdentityCorrelationRuleRequest = {
					name: formName,
					attribute: formAttribute,
					match_type: formMatchType,
					threshold: formThreshold,
					weight: formWeight,
					priority: formPriority
				};
				if (formMatchType === 'fuzzy') {
					body.algorithm = formAlgorithm;
				}
				await createIdentityCorrelationRuleClient(body);
				showFormDialog = false;
				resetForm();
				onRuleCreated?.();
			}
		} finally {
			processing = false;
		}
	}

	async function handleDelete() {
		if (!deleteTarget) return;
		processing = true;
		try {
			await deleteIdentityCorrelationRuleClient(deleteTarget.id);
			showDeleteDialog = false;
			deleteTarget = null;
			onRuleDeleted?.();
		} finally {
			processing = false;
		}
	}
</script>

<div class="space-y-4">
	<div class="flex items-center justify-between">
		<p class="text-sm text-muted-foreground">
			{rules.length} identity correlation {rules.length === 1 ? 'rule' : 'rules'}
		</p>
		<Button size="sm" onclick={openCreateDialog}>
			<Plus class="mr-1.5 h-4 w-4" />
			Add Rule
		</Button>
	</div>

	{#if rules.length === 0}
		<p class="py-8 text-center text-sm text-muted-foreground">
			No identity correlation rules configured.
		</p>
	{:else}
		<div class="overflow-x-auto">
			<table class="w-full text-sm">
				<thead>
					<tr class="border-b border-border text-left">
						<th class="px-3 py-2 font-medium text-muted-foreground">Name</th>
						<th class="px-3 py-2 font-medium text-muted-foreground">Attribute</th>
						<th class="px-3 py-2 font-medium text-muted-foreground">Match Type</th>
						<th class="px-3 py-2 font-medium text-muted-foreground">Algorithm</th>
						<th class="px-3 py-2 font-medium text-muted-foreground">Threshold</th>
						<th class="px-3 py-2 font-medium text-muted-foreground">Weight</th>
						<th class="px-3 py-2 font-medium text-muted-foreground">Active</th>
						<th class="px-3 py-2 font-medium text-muted-foreground">Priority</th>
						<th class="px-3 py-2 font-medium text-muted-foreground">Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each rules as rule}
						<tr class="border-b border-border">
							<td class="px-3 py-2 font-medium text-foreground">{rule.name}</td>
							<td class="px-3 py-2 text-muted-foreground">{rule.attribute}</td>
							<td class="px-3 py-2">
								<Badge class={matchTypeClass(rule.match_type)}>{rule.match_type}</Badge>
							</td>
							<td class="px-3 py-2 text-muted-foreground">
								{rule.algorithm ?? '--'}
							</td>
							<td class="px-3 py-2 text-foreground">
								{Math.round(rule.threshold * 100)}%
							</td>
							<td class="px-3 py-2 text-foreground">{rule.weight}</td>
							<td class="px-3 py-2">
								{#if rule.is_active}
									<Badge class="border-transparent bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
										Active
									</Badge>
								{:else}
									<Badge class="border-transparent bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400">
										Inactive
									</Badge>
								{/if}
							</td>
							<td class="px-3 py-2 text-foreground">{rule.priority}</td>
							<td class="px-3 py-2">
								<div class="flex items-center gap-1">
									<Button variant="ghost" size="icon" onclick={() => openEditDialog(rule)}>
										<Pencil class="h-4 w-4" />
									</Button>
									<Button variant="ghost" size="icon" onclick={() => confirmDelete(rule)}>
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

<!-- Create / Edit Rule Dialog -->
<Dialog.Root bind:open={showFormDialog}>
	<DialogContent class="max-w-md">
		<DialogHeader>
			<DialogTitle>{isEditing ? 'Edit Rule' : 'Add Rule'}</DialogTitle>
		</DialogHeader>
		<div class="space-y-4 py-4">
			<div>
				<label for="rule-name" class="mb-1 block text-sm font-medium text-foreground">
					Name <span class="text-destructive">*</span>
				</label>
				<input
					id="rule-name"
					type="text"
					bind:value={formName}
					class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
					placeholder="e.g., Email Match"
				/>
			</div>

			<div>
				<label for="rule-attribute" class="mb-1 block text-sm font-medium text-foreground">
					Attribute <span class="text-destructive">*</span>
				</label>
				<input
					id="rule-attribute"
					type="text"
					bind:value={formAttribute}
					class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
					placeholder="e.g., email"
				/>
			</div>

			<div>
				<label for="rule-match-type" class="mb-1 block text-sm font-medium text-foreground">
					Match Type
				</label>
				<select
					id="rule-match-type"
					bind:value={formMatchType}
					class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
				>
					<option value="exact">Exact</option>
					<option value="fuzzy">Fuzzy</option>
					<option value="expression">Expression</option>
				</select>
			</div>

			{#if formMatchType === 'fuzzy'}
				<div>
					<label for="rule-algorithm" class="mb-1 block text-sm font-medium text-foreground">
						Algorithm
					</label>
					<select
						id="rule-algorithm"
						bind:value={formAlgorithm}
						class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
					>
						<option value="levenshtein">Levenshtein</option>
						<option value="jaro_winkler">Jaro-Winkler</option>
					</select>
				</div>
			{/if}

			<div class="grid grid-cols-3 gap-3">
				<div>
					<label for="rule-threshold" class="mb-1 block text-sm font-medium text-foreground">
						Threshold
					</label>
					<input
						id="rule-threshold"
						type="number"
						bind:value={formThreshold}
						min="0"
						max="1"
						step="0.01"
						class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
					/>
				</div>
				<div>
					<label for="rule-weight" class="mb-1 block text-sm font-medium text-foreground">
						Weight
					</label>
					<input
						id="rule-weight"
						type="number"
						bind:value={formWeight}
						min="0"
						step="0.1"
						class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
					/>
				</div>
				<div>
					<label for="rule-priority" class="mb-1 block text-sm font-medium text-foreground">
						Priority
					</label>
					<input
						id="rule-priority"
						type="number"
						bind:value={formPriority}
						min="1"
						step="1"
						class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
					/>
				</div>
			</div>
		</div>
		<DialogFooter>
			<Button
				variant="outline"
				onclick={() => {
					showFormDialog = false;
					resetForm();
				}}
			>
				Cancel
			</Button>
			<Button onclick={handleSubmit} disabled={processing || !formName.trim() || !formAttribute.trim()}>
				{processing ? 'Saving...' : isEditing ? 'Update Rule' : 'Create Rule'}
			</Button>
		</DialogFooter>
	</DialogContent>
</Dialog.Root>

<!-- Delete Confirmation Dialog -->
<Dialog.Root bind:open={showDeleteDialog}>
	<DialogContent>
		<DialogHeader>
			<DialogTitle>Delete Rule</DialogTitle>
		</DialogHeader>
		<p class="py-4 text-sm text-muted-foreground">
			Are you sure you want to delete the rule "{deleteTarget?.name}"? This action cannot be undone.
		</p>
		<DialogFooter>
			<Button variant="outline" onclick={() => (showDeleteDialog = false)}>Cancel</Button>
			<Button variant="destructive" onclick={handleDelete} disabled={processing}>
				{processing ? 'Deleting...' : 'Delete'}
			</Button>
		</DialogFooter>
	</DialogContent>
</Dialog.Root>
