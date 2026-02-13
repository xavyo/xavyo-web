<script lang="ts">
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { EmptyState } from '$lib/components/ui/empty-state';
	import { addToast } from '$lib/stores/toast.svelte';
	import PoaStatusBadge from '$lib/components/poa/poa-status-badge.svelte';
	import { listPoaClient, adminListPoaClient, adminRevokePoaClient } from '$lib/api/power-of-attorney-client';
	import type { PoaGrant, PoaListResponse } from '$lib/api/types';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	function userName(id: string): string {
		return data.userNameMap?.[id] ?? id;
	}

	// Tab state
	let activeTab = $state<'my' | 'admin'>('my');
	let direction = $state<'outgoing' | 'incoming'>('outgoing');

	// My PoA data
	let myItems = $state<PoaGrant[]>(data.outgoing.items);
	let myTotal = $state(data.outgoing.total);
	let myLoading = $state(false);

	// Admin data
	let adminItems = $state<PoaGrant[]>([]);
	let adminTotal = $state(0);
	let adminLoading = $state(false);
	let adminStatusFilter = $state('');
	let adminLoaded = $state(false);

	// Revoke dialog
	let showRevokeDialog = $state(false);
	let revokeTargetId = $state('');
	let revokeReason = $state('');
	let revoking = $state(false);

	async function loadMyPoa() {
		myLoading = true;
		try {
			const result = await listPoaClient({ direction });
			myItems = result.items;
			myTotal = result.total;
		} catch (e) {
			addToast('error', 'Failed to load PoA grants');
		} finally {
			myLoading = false;
		}
	}

	async function loadAdminPoa() {
		adminLoading = true;
		try {
			const result = await adminListPoaClient({
				status: adminStatusFilter || undefined
			});
			adminItems = result.items;
			adminTotal = result.total;
			adminLoaded = true;
		} catch (e) {
			addToast('error', 'Failed to load admin PoA list');
		} finally {
			adminLoading = false;
		}
	}

	function switchDirection(dir: 'outgoing' | 'incoming') {
		direction = dir;
		loadMyPoa();
	}

	function switchToAdmin() {
		activeTab = 'admin';
		if (!adminLoaded) loadAdminPoa();
	}

	function openRevokeDialog(id: string) {
		revokeTargetId = id;
		revokeReason = '';
		showRevokeDialog = true;
	}

	async function confirmRevoke() {
		revoking = true;
		try {
			await adminRevokePoaClient(revokeTargetId, { reason: revokeReason || undefined });
			addToast('success', 'PoA revoked successfully');
			showRevokeDialog = false;
			loadAdminPoa();
		} catch {
			addToast('error', 'Failed to revoke PoA');
		} finally {
			revoking = false;
		}
	}

	function formatDate(iso: string): string {
		return new Date(iso).toLocaleDateString();
	}
</script>

<div class="flex items-center justify-between">
	<PageHeader title="Power of Attorney" description="Manage identity delegation grants" />
	<a
		href="/governance/power-of-attorney/grant"
		class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90"
	>
		Grant PoA
	</a>
</div>

