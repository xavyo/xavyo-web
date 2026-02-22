<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { Card, CardHeader, CardContent } from '$lib/components/ui/card';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import { addToast } from '$lib/stores/toast.svelte';
	import type { PageData, ActionData } from './$types';
	import type { BulkOperationResult } from '$lib/api/types';

	let { data, form: actionData }: { data: PageData; form: ActionData } = $props();

	let bulkResult: BulkOperationResult | null = $state(null);
	let lastAction: string | null = $state(null);

	const {
		form: assignForm,
		errors: assignErrors,
		enhance: assignEnhance,
		message: assignMessage
	// svelte-ignore state_referenced_locally
	} = superForm(data.assignForm, {
		onResult({ result }) {
			if (result.type === 'success' && result.data?.bulkResult) {
				bulkResult = result.data.bulkResult as BulkOperationResult;
				lastAction = 'assign';
				const r = bulkResult;
				if (r.failure_count === 0) {
					addToast('success', `Successfully assigned ${r.success_count} licenses`);
				} else {
					addToast('error', `Assigned ${r.success_count}, failed ${r.failure_count}`);
				}
			}
		}
	});

	const {
		form: reclaimForm,
		errors: reclaimErrors,
		enhance: reclaimEnhance,
		message: reclaimMessage
	// svelte-ignore state_referenced_locally
	} = superForm(data.reclaimForm, {
		onResult({ result }) {
			if (result.type === 'success' && result.data?.bulkResult) {
				bulkResult = result.data.bulkResult as BulkOperationResult;
				lastAction = 'reclaim';
				const r = bulkResult;
				if (r.failure_count === 0) {
					addToast('success', `Successfully reclaimed ${r.success_count} licenses`);
				} else {
					addToast('error', `Reclaimed ${r.success_count}, failed ${r.failure_count}`);
				}
			}
		}
	});

	const selectClasses =
		'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';
	const textareaClasses =
		'flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';
</script>

<PageHeader
	title="Bulk License Operations"
	description="Assign or reclaim licenses in bulk using user IDs or assignment IDs"
/>

