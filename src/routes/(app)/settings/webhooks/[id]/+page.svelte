<script lang="ts">
	import { Card, CardHeader, CardContent } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Separator } from '$lib/components/ui/separator';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import { enhance as formEnhance } from '$app/forms';
	import { goto, invalidateAll } from '$app/navigation';
	import { addToast } from '$lib/stores/toast.svelte';
	import type { WebhookSubscription } from '$lib/api/types';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let showDeleteDialog = $state(false);

	const sub = $derived(data.subscription);
	const deliveries = $derived(data.deliveries);
	const deliveryTotal = $derived(data.deliveryTotal);
	const deliveryLimit = $derived(data.deliveryLimit);
	const deliveryOffset = $derived(data.deliveryOffset);
	const deliveryPageCount = $derived(Math.ceil(deliveryTotal / deliveryLimit));
	const deliveryCurrentPage = $derived(Math.floor(deliveryOffset / deliveryLimit));

	function statusBadgeColor(s: WebhookSubscription): string {
		if (!s.enabled) {
			return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
		}
		if (s.consecutive_failures > 0) {
			return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
		}
		return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
	}

	function statusLabel(s: WebhookSubscription): string {
		if (!s.enabled) return 'Paused';
		if (s.consecutive_failures > 0) return 'Failing';
		return 'Active';
	}

	function deliveryStatusBadgeColor(status: string): string {
		switch (status) {
			case 'success':
			case 'delivered':
				return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
			case 'failed':
			case 'error':
				return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
			case 'pending':
				return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
			default:
				return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
		}
	}

	function formatDate(dateStr: string): string {
		return new Date(dateStr).toLocaleString();
	}

	function goToDeliveryPage(page: number) {
		const params = new URLSearchParams();
		params.set('dlimit', String(deliveryLimit));
		params.set('doffset', String(page * deliveryLimit));
		goto(`/settings/webhooks/${sub.id}?${params}`);
	}
</script>

