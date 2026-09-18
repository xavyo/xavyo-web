<script lang="ts">
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import { enhance as formEnhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import { Button } from '$lib/components/ui/button';
	import { EmptyState } from '$lib/components/ui/empty-state';
	import { addToast } from '$lib/stores/toast.svelte';
	import type { ImportJobStatus } from '$lib/api/types';

	let { data }: { data: PageData } = $props();

	const jobs = $derived(data.jobs);
	const limit = $derived(data.limit);
	const total = $derived(data.total);
	const offset = $derived(data.offset);
	const pageCount = $derived(Math.ceil(total / limit));
	const currentPage = $derived(Math.floor(offset / limit));

	let uploading = $state(false);

	function buildUrl(newOffset: number): string {
		const params = new URLSearchParams();
		params.set('limit', String(limit));
		params.set('offset', String(newOffset));
		return `/settings/imports?${params}`;
	}

	function goToPage(page: number) {
		goto(buildUrl(page * limit));
	}

	function statusBadgeColor(status: ImportJobStatus): string {
		switch (status) {
			case 'pending':
				return 'bg-warning/15 text-warning';
			case 'processing':
				return 'bg-info/15 text-info';
			case 'completed':
				return 'bg-success/15 text-success';
			case 'failed':
				return 'bg-destructive/15 text-destructive';
			case 'cancelled':
				return 'bg-muted text-muted-foreground';
			default:
				return 'bg-muted text-muted-foreground';
		}
	}

	function formatDate(dateStr: string): string {
		return new Date(dateStr).toLocaleDateString();
	}
</script>

<PageHeader title="User Imports" description="Import users from CSV files" />

<!-- Upload form -->
<div class="mb-6 rounded-md border p-6">
	<h2 class="mb-4 text-lg font-semibold">Upload CSV</h2>
	<form
		method="POST"
		action="?/upload"
		enctype="multipart/form-data"
		use:formEnhance={() => {
			uploading = true;
			return async ({ result, update }) => {
				uploading = false;
				if (result.type === 'redirect') {
					addToast('success', 'Import job created successfully');
					await update();
				} else if (result.type === 'failure') {
					addToast('error', (result.data?.error as string) || 'Upload failed');
				}
			};
		}}
	>
		<div class="flex flex-col gap-4 sm:flex-row sm:items-end">
			<div class="flex-1">
				<label for="file" class="mb-1 block text-sm font-medium text-foreground">
					CSV File
				</label>
				<input
					id="file"
					name="file"
					type="file"
					accept=".csv"
					required
					class="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-1 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-primary/90"
				/>
			</div>
			<div class="flex items-center gap-2">
				<input
					id="send_invitations"
					name="send_invitations"
					type="checkbox"
					class="h-4 w-4 rounded border-input"
				/>
				<label for="send_invitations" class="text-sm font-medium text-foreground">
					Send email invitations
				</label>
			</div>
			<Button type="submit" disabled={uploading}>
				{uploading ? 'Uploading...' : 'Upload'}
			</Button>
		</div>
	</form>
</div>

<!-- Job list -->
{#if jobs.length === 0}
	<EmptyState
		title="No import jobs yet"
		description="Upload a CSV file to start importing users."
	/>
{:else}
	<div class="overflow-x-auto rounded-lg border border-border/80 bg-card shadow-xs">
		<table class="w-full text-sm">
			<thead>
				<tr class="border-b bg-muted/50">
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">File Name</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Total Rows</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Success</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Errors</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Skipped</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Created</th>
				</tr>
			</thead>
			<tbody>
				{#each jobs as job}
					<tr
						class="cursor-pointer border-b transition-colors hover:bg-muted/50"
						onclick={() => goto(`/settings/imports/${job.id}`)}
					>
						<td class="px-4 py-3 font-medium">
							<a
								href="/settings/imports/{job.id}"
								class="text-primary hover:underline"
								onclick={(e) => e.stopPropagation()}
							>
								{job.file_name}
							</a>
						</td>
						<td class="px-4 py-3">
							<span
								class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {statusBadgeColor(
									job.status
								)}"
							>
								{job.status}
							</span>
						</td>
						<td class="px-4 py-3 text-muted-foreground">{job.total_rows}</td>
						<td class="px-4 py-3 text-success">{job.success_count}</td>
						<td class="px-4 py-3 text-destructive">{job.error_count}</td>
						<td class="px-4 py-3 text-muted-foreground">{job.skip_count}</td>
						<td class="px-4 py-3 text-muted-foreground">{formatDate(job.created_at)}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	{#if pageCount > 1}
		<div class="mt-4 flex items-center justify-between">
			<p class="text-sm text-muted-foreground">
				Showing {offset + 1}&ndash;{Math.min(offset + limit, total)} of {total} import jobs
			</p>
			<div class="flex gap-2">
				<Button
					variant="outline"
					size="sm"
					disabled={currentPage === 0}
					onclick={() => goToPage(currentPage - 1)}
				>
					Previous
				</Button>
				<Button
					variant="outline"
					size="sm"
					disabled={currentPage >= pageCount - 1}
					onclick={() => goToPage(currentPage + 1)}
				>
					Next
				</Button>
			</div>
		</div>
	{/if}
{/if}