{#if bulkResult}
	<Card class="mb-6">
		<CardHeader>
			<h2 class="text-xl font-semibold">
				{lastAction === 'assign' ? 'Bulk Assign' : 'Bulk Reclaim'} Results
			</h2>
		</CardHeader>
		<CardContent>
			<div class="flex gap-6 mb-4">
				<div class="flex items-center gap-2">
					<span
						class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 text-sm font-semibold"
					>
						{bulkResult.success_count}
					</span>
					<span class="text-sm text-muted-foreground">Succeeded</span>
				</div>
				<div class="flex items-center gap-2">
					<span
						class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 text-sm font-semibold"
					>
						{bulkResult.failure_count}
					</span>
					<span class="text-sm text-muted-foreground">Failed</span>
				</div>
			</div>

			{#if bulkResult.failures.length > 0}
				<div class="rounded-md border">
					<table class="w-full text-sm">
						<thead>
							<tr class="border-b bg-muted/50">
								<th class="px-4 py-2 text-left font-medium">Item ID</th>
								<th class="px-4 py-2 text-left font-medium">Error</th>
							</tr>
						</thead>
						<tbody>
							{#each bulkResult.failures as failure}
								<tr class="border-b last:border-b-0">
									<td class="px-4 py-2 font-mono text-xs">{failure.item_id}</td>
									<td class="px-4 py-2 text-destructive">{failure.error}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}

			<div class="mt-4">
				<Button
					variant="outline"
					onclick={() => {
						bulkResult = null;
						lastAction = null;
					}}>Dismiss</Button
				>
			</div>
		</CardContent>
	</Card>
{/if}

<div class="grid gap-6 lg:grid-cols-2">
	<!-- Bulk Assign Section -->
	<Card>
		<CardHeader>
			<h2 class="text-xl font-semibold">Bulk Assign</h2>
			<p class="text-sm text-muted-foreground">
				Assign licenses from a pool to multiple users at once
			</p>
		</CardHeader>
		<CardContent>
			{#if $assignMessage}
				<Alert variant="destructive" class="mb-4">
					<AlertDescription>{$assignMessage}</AlertDescription>
				</Alert>
			{/if}

			<form method="POST" action="?/bulkAssign" use:assignEnhance class="space-y-4">
				<div class="space-y-2">
					<Label for="assign-pool">License Pool</Label>
					<select
						id="assign-pool"
						name="license_pool_id"
						class={selectClasses}
						value={String($assignForm.license_pool_id ?? '')}
					>
						<option value="">Select a pool</option>
						{#each data.pools as pool}
							<option value={pool.id}
								>{pool.name} ({pool.vendor}) - {pool.available_count} available</option
							>
						{/each}
					</select>
					{#if $assignErrors.license_pool_id}
						<p class="text-sm text-destructive">{$assignErrors.license_pool_id}</p>
					{/if}
				</div>

				<div class="space-y-2">
					<Label for="assign-user-ids">User IDs (one per line)</Label>
					<textarea
						id="assign-user-ids"
						name="user_ids"
						class={textareaClasses}
						placeholder="Enter user UUIDs, one per line&#10;e.g.&#10;550e8400-e29b-41d4-a716-446655440000&#10;6ba7b810-9dad-11d1-80b4-00c04fd430c8"
						value={String($assignForm.user_ids ?? '')}
					></textarea>
					{#if $assignErrors.user_ids}
						<p class="text-sm text-destructive">{$assignErrors.user_ids}</p>
					{/if}
				</div>

				<div class="space-y-2">
					<Label for="assign-source">Source</Label>
					<select
						id="assign-source"
						name="source"
						class={selectClasses}
						value={String($assignForm.source ?? 'manual')}
					>
						<option value="manual">Manual</option>
						<option value="automatic">Automatic</option>
						<option value="entitlement">Entitlement</option>
					</select>
					{#if $assignErrors.source}
						<p class="text-sm text-destructive">{$assignErrors.source}</p>
					{/if}
				</div>

				<div class="flex gap-2 pt-2">
					<Button type="submit">Bulk Assign</Button>
				</div>
			</form>
		</CardContent>
	</Card>

	<!-- Bulk Reclaim Section -->
	<Card>
		<CardHeader>
			<h2 class="text-xl font-semibold">Bulk Reclaim</h2>
			<p class="text-sm text-muted-foreground">
				Reclaim multiple license assignments at once
			</p>
		</CardHeader>
		<CardContent>
			{#if $reclaimMessage}
				<Alert variant="destructive" class="mb-4">
					<AlertDescription>{$reclaimMessage}</AlertDescription>
				</Alert>
			{/if}

			<form method="POST" action="?/bulkReclaim" use:reclaimEnhance class="space-y-4">
				<div class="space-y-2">
					<Label for="reclaim-pool">License Pool</Label>
					<select
						id="reclaim-pool"
						name="license_pool_id"
						class={selectClasses}
						value={String($reclaimForm.license_pool_id ?? '')}
					>
						<option value="">Select a pool</option>
						{#each data.pools as pool}
							<option value={pool.id}>{pool.name} ({pool.vendor})</option>
						{/each}
					</select>
					{#if $reclaimErrors.license_pool_id}
						<p class="text-sm text-destructive">{$reclaimErrors.license_pool_id}</p>
					{/if}
				</div>

				<div class="space-y-2">
					<Label for="reclaim-assignment-ids">Assignment IDs (one per line)</Label>
					<textarea
						id="reclaim-assignment-ids"
						name="assignment_ids"
						class={textareaClasses}
						placeholder="Enter assignment UUIDs, one per line&#10;e.g.&#10;550e8400-e29b-41d4-a716-446655440000&#10;6ba7b810-9dad-11d1-80b4-00c04fd430c8"
						value={String($reclaimForm.assignment_ids ?? '')}
					></textarea>
					{#if $reclaimErrors.assignment_ids}
						<p class="text-sm text-destructive">{$reclaimErrors.assignment_ids}</p>
					{/if}
				</div>

				<div class="space-y-2">
					<Label for="reclaim-reason">Reason</Label>
					<textarea
						id="reclaim-reason"
						name="reason"
						class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
						placeholder="Enter reason for reclaiming these licenses"
						value={String($reclaimForm.reason ?? '')}
					></textarea>
					{#if $reclaimErrors.reason}
						<p class="text-sm text-destructive">{$reclaimErrors.reason}</p>
					{/if}
				</div>

				<div class="flex gap-2 pt-2">
					<Button type="submit">Bulk Reclaim</Button>
				</div>
			</form>
		</CardContent>
	</Card>
</div>

<div class="mt-6">
	<a
		href="/governance/licenses?tab=assignments"
		class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
	>
		Back to Assignments
	</a>
</div>
