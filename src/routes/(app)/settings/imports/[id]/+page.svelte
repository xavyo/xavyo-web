<script lang="ts">
	import { Card, CardHeader, CardContent } from '$lib/components/ui/card';
	import { Separator } from '$lib/components/ui/separator';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import { enhance as formEnhance } from '$app/forms';
	import { goto, invalidateAll } from '$app/navigation';
	import { addToast } from '$lib/stores/toast.svelte';
	import { downloadErrorCsv } from '$lib/api/imports-client';
	import type { ImportJobStatus, ImportErrorType } from '$lib/api/types';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let showResendDialog = $state(false);

	const job = $derived(data.job);
	const errors = $derived(data.errors);
	const errorTotal = $derived(data.errorTotal);
	const errorLimit = $derived(data.errorLimit);
	const errorOffset = $derived(data.errorOffset);
	const errorPageCount = $derived(Math.ceil(errorTotal / errorLimit));
	const errorCurrentPage = $derived(Math.floor(errorOffset / errorLimit));

	function statusBadgeColor(status: ImportJobStatus): string {
		switch (status) {
			case 'pending':
				return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
			case 'processing':
				return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
			case 'completed':
				return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
			case 'failed':
				return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
			case 'cancelled':
				return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
			default:
				return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
		}
	}

	function errorTypeBadgeColor(errorType: ImportErrorType): string {
		switch (errorType) {
			case 'validation':
				return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
			case 'duplicate_in_file':
			case 'duplicate_in_tenant':
				return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
			case 'role_not_found':
			case 'group_error':
				return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
			case 'attribute_error':
				return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
			case 'system':
				return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
			default:
				return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
		}
	}

	function formatDate(dateStr: string | null): string {
		if (!dateStr) return '---';
		return new Date(dateStr).toLocaleString();
	}

	function formatFileSize(bytes: number): string {
		if (bytes >= 1024 * 1024) {
			return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
		}
		return (bytes / 1024).toFixed(1) + ' KB';
	}

	function goToErrorPage(page: number) {
		const params = new URLSearchParams();
		params.set('elimit', String(errorLimit));
		params.set('eoffset', String(page * errorLimit));
		goto(`/settings/imports/${job.id}?${params}`);
	}
</script>

<!-- Header -->
<div class="mb-4 flex items-center gap-2">
	<a
		href="/settings/imports"
		class="text-sm text-muted-foreground hover:text-foreground"
	>
		&larr; Back to Imports
	</a>
</div>

