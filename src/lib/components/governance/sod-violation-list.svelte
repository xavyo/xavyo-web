<script lang="ts">
	import type { SodViolationResponse, RiskLevel } from '$lib/api/types';
	import EmptyState from '$lib/components/ui/empty-state/empty-state.svelte';
	import { Skeleton } from '$lib/components/ui/skeleton';

	interface Props {
		violations: SodViolationResponse[];
		isLoading: boolean;
	}

	let { violations, isLoading }: Props = $props();

	const severityStyles: Record<RiskLevel, string> = {
		low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
		medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
		high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
		critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
	};

	const severityLabels: Record<RiskLevel, string> = {
		low: 'Low',
		medium: 'Medium',
		high: 'High',
		critical: 'Critical'
	};
</script>

<div>
	{#if isLoading}
		<div class="overflow-x-auto rounded-md border">
			<table class="w-full caption-bottom text-sm">
				<thead class="[&_tr]:border-b">
					<tr class="border-b transition-colors hover:bg-muted/50">
						<th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground"
							>Rule Name</th
						>
						<th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground"
							>Severity</th
						>
						<th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground"
							>User ID</th
						>
						<th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground"
							>First Entitlement</th
						>
						<th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground"
							>Second Entitlement</th
						>
					</tr>
				</thead>
				<tbody class="[&_tr:last-child]:border-0">
					{#each Array(3) as _}
						<tr class="border-b">
							<td class="p-4 align-middle"><Skeleton class="h-4 w-full" /></td>
							<td class="p-4 align-middle"><Skeleton class="h-4 w-full" /></td>
							<td class="p-4 align-middle"><Skeleton class="h-4 w-full" /></td>
							<td class="p-4 align-middle"><Skeleton class="h-4 w-full" /></td>
							<td class="p-4 align-middle"><Skeleton class="h-4 w-full" /></td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{:else if violations.length === 0}
		<EmptyState
			icon="✅"
			title="No SoD violations"
			description="No separation of duties violations have been detected."
		/>
	{:else}
		<div class="overflow-x-auto rounded-md border">
			<table class="w-full caption-bottom text-sm">
				<thead class="[&_tr]:border-b">
					<tr class="border-b transition-colors hover:bg-muted/50">
						<th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground"
							>Rule Name</th
						>
						<th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground"
							>Severity</th
						>
						<th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground"
							>User ID</th
						>
						<th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground"
							>First Entitlement</th
						>
						<th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground"
							>Second Entitlement</th
						>
					</tr>
				</thead>
				<tbody class="[&_tr:last-child]:border-0">
					{#each violations as violation (violation.rule_id + violation.user_id)}
						<tr class="border-b transition-colors hover:bg-muted/50">
							<td class="p-4 align-middle">
								<span class="text-sm font-medium">{violation.rule_name}</span>
							</td>
							<td class="p-4 align-middle">
								<span
									class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {severityStyles[violation.severity]}"
									>{severityLabels[violation.severity]}</span
								>
							</td>
							<td class="p-4 align-middle">
								<span class="font-mono text-xs">{violation.user_id}</span>
							</td>
							<td class="p-4 align-middle">
								<span class="font-mono text-xs">{violation.first_entitlement_id}</span>
							</td>
							<td class="p-4 align-middle">
								<span class="font-mono text-xs">{violation.second_entitlement_id}</span>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>
