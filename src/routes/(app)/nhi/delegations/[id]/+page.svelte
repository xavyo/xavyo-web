<script lang="ts">
	import type { NhiDelegationGrant } from '$lib/api/types';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import DelegationStatusBadge from '$lib/components/nhi/delegation-status-badge.svelte';
	import { Card, CardContent, CardHeader } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { addToast } from '$lib/stores/toast.svelte';
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let grant = $derived(data.grant as NhiDelegationGrant);
	let isAdmin = $derived(data.isAdmin as boolean);

	let showRevokeConfirm = $state(false);
</script>

<PageHeader title="Delegation Grant">
	<a href="/nhi/delegations" class="text-sm text-muted-foreground hover:text-foreground">&larr; Back to Delegations</a>
</PageHeader>

<div class="space-y-6">
	<Card>
		<CardHeader>
			<div class="flex items-center gap-3">
				<h2 class="text-xl font-semibold">Grant Details</h2>
				<DelegationStatusBadge status={grant.status} />
			</div>
		</CardHeader>
		<CardContent class="space-y-4">
			<div class="grid gap-4 sm:grid-cols-2">
				<div>
					<p class="text-sm text-muted-foreground">Grant ID</p>
					<p class="font-mono text-xs">{grant.id}</p>
				</div>
				<div>
					<p class="text-sm text-muted-foreground">Principal Type</p>
					<p class="font-medium">{grant.principal_type}</p>
				</div>
				<div>
					<p class="text-sm text-muted-foreground">Principal ID</p>
					<p class="font-mono text-xs">{grant.principal_id}</p>
				</div>
				<div>
					<p class="text-sm text-muted-foreground">Actor NHI ID</p>
					<p class="font-mono text-xs">{grant.actor_nhi_id}</p>
				</div>
				<div>
					<p class="text-sm text-muted-foreground">Max Delegation Depth</p>
					<p class="font-medium">{grant.max_delegation_depth}</p>
				</div>
				<div>
					<p class="text-sm text-muted-foreground">Granted At</p>
					<p>{new Date(grant.granted_at).toLocaleString()}</p>
				</div>
				<div>
					<p class="text-sm text-muted-foreground">Granted By</p>
					<p class="font-mono text-xs">{grant.granted_by}</p>
				</div>
				{#if grant.expires_at}
					<div>
						<p class="text-sm text-muted-foreground">Expires At</p>
						<p>{new Date(grant.expires_at).toLocaleString()}</p>
					</div>
				{/if}
				{#if grant.revoked_at}
					<div>
						<p class="text-sm text-muted-foreground">Revoked At</p>
						<p>{new Date(grant.revoked_at).toLocaleString()}</p>
					</div>
				{/if}
				{#if grant.revoked_by}
					<div>
						<p class="text-sm text-muted-foreground">Revoked By</p>
						<p class="font-mono text-xs">{grant.revoked_by}</p>
					</div>
				{/if}
			</div>

			<!-- Scopes -->
			<div>
				<p class="mb-2 text-sm text-muted-foreground">Allowed Scopes</p>
				{#if grant.allowed_scopes.length === 0}
					<p class="text-sm text-muted-foreground italic">All scopes (unrestricted)</p>
				{:else}
					<div class="flex flex-wrap gap-1">
						{#each grant.allowed_scopes as scope}
							<Badge variant="outline">{scope}</Badge>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Resource Types -->
			<div>
				<p class="mb-2 text-sm text-muted-foreground">Allowed Resource Types</p>
				{#if grant.allowed_resource_types.length === 0}
					<p class="text-sm text-muted-foreground italic">All resource types (unrestricted)</p>
				{:else}
					<div class="flex flex-wrap gap-1">
						{#each grant.allowed_resource_types as rt}
							<Badge variant="outline">{rt}</Badge>
						{/each}
					</div>
				{/if}
			</div>
		</CardContent>
	</Card>

	{#if grant.status === 'active' && isAdmin}
		<Card>
			<CardHeader><h3 class="text-lg font-semibold">Actions</h3></CardHeader>
			<CardContent>
				{#if showRevokeConfirm}
					<p class="mb-3 text-sm text-muted-foreground">Are you sure you want to revoke this delegation grant? This cannot be undone.</p>
					<form method="POST" action="?/revoke" use:enhance={() => { return async ({ result, update }) => { if (result.type === 'redirect') { addToast('success', 'Delegation grant revoked'); } await update(); }; }}>
						<div class="flex gap-2">
							<Button type="submit" variant="destructive">Confirm Revoke</Button>
							<Button type="button" variant="ghost" onclick={() => (showRevokeConfirm = false)}>Cancel</Button>
						</div>
					</form>
				{:else}
					<Button variant="destructive" onclick={() => (showRevokeConfirm = true)}>Revoke Grant</Button>
				{/if}
			</CardContent>
		</Card>
	{/if}
</div>