<div class="flex items-center justify-between">
	<div class="flex items-center gap-3">
		<PageHeader title={job.file_name} description="Import job details" />
		<span
			class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {statusBadgeColor(
				job.status
			)}"
		>
			{job.status}
		</span>
	</div>
	<div class="flex items-center gap-2">
		{#if job.error_count > 0}
			<Button variant="outline" onclick={() => downloadErrorCsv(job.id)}>
				Download Error CSV
			</Button>
		{/if}
		{#if job.send_invitations && job.status === 'completed' && job.success_count > 0}
			<Button
				variant="outline"
				onclick={() => {
					showResendDialog = true;
				}}
			>
				Resend Invitations
			</Button>
		{/if}
	</div>
</div>

<!-- Job Summary Card -->
<Card class="mt-4 max-w-2xl">
	<CardHeader>
		<h2 class="text-xl font-semibold">Job Summary</h2>
	</CardHeader>
	<CardContent class="space-y-4">
		<div class="grid gap-3">
			<div class="flex justify-between">
				<span class="text-sm text-muted-foreground">Status</span>
				<span
					class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {statusBadgeColor(
						job.status
					)}"
				>
					{job.status}
				</span>
			</div>
			<div class="flex justify-between">
				<span class="text-sm text-muted-foreground">File Name</span>
				<span class="text-sm font-medium">{job.file_name}</span>
			</div>
			<div class="flex justify-between">
				<span class="text-sm text-muted-foreground">File Size</span>
				<span class="text-sm">{formatFileSize(job.file_size_bytes)}</span>
			</div>
			<div class="flex justify-between">
				<span class="text-sm text-muted-foreground">Progress</span>
				<span class="text-sm font-medium">{job.processed_rows} / {job.total_rows} rows</span>
			</div>
			<div class="flex justify-between">
				<span class="text-sm text-muted-foreground">Send Invitations</span>
				<span class="text-sm">{job.send_invitations ? 'Yes' : 'No'}</span>
			</div>

			<Separator />

			<div class="flex justify-between">
				<span class="text-sm text-muted-foreground">Successful</span>
				<span class="text-sm font-medium text-green-600 dark:text-green-400">
					{job.success_count}
				</span>
			</div>
			<div class="flex justify-between">
				<span class="text-sm text-muted-foreground">Errors</span>
				<span class="text-sm font-medium text-red-600 dark:text-red-400">
					{job.error_count}
				</span>
			</div>
			<div class="flex justify-between">
				<span class="text-sm text-muted-foreground">Skipped</span>
				<span class="text-sm font-medium text-muted-foreground">{job.skip_count}</span>
			</div>

			{#if job.error_message}
				<Separator />
				<div>
					<span class="text-sm text-muted-foreground">Error Message</span>
					<p class="mt-1 text-sm text-red-600 dark:text-red-400">{job.error_message}</p>
				</div>
			{/if}

			<Separator />

			<div class="flex justify-between">
				<span class="text-sm text-muted-foreground">Created</span>
				<span class="text-sm">{formatDate(job.created_at)}</span>
			</div>
			<div class="flex justify-between">
				<span class="text-sm text-muted-foreground">Started</span>
				<span class="text-sm">{formatDate(job.started_at)}</span>
			</div>
			<div class="flex justify-between">
				<span class="text-sm text-muted-foreground">Completed</span>
				<span class="text-sm">{formatDate(job.completed_at)}</span>
			</div>
		</div>
	</CardContent>
</Card>

<!-- Error List -->
{#if errorTotal > 0}
	<Card class="mt-6 max-w-4xl">
		<CardHeader>
			<div class="flex items-center justify-between">
				<h2 class="text-xl font-semibold">Import Errors ({errorTotal})</h2>
				<Button variant="outline" size="sm" onclick={() => downloadErrorCsv(job.id)}>
					Download CSV
				</Button>
			</div>
		</CardHeader>
		<CardContent>
			<div class="rounded-md border">
				<table class="w-full text-sm">
					<thead>
						<tr class="border-b bg-muted/50">
							<th class="px-4 py-3 text-left font-medium text-muted-foreground">Line</th>
							<th class="px-4 py-3 text-left font-medium text-muted-foreground">Email</th>
							<th class="px-4 py-3 text-left font-medium text-muted-foreground">Column</th>
							<th class="px-4 py-3 text-left font-medium text-muted-foreground">Error Type</th>
							<th class="px-4 py-3 text-left font-medium text-muted-foreground">Message</th>
						</tr>
					</thead>
					<tbody>
						{#each errors as err}
							<tr class="border-b transition-colors hover:bg-muted/50">
								<td class="px-4 py-3 font-mono text-muted-foreground">{err.line_number}</td>
								<td class="px-4 py-3">{err.email ?? '---'}</td>
								<td class="px-4 py-3 text-muted-foreground">{err.column_name ?? '---'}</td>
								<td class="px-4 py-3">
									<span
										class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {errorTypeBadgeColor(
											err.error_type
										)}"
									>
										{err.error_type}
									</span>
								</td>
								<td class="max-w-[300px] truncate px-4 py-3 text-muted-foreground">
									{err.error_message}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>

			{#if errorPageCount > 1}
				<div class="mt-4 flex items-center justify-between">
					<p class="text-sm text-muted-foreground">
						Showing {errorOffset + 1}&ndash;{Math.min(errorOffset + errorLimit, errorTotal)}
						of {errorTotal} errors
					</p>
					<div class="flex gap-2">
						<Button
							variant="outline"
							size="sm"
							disabled={errorCurrentPage === 0}
							onclick={() => goToErrorPage(errorCurrentPage - 1)}
						>
							Previous
						</Button>
						<Button
							variant="outline"
							size="sm"
							disabled={errorCurrentPage >= errorPageCount - 1}
							onclick={() => goToErrorPage(errorCurrentPage + 1)}
						>
							Next
						</Button>
					</div>
				</div>
			{/if}
		</CardContent>
	</Card>
{:else if job.status === 'completed'}
	<Card class="mt-6 max-w-4xl">
		<CardContent class="py-8 text-center">
			<p class="text-sm text-muted-foreground">No errors found for this import job.</p>
		</CardContent>
	</Card>
{/if}

<!-- Resend Invitations Confirmation Dialog -->
<Dialog.Root bind:open={showResendDialog}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Resend Invitations</Dialog.Title>
			<Dialog.Description>
				This will resend email invitations to all successfully imported users from "{job.file_name}".
				Are you sure you want to proceed?
			</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer>
			<Button
				variant="outline"
				onclick={() => {
					showResendDialog = false;
				}}>Cancel</Button
			>
			<form
				method="POST"
				action="?/resend"
				use:formEnhance={() => {
					return async ({ result }) => {
						showResendDialog = false;
						if (result.type === 'success' && result.data) {
							const d = result.data as Record<string, unknown>;
							const resent = d.resent_count as number;
							const skipped = d.skipped_count as number;
							addToast(
								'success',
								`Invitations resent: ${resent} sent, ${skipped} skipped`
							);
							await invalidateAll();
						} else if (result.type === 'failure') {
							addToast('error', (result.data?.error as string) || 'Failed to resend invitations');
						}
					};
				}}
			>
				<Button type="submit">Resend</Button>
			</form>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
