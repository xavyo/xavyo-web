<script lang="ts">
	import type { NhiStalenessEntry, AutoSuspendResult, OrphanDetectionItem, OrphanDetectionListResponse } from '$lib/api/types';
	import { triggerAutoSuspend, grantGracePeriodClient, fetchOrphanDetections } from '$lib/api/nhi-governance-client';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { EmptyState } from '$lib/components/ui/empty-state';
	import { Tabs, TabsList, TabsTrigger, TabsContent } from '$lib/components/ui/tabs';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Separator } from '$lib/components/ui/separator';
	import { addToast } from '$lib/stores/toast.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let entries = $derived((data.entries ?? []) as NhiStalenessEntry[]);
	let total = $derived(data.total as number);

	// Auto-suspend state
	let suspending = $state(false);
	let suspendResult = $state<AutoSuspendResult | null>(null);
	let suspendResultOpen = $state(false);

	// Grace period dialog state
	let graceDialogOpen = $state(false);
	let graceEntryId = $state('');
	let graceEntryName = $state('');
	let graceDays = $state('30');
	let graceSubmitting = $state(false);

	// Orphans tab state
	let orphans = $state<OrphanDetectionItem[]>([]);
	let orphansTotal = $state(0);
	let orphansLoaded = $state(false);
	let orphansLoading = $state(false);

	async function handleAutoSuspend() {
		suspending = true;
		try {
			const result = await triggerAutoSuspend();
			suspendResult = result;
			const count = result.suspended.length;
			const failCount = result.failed.length;
			if (count > 0 && failCount === 0) {
				addToast('success', `Auto-suspended ${count} stale NHI entit${count === 1 ? 'y' : 'ies'}`);
			} else if (count > 0 && failCount > 0) {
				addToast('info', `Suspended ${count}, failed ${failCount} -- see details`);
				suspendResultOpen = true;
			} else if (count === 0 && failCount > 0) {
				addToast('error', `All ${failCount} suspension${failCount === 1 ? '' : 's'} failed`);
				suspendResultOpen = true;
			} else {
				addToast('info', 'No stale entities eligible for auto-suspension');
			}
		} catch (err) {
			addToast('error', err instanceof Error ? err.message : 'Auto-suspend failed');
		} finally {
			suspending = false;
		}
	}

	function openGraceDialog(entry: NhiStalenessEntry) {
		graceEntryId = entry.id;
		graceEntryName = entry.name;
		graceDays = '30';
		graceDialogOpen = true;
	}

	async function handleGracePeriod() {
		const days = parseInt(graceDays, 10);
		if (isNaN(days) || days < 1 || days > 365) {
			addToast('error', 'Grace period must be between 1 and 365 days');
			return;
		}
		graceSubmitting = true;
		try {
			await grantGracePeriodClient(graceEntryId, days);
			addToast('success', `Granted ${days}-day grace period to "${graceEntryName}"`);
			graceDialogOpen = false;
		} catch (err) {
			addToast('error', err instanceof Error ? err.message : 'Failed to grant grace period');
		} finally {
			graceSubmitting = false;
		}
	}

	async function loadOrphans() {
		orphansLoading = true;
		try {
			const result: OrphanDetectionListResponse = await fetchOrphanDetections();
			orphans = result.items;
			orphansTotal = result.total;
			orphansLoaded = true;
		} catch (err) {
			addToast('error', err instanceof Error ? err.message : 'Failed to load orphan detections');
		} finally {
			orphansLoading = false;
		}
	}

	function truncateId(id: string, length = 12): string {
		if (id.length <= length) return id;
		return id.slice(0, length) + '...';
	}
</script>

<PageHeader title="NHI Staleness & Orphans" description="Monitor inactive and orphaned NHI entities">
	<a href="/nhi" class="text-sm text-muted-foreground hover:text-foreground">&larr; Back to NHI</a>
</PageHeader>

