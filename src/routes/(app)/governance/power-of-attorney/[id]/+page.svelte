<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { Card, CardHeader, CardContent } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import { Separator } from '$lib/components/ui/separator';
	import { Badge } from '$lib/components/ui/badge';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import PoaStatusBadge from '$lib/components/poa/poa-status-badge.svelte';
	import { addToast } from '$lib/stores/toast.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	function userName(id: string): string {
		return data.userNameMap?.[id] ?? id;
	}

	const poa = $derived(data.poa);
	const audit = $derived(data.audit);
	const canRevoke = $derived(data.isGrantor && (poa.status === 'active' || poa.status === 'pending'));
	const canExtend = $derived(data.isGrantor && poa.status === 'active');
	const canAssume = $derived(data.isGrantee && poa.status === 'active');

	// Revoke form
	let showRevokeDialog = $state(false);
	// svelte-ignore state_referenced_locally
	const { form: revokeForm, errors: revokeErrors, enhance: revokeEnhance, message: revokeMessage } = superForm(data.revokeForm, {
		onResult({ result }) {
			if (result.type === 'redirect') {
				addToast('success', 'PoA revoked successfully');
			}
		}
	});

	// Extend form
	let showExtendDialog = $state(false);
	// svelte-ignore state_referenced_locally
	const { form: extendForm, errors: extendErrors, enhance: extendEnhance, message: extendMessage } = superForm(data.extendForm, {
		onResult({ result }) {
			if (result.type === 'redirect') {
				addToast('success', 'PoA extended successfully');
			}
		}
	});

	// Audit filter
	let auditTypeFilter = $state('');
	const filteredAudit = $derived(
		auditTypeFilter
			? audit.items.filter((e) => e.event_type === auditTypeFilter)
			: audit.items
	);

	const eventTypeLabels: Record<string, string> = {
		granted: 'Granted',
		activated: 'Activated',
		assumed: 'Assumed',
		dropped: 'Dropped',
		extended: 'Extended',
		revoked: 'Revoked',
		expired: 'Expired'
	};

	function formatDateTime(iso: string): string {
		return new Date(iso).toLocaleString();
	}

	function formatDate(iso: string): string {
		return new Date(iso).toLocaleDateString();
	}
</script>

<div class="flex items-center justify-between">
	<div class="flex items-center gap-3">
		<PageHeader title="Power of Attorney" description={`Grant #${poa.id.slice(0, 8)}`} />
		<PoaStatusBadge status={poa.status} />
	</div>
	<a
		href="/governance/power-of-attorney"
		class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
	>
		Back
	</a>
</div>

