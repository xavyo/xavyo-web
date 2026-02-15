<script lang="ts">
	import type { NhiDelegationGrant } from '$lib/api/types';
	import {
		fetchIncomingDelegations,
		fetchOutgoingDelegations,
		revokeDelegationGrantClient
	} from '$lib/api/nhi-delegations-client';
	import { Card, CardHeader, CardContent } from '$lib/components/ui/card';
	import Button from '$lib/components/ui/button/button.svelte';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import DelegationStatusBadge from './delegation-status-badge.svelte';

	interface Props {
		nhiId: string;
	}

	let { nhiId }: Props = $props();

	const PAGE_SIZE = 20;

	// --- Incoming state ---
	let incoming = $state<NhiDelegationGrant[]>([]);
	let incomingLoading = $state(true);
	let incomingError = $state<string | null>(null);
	let incomingHasMore = $state(false);
	let incomingLoadingMore = $state(false);

	// --- Outgoing state ---
	let outgoing = $state<NhiDelegationGrant[]>([]);
	let outgoingLoading = $state(true);
	let outgoingError = $state<string | null>(null);
	let outgoingHasMore = $state(false);
	let outgoingLoadingMore = $state(false);

	// --- Revoke state ---
	let revokeDialogOpen = $state(false);
	let revokeTarget = $state<{ id: string; label: string } | null>(null);
	let isRevoking = $state(false);
	let revokeError = $state<string | null>(null);

	// --- Load data reactively when nhiId changes ---
	$effect(() => {
		const id = nhiId;
		loadIncoming(id);
		loadOutgoing(id);
	});

	async function loadIncoming(id: string) {
		incomingLoading = true;
		incomingError = null;
		try {
			const res = await fetchIncomingDelegations(id, { limit: PAGE_SIZE, offset: 0 });
			incoming = res.data;
			incomingHasMore = res.data.length >= PAGE_SIZE;
		} catch (err: unknown) {
			incomingError = err instanceof Error ? err.message : 'Failed to load incoming delegations';
		} finally {
			incomingLoading = false;
		}
	}

	async function loadMoreIncoming() {
		incomingLoadingMore = true;
		try {
			const res = await fetchIncomingDelegations(nhiId, { limit: PAGE_SIZE, offset: incoming.length });
			incoming = [...incoming, ...res.data];
			incomingHasMore = res.data.length >= PAGE_SIZE;
		} catch (err: unknown) {
			incomingError = err instanceof Error ? err.message : 'Failed to load more';
		} finally {
			incomingLoadingMore = false;
		}
	}

	async function loadOutgoing(id: string) {
		outgoingLoading = true;
		outgoingError = null;
		try {
			const res = await fetchOutgoingDelegations(id, { limit: PAGE_SIZE, offset: 0 });
			outgoing = res.data;
			outgoingHasMore = res.data.length >= PAGE_SIZE;
		} catch (err: unknown) {
			outgoingError = err instanceof Error ? err.message : 'Failed to load outgoing delegations';
		} finally {
			outgoingLoading = false;
		}
	}

	async function loadMoreOutgoing() {
		outgoingLoadingMore = true;
		try {
			const res = await fetchOutgoingDelegations(nhiId, { limit: PAGE_SIZE, offset: outgoing.length });
			outgoing = [...outgoing, ...res.data];
			outgoingHasMore = res.data.length >= PAGE_SIZE;
		} catch (err: unknown) {
			outgoingError = err instanceof Error ? err.message : 'Failed to load more';
		} finally {
			outgoingLoadingMore = false;
		}
	}

	function confirmRevoke(id: string, label: string) {
		revokeTarget = { id, label };
		revokeError = null;
		revokeDialogOpen = true;
	}

	async function handleRevoke() {
		if (!revokeTarget) return;
		isRevoking = true;
		revokeError = null;
		try {
			await revokeDelegationGrantClient(revokeTarget.id);
			revokeDialogOpen = false;
			revokeTarget = null;
			const id = nhiId;
			await loadIncoming(id);
			await loadOutgoing(id);
		} catch (err: unknown) {
			revokeError = err instanceof Error ? err.message : 'Failed to revoke delegation';
		} finally {
			isRevoking = false;
		}
	}

	function formatDate(dateStr: string): string {
		return new Date(dateStr).toLocaleDateString(undefined, {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}
</script>

<div class="space-y-6">
	<!-- Incoming Delegations (NHI is the actor) -->
	<Card>
		<CardHeader>
			<h3 class="text-base font-semibold text-foreground">Incoming Delegations</h3>
			<p class="text-sm text-muted-foreground">Grants where this NHI acts on behalf of a principal</p>
		</CardHeader>
		<CardContent>
			{#if incomingLoading}
				<div class="animate-pulse space-y-2">
					<div class="h-8 rounded bg-muted"></div>
					<div class="h-8 rounded bg-muted"></div>
				</div>
			{:else if incomingError}
				<p class="text-sm text-destructive">{incomingError}</p>
			{:else if incoming.length === 0}
				<p class="text-sm text-muted-foreground">No incoming delegations</p>
			{:else}
				<div class="space-y-2">
					{#each incoming as grant}
						<div class="flex items-center justify-between rounded-md border border-border px-3 py-2">
							<div class="min-w-0">
								<div class="flex items-center gap-2">
									<p class="truncate text-sm font-medium text-foreground">
										Principal: {grant.principal_id}
									</p>
									<DelegationStatusBadge status={grant.status} />
								</div>
								<p class="text-xs text-muted-foreground">
									Scopes: {grant.allowed_scopes.length > 0 ? grant.allowed_scopes.join(', ') : 'All'}
									&middot; Granted: {formatDate(grant.granted_at)}
									{#if grant.expires_at}
										&middot; Expires: {formatDate(grant.expires_at)}
									{/if}
								</p>
							</div>
							{#if grant.status === 'active'}
								<Button
									variant="ghost"
									size="sm"
									class="text-destructive hover:text-destructive"
									onclick={() => confirmRevoke(grant.id, grant.principal_id)}
								>
									Revoke
								</Button>
							{/if}
						</div>
					{/each}
				</div>
				{#if incomingHasMore}
					<div class="mt-3 flex justify-center">
						<Button variant="outline" size="sm" onclick={loadMoreIncoming} disabled={incomingLoadingMore}>
							{incomingLoadingMore ? 'Loading...' : 'Load More'}
						</Button>
					</div>
				{/if}
			{/if}
		</CardContent>
	</Card>

	<Separator />

	<!-- Outgoing Delegations (NHI is the principal) -->
	<Card>
		<CardHeader>
			<h3 class="text-base font-semibold text-foreground">Outgoing Delegations</h3>
			<p class="text-sm text-muted-foreground">Grants where this NHI delegates to another NHI</p>
		</CardHeader>
		<CardContent>
			{#if outgoingLoading}
				<div class="animate-pulse space-y-2">
					<div class="h-8 rounded bg-muted"></div>
					<div class="h-8 rounded bg-muted"></div>
				</div>
			{:else if outgoingError}
				<p class="text-sm text-destructive">{outgoingError}</p>
			{:else if outgoing.length === 0}
				<p class="text-sm text-muted-foreground">No outgoing delegations</p>
			{:else}
				<div class="space-y-2">
					{#each outgoing as grant}
						<div class="flex items-center justify-between rounded-md border border-border px-3 py-2">
							<div class="min-w-0">
								<div class="flex items-center gap-2">
									<p class="truncate text-sm font-medium text-foreground">
										Actor: {grant.actor_nhi_id}
									</p>
									<DelegationStatusBadge status={grant.status} />
								</div>
								<p class="text-xs text-muted-foreground">
									Scopes: {grant.allowed_scopes.length > 0 ? grant.allowed_scopes.join(', ') : 'All'}
									&middot; Granted: {formatDate(grant.granted_at)}
									{#if grant.expires_at}
										&middot; Expires: {formatDate(grant.expires_at)}
									{/if}
								</p>
							</div>
							{#if grant.status === 'active'}
								<Button
									variant="ghost"
									size="sm"
									class="text-destructive hover:text-destructive"
									onclick={() => confirmRevoke(grant.id, grant.actor_nhi_id)}
								>
									Revoke
								</Button>
							{/if}
						</div>
					{/each}
				</div>
				{#if outgoingHasMore}
					<div class="mt-3 flex justify-center">
						<Button variant="outline" size="sm" onclick={loadMoreOutgoing} disabled={outgoingLoadingMore}>
							{outgoingLoadingMore ? 'Loading...' : 'Load More'}
						</Button>
					</div>
				{/if}
			{/if}
		</CardContent>
	</Card>
</div>

<!-- Revoke Confirmation Dialog -->
<Dialog.Root bind:open={revokeDialogOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Confirm Revoke</Dialog.Title>
			<Dialog.Description>
				{#if revokeTarget}
					Are you sure you want to revoke this delegation grant for
					<code class="rounded bg-muted px-1 text-xs">{revokeTarget.label}</code>?
					This action cannot be undone.
				{/if}
			</Dialog.Description>
		</Dialog.Header>
		{#if revokeError}
			<p class="text-sm text-destructive">{revokeError}</p>
		{/if}
		<Dialog.Footer>
			<Button
				variant="outline"
				onclick={() => {
					revokeDialogOpen = false;
					revokeTarget = null;
					revokeError = null;
				}}
				disabled={isRevoking}
			>
				Cancel
			</Button>
			<Button variant="destructive" onclick={handleRevoke} disabled={isRevoking}>
				{isRevoking ? 'Revoking...' : 'Revoke'}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
