<script lang="ts">
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import { enhance as formEnhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { Card, CardHeader, CardContent } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label';
	import { EmptyState } from '$lib/components/ui/empty-state';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import { addToast } from '$lib/stores/toast.svelte';

	let { data }: { data: PageData } = $props();

	let modeFilter = $state('');
	let statusFilter = $state('');

	const runs = $derived(data.runs.runs);
	const total = $derived(data.runs.total);
	const limit = $derived(data.runs.limit);
	const offset = $derived(data.runs.offset);
	const pageCount = $derived(Math.ceil(total / limit));
	const currentPage = $derived(Math.floor(offset / limit));
	const hasFilters = $derived(modeFilter !== '' || statusFilter !== '');

	$effect(() => {
		const url = new URL(window.location.href);
		modeFilter = url.searchParams.get('mode') ?? '';
		statusFilter = url.searchParams.get('status') ?? '';
	});

	const connectorName = $derived(data.connector?.name ?? 'Connector');

	const statusOptions = [
		{ value: '', label: 'All statuses' },
		{ value: 'pending', label: 'Pending' },
		{ value: 'running', label: 'Running' },
		{ value: 'completed', label: 'Completed' },
		{ value: 'failed', label: 'Failed' },
		{ value: 'cancelled', label: 'Cancelled' },
		{ value: 'paused', label: 'Paused' }
	];

	const modeOptions = [
		{ value: '', label: 'All modes' },
		{ value: 'full', label: 'Full' },
		{ value: 'delta', label: 'Delta' }
	];

	function buildUrl(overrides: Record<string, string | number | undefined> = {}): string {
		const params = new URLSearchParams();
		const m = (overrides.mode as string) ?? modeFilter;
		const s = (overrides.status as string) ?? statusFilter;
		const off = overrides.offset ?? 0;
		if (m) params.set('mode', m);
		if (s) params.set('status', s);
		params.set('limit', String(limit));
		params.set('offset', String(off));
		return `/connectors/${data.connectorId}/reconciliation?${params}`;
	}

	function applyFilter() {
		goto(buildUrl({ offset: 0 }));
	}

	function goToPage(page: number) {
		goto(buildUrl({ offset: page * limit }));
	}

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
	<PageHeader title="Reconciliation Runs" description={connectorName} />
	<div class="flex items-center gap-2">
		<a
			href="/connectors/{data.connectorId}/reconciliation/discrepancies"
			class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
		>
			Discrepancies
		</a>
		<a
			href="/connectors/{data.connectorId}/reconciliation/schedule"
			class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
		>
			Schedule
		</a>
		<a
			href="/connectors/{data.connectorId}"
			class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
		>
			Back to Connector
		</a>
	</div>
</div>

<!-- Trigger Run Form -->
<Card class="mt-6 max-w-lg">
	<CardHeader>
		<h2 class="text-xl font-semibold">Start Reconciliation Run</h2>
	</CardHeader>
	<CardContent>
		<form
			method="POST"
			action="?/trigger"
			use:formEnhance={() => {
				return async ({ result }) => {
					if (result.type === 'success') {
						addToast('success', 'Reconciliation run triggered');
						await invalidateAll();
					} else if (result.type === 'failure') {
						addToast('error', (result.data?.error as string) || 'Failed to trigger run');
					}
				};
			}}
			class="space-y-4"
		>
			<div class="space-y-2">
				<Label for="trigger-mode">Mode</Label>
				<select
					id="trigger-mode"
					name="mode"
					class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
				>
					<option value="full">Full</option>
					<option value="delta">Delta</option>
				</select>
			</div>
			<div class="flex items-center gap-2">
				<input
					id="dry_run"
					name="dry_run"
					type="checkbox"
					class="h-4 w-4 rounded border-input"
				/>
				<Label for="dry_run">Dry run (preview only, no changes applied)</Label>
			</div>
			<Button type="submit">Start Run</Button>
		</form>
	</CardContent>
</Card>

<!-- Filters -->
<div class="mb-4 mt-6 flex flex-wrap gap-3">
	<select
		class="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
		bind:value={modeFilter}
		onchange={applyFilter}
	>
		{#each modeOptions as opt}
			<option value={opt.value}>{opt.label}</option>
		{/each}
	</select>
	<select
		class="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
		bind:value={statusFilter}
		onchange={applyFilter}
	>
		{#each statusOptions as opt}
			<option value={opt.value}>{opt.label}</option>
		{/each}
	</select>
</div>

<!-- Runs Table -->
{#if runs.length === 0}
	{#if hasFilters}
		<EmptyState
			title="No runs match your filters"
			description="Try adjusting your filter criteria."
			icon="search"
		/>
		<div class="flex justify-center pb-4">
			<button
				onclick={() => {
					modeFilter = '';
					statusFilter = '';
					goto(`/connectors/${data.connectorId}/reconciliation?limit=${limit}&offset=0`);
				}}
				class="text-sm font-medium text-primary hover:underline"
			>
				Clear filters
			</button>
		</div>
	{:else}
		<EmptyState
			title="No reconciliation runs"
			description="Trigger a reconciliation run above to compare accounts between Xavyo and the target system."
			icon="inbox"
		/>
	{/if}
{:else}
	<div class="rounded-md border">
		<table class="w-full text-sm">
			<thead>
				<tr class="border-b bg-muted/50">
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Mode</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Dry Run</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Accounts</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Discrepancies</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Duration</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Started</th>
				</tr>
			</thead>
			<tbody>
				{#each runs as run}
					<tr class="border-b transition-colors hover:bg-muted/50">
						<td class="px-4 py-3">
							<Badge
								variant={statusBadgeVariant(run.status)}
								class={statusBadgeClass(run.status)}
							>
								{run.status}
							</Badge>
						</td>
						<td class="px-4 py-3">
							<Badge variant="outline">{run.mode}</Badge>
						</td>
						<td class="px-4 py-3 text-muted-foreground">{run.dry_run ? 'Yes' : 'No'}</td>
						<td class="px-4 py-3 text-muted-foreground">{run.accounts_processed}</td>
						<td class="px-4 py-3">
							<a
								href="/connectors/{data.connectorId}/reconciliation/runs/{run.id}"
								class="text-primary hover:underline"
							>
								{run.discrepancies_found}
							</a>
						</td>
						<td class="px-4 py-3 text-muted-foreground">
							{run.duration_seconds !== null ? `${run.duration_seconds}s` : '\u2014'}
						</td>
						<td class="px-4 py-3 text-muted-foreground">{formatDate(run.started_at)}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	{#if pageCount > 1}
		<div class="mt-4 flex items-center justify-between">
			<p class="text-sm text-muted-foreground">
				Showing {offset + 1}&ndash;{Math.min(offset + limit, total)} of {total} runs
			</p>
			<div class="flex gap-2">
				<Button variant="outline" size="sm" disabled={currentPage === 0} onclick={() => goToPage(currentPage - 1)}>
					Previous
				</Button>
				<Button variant="outline" size="sm" disabled={currentPage >= pageCount - 1} onclick={() => goToPage(currentPage + 1)}>
					Next
				</Button>
			</div>
		</div>
	{/if}
{/if}