<!-- PoA Info Card -->
<Card class="mt-4">
	<CardHeader>
		<h2 class="text-lg font-semibold">Grant Details</h2>
	</CardHeader>
	<CardContent class="space-y-3">
		<div class="grid grid-cols-2 gap-4 text-sm">
			<div>
				<span class="font-medium text-muted-foreground">Grantor:</span>
				<span class="ml-1">{userName(poa.donor_id)}</span>
			</div>
			<div>
				<span class="font-medium text-muted-foreground">Grantee:</span>
				<span class="ml-1">{userName(poa.attorney_id)}</span>
			</div>
			<div>
				<span class="font-medium text-muted-foreground">Start:</span>
				<span class="ml-1">{formatDate(poa.starts_at)}</span>
			</div>
			<div>
				<span class="font-medium text-muted-foreground">End:</span>
				<span class="ml-1">{formatDate(poa.ends_at)}</span>
			</div>
		</div>
		{#if poa.reason}
			<div class="text-sm">
				<span class="font-medium text-muted-foreground">Reason:</span>
				<span class="ml-1">{poa.reason}</span>
			</div>
		{/if}
		{#if poa.revoked_at}
			<div class="text-sm">
				<span class="font-medium text-destructive">Revoked at:</span>
				<span class="ml-1">{formatDateTime(poa.revoked_at)}</span>
			</div>
		{/if}

		{#if poa.scope_id}
			<Separator />
			<div class="text-sm">
				<span class="font-medium text-muted-foreground">Scope ID:</span>
				<span class="ml-1">{poa.scope_id}</span>
			</div>
		{/if}
	</CardContent>
</Card>

<!-- Actions -->
<div class="mt-4 flex gap-2">
	{#if canAssume}
		<form method="POST" action="?/assume">
			<Button type="submit" variant="default">Assume Identity</Button>
		</form>
	{/if}
	{#if canExtend}
		<Button variant="outline" onclick={() => (showExtendDialog = true)}>Extend</Button>
	{/if}
	{#if canRevoke}
		<Button variant="destructive" onclick={() => (showRevokeDialog = true)}>Revoke</Button>
	{/if}
</div>

<!-- Revoke Dialog -->
{#if showRevokeDialog}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" role="dialog">
		<Card class="w-full max-w-md">
			<CardHeader>
				<h2 class="text-lg font-semibold">Revoke Power of Attorney</h2>
			</CardHeader>
			<CardContent>
				{#if $revokeMessage}
					<Alert variant="destructive" class="mb-4">
						<AlertDescription>{$revokeMessage}</AlertDescription>
					</Alert>
				{/if}
				<form method="POST" action="?/revoke" use:revokeEnhance class="space-y-4">
					<div class="space-y-2">
						<Label for="revoke-reason">Reason (optional)</Label>
						<textarea
							id="revoke-reason"
							name="reason"
							class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
							value={String($revokeForm.reason ?? '')}
							placeholder="Reason for revocation..."
						></textarea>
					</div>
					<div class="flex justify-end gap-2">
						<Button variant="outline" type="button" onclick={() => (showRevokeDialog = false)}>Cancel</Button>
						<Button variant="destructive" type="submit">Revoke</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	</div>
{/if}

<!-- Extend Dialog -->
{#if showExtendDialog}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" role="dialog">
		<Card class="w-full max-w-md">
			<CardHeader>
				<h2 class="text-lg font-semibold">Extend Power of Attorney</h2>
			</CardHeader>
			<CardContent>
				{#if $extendMessage}
					<Alert variant="destructive" class="mb-4">
						<AlertDescription>{$extendMessage}</AlertDescription>
					</Alert>
				{/if}
				<form method="POST" action="?/extend" use:extendEnhance class="space-y-4">
					<div class="space-y-2">
						<Label for="new-ends-at">New end date (max 90 days from start)</Label>
						<Input
							id="new-ends-at"
							name="new_ends_at"
							type="date"
							value={String($extendForm.new_ends_at ?? '')}
						/>
						{#if $extendErrors.new_ends_at}
							<p class="text-sm text-destructive">{$extendErrors.new_ends_at}</p>
						{/if}
					</div>
					<div class="flex justify-end gap-2">
						<Button variant="outline" type="button" onclick={() => (showExtendDialog = false)}>Cancel</Button>
						<Button type="submit">Extend</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	</div>
{/if}

<!-- Audit Trail -->
<Card class="mt-4">
	<CardHeader>
		<div class="flex items-center justify-between">
			<h2 class="text-lg font-semibold">Audit Trail</h2>
			<select
				class="flex h-8 rounded-md border border-input bg-background px-2 py-1 text-xs"
				bind:value={auditTypeFilter}
			>
				<option value="">All events</option>
				<option value="granted">Granted</option>
				<option value="activated">Activated</option>
				<option value="assumed">Assumed</option>
				<option value="dropped">Dropped</option>
				<option value="extended">Extended</option>
				<option value="revoked">Revoked</option>
				<option value="expired">Expired</option>
			</select>
		</div>
	</CardHeader>
	<CardContent>
		{#if filteredAudit.length === 0}
			<p class="text-sm text-muted-foreground">No audit events found.</p>
		{:else}
			<div class="space-y-3">
				{#each filteredAudit as event}
					<div class="flex items-start gap-3 border-l-2 border-border pl-3">
						<Badge variant="outline">{eventTypeLabels[event.event_type] ?? event.event_type}</Badge>
						<div class="flex-1 text-sm">
							<p class="text-muted-foreground">
								Actor: {event.actor_name ?? userName(event.actor_id)} &middot; {formatDateTime(event.created_at)}
							</p>
							{#if event.details && Object.keys(event.details).length > 0}
								<pre class="mt-1 rounded bg-muted p-2 text-xs">{JSON.stringify(event.details, null, 2)}</pre>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</CardContent>
</Card>
