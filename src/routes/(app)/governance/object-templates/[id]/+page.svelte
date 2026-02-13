<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { Dialog } from 'bits-ui';
	import DialogContent from '$lib/components/ui/dialog/dialog-content.svelte';
	import DialogHeader from '$lib/components/ui/dialog/dialog-header.svelte';
	import DialogTitle from '$lib/components/ui/dialog/dialog-title.svelte';
	import DialogFooter from '$lib/components/ui/dialog/dialog-footer.svelte';
	import { Button } from '$lib/components/ui/button';
	import type { PageData } from './$types';
	import type { TemplateSimulationResult } from '$lib/api/types';
	import TemplateStatusBadge from '$lib/components/object-templates/template-status-badge.svelte';
	import ActionTypeBadge from '$lib/components/object-templates/action-type-badge.svelte';
	import ScopeBadge from '$lib/components/object-templates/scope-badge.svelte';
	import MergePolicySelect from '$lib/components/object-templates/merge-policy-select.svelte';
	import SimulationPanel from '$lib/components/object-templates/simulation-panel.svelte';
	import RuleEditor from '$lib/components/object-templates/rule-editor.svelte';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import { addToast } from '$lib/stores/toast.svelte';
	import {
		deleteObjectTemplateClient,
		activateObjectTemplateClient,
		disableObjectTemplateClient,
		createTemplateRuleClient,
		updateTemplateRuleClient,
		deleteTemplateRuleClient,
		createTemplateScopeClient,
		deleteTemplateScopeClient,
		createMergePolicyClient,
		deleteMergePolicyClient,
		simulateTemplateClient
	} from '$lib/api/object-templates-client';

	let { data }: { data: PageData } = $props();

	let template = $derived(data.template);

	let activeTab = $state('details');
	let showAddRule = $state(false);
	let editingRuleId = $state<string | null>(null);
	let showAddScope = $state(false);
	let scopeType = $state<'global' | 'organization' | 'category' | 'condition'>('global');
	let scopeValue = $state('');
	let scopeCondition = $state('');
	let simResult = $state<TemplateSimulationResult | null>(null);
	let simLoading = $state(false);
	let simError = $state<string | null>(null);

	// Confirm dialog state
	let confirmOpen = $state(false);
	let confirmTitle = $state('');
	let confirmMessage = $state('');
	let confirmAction = $state<(() => Promise<void>) | null>(null);

	function openConfirm(title: string, message: string, action: () => Promise<void>) {
		confirmTitle = title;
		confirmMessage = message;
		confirmAction = action;
		confirmOpen = true;
	}

	async function executeConfirm() {
		if (confirmAction) {
			await confirmAction();
		}
		confirmOpen = false;
		confirmAction = null;
	}

	const objectTypeLabels: Record<string, string> = {
		user: 'User',
		role: 'Role',
		entitlement: 'Entitlement',
		application: 'Application'
	};

	function handleDelete() {
		openConfirm(
			'Delete Template',
			'Are you sure you want to delete this template? This will also delete all its rules and scopes.',
			async () => {
				try {
					await deleteObjectTemplateClient(template.id);
					addToast('success', 'Template deleted');
					goto('/governance/object-templates');
				} catch (e) {
					addToast('error', e instanceof Error ? e.message : 'Failed to delete template');
				}
			}
		);
	}

	async function handleActivate() {
		try {
			await activateObjectTemplateClient(template.id);
			addToast('success', 'Template activated');
			await invalidateAll();
		} catch (e) {
			addToast('error', e instanceof Error ? e.message : 'Failed to activate template');
		}
	}

	async function handleDisable() {
		try {
			await disableObjectTemplateClient(template.id);
			addToast('success', 'Template disabled');
			await invalidateAll();
		} catch (e) {
			addToast('error', e instanceof Error ? e.message : 'Failed to disable template');
		}
	}

	interface RuleData {
		rule_type: 'default' | 'computed' | 'validation' | 'normalization';
		target_attribute: string;
		expression: string;
		strength: 'strong' | 'normal' | 'weak';
		priority: number;
		condition?: string;
		error_message?: string;
		authoritative: boolean;
		exclusive: boolean;
	}

	async function handleAddRule(ruleData: RuleData) {
		try {
			await createTemplateRuleClient(template.id, ruleData as unknown as Record<string, unknown>);
			showAddRule = false;
			addToast('success', 'Rule added');
			await invalidateAll();
		} catch (e) {
			addToast('error', e instanceof Error ? e.message : 'Failed to add rule');
		}
	}

	async function handleUpdateRule(ruleId: string, ruleData: RuleData) {
		try {
			await updateTemplateRuleClient(template.id, ruleId, ruleData as unknown as Record<string, unknown>);
			editingRuleId = null;
			addToast('success', 'Rule updated');
			await invalidateAll();
		} catch (e) {
			addToast('error', e instanceof Error ? e.message : 'Failed to update rule');
		}
	}

	function handleDeleteRule(ruleId: string) {
		openConfirm('Delete Rule', 'Are you sure you want to delete this rule?', async () => {
			try {
				await deleteTemplateRuleClient(template.id, ruleId);
				addToast('success', 'Rule deleted');
				await invalidateAll();
			} catch (e) {
				addToast('error', e instanceof Error ? e.message : 'Failed to delete rule');
			}
		});
	}

	async function handleAddScope() {
		const body: Record<string, unknown> = { scope_type: scopeType };
		if (scopeType !== 'global' && scopeValue.trim()) {
			body.scope_value = scopeValue.trim();
		}
		if (scopeCondition.trim()) {
			body.condition = scopeCondition.trim();
		}
		try {
			await createTemplateScopeClient(template.id, body);
			showAddScope = false;
			scopeValue = '';
			scopeCondition = '';
			addToast('success', 'Scope added');
			await invalidateAll();
		} catch (e) {
			addToast('error', e instanceof Error ? e.message : 'Failed to add scope');
		}
	}

	function handleDeleteScope(scopeId: string) {
		openConfirm('Delete Scope', 'Are you sure you want to delete this scope?', async () => {
			try {
				await deleteTemplateScopeClient(template.id, scopeId);
				addToast('success', 'Scope deleted');
				await invalidateAll();
			} catch (e) {
				addToast('error', e instanceof Error ? e.message : 'Failed to delete scope');
			}
		});
	}

	async function handleAddMergePolicy(body: { attribute: string; strategy: string; null_handling: string }) {
		try {
			await createMergePolicyClient(template.id, body as unknown as Record<string, unknown>);
			addToast('success', 'Merge policy added');
			await invalidateAll();
		} catch (e) {
			addToast('error', e instanceof Error ? e.message : 'Failed to add merge policy');
		}
	}

	function handleDeleteMergePolicy(policyId: string) {
		openConfirm('Delete Merge Policy', 'Are you sure you want to delete this merge policy?', async () => {
			try {
				await deleteMergePolicyClient(template.id, policyId);
				addToast('success', 'Merge policy deleted');
				await invalidateAll();
			} catch (e) {
				addToast('error', e instanceof Error ? e.message : 'Failed to delete merge policy');
			}
		});
	}

	async function handleSimulate(sampleDataStr: string) {
		simLoading = true;
		simError = null;
		simResult = null;
		try {
			const sampleData = JSON.parse(sampleDataStr) as Record<string, unknown>;
			simResult = await simulateTemplateClient(template.id, sampleData);
		} catch (e) {
			simError = e instanceof Error ? e.message : 'Simulation failed';
		} finally {
			simLoading = false;
		}
	}

	const strengthLabels: Record<string, string> = {
		strong: 'Strong',
		normal: 'Normal',
		weak: 'Weak'
	};
