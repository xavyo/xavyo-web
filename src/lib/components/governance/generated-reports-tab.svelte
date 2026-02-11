<script lang="ts">
	import type { GeneratedReport } from '$lib/api/types';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import { deleteReportClient, cleanupReportsClient } from '$lib/api/governance-reporting-client';
	import { addToast } from '$lib/stores/toast.svelte';

	interface Props {
		reports: GeneratedReport[];
		loading?: boolean;
		statusFilter?: string;
		onStatusFilterChange?: (status: string) => void;
		onRefresh?: () => void;
	}

	let { reports, loading = false, statusFilter = '', onStatusFilterChange, onRefresh }: Props = $props();

	let viewingReportId: string | null = $state(null);
	let reportData: unknown = $state(null);
	let dataLoading: boolean = $state(false);

	function statusClass(status: string): string {
		switch (status) {
			case 'completed':
				return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
			case 'failed':
				return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
			case 'generating':
				return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
			case 'pending':
				return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
			default:
				return 'bg-muted text-muted-foreground';
		}
	}

	function formatDate(d: string | null): string {
		if (!d) return '—';
		return new Date(d).toLocaleString();
	}

	function formatSize(bytes: number | null): string {
		if (bytes === null) return '—';
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
		return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
	}

	async function viewData(id: string) {
		dataLoading = true;
		try {
			const res = await fetch(`/api/governance/reports/${id}/data`);
			if (!res.ok) throw new Error('Failed to fetch data');
			reportData = await res.json();
			viewingReportId = id;
		} catch {
			addToast('error', 'Failed to load report data');
		} finally {
			dataLoading = false;
		}
	}

	async function handleDelete(id: string) {
		if (!confirm('Delete this report?')) return;
		try {
			await deleteReportClient(id);
			addToast('success', 'Report deleted');
			onRefresh?.();
		} catch {
			addToast('error', 'Failed to delete report');
		}
	}

	async function handleCleanup() {
		if (!confirm('Delete all expired reports?')) return;
		try {
			const result = await cleanupReportsClient();
			addToast('success', `Cleaned up ${result.deleted_count} expired ${result.deleted_count === 1 ? 'report' : 'reports'}`);
			onRefresh?.();
		} catch {
			addToast('error', 'Failed to cleanup reports');
		}
	}
</script>

<div class="space-y-4">
	<div class="flex items-center justify-between gap-4">
		<div class="flex items-center gap-2">
			<p class="text-sm text-muted-foreground">
				{reports.length} {reports.length === 1 ? 'report' : 'reports'}
			</p>
			<select
				class="h-8 rounded-md border border-border bg-background px-2 text-sm"
				value={statusFilter}
				onchange={(e) => onStatusFilterChange?.(e.currentTarget.value)}
			>
				<option value="">All statuses</option>
				<option value="pending">Pending</option>
				<option value="generating">Generating</option>
				<option value="completed">Completed</option>
				<option value="failed">Failed</option>
			</select>
		</div>
		<button
			type="button"
			class="inline-flex h-8 items-center rounded-md border border-border px-3 text-sm hover:bg-muted"
			onclick={handleCleanup}
		>
			Cleanup Expired
		</button>
	</div>

	{#if loading}
		<div class="space-y-3">
			{#each Array(3) as _}
				<div class="h-12 animate-pulse rounded-md bg-muted"></div>
			{/each}
		</div>
	{:else if reports.length === 0}
		<p class="py-8 text-center text-sm text-muted-foreground">No generated reports.</p>
	{:else}
		<div class="overflow-x-auto">
			<table class="w-full text-sm">
				<thead>
					<tr class="border-b border-border text-left">
						<th class="px-3 py-2 font-medium text-muted-foreground">Name</th>
						<th class="px-3 py-2 font-medium text-muted-foreground">Status</th>
						<th class="px-3 py-2 font-medium text-muted-foreground">Format</th>
						<th class="px-3 py-2 font-medium text-muted-foreground">Records</th>
						<th class="px-3 py-2 font-medium text-muted-foreground">Size</th>
						<th class="px-3 py-2 font-medium text-muted-foreground">Created</th>
						<th class="px-3 py-2 font-medium text-muted-foreground">Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each reports as report}
						<tr class="border-b border-border">
							<td class="px-3 py-2 font-medium">{report.name}</td>
							<td class="px-3 py-2">
								<Badge class={statusClass(report.status)}>{report.status}</Badge>
								{#if report.status === 'generating'}
									<span class="ml-1 text-xs text-muted-foreground">{report.progress_percent}%</span>
								{/if}
							</td>
							<td class="px-3 py-2 uppercase text-muted-foreground">{report.output_format}</td>
							<td class="px-3 py-2 text-muted-foreground">{report.record_count ?? '—'}</td>
							<td class="px-3 py-2 text-muted-foreground">{formatSize(report.file_size_bytes)}</td>
							<td class="px-3 py-2 text-muted-foreground">{formatDate(report.created_at)}</td>
							<td class="px-3 py-2">
								<div class="flex gap-2">
									{#if report.status === 'completed'}
										<button
											type="button"
											class="text-sm font-medium text-primary hover:underline"
											onclick={() => viewData(report.id)}
										>
											View Data
										</button>
									{/if}
									{#if report.status === 'failed' || report.status === 'pending'}
										<button
											type="button"
											class="text-sm font-medium text-destructive hover:underline"
											onclick={() => handleDelete(report.id)}
										>
											Delete
										</button>
									{/if}
									{#if report.status === 'failed' && report.error_message}
										<span class="text-xs text-destructive" title={report.error_message}>Error</span>
									{/if}
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}

	{#if viewingReportId && reportData !== null}
		<div class="mt-4 rounded-lg border border-border p-4">
			<div class="mb-2 flex items-center justify-between">
				<h3 class="text-sm font-medium">Report Data</h3>
				<button
					type="button"
					class="text-sm text-muted-foreground hover:text-foreground"
					onclick={() => { viewingReportId = null; reportData = null; }}
				>
					Close
				</button>
			</div>
			{#if dataLoading}
				<div class="h-20 animate-pulse rounded-md bg-muted"></div>
			{:else if Array.isArray(reportData) && reportData.length > 0 && typeof reportData[0] === 'object'}
				{@const keys = Object.keys(reportData[0] as Record<string, unknown>)}
				<div class="overflow-x-auto">
					<table class="w-full text-xs">
						<thead>
							<tr class="border-b border-border">
								{#each keys as key}
									<th class="px-2 py-1 text-left font-medium text-muted-foreground">{key}</th>
								{/each}
							</tr>
						</thead>
						<tbody>
							{#each reportData as row}
								<tr class="border-b border-border">
									{#each keys as key}
										<td class="px-2 py-1 text-muted-foreground">{String((row as Record<string, unknown>)[key] ?? '')}</td>
									{/each}
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{:else}
				<pre class="max-h-96 overflow-auto rounded bg-muted p-3 text-xs">{JSON.stringify(reportData, null, 2)}</pre>
			{/if}
		</div>
	{/if}
</div>
