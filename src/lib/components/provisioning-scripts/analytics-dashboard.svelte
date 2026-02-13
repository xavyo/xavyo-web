<script lang="ts">
	import { Card, CardContent, CardHeader } from '$lib/components/ui/card';
	import type { ScriptAnalyticsDashboard } from '$lib/api/types';

	let { dashboard }: { dashboard: ScriptAnalyticsDashboard | null } = $props();
</script>

{#if dashboard}
	<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
		<Card>
			<CardHeader class="pb-2">
				<p class="text-sm text-muted-foreground">Total Scripts</p>
			</CardHeader>
			<CardContent>
				<p class="text-2xl font-bold">{dashboard.total_scripts}</p>
			</CardContent>
		</Card>
		<Card>
			<CardHeader class="pb-2">
				<p class="text-sm text-muted-foreground">Active Scripts</p>
			</CardHeader>
			<CardContent>
				<p class="text-2xl font-bold">{dashboard.active_scripts}</p>
			</CardContent>
		</Card>
		<Card>
			<CardHeader class="pb-2">
				<p class="text-sm text-muted-foreground">Total Executions</p>
			</CardHeader>
			<CardContent>
				<p class="text-2xl font-bold">{dashboard.total_executions}</p>
			</CardContent>
		</Card>
		<Card>
			<CardHeader class="pb-2">
				<p class="text-sm text-muted-foreground">Success Rate</p>
			</CardHeader>
			<CardContent>
				<p class="text-2xl font-bold">{Number(dashboard.success_rate).toFixed(1)}%</p>
			</CardContent>
		</Card>
		<Card>
			<CardHeader class="pb-2">
				<p class="text-sm text-muted-foreground">Avg Duration</p>
			</CardHeader>
			<CardContent>
				<p class="text-2xl font-bold">{Number(dashboard.avg_duration_ms).toFixed(0)}ms</p>
			</CardContent>
		</Card>
	</div>

	{#if dashboard.scripts.length > 0}
		<div class="mt-6">
			<h3 class="text-sm font-medium mb-3">Per-Script Summary</h3>
			<div class="rounded-md border">
				<table class="w-full text-sm">
					<thead>
						<tr class="border-b bg-muted/50">
							<th class="px-4 py-2 text-left font-medium">Script</th>
							<th class="px-4 py-2 text-right font-medium">Executions</th>
							<th class="px-4 py-2 text-right font-medium">Success</th>
							<th class="px-4 py-2 text-right font-medium">Failure</th>
							<th class="px-4 py-2 text-right font-medium">Avg Duration</th>
						</tr>
					</thead>
					<tbody>
						{#each dashboard.scripts as script}
							<tr class="border-b last:border-0">
								<td class="px-4 py-2">
									<a href="/governance/provisioning-scripts/{script.script_id}" class="text-primary hover:underline">
										{script.name}
									</a>
								</td>
								<td class="px-4 py-2 text-right">{script.total_executions}</td>
								<td class="px-4 py-2 text-right text-green-600 dark:text-green-400">{script.success_count}</td>
								<td class="px-4 py-2 text-right text-red-600 dark:text-red-400">{script.failure_count}</td>
								<td class="px-4 py-2 text-right">{Number(script.avg_duration_ms).toFixed(0)}ms</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	{/if}
{:else}
	<p class="text-sm text-muted-foreground">No analytics data available.</p>
{/if}
