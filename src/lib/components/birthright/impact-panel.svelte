<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { addToast } from '$lib/stores/toast.svelte';
	import type { ImpactAnalysisResponse } from '$lib/api/types';
	import { analyzeImpactClient } from '$lib/api/birthright-client';
	import { BarChart3 } from 'lucide-svelte';

	interface Props {
		policyId: string;
	}

	let { policyId }: Props = $props();

	let loading = $state(false);
	let result = $state<ImpactAnalysisResponse | null>(null);

	async function handleAnalyze() {
		loading = true;
		result = null;
		try {
			result = await analyzeImpactClient(policyId);
		} catch (e) {
			addToast('error', e instanceof Error ? e.message : 'Impact analysis failed');
		} finally {
			loading = false;
		}
	}
</script>

<div class="space-y-4">
	<div class="flex items-center gap-2">
		<BarChart3 class="h-5 w-5 text-muted-foreground" />
		<h3 class="text-sm font-medium">Impact Analysis</h3>
	</div>

	<Button variant="outline" onclick={handleAnalyze} disabled={loading}>
		{loading ? 'Analyzing...' : 'Analyze Impact'}
	</Button>

	{#if result}
		{#if result.summary.total_users_affected === 0}
			<p class="text-sm text-muted-foreground">No users would be affected by this policy.</p>
		{:else}
			<div class="grid grid-cols-3 gap-4">
				<div class="rounded-md border p-3 text-center">
					<p class="text-2xl font-bold">{result.summary.total_users_affected}</p>
					<p class="text-xs text-muted-foreground">Total Affected</p>
				</div>
				<div class="rounded-md border p-3 text-center">
					<p class="text-2xl font-bold text-green-600 dark:text-green-400">{result.summary.users_gaining_access}</p>
					<p class="text-xs text-muted-foreground">Gaining Access</p>
				</div>
				<div class="rounded-md border p-3 text-center">
					<p class="text-2xl font-bold text-red-600 dark:text-red-400">{result.summary.users_losing_access}</p>
					<p class="text-xs text-muted-foreground">Losing Access</p>
				</div>
			</div>

			{#if result.by_department.length > 0}
				<div>
					<h4 class="mb-2 text-sm font-medium">By Department</h4>
					<div class="rounded-md border">
						<table class="w-full text-sm">
							<thead>
								<tr class="border-b bg-muted/50">
									<th class="px-3 py-2 text-left font-medium">Department</th>
									<th class="px-3 py-2 text-right font-medium">Users</th>
									<th class="px-3 py-2 text-right font-medium">%</th>
								</tr>
							</thead>
							<tbody>
								{#each result.by_department as dept}
									<tr class="border-b last:border-0">
										<td class="px-3 py-2">{dept.department}</td>
										<td class="px-3 py-2 text-right">{dept.user_count}</td>
										<td class="px-3 py-2 text-right">{dept.percentage.toFixed(1)}%</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</div>
			{/if}

			{#if result.by_location.length > 0}
				<div>
					<h4 class="mb-2 text-sm font-medium">By Location</h4>
					<div class="rounded-md border">
						<table class="w-full text-sm">
							<thead>
								<tr class="border-b bg-muted/50">
									<th class="px-3 py-2 text-left font-medium">Location</th>
									<th class="px-3 py-2 text-right font-medium">Users</th>
									<th class="px-3 py-2 text-right font-medium">%</th>
								</tr>
							</thead>
							<tbody>
								{#each result.by_location as loc}
									<tr class="border-b last:border-0">
										<td class="px-3 py-2">{loc.location}</td>
										<td class="px-3 py-2 text-right">{loc.user_count}</td>
										<td class="px-3 py-2 text-right">{loc.percentage.toFixed(1)}%</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</div>
			{/if}

			{#if result.entitlement_impacts.length > 0}
				<div>
					<h4 class="mb-2 text-sm font-medium">Entitlement Impact</h4>
					<div class="rounded-md border">
						<table class="w-full text-sm">
							<thead>
								<tr class="border-b bg-muted/50">
									<th class="px-3 py-2 text-left font-medium">Entitlement</th>
									<th class="px-3 py-2 text-right font-medium">Gaining</th>
									<th class="px-3 py-2 text-right font-medium">Already Have</th>
								</tr>
							</thead>
							<tbody>
								{#each result.entitlement_impacts as ei}
									<tr class="border-b last:border-0">
										<td class="px-3 py-2">{ei.entitlement_name ?? ei.entitlement_id.slice(0, 8)}</td>
										<td class="px-3 py-2 text-right text-green-600 dark:text-green-400">{ei.users_gaining}</td>
										<td class="px-3 py-2 text-right">{ei.users_already_have}</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</div>
			{/if}
		{/if}
	{/if}
</div>
