<script lang="ts">
	import type { PageData } from './$types';
	import { Card, CardHeader, CardContent } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Separator } from '$lib/components/ui/separator';
	import { Button } from '$lib/components/ui/button';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import { enhance as formEnhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { addToast } from '$lib/stores/toast.svelte';

	let { data }: { data: PageData } = $props();

	const run = $derived(data.run);
	const report = $derived(data.report);

	function formatDate(dateStr: string | null): string {
		if (!dateStr) return '\u2014';
		return new Date(dateStr).toLocaleString();
	}

	function statusBadgeClass(status: string): string {
		switch (status) {
			case 'pending':
				return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
			case 'running':
				return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
			case 'completed':
				return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
			case 'failed':
				return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
			case 'cancelled':
				return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
			case 'paused':
				return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
			default:
				return '';
		}
	}

	function statusBadgeVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
		switch (status) {
			case 'completed':
				return 'default';
			case 'failed':
				return 'destructive';
			default:
				return 'secondary';
		}
	}
</script>

<!-- Header -->
<div class="flex items-center justify-between">
	<div class="flex items-center gap-3">
		<PageHeader title="Run Detail" description="Reconciliation run information" />
		<Badge
			variant={statusBadgeVariant(run.status)}
			class={statusBadgeClass(run.status)}
		>
			{run.status}
		</Badge>
	</div>
	<div class="flex items-center gap-2">
		{#if run.status === 'running'}
			<form method="POST" action="?/cancel" use:formEnhance={() => {
				return async ({ result }) => {
					if (result.type === 'success') {
						addToast('success', 'Run cancelled');
						await invalidateAll();
					} else if (result.type === 'failure') {
						addToast('error', (result.data?.error as string) || 'Failed to cancel run');
					}
				};
			}}>
				<Button type="submit" variant="destructive">Cancel Run</Button>
			</form>
		{/if}
		{#if run.status === 'paused'}
			<form method="POST" action="?/resume" use:formEnhance={() => {
				return async ({ result }) => {
					if (result.type === 'success') {
						addToast('success', 'Run resumed');
						await invalidateAll();
					} else if (result.type === 'failure') {
						addToast('error', (result.data?.error as string) || 'Failed to resume run');
					}
				};
			}}>
				<Button type="submit" variant="outline">Resume Run</Button>
			</form>
		{/if}
		<a
			href="/connectors/{data.connectorId}/reconciliation/discrepancies?run_id={run.id}"
			class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
		>
			View Discrepancies
		</a>
		<a
			href="/connectors/{data.connectorId}/reconciliation"
			class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
		>
			Back to Runs
		</a>
	</div>
</div>

<!-- Run Info Card -->
<Card class="mt-6 max-w-2xl">
	<CardHeader>
		<h2 class="text-xl font-semibold">Run Information</h2>
	</CardHeader>
	<CardContent class="space-y-4">
		<div class="grid gap-3">
			<div class="flex justify-between">
				<span class="text-sm text-muted-foreground">ID</span>
				<span class="text-sm font-mono">{run.id}</span>
			</div>
			<div class="flex justify-between">
				<span class="text-sm text-muted-foreground">Mode</span>
				<Badge variant="outline">{run.mode}</Badge>
			</div>
			<div class="flex justify-between">
				<span class="text-sm text-muted-foreground">Dry Run</span>
				<span class="text-sm">{run.dry_run ? 'Yes' : 'No'}</span>
			</div>
			<div class="flex justify-between">
				<span class="text-sm text-muted-foreground">Status</span>
				<Badge
					variant={statusBadgeVariant(run.status)}
					class={statusBadgeClass(run.status)}
				>
					{run.status}
				</Badge>
			</div>

			<Separator />

			<div class="flex justify-between">
				<span class="text-sm text-muted-foreground">Started</span>
				<span class="text-sm">{formatDate(run.started_at)}</span>
			</div>
			<div class="flex justify-between">
				<span class="text-sm text-muted-foreground">Completed</span>
				<span class="text-sm">{formatDate(run.completed_at)}</span>
			</div>
			<div class="flex justify-between">
				<span class="text-sm text-muted-foreground">Duration</span>
				<span class="text-sm">{run.duration_seconds !== null ? `${run.duration_seconds}s` : '\u2014'}</span>
			</div>

			<Separator />

			<div class="flex justify-between">
				<span class="text-sm text-muted-foreground">Accounts Processed</span>
				<span class="text-sm font-medium">{run.accounts_processed}</span>
			</div>
			<div class="flex justify-between">
				<span class="text-sm text-muted-foreground">Discrepancies Found</span>
				<span class="text-sm font-medium">{run.discrepancies_found}</span>
			</div>
			<div class="flex justify-between">
				<span class="text-sm text-muted-foreground">Created By</span>
				<span class="text-sm font-mono">{run.created_by}</span>
			</div>
		</div>
	</CardContent>
</Card>

<!-- Report Section (only shown for completed runs with a report) -->
{#if report}
	<!-- Discrepancy Summary -->
	<Card class="mt-6 max-w-2xl">
		<CardHeader>
			<h2 class="text-xl font-semibold">Discrepancy Summary</h2>
		</CardHeader>
		<CardContent class="space-y-4">
			<div class="flex justify-between">
				<span class="text-sm text-muted-foreground">Total Discrepancies</span>
				<span class="text-sm font-medium">{report.discrepancy_summary.total}</span>
			</div>
			{#if Object.keys(report.discrepancy_summary.by_type).length > 0}
				<Separator />
				<h3 class="text-sm font-medium text-muted-foreground">Breakdown by Type</h3>
				<div class="grid gap-2">
					{#each Object.entries(report.discrepancy_summary.by_type) as [type, count]}
						<div class="flex items-center justify-between rounded-md border px-3 py-2">
							<span class="text-sm">{type}</span>
							<Badge variant="secondary">{count}</Badge>
						</div>
					{/each}
				</div>
			{/if}
		</CardContent>
	</Card>

	<!-- Action Summary -->
	<Card class="mt-6 max-w-2xl">
		<CardHeader>
			<h2 class="text-xl font-semibold">Action Summary</h2>
		</CardHeader>
		<CardContent class="space-y-4">
			<div class="flex justify-between">
				<span class="text-sm text-muted-foreground">Total Actions</span>
				<span class="text-sm font-medium">{report.action_summary.total}</span>
			</div>
			{#if Object.keys(report.action_summary.by_action).length > 0}
				<Separator />
				<h3 class="text-sm font-medium text-muted-foreground">Breakdown by Action</h3>
				<div class="grid gap-2">
					{#each Object.entries(report.action_summary.by_action) as [action, count]}
						<div class="flex items-center justify-between rounded-md border px-3 py-2">
							<span class="text-sm">{action}</span>
							<Badge variant="secondary">{count}</Badge>
						</div>
					{/each}
				</div>
			{/if}
		</CardContent>
	</Card>

	<!-- Top Mismatched Attributes -->
	{#if report.top_mismatched_attributes.length > 0}
		<Card class="mt-6 max-w-2xl">
			<CardHeader>
				<h2 class="text-xl font-semibold">Top Mismatched Attributes</h2>
			</CardHeader>
			<CardContent>
				<div class="rounded-md border">
					<table class="w-full text-sm">
						<thead>
							<tr class="border-b bg-muted/50">
								<th class="px-4 py-3 text-left font-medium text-muted-foreground">Attribute</th>
								<th class="px-4 py-3 text-right font-medium text-muted-foreground">Count</th>
							</tr>
						</thead>
						<tbody>
							{#each report.top_mismatched_attributes as attr}
								<tr class="border-b last:border-b-0">
									<td class="px-4 py-3 font-mono text-sm">{attr.attribute_name}</td>
									<td class="px-4 py-3 text-right">
										<Badge variant="secondary">{attr.count}</Badge>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</CardContent>
		</Card>
	{/if}

	<!-- Performance Metrics -->
	<Card class="mt-6 max-w-2xl">
		<CardHeader>
			<h2 class="text-xl font-semibold">Performance Metrics</h2>
		</CardHeader>
		<CardContent class="space-y-4">
			<div class="grid gap-3">
				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Total Duration</span>
					<span class="text-sm font-medium">{report.performance_metrics.total_duration_ms}ms</span>
				</div>
				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Accounts per Second</span>
					<span class="text-sm font-medium">{report.performance_metrics.accounts_per_second.toFixed(2)}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">API Calls Made</span>
					<span class="text-sm font-medium">{report.performance_metrics.api_calls_made}</span>
				</div>
			</div>
		</CardContent>
	</Card>
{/if}
