<script lang="ts">
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import MergePreviewCard from '$lib/components/dedup/merge-preview.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let audit = $derived(data.audit);

	// Backend returns attribute_decisions as an object { field: { source: 'source'|'target' } }
	// Normalize to array for display
	let attributeDecisionsList = $derived(
		Array.isArray(audit.attribute_decisions)
			? audit.attribute_decisions
			: Object.entries(audit.attribute_decisions ?? {}).map(([attr, val]: [string, any]) => ({
					attribute: attr,
					source: val.source ?? 'unknown',
					selected_value: val.source === 'source'
						? (audit.source_snapshot as any)?.[attr] ?? null
						: (audit.target_snapshot as any)?.[attr] ?? null,
					source_value: (audit.source_snapshot as any)?.[attr] ?? null,
					target_value: (audit.target_snapshot as any)?.[attr] ?? null
				}))
	);

	// Backend returns entitlement_decisions as { strategy, added_count, removed_count }
	// Normalize for display
	let entitlementDecisions = $derived({
		strategy: audit.entitlement_decisions?.strategy ?? 'union',
		source_entitlements: audit.entitlement_decisions?.source_entitlements ?? [],
		target_entitlements: audit.entitlement_decisions?.target_entitlements ?? [],
		merged_entitlements: audit.entitlement_decisions?.merged_entitlements ?? [],
		excluded_entitlements: audit.entitlement_decisions?.excluded_entitlements ?? [],
		added_count: audit.entitlement_decisions?.added_count ?? 0,
		removed_count: audit.entitlement_decisions?.removed_count ?? 0
	});
</script>

<PageHeader title="Merge Audit Detail" description="Complete record of a merge operation">
	<a href="/governance/dedup" class="text-sm text-muted-foreground hover:text-foreground">&larr; Back to hub</a>
</PageHeader>