</script>

<div class="flex items-start justify-between">
	<PageHeader title={template.name} description={template.description || 'No description'} />
	<div class="flex gap-2">
		{#if template.status === 'draft'}
			<button
				onclick={handleActivate}
				class="rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
			>
				Activate
			</button>
		{:else if template.status === 'active'}
			<button
				onclick={handleDisable}
				class="rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
			>
				Disable
			</button>
		{/if}
		<a
			href="/governance/object-templates/{template.id}/edit"
			class="rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
		>
			Edit
		</a>
		<button
			onclick={handleDelete}
			class="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
		>
			Delete
		</button>
	</div>
</div>

<!-- Tabs -->
<div class="mt-4 border-b border-zinc-200 dark:border-zinc-700">
	<nav class="-mb-px flex gap-4" role="tablist">
		{#each [
			{ id: 'details', label: 'Details' },
			{ id: 'rules', label: `Rules (${template.rules.length})` },
			{ id: 'scopes', label: `Scopes (${template.scopes.length})` },
			{ id: 'merge-policies', label: `Merge Policies (${template.merge_policies.length})` },
			{ id: 'simulation', label: 'Simulation' }
		] as tab}
			<button
				role="tab"
				aria-selected={activeTab === tab.id}
				onclick={() => activeTab = tab.id}
				class="border-b-2 px-1 py-3 text-sm font-medium transition-colors {activeTab === tab.id
					? 'border-blue-500 text-blue-600 dark:text-blue-400'
					: 'border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300'}"
			>
				{tab.label}
			</button>
		{/each}
	</nav>
