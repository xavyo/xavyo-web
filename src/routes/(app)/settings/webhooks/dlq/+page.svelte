<script lang="ts">
	import type { PageData } from './$types';
	import { goto, invalidateAll } from '$app/navigation';
	import { enhance } from '$app/forms';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import { Button } from '$lib/components/ui/button';
	import { EmptyState } from '$lib/components/ui/empty-state';
	import { addToast } from '$lib/stores/toast.svelte';
	import ConfirmDialog from '$lib/components/ui/confirm-dialog.svelte';

	let { data }: { data: PageData } = $props();

	// svelte-ignore state_referenced_locally
	let currentOffset = $state(data.offset);
	const limit = $derived(data.limit);
	const total = $derived(data.total);
	const pageCount = $derived(Math.ceil(total / limit));
	const currentPage = $derived(Math.floor(currentOffset / limit));

	function buildUrl(overrides: { offset?: number } = {}): string {
		const params = new URLSearchParams();
		const off = overrides.offset ?? 0;
		params.set('limit', String(limit));
		params.set('offset', String(off));
		return `/settings/webhooks/dlq?${params}`;
	}

	function goToPage(page: number) {
		goto(buildUrl({ offset: page * limit }));
	}

	function truncate(text: string, maxLen: number): string {
		if (text.length <= maxLen) return text;
		return text.slice(0, maxLen) + '...';
	}

	let showDeleteConfirm = $state(false);
	let deleteEntryId: string | null = $state(null);

	function formatDate(dateStr: string): string {
		return new Date(dateStr).toLocaleDateString();
	}
</script>

<div class="mb-4">
	<a
		href="/settings/webhooks"
		class="text-sm font-medium text-primary hover:underline"
	>
		&larr; Back to Webhooks
	</a>
</div>

<PageHeader
	title="Dead Letter Queue"
	description="Failed webhook deliveries that exhausted all retry attempts"
/>

{#if data.entries.length === 0}
	<EmptyState
		title="No failed deliveries"
		description="All webhook deliveries have been processed successfully. Failed deliveries that exhaust retries will appear here."
		icon="📬"
	/>
{:else}
	<div class="rounded-md border">
		<table class="w-full text-sm">
			<thead>
				<tr class="border-b bg-muted/50">
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Event Type</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Subscription ID</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Error Message</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Retry Count</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Created</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Actions</th>
				</tr>
			</thead>
			<tbody>
				{#each data.entries as entry}
					<tr class="border-b transition-colors hover:bg-muted/50">
						<td class="px-4 py-3 font-medium">
							<span class="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
								{entry.event_type}
							</span>
						</td>
						<td class="px-4 py-3 text-muted-foreground">
							<span title={entry.subscription_id}>
								{truncate(entry.subscription_id, 12)}
							</span>
						</td>
						<td class="max-w-xs px-4 py-3 text-muted-foreground">
							<span class="block truncate" title={entry.error_message}>
								{truncate(entry.error_message, 50)}
							</span>
						</td>
						<td class="px-4 py-3 text-muted-foreground">
							{entry.retry_count}
						</td>
						<td class="px-4 py-3 text-muted-foreground">
							{formatDate(entry.created_at)}
						</td>
						<td class="px-4 py-3">
							<div class="flex gap-2">
								<form
									method="POST"
									action="?/replay"
									use:enhance={() => {
										return async ({ result }) => {
											if (result.type === 'success') {
												const resultData = result.data as
													| { success: boolean; error?: string }
													| undefined;
												if (resultData?.success) {
													addToast('success', 'DLQ entry replayed successfully');
													await invalidateAll();
												} else {
													addToast('error', resultData?.error ?? 'Failed to replay DLQ entry');
												}
											} else {
												addToast('error', 'Failed to replay DLQ entry');
											}
										};
									}}
								>
									<input type="hidden" name="id" value={entry.id} />
									<Button variant="outline" size="sm" type="submit">Replay</Button>
								</form>
								<form
									id="dlq-delete-form-{entry.id}"
									method="POST"
									action="?/delete"
									use:enhance={() => {
										return async ({ result }) => {
											if (result.type === 'success') {
												const resultData = result.data as
													| { success: boolean; error?: string }
													| undefined;
												if (resultData?.success) {
													addToast('success', 'DLQ entry deleted');
													await invalidateAll();
												} else {
													addToast('error', resultData?.error ?? 'Failed to delete DLQ entry');
												}
											} else {
												addToast('error', 'Failed to delete DLQ entry');
											}
										};
									}}
								>
									<input type="hidden" name="id" value={entry.id} />
									<Button variant="destructive" size="sm" type="button" onclick={() => { deleteEntryId = entry.id; showDeleteConfirm = true; }}>Delete</Button>
								</form>
							</div>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	{#if pageCount > 1}
		<div class="mt-4 flex items-center justify-between">
			<p class="text-sm text-muted-foreground">
				Showing {currentOffset + 1}&ndash;{Math.min(currentOffset + limit, total)} of {total} entries
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

<ConfirmDialog
	bind:open={showDeleteConfirm}
	title="Delete DLQ entry"
	description="Are you sure you want to delete this DLQ entry? This action cannot be undone."
	confirmLabel="Delete"
	variant="destructive"
	onconfirm={() => {
		if (deleteEntryId) {
			const form = document.getElementById('dlq-delete-form-' + deleteEntryId);
			if (form instanceof HTMLFormElement) form.requestSubmit();
		}
	}}
/>