<div class="space-y-6">
	<!-- Operation Info -->
	<div class="rounded-lg border border-border bg-card p-4">
		<dl class="grid gap-4 md:grid-cols-3">
			<div>
				<dt class="text-sm text-muted-foreground">Operation ID</dt>
				<dd class="font-mono text-sm text-foreground">{audit.operation_id}</dd>
			</div>
			<div>
				<dt class="text-sm text-muted-foreground">Performed At</dt>
				<dd class="text-sm text-foreground">{new Date(audit.created_at).toLocaleString()}</dd>
			</div>
			<div>
				<dt class="text-sm text-muted-foreground">Entitlement Strategy</dt>
				<dd class="text-sm font-medium text-foreground">{entitlementDecisions.strategy}</dd>
			</div>
		</dl>
	</div>

	<!-- Snapshots -->
	<div class="grid gap-4 md:grid-cols-3">
		<MergePreviewCard identity={audit.source_snapshot} title="Source (before merge)" />
		<MergePreviewCard identity={audit.target_snapshot} title="Target (before merge)" />
		<MergePreviewCard identity={audit.merged_snapshot} title="Merged Result" />
	</div>

	<!-- Attribute Decisions -->
	{#if attributeDecisionsList.length > 0}
		<div class="rounded-lg border border-border p-4">
			<h3 class="mb-3 text-sm font-semibold text-foreground">Attribute Decisions</h3>
			<table class="w-full text-sm">
				<thead>
					<tr class="border-b border-border">
						<th class="py-2 pr-4 text-left font-medium text-muted-foreground">Attribute</th>
						<th class="py-2 pr-4 text-left font-medium text-muted-foreground">Source Value</th>
						<th class="py-2 pr-4 text-left font-medium text-muted-foreground">Target Value</th>
						<th class="py-2 pr-4 text-left font-medium text-muted-foreground">Selected</th>
						<th class="py-2 text-left font-medium text-muted-foreground">Result</th>
					</tr>
				</thead>
				<tbody>
					{#each attributeDecisionsList as decision}
						<tr class="border-b border-border/50">
							<td class="py-2 pr-4 font-medium text-foreground">{decision.attribute}</td>
							<td class="py-2 pr-4 text-foreground {decision.source === 'source' ? 'font-medium' : 'text-muted-foreground'}">{String(decision.source_value ?? '—')}</td>
							<td class="py-2 pr-4 text-foreground {decision.source === 'target' ? 'font-medium' : 'text-muted-foreground'}">{String(decision.target_value ?? '—')}</td>
							<td class="py-2 pr-4">
								<span class="rounded bg-muted px-2 py-0.5 text-xs font-medium text-foreground">{decision.source}</span>
							</td>
							<td class="py-2 font-medium text-foreground">{String(decision.selected_value ?? '—')}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}

	<!-- Entitlement Decisions -->
	<div class="rounded-lg border border-border p-4">
		<h3 class="mb-3 text-sm font-semibold text-foreground">Entitlement Decisions</h3>
		<div class="mb-3 flex gap-4 text-sm">
			<span class="text-muted-foreground">Strategy: <span class="font-medium text-foreground">{entitlementDecisions.strategy}</span></span>
			<span class="text-muted-foreground">Added: <span class="font-medium text-foreground">{entitlementDecisions.added_count}</span></span>
			<span class="text-muted-foreground">Removed: <span class="font-medium text-foreground">{entitlementDecisions.removed_count}</span></span>
		</div>
		{#if entitlementDecisions.source_entitlements.length > 0 || entitlementDecisions.target_entitlements.length > 0 || entitlementDecisions.merged_entitlements.length > 0 || entitlementDecisions.excluded_entitlements.length > 0}
			<div class="grid gap-4 md:grid-cols-2">
				<div>
					<h4 class="mb-2 text-xs font-medium text-muted-foreground">Source Entitlements ({entitlementDecisions.source_entitlements.length})</h4>
					{#if entitlementDecisions.source_entitlements.length === 0}
						<p class="text-xs text-muted-foreground">None</p>
					{:else}
						{#each entitlementDecisions.source_entitlements as e}
							<p class="text-sm text-foreground">{e.name} {e.application ? `(${e.application})` : ''}</p>
						{/each}
					{/if}
				</div>
				<div>
					<h4 class="mb-2 text-xs font-medium text-muted-foreground">Target Entitlements ({entitlementDecisions.target_entitlements.length})</h4>
					{#if entitlementDecisions.target_entitlements.length === 0}
						<p class="text-xs text-muted-foreground">None</p>
					{:else}
						{#each entitlementDecisions.target_entitlements as e}
							<p class="text-sm text-foreground">{e.name} {e.application ? `(${e.application})` : ''}</p>
						{/each}
					{/if}
				</div>
				<div>
					<h4 class="mb-2 text-xs font-medium text-muted-foreground">Merged Entitlements ({entitlementDecisions.merged_entitlements.length})</h4>
					{#if entitlementDecisions.merged_entitlements.length === 0}
						<p class="text-xs text-muted-foreground">None</p>
					{:else}
						{#each entitlementDecisions.merged_entitlements as e}
							<p class="text-sm text-foreground">{e.name} {e.application ? `(${e.application})` : ''}</p>
						{/each}
					{/if}
				</div>
				<div>
					<h4 class="mb-2 text-xs font-medium text-muted-foreground">Excluded Entitlements ({entitlementDecisions.excluded_entitlements.length})</h4>
					{#if entitlementDecisions.excluded_entitlements.length === 0}
						<p class="text-xs text-muted-foreground">None</p>
					{:else}
						{#each entitlementDecisions.excluded_entitlements as e}
							<p class="text-sm text-foreground">{e.name} {e.application ? `(${e.application})` : ''}</p>
						{/each}
					{/if}
				</div>
			</div>
		{:else}
			<p class="text-xs text-muted-foreground">No entitlements involved in this merge</p>
		{/if}
	</div>

	<!-- SoD Violations -->
	{#if audit.sod_violations && audit.sod_violations.length > 0}
		<div class="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
			<h3 class="mb-3 text-sm font-semibold text-red-700 dark:text-red-400">SoD Violations (Overridden)</h3>
			{#each audit.sod_violations as violation}
				<div class="mb-2 flex items-center justify-between rounded border border-red-200 bg-white p-3 dark:border-red-800 dark:bg-background">
					<p class="text-sm text-foreground">{violation.rule_name}</p>
					<span class="text-xs text-muted-foreground">{violation.severity}</span>
				</div>
			{/each}
		</div>
	{/if}
</div>