</div>

<div class="mt-6">
	<!-- Details Tab -->
	{#if activeTab === 'details'}
		<div class="grid gap-4 md:grid-cols-2">
			<div class="rounded-md border border-zinc-200 p-4 dark:border-zinc-700">
				<h3 class="mb-3 text-sm font-medium text-zinc-500 dark:text-zinc-400">Template Info</h3>
				<dl class="space-y-2 text-sm">
					<div class="flex justify-between">
						<dt class="text-zinc-500 dark:text-zinc-400">Object Type</dt>
						<dd>{objectTypeLabels[template.object_type] ?? template.object_type}</dd>
					</div>
					<div class="flex justify-between">
						<dt class="text-zinc-500 dark:text-zinc-400">Priority</dt>
						<dd>{template.priority}</dd>
					</div>
					<div class="flex justify-between">
						<dt class="text-zinc-500 dark:text-zinc-400">Status</dt>
						<dd><TemplateStatusBadge status={template.status} /></dd>
					</div>
					<div class="flex justify-between">
						<dt class="text-zinc-500 dark:text-zinc-400">Version</dt>
						<dd>{template.current_version ?? 'N/A'}</dd>
					</div>
				</dl>
			</div>
			<div class="rounded-md border border-zinc-200 p-4 dark:border-zinc-700">
				<h3 class="mb-3 text-sm font-medium text-zinc-500 dark:text-zinc-400">Metadata</h3>
				<dl class="space-y-2 text-sm">
					<div class="flex justify-between">
						<dt class="text-zinc-500 dark:text-zinc-400">Rules</dt>
						<dd>{template.rules.length}</dd>
					</div>
					<div class="flex justify-between">
						<dt class="text-zinc-500 dark:text-zinc-400">Scopes</dt>
						<dd>{template.scopes.length}</dd>
					</div>
					<div class="flex justify-between">
						<dt class="text-zinc-500 dark:text-zinc-400">Merge Policies</dt>
						<dd>{template.merge_policies.length}</dd>
					</div>
					<div class="flex justify-between">
						<dt class="text-zinc-500 dark:text-zinc-400">Created</dt>
						<dd>{new Date(template.created_at).toLocaleDateString()}</dd>
					</div>
					<div class="flex justify-between">
						<dt class="text-zinc-500 dark:text-zinc-400">Updated</dt>
						<dd>{new Date(template.updated_at).toLocaleDateString()}</dd>
					</div>
				</dl>
			</div>
		</div>

	<!-- Rules Tab -->
	{:else if activeTab === 'rules'}
		<div class="space-y-4">
			<button
				onclick={() => showAddRule = !showAddRule}
				class="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
			>
				{showAddRule ? 'Cancel' : 'Add Rule'}
			</button>

			{#if showAddRule}
				<RuleEditor onsubmit={handleAddRule} oncancel={() => showAddRule = false} />
			{/if}

			{#if template.rules.length === 0}
				<p class="py-4 text-sm text-zinc-500 dark:text-zinc-400">No rules defined. Add a rule to get started.</p>
			{:else}
				<div class="space-y-3">
					{#each template.rules.toSorted((a, b) => a.priority - b.priority) as rule}
						{#if editingRuleId === rule.id}
							<RuleEditor
								ruleType={rule.rule_type}
								targetAttribute={rule.target_attribute}
								expression={rule.expression}
								strength={rule.strength}
								priority={rule.priority}
								condition={rule.condition ?? ''}
								errorMessage={rule.error_message ?? ''}
								authoritative={rule.authoritative}
								exclusive={rule.exclusive}
								submitLabel="Update Rule"
								onsubmit={(ruleData) => handleUpdateRule(rule.id, ruleData)}
								oncancel={() => editingRuleId = null}
							/>
						{:else}
							<div class="flex items-center justify-between rounded-md border border-zinc-200 p-3 dark:border-zinc-700">
								<div class="flex flex-wrap items-center gap-3">
									<span class="text-xs font-medium text-zinc-400">P{rule.priority}</span>
									<ActionTypeBadge ruleType={rule.rule_type} />
									<span class="font-medium text-sm">{rule.target_attribute}</span>
									<span class="max-w-xs truncate text-xs font-mono text-zinc-500">{rule.expression}</span>
									<span class="text-xs text-zinc-400">{strengthLabels[rule.strength] ?? rule.strength}</span>
									{#if rule.authoritative}
										<span class="rounded bg-green-100 px-1.5 py-0.5 text-xs text-green-700 dark:bg-green-900/30 dark:text-green-400">Auth</span>
									{/if}
									{#if rule.exclusive}
										<span class="rounded bg-red-100 px-1.5 py-0.5 text-xs text-red-700 dark:bg-red-900/30 dark:text-red-400">Excl</span>
									{/if}
								</div>
								<div class="flex gap-2">
									<button
										onclick={() => editingRuleId = rule.id}
										class="text-sm text-blue-600 hover:underline dark:text-blue-400"
									>
										Edit
									</button>
									<button
										onclick={() => handleDeleteRule(rule.id)}
										class="text-sm text-red-600 hover:underline dark:text-red-400"
									>
										Delete
									</button>
								</div>
							</div>
						{/if}
					{/each}
				</div>
			{/if}
		</div>

	<!-- Scopes Tab -->
	{:else if activeTab === 'scopes'}
		<div class="space-y-4">
			<button
				onclick={() => showAddScope = !showAddScope}
				class="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
			>
				{showAddScope ? 'Cancel' : 'Add Scope'}
			</button>

			{#if showAddScope}
				<div class="space-y-3 rounded-md border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900">
					<div class="grid gap-3 md:grid-cols-3">
						<div>
							<label for="scope-type" class="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Scope Type</label>
							<select
								id="scope-type"
								bind:value={scopeType}
								class="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
							>
								<option value="global">Global</option>
								<option value="organization">Organization</option>
								<option value="category">Category</option>
								<option value="condition">Condition</option>
							</select>
						</div>
						{#if scopeType !== 'global'}
							<div>
								<label for="scope-value" class="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Scope Value</label>
								<input
									id="scope-value"
									type="text"
									bind:value={scopeValue}
									placeholder="e.g., Engineering"
									class="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
								/>
							</div>
						{/if}
						{#if scopeType === 'condition'}
							<div>
								<label for="scope-condition" class="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Condition</label>
								<input
									id="scope-condition"
									type="text"
									bind:value={scopeCondition}
									placeholder="e.g., user.type == 'employee'"
									class="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
								/>
							</div>
						{/if}
					</div>
					<div class="flex gap-2">
						<button
							onclick={handleAddScope}
							class="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
						>
							Add Scope
						</button>
						<button
							onclick={() => showAddScope = false}
							class="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300"
						>
							Cancel
						</button>
					</div>
				</div>
			{/if}

			{#if template.scopes.length === 0}
				<p class="py-4 text-sm text-zinc-500 dark:text-zinc-400">No scopes defined. Add a scope to target specific objects.</p>
			{:else}
				<div class="space-y-2">
					{#each template.scopes as scope}
						<div class="flex items-center justify-between rounded-md border border-zinc-200 p-3 dark:border-zinc-700">
							<div class="flex items-center gap-3">
								<ScopeBadge scopeType={scope.scope_type} scopeValue={scope.scope_value} />
								{#if scope.condition}
									<span class="text-xs text-zinc-500 dark:text-zinc-400">if: {scope.condition}</span>
								{/if}
							</div>
							<button
								onclick={() => handleDeleteScope(scope.id)}
								class="text-sm text-red-600 hover:underline dark:text-red-400"
							>
								Delete
							</button>
						</div>
					{/each}
				</div>
			{/if}
		</div>

	<!-- Merge Policies Tab -->
	{:else if activeTab === 'merge-policies'}
		<MergePolicySelect
			policies={template.merge_policies}
			onAdd={handleAddMergePolicy}
			onDelete={handleDeleteMergePolicy}
		/>

	<!-- Simulation Tab -->
	{:else if activeTab === 'simulation'}
		<div class="space-y-6">
			<h3 class="text-sm font-medium text-zinc-700 dark:text-zinc-300">Template Simulation</h3>
			<SimulationPanel
				result={simResult}
				loading={simLoading}
				error={simError}
				onsubmit={handleSimulate}
			/>
		</div>
	{/if}
</div>

<!-- Confirm Dialog -->
<Dialog.Root bind:open={confirmOpen}>
	<DialogContent>
		<DialogHeader>
			<DialogTitle>{confirmTitle}</DialogTitle>
		</DialogHeader>
		<div class="py-4">
			<p class="text-sm text-muted-foreground">{confirmMessage}</p>
		</div>
		<DialogFooter>
			<Button variant="outline" onclick={() => (confirmOpen = false)}>Cancel</Button>
			<Button variant="destructive" onclick={executeConfirm}>Confirm</Button>
		</DialogFooter>
	</DialogContent>
</Dialog.Root>
