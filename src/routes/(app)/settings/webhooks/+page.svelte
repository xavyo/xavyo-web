<script lang="ts">
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import { Button } from '$lib/components/ui/button';
	import { EmptyState } from '$lib/components/ui/empty-state';
	import type { WebhookSubscription } from '$lib/api/types';

	let { data }: { data: PageData } = $props();

	const limit = $derived(data.limit);
	const total = $derived(data.total);
	const offset = $derived(data.offset);
	const pageCount = $derived(Math.ceil(total / limit));
	const currentPage = $derived(Math.floor(offset / limit));

	function buildUrl(newOffset: number): string {
		const params = new URLSearchParams();
		params.set('limit', String(limit));
		params.set('offset', String(newOffset));
		return `/settings/webhooks?${params}`;
	}

	function goToPage(page: number) {
		goto(buildUrl(page * limit));
	}

	function statusBadgeColor(sub: WebhookSubscription): string {
		if (!sub.enabled) {
			return 'bg-warning/15 text-warning';
		}
		if (sub.consecutive_failures > 0) {
			return 'bg-destructive/15 text-destructive';
		}
		return 'bg-success/15 text-success';
	}

	function statusLabel(sub: WebhookSubscription): string {
		if (!sub.enabled) return 'Paused';
		if (sub.consecutive_failures > 0) return 'Failing';
		return 'Active';
	}

	function formatDate(dateStr: string): string {
		return new Date(dateStr).toLocaleDateString();
	}
</script>

<PageHeader title="Webhooks" description="Manage webhook subscriptions for event notifications">
	<a
		href="/settings/webhooks/create"
		class="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
	>
		Create Subscription
	</a>
</PageHeader>

{#if data.subscriptions.length === 0}
	<EmptyState
		title="No webhook subscriptions yet"
		description="Create a webhook subscription to receive event notifications."
		actionLabel="Create Subscription"
		actionHref="/settings/webhooks/create"
	/>
{:else}
	<div class="overflow-x-auto rounded-lg border border-border/80 bg-card shadow-xs">
		<table class="w-full text-sm">
			<thead>
				<tr class="border-b bg-muted/50">
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">URL</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Event Types</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Created</th>
				</tr>
			</thead>
			<tbody>
				{#each data.subscriptions as sub}
					<tr
						class="cursor-pointer border-b transition-colors hover:bg-muted/50"
						onclick={() => goto(`/settings/webhooks/${sub.id}`)}
					>
						<td class="px-4 py-3 font-medium">
							<a
								href="/settings/webhooks/{sub.id}"
								class="text-primary hover:underline"
								onclick={(e) => e.stopPropagation()}
							>
								{sub.name}
							</a>
						</td>
						<td class="max-w-[200px] truncate px-4 py-3 text-muted-foreground">
							{sub.url}
						</td>
						<td class="px-4 py-3">
							<span
								class="inline-flex items-center rounded-full bg-info/15 px-2.5 py-0.5 text-xs font-medium text-info "
							>
								{sub.event_types.length} event{sub.event_types.length !== 1 ? 's' : ''}
							</span>
						</td>
						<td class="px-4 py-3">
							<span
								class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {statusBadgeColor(sub)}"
							>
								{statusLabel(sub)}
							</span>
						</td>
						<td class="px-4 py-3 text-muted-foreground">
							{formatDate(sub.created_at)}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	{#if pageCount > 1}
		<div class="mt-4 flex items-center justify-between">
			<p class="text-sm text-muted-foreground">
				Showing {offset + 1}&ndash;{Math.min(offset + limit, total)} of {total} subscriptions
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