<!-- Tabs -->
<div class="mt-4 flex gap-2 border-b border-border">
	<button
		class="px-4 py-2 text-sm font-medium transition-colors {activeTab === 'my' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}"
		onclick={() => (activeTab = 'my')}
	>
		My PoA
	</button>
	{#if data.isAdmin}
		<button
			class="px-4 py-2 text-sm font-medium transition-colors {activeTab === 'admin' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}"
			onclick={switchToAdmin}
		>
			Admin
		</button>
	{/if}
</div>

<!-- My PoA tab -->
{#if activeTab === 'my'}
	<div class="mt-4">
		<!-- Direction toggle -->
		<div class="mb-4 flex gap-2">
			<Button
				variant={direction === 'outgoing' ? 'default' : 'outline'}
				size="sm"
				onclick={() => switchDirection('outgoing')}
			>
				Outgoing ({direction === 'outgoing' ? myTotal : '...'})
			</Button>
			<Button
				variant={direction === 'incoming' ? 'default' : 'outline'}
				size="sm"
				onclick={() => switchDirection('incoming')}
			>
				Incoming ({direction === 'incoming' ? myTotal : '...'})
			</Button>
		</div>

		{#if myLoading}
			<div class="py-8 text-center text-muted-foreground">Loading...</div>
		{:else if myItems.length === 0}
			<EmptyState
				title="No PoA grants"
				description={direction === 'outgoing' ? "You haven't granted any Power of Attorney." : "No one has granted you Power of Attorney."}
			/>
		{:else}
			<div class="space-y-3">
				{#each myItems as poa}
					<a href="/governance/power-of-attorney/{poa.id}" class="block">
						<Card class="transition-colors hover:bg-muted/50">
							<CardContent class="flex items-center justify-between p-4">
								<div>
									<div class="flex items-center gap-2">
										<span class="font-medium">
											{direction === 'outgoing' ? `To: ${userName(poa.attorney_id)}` : `From: ${userName(poa.donor_id)}`}
										</span>
										<PoaStatusBadge status={poa.status} />
									</div>
									{#if poa.reason}
									<p class="mt-1 text-sm text-muted-foreground">{poa.reason}</p>
								{/if}
									<p class="mt-0.5 text-xs text-muted-foreground">
										{formatDate(poa.starts_at)} — {formatDate(poa.ends_at)}
									</p>
								</div>
							</CardContent>
						</Card>
					</a>
				{/each}
			</div>
		{/if}
	</div>
{/if}

<!-- Admin tab -->
{#if activeTab === 'admin'}
	<div class="mt-4">
		<!-- Status filter -->
		<div class="mb-4 flex items-center gap-2">
			<select
				class="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
				bind:value={adminStatusFilter}
				onchange={() => loadAdminPoa()}
			>
				<option value="">All statuses</option>
				<option value="pending">Pending</option>
				<option value="active">Active</option>
				<option value="expired">Expired</option>
				<option value="revoked">Revoked</option>
			</select>
			<span class="text-sm text-muted-foreground">{adminTotal} grant(s)</span>
		</div>

		{#if adminLoading}
			<div class="py-8 text-center text-muted-foreground">Loading...</div>
		{:else if adminItems.length === 0}
			<EmptyState title="No PoA grants" description="No Power of Attorney grants found." />
		{:else}
			<div class="space-y-3">
				{#each adminItems as poa}
					<Card>
						<CardContent class="flex items-center justify-between p-4">
							<a href="/governance/power-of-attorney/{poa.id}" class="flex-1">
								<div class="flex items-center gap-2">
									<span class="font-medium">Grantor: {userName(poa.donor_id)}</span>
									<span class="text-muted-foreground">→</span>
									<span class="font-medium">Grantee: {userName(poa.attorney_id)}</span>
									<PoaStatusBadge status={poa.status} />
								</div>
								{#if poa.reason}
									<p class="mt-1 text-sm text-muted-foreground">{poa.reason}</p>
								{/if}
								<p class="mt-0.5 text-xs text-muted-foreground">
									{formatDate(poa.starts_at)} — {formatDate(poa.ends_at)}
								</p>
							</a>
							{#if poa.status === 'active' || poa.status === 'pending'}
								<Button variant="destructive" size="sm" onclick={() => openRevokeDialog(poa.id)}>
									Force Revoke
								</Button>
							{/if}
						</CardContent>
					</Card>
				{/each}
			</div>
		{/if}
	</div>
{/if}

<!-- Admin Revoke Dialog -->
{#if showRevokeDialog}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" role="dialog">
		<Card class="w-full max-w-md">
			<CardHeader>
				<h2 class="text-lg font-semibold">Force Revoke PoA</h2>
			</CardHeader>
			<CardContent class="space-y-4">
				<div class="space-y-2">
					<label for="revoke-reason" class="text-sm font-medium">Reason (optional)</label>
					<textarea
						id="revoke-reason"
						class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
						bind:value={revokeReason}
						placeholder="Enter reason for revocation..."
					></textarea>
				</div>
				<div class="flex justify-end gap-2">
					<Button variant="outline" onclick={() => (showRevokeDialog = false)}>Cancel</Button>
					<Button variant="destructive" onclick={confirmRevoke} disabled={revoking}>
						{revoking ? 'Revoking...' : 'Revoke'}
					</Button>
				</div>
			</CardContent>
		</Card>
	</div>
{/if}