<!-- Header -->
<div class="flex items-center justify-between">
	<div class="flex items-center gap-3">
		<PageHeader title={sub.name} description="Webhook subscription details" />
		<span
			class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {statusBadgeColor(sub)}"
		>
			{statusLabel(sub)}
		</span>
	</div>
	<div class="flex items-center gap-2">
		<a
			href="/settings/webhooks/{sub.id}/edit"
			class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
		>
			Edit
		</a>
		{#if sub.enabled}
			<form
				method="POST"
				action="?/pause"
				use:formEnhance={() => {
					return async ({ result }) => {
						if (result.type === 'success') {
							addToast('success', 'Webhook subscription paused');
							await invalidateAll();
						} else if (result.type === 'failure') {
							addToast('error', (result.data?.error as string) || 'Failed to pause');
						}
					};
				}}
			>
				<Button type="submit" variant="outline">Pause</Button>
			</form>
		{:else}
			<form
				method="POST"
				action="?/resume"
				use:formEnhance={() => {
					return async ({ result }) => {
						if (result.type === 'success') {
							addToast('success', 'Webhook subscription resumed');
							await invalidateAll();
						} else if (result.type === 'failure') {
							addToast('error', (result.data?.error as string) || 'Failed to resume');
						}
					};
				}}
			>
				<Button type="submit" variant="outline">Resume</Button>
			</form>
		{/if}
		<Button
			variant="destructive"
			onclick={() => {
				showDeleteDialog = true;
			}}
		>
			Delete
		</Button>
		<a
			href="/settings/webhooks"
			class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
		>
			Back to Webhooks
		</a>
	</div>
</div>

<!-- Subscription Info Card -->
<Card class="mt-4 max-w-2xl">
	<CardHeader>
		<h2 class="text-xl font-semibold">Subscription information</h2>
	</CardHeader>
	<CardContent class="space-y-4">
		<div class="grid gap-3">
			<div class="flex justify-between">
				<span class="text-sm text-muted-foreground">Name</span>
				<span class="text-sm font-medium">{sub.name}</span>
			</div>
			<div class="flex justify-between">
				<span class="text-sm text-muted-foreground">URL</span>
				<span class="max-w-[300px] truncate text-sm font-mono">{sub.url}</span>
			</div>
			<div class="flex justify-between">
				<span class="text-sm text-muted-foreground">Description</span>
				<span class="text-sm">{sub.description ?? 'No description'}</span>
			</div>
			<div class="flex justify-between">
				<span class="text-sm text-muted-foreground">Status</span>
				<span
					class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {statusBadgeColor(sub)}"
				>
					{statusLabel(sub)}
				</span>
			</div>
			{#if sub.consecutive_failures > 0}
				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Consecutive Failures</span>
					<span class="text-sm font-medium text-destructive">{sub.consecutive_failures}</span>
				</div>
			{/if}

			<Separator />

			<div class="space-y-2">
				<span class="text-sm text-muted-foreground">Event Types</span>
				<div class="flex flex-wrap gap-1.5">
					{#each sub.event_types as et}
						<Badge variant="secondary">{et}</Badge>
					{/each}
				</div>
			</div>

			<Separator />

			<div class="flex justify-between">
				<span class="text-sm text-muted-foreground">Created</span>
				<span class="text-sm">{formatDate(sub.created_at)}</span>
			</div>
			<div class="flex justify-between">
				<span class="text-sm text-muted-foreground">Updated</span>
				<span class="text-sm">{formatDate(sub.updated_at)}</span>
			</div>
		</div>
	</CardContent>
</Card>

<!-- Delivery History -->
<Card class="mt-6 max-w-4xl">
	<CardHeader>
		<div class="flex items-center justify-between">
			<h2 class="text-xl font-semibold">Delivery History</h2>
			<a
				href="/settings/webhooks/dlq"
				class="text-sm font-medium text-primary hover:underline"
			>
				View Dead Letter Queue
			</a>
		</div>
	</CardHeader>
	<CardContent>
		{#if deliveries.length === 0}
			<p class="py-4 text-center text-sm text-muted-foreground">No deliveries yet.</p>
		{:else}
			<div class="rounded-md border">
				<table class="w-full text-sm">
					<thead>
						<tr class="border-b bg-muted/50">
							<th class="px-4 py-3 text-left font-medium text-muted-foreground">Event Type</th>
							<th class="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
							<th class="px-4 py-3 text-left font-medium text-muted-foreground">Response Code</th>
							<th class="px-4 py-3 text-left font-medium text-muted-foreground">Latency</th>
							<th class="px-4 py-3 text-left font-medium text-muted-foreground">Created</th>
						</tr>
					</thead>
					<tbody>
						{#each deliveries as delivery}
							<tr class="border-b transition-colors hover:bg-muted/50">
								<td class="px-4 py-3 font-medium">{delivery.event_type}</td>
								<td class="px-4 py-3">
									<span
										class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {deliveryStatusBadgeColor(delivery.status)}"
									>
										{delivery.status}
									</span>
								</td>
								<td class="px-4 py-3 text-muted-foreground">
									{delivery.response_code ?? '---'}
								</td>
								<td class="px-4 py-3 text-muted-foreground">
									{delivery.latency_ms != null ? `${delivery.latency_ms}ms` : '---'}
								</td>
								<td class="px-4 py-3 text-muted-foreground">
									{formatDate(delivery.created_at)}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>

			{#if deliveryPageCount > 1}
				<div class="mt-4 flex items-center justify-between">
					<p class="text-sm text-muted-foreground">
						Showing {deliveryOffset + 1}&ndash;{Math.min(deliveryOffset + deliveryLimit, deliveryTotal)}
						of {deliveryTotal} deliveries
					</p>
					<div class="flex gap-2">
						<Button
							variant="outline"
							size="sm"
							disabled={deliveryCurrentPage === 0}
							onclick={() => goToDeliveryPage(deliveryCurrentPage - 1)}
						>
							Previous
						</Button>
						<Button
							variant="outline"
							size="sm"
							disabled={deliveryCurrentPage >= deliveryPageCount - 1}
							onclick={() => goToDeliveryPage(deliveryCurrentPage + 1)}
						>
							Next
						</Button>
					</div>
				</div>
			{/if}
		{/if}
	</CardContent>
</Card>

<!-- Delete Confirmation Dialog -->
<Dialog.Root bind:open={showDeleteDialog}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Delete Webhook Subscription</Dialog.Title>
			<Dialog.Description>
				Are you sure you want to delete "{sub.name}"? This action cannot be undone. All delivery
				history will also be removed.
			</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer>
			<Button
				variant="outline"
				onclick={() => {
					showDeleteDialog = false;
				}}>Cancel</Button
			>
			<form
				method="POST"
				action="?/delete"
				use:formEnhance={() => {
					return async ({ result, update }) => {
						if (result.type === 'redirect') {
							addToast('success', 'Webhook subscription deleted');
							await update();
						} else if (result.type === 'failure') {
							addToast('error', (result.data?.error as string) || 'Failed to delete');
							showDeleteDialog = false;
						}
					};
				}}
			>
				<Button type="submit" variant="destructive">Delete</Button>
			</form>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