<Tabs value="staleness">
	<TabsList>
		<TabsTrigger value="staleness">Staleness</TabsTrigger>
		<TabsTrigger value="orphans">Orphans</TabsTrigger>
	</TabsList>

	<!-- Staleness Tab -->
	<TabsContent value="staleness">
		<div class="mt-4 flex items-center justify-between">
			<p class="text-sm text-muted-foreground">{total} stale entit{total === 1 ? 'y' : 'ies'}</p>
			<Button variant="destructive" size="sm" disabled={suspending} onclick={handleAutoSuspend}>
				{suspending ? 'Suspending...' : 'Auto-Suspend Stale'}
			</Button>
		</div>

		<Separator class="my-4" />

		{#if entries.length === 0}
			<EmptyState title="No stale entities" description="All NHI entities have recent activity." />
		{:else}
			<div class="rounded-md border">
				<table class="w-full text-sm">
					<thead>
						<tr class="border-b bg-muted/50">
							<th class="px-4 py-3 text-left font-medium">Name</th>
							<th class="px-4 py-3 text-left font-medium">Type</th>
							<th class="px-4 py-3 text-left font-medium">State</th>
							<th class="px-4 py-3 text-left font-medium">Last Activity</th>
							<th class="px-4 py-3 text-left font-medium">Days Inactive</th>
							<th class="px-4 py-3 text-right font-medium">Actions</th>
						</tr>
					</thead>
					<tbody>
						{#each entries as entry}
							<tr class="border-b transition-colors hover:bg-muted/50">
								<td class="px-4 py-3 font-medium">{entry.name}</td>
								<td class="px-4 py-3">{entry.nhi_type}</td>
								<td class="px-4 py-3"><Badge variant="outline">{entry.state}</Badge></td>
								<td class="px-4 py-3 text-muted-foreground">{entry.last_activity_at ? new Date(entry.last_activity_at).toLocaleDateString() : 'Never'}</td>
								<td class="px-4 py-3">
									<Badge class={entry.days_inactive > 90 ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : entry.days_inactive > 30 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'}>
										{entry.days_inactive} days
									</Badge>
								</td>
								<td class="px-4 py-3 text-right">
									<Button variant="outline" size="sm" onclick={() => openGraceDialog(entry)}>
										Grace Period
									</Button>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</TabsContent>

	<!-- Orphans Tab -->
	<TabsContent value="orphans">
		<div class="mt-4 flex items-center justify-between">
			<p class="text-sm text-muted-foreground">
				{#if orphansLoaded}
					{orphansTotal} orphan{orphansTotal === 1 ? '' : 's'} detected
				{:else}
					Click detect to scan for orphaned NHI entities
				{/if}
			</p>
			<Button variant="outline" size="sm" disabled={orphansLoading} onclick={loadOrphans}>
				{orphansLoading ? 'Detecting...' : 'Detect Orphans'}
			</Button>
		</div>

		<Separator class="my-4" />

		{#if !orphansLoaded && !orphansLoading}
			<EmptyState
				title="No scan performed"
				description="Click 'Detect Orphans' to scan for NHI entities without an active owner."
			/>
		{:else if orphansLoading}
			<div class="flex h-48 items-center justify-center">
				<p class="text-sm text-muted-foreground">Scanning for orphaned entities...</p>
			</div>
		{:else if orphans.length === 0}
			<EmptyState title="No orphans found" description="All NHI entities have active owners." />
		{:else}
			<div class="rounded-md border">
				<table class="w-full text-sm">
					<thead>
						<tr class="border-b bg-muted/50">
							<th class="px-4 py-3 text-left font-medium">ID</th>
							<th class="px-4 py-3 text-left font-medium">Reason</th>
							<th class="px-4 py-3 text-left font-medium">Status</th>
							<th class="px-4 py-3 text-left font-medium">Days Inactive</th>
							<th class="px-4 py-3 text-left font-medium">Detected At</th>
						</tr>
					</thead>
					<tbody>
						{#each orphans as orphan}
							<tr class="border-b transition-colors hover:bg-muted/50">
								<td class="px-4 py-3 font-mono text-xs" title={orphan.id}>
									{truncateId(orphan.id)}
								</td>
								<td class="px-4 py-3">{orphan.detection_reason}</td>
								<td class="px-4 py-3">
									<Badge variant={orphan.status === 'resolved' ? 'default' : 'outline'}>
										{orphan.status}
									</Badge>
								</td>
								<td class="px-4 py-3">
									{#if orphan.days_inactive !== null}
										<Badge class={orphan.days_inactive > 90 ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : orphan.days_inactive > 30 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'}>
											{orphan.days_inactive} days
										</Badge>
									{:else}
										<span class="text-muted-foreground">N/A</span>
									{/if}
								</td>
								<td class="px-4 py-3 text-muted-foreground">
									{new Date(orphan.detected_at).toLocaleString()}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</TabsContent>
</Tabs>

<!-- Grace Period Dialog -->
<Dialog.Root bind:open={graceDialogOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Grant Grace Period</Dialog.Title>
			<Dialog.Description>
				Set a grace period for <strong>{graceEntryName}</strong> to prevent auto-suspension.
			</Dialog.Description>
		</Dialog.Header>
		<div class="grid gap-4 py-4">
			<div class="grid gap-2">
				<Label for="grace-days">Grace period (days)</Label>
				<Input
					id="grace-days"
					type="number"
					min="1"
					max="365"
					bind:value={graceDays}
					placeholder="30"
				/>
				<p class="text-xs text-muted-foreground">Enter a value between 1 and 365 days.</p>
			</div>
		</div>
		<Dialog.Footer>
			<Button variant="outline" type="button" onclick={() => (graceDialogOpen = false)}>Cancel</Button>
			<Button type="button" disabled={graceSubmitting} onclick={handleGracePeriod}>
				{graceSubmitting ? 'Granting...' : 'Grant Grace Period'}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<!-- Auto-Suspend Results Dialog -->
<Dialog.Root bind:open={suspendResultOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Auto-Suspend Results</Dialog.Title>
			<Dialog.Description>
				Summary of the auto-suspension operation.
			</Dialog.Description>
		</Dialog.Header>
		{#if suspendResult}
			<div class="space-y-4 py-4">
				{#if suspendResult.suspended.length > 0}
					<div>
						<p class="text-sm font-medium text-green-700 dark:text-green-400">
							Suspended ({suspendResult.suspended.length})
						</p>
						<ul class="mt-1 space-y-1">
							{#each suspendResult.suspended as id}
								<li class="font-mono text-xs text-muted-foreground" title={id}>{truncateId(id, 24)}</li>
							{/each}
						</ul>
					</div>
				{/if}
				{#if suspendResult.failed.length > 0}
					<div>
						<p class="text-sm font-medium text-red-700 dark:text-red-400">
							Failed ({suspendResult.failed.length})
						</p>
						<ul class="mt-1 space-y-1">
							{#each suspendResult.failed as failure}
								<li class="text-xs">
									<span class="font-mono text-muted-foreground" title={failure.id}>{truncateId(failure.id, 24)}</span>
									<span class="ml-2 text-red-600 dark:text-red-400">{failure.error}</span>
								</li>
							{/each}
						</ul>
					</div>
				{/if}
			</div>
		{/if}
		<Dialog.Footer>
			<Button variant="outline" type="button" onclick={() => (suspendResultOpen = false)}>Close</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
