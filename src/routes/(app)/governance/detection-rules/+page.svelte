<script lang="ts">
	import { invalidateAll, goto } from '$app/navigation';
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import { EmptyState } from '$lib/components/ui/empty-state';
	import RuleTypeBadge from '$lib/components/detection-rules/rule-type-badge.svelte';
	import { addToast } from '$lib/stores/toast.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let typeFilter = $state(data.filters.rule_type ?? '');
	let enabledFilter = $state(data.filters.is_enabled !== undefined ? String(data.filters.is_enabled) : '');
	let deleteOpen = $state(false);
	let deleteRuleId = $state('');
	let deleteRuleName = $state('');

	function applyFilters() {
		const params = new URLSearchParams();
		if (typeFilter) params.set('rule_type', typeFilter);
		if (enabledFilter) params.set('is_enabled', enabledFilter);
		const qs = params.toString();
		goto(`/governance/detection-rules${qs ? `?${qs}` : ''}`, { replaceState: true });
	}

	function openDeleteDialog(id: string, name: string) {
		deleteRuleId = id;
		deleteRuleName = name;
		deleteOpen = true;
	}

	function handleResult(result: any) {
		if (result.type === 'success' && result.data?.success) {
			addToast('success', `Rule ${result.data.action} successfully`);
			invalidateAll();
		} else if (result.type === 'failure') {
			addToast('error', result.data?.error ?? 'Action failed');
		}
	}
</script>

<PageHeader title="Detection Rules" description="Manage orphan account detection rules">
	<div class="flex gap-2">
		<form method="POST" action="?/seed" use:enhance={() => ({ result }) => handleResult(result)}>
			<Button variant="outline" type="submit">Seed Defaults</Button>
		</form>
		<a href="/governance/detection-rules/create">
			<Button>Create Rule</Button>
		</a>
	</div>
</PageHeader>

<!-- Filters -->
<div class="mb-4 flex flex-wrap items-center gap-3">
	<select
		class="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
		bind:value={typeFilter}
		onchange={applyFilters}
	>
		<option value="">All Types</option>
		<option value="no_manager">No Manager</option>
		<option value="terminated">Terminated</option>
		<option value="inactive">Inactive</option>
		<option value="custom">Custom</option>
	</select>

	<select
		class="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
		bind:value={enabledFilter}
		onchange={applyFilters}
	>
		<option value="">All Status</option>
		<option value="true">Enabled</option>
		<option value="false">Disabled</option>
	</select>
</div>

{#if data.rules.items.length === 0}
	<EmptyState
		title="No detection rules"
		description="No detection rules match the current filters. Click 'Seed Defaults' to create default rules."
	/>
{:else}
	<div class="overflow-x-auto rounded-lg border border-border">
		<table class="w-full text-sm">
			<thead class="border-b border-border bg-muted/50">
				<tr>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Type</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Priority</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
					<th class="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
				</tr>
			</thead>
			<tbody>
				{#each data.rules.items as rule}
					<tr class="border-b border-border hover:bg-muted/30">
						<td class="px-4 py-3">
							<a href="/governance/detection-rules/{rule.id}" class="font-medium text-primary hover:underline">
								{rule.name}
							</a>
							{#if rule.description}
								<p class="text-xs text-muted-foreground">{rule.description}</p>
							{/if}
						</td>
						<td class="px-4 py-3"><RuleTypeBadge ruleType={rule.rule_type} /></td>
						<td class="px-4 py-3 text-foreground">{rule.priority}</td>
						<td class="px-4 py-3">
							<span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {rule.is_enabled ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'}">
								{rule.is_enabled ? 'Enabled' : 'Disabled'}
							</span>
						</td>
						<td class="px-4 py-3 text-right">
							<div class="flex items-center justify-end gap-1">
								{#if rule.is_enabled}
									<form method="POST" action="?/disable" use:enhance={() => ({ result }) => handleResult(result)}>
										<input type="hidden" name="id" value={rule.id} />
										<Button variant="outline" size="sm" type="submit">Disable</Button>
									</form>
								{:else}
									<form method="POST" action="?/enable" use:enhance={() => ({ result }) => handleResult(result)}>
										<input type="hidden" name="id" value={rule.id} />
										<Button variant="outline" size="sm" type="submit">Enable</Button>
									</form>
								{/if}
								<Button variant="destructive" size="sm" onclick={() => openDeleteDialog(rule.id, rule.name)}>Delete</Button>
							</div>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}

<!-- Delete Dialog -->
<Dialog.Root bind:open={deleteOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Delete Detection Rule</Dialog.Title>
			<Dialog.Description>Delete "{deleteRuleName}"? This cannot be undone.</Dialog.Description>
		</Dialog.Header>
		<form method="POST" action="?/delete" use:enhance={() => {
			deleteOpen = false;
			return ({ result }) => handleResult(result);
		}}>
			<input type="hidden" name="id" value={deleteRuleId} />
			<Dialog.Footer>
				<Button variant="outline" type="button" onclick={() => (deleteOpen = false)}>Cancel</Button>
				<Button variant="destructive" type="submit">Delete</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
