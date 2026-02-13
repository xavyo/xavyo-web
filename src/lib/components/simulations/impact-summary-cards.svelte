<script lang="ts">
	import type { PolicyImpactSummary, BatchImpactSummary } from '$lib/api/types';

	let { summary, type = 'policy' }: { summary: PolicyImpactSummary | BatchImpactSummary | null; type?: 'policy' | 'batch' } = $props();
</script>

{#if summary}
	<div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
		{#if type === 'policy'}
			{@const s = summary as PolicyImpactSummary}
			<div class="rounded-lg border border-border bg-card p-4">
				<p class="text-sm text-muted-foreground">Total Analyzed</p>
				<p class="text-2xl font-bold">{s.total_users_analyzed}</p>
			</div>
			<div class="rounded-lg border border-border bg-card p-4">
				<p class="text-sm text-muted-foreground">Affected Users</p>
				<p class="text-2xl font-bold">{s.affected_users}</p>
			</div>
			<div class="rounded-lg border border-border bg-card p-4">
				<p class="text-sm text-muted-foreground">By Severity</p>
				<div class="mt-1 space-y-1 text-sm">
					{#if s.by_severity.critical > 0}<p class="text-red-600 dark:text-red-400">Critical: {s.by_severity.critical}</p>{/if}
					{#if s.by_severity.high > 0}<p class="text-orange-600 dark:text-orange-400">High: {s.by_severity.high}</p>{/if}
					{#if s.by_severity.medium > 0}<p class="text-yellow-600 dark:text-yellow-400">Medium: {s.by_severity.medium}</p>{/if}
					{#if s.by_severity.low > 0}<p class="text-green-600 dark:text-green-400">Low: {s.by_severity.low}</p>{/if}
				</div>
			</div>
			<div class="rounded-lg border border-border bg-card p-4">
				<p class="text-sm text-muted-foreground">By Impact</p>
				<div class="mt-1 space-y-1 text-sm">
					{#if s.by_impact_type.violation > 0}<p>Violations: {s.by_impact_type.violation}</p>{/if}
					{#if s.by_impact_type.entitlement_gain > 0}<p>Gains: {s.by_impact_type.entitlement_gain}</p>{/if}
					{#if s.by_impact_type.entitlement_loss > 0}<p>Losses: {s.by_impact_type.entitlement_loss}</p>{/if}
					{#if s.by_impact_type.warning > 0}<p>Warnings: {s.by_impact_type.warning}</p>{/if}
				</div>
			</div>
		{:else}
			{@const s = summary as BatchImpactSummary}
			<div class="rounded-lg border border-border bg-card p-4">
				<p class="text-sm text-muted-foreground">Total Users</p>
				<p class="text-2xl font-bold">{s.total_users}</p>
			</div>
			<div class="rounded-lg border border-border bg-card p-4">
				<p class="text-sm text-muted-foreground">Affected Users</p>
				<p class="text-2xl font-bold">{s.affected_users}</p>
			</div>
			<div class="rounded-lg border border-border bg-card p-4">
				<p class="text-sm text-muted-foreground">Entitlements Gained</p>
				<p class="text-2xl font-bold text-green-600 dark:text-green-400">{s.entitlements_gained}</p>
			</div>
			<div class="rounded-lg border border-border bg-card p-4">
				<p class="text-sm text-muted-foreground">Entitlements Lost</p>
				<p class="text-2xl font-bold text-orange-600 dark:text-orange-400">{s.entitlements_lost}</p>
			</div>
			{#if s.sod_violations_introduced > 0}
				<div class="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
					<p class="text-sm text-red-600 dark:text-red-400">SoD Violations</p>
					<p class="text-2xl font-bold text-red-600 dark:text-red-400">{s.sod_violations_introduced}</p>
				</div>
			{/if}
			{#if s.warnings.length > 0}
				<div class="col-span-full rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-950">
					<p class="text-sm font-medium text-yellow-800 dark:text-yellow-200">Warnings</p>
					<ul class="mt-1 list-inside list-disc text-sm text-yellow-700 dark:text-yellow-300">
						{#each s.warnings as warning}
							<li>{warning}</li>
						{/each}
					</ul>
				</div>
			{/if}
		{/if}
	</div>
{:else}
	<p class="text-sm text-muted-foreground">No impact summary available. Execute the simulation to generate results.</p>
{/if}
