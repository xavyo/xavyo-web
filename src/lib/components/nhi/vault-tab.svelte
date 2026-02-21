<script lang="ts">
	import { Card, CardHeader, CardContent } from '$lib/components/ui/card';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import { addToast } from '$lib/stores/toast.svelte';
	import { relativeTime } from '$lib/utils/relative-time';
	import {
		listSecretsClient,
		storeSecretClient,
		deleteSecretClient,
		rotateSecretClient,
		listLeasesClient,
		createLeaseClient,
		renewLeaseClient,
		revokeLeaseClient
	} from '$lib/api/nhi-vault-client';
	import type {
		SecretMetadata,
		StoreSecretRequest,
		NhiSecretLease,
		CreateLeaseRequest
	} from '$lib/api/types';

	interface Props {
		nhiId: string;
	}

	let { nhiId }: Props = $props();

	// --- Secrets State ---
	let secrets = $state<SecretMetadata[]>([]);
	let secretsLoading = $state(false);
	let secretsLoaded = $state(false);
	let secretsError = $state<string | null>(null);

	// --- Leases State ---
	let leases = $state<NhiSecretLease[]>([]);
	let leasesLoading = $state(false);
	let leasesLoaded = $state(false);
	let leasesError = $state<string | null>(null);

	// --- Dialogs ---
	let showAddSecretDialog = $state(false);
	let showRotateDialog = $state(false);
	let showDeleteSecretDialog = $state(false);
	let showCreateLeaseDialog = $state(false);
	let showRenewLeaseDialog = $state(false);
	let showRevokeLeaseDialog = $state(false);

	// --- Add Secret Form ---
	let newSecretName = $state('');
	let newSecretValue = $state('');
	let newSecretType = $state('');
	let newSecretDescription = $state('');
	let newSecretInjectAs = $state('');
	let newSecretInjectFormat = $state('');
	let newSecretExpiresAt = $state('');
	let newSecretRotationDays = $state('');
	let newSecretMaxLeaseSecs = $state('');
	let newSecretMaxLeases = $state('');
	let isStoringSecret = $state(false);

	// --- Rotate ---
	let rotateTarget = $state<SecretMetadata | null>(null);
	let rotateValue = $state('');
	let isRotating = $state(false);

	// --- Delete Secret ---
	let deleteTarget = $state<SecretMetadata | null>(null);
	let isDeleting = $state(false);

	// --- Create Lease ---
	let newLeaseSecretId = $state('');
	let newLeaseLesseeId = $state('');
	let newLeaseLesseeType = $state('');
	let newLeaseDurationSecs = $state('');
	let isCreatingLease = $state(false);

	// --- Renew Lease ---
	let renewTarget = $state<NhiSecretLease | null>(null);
	let renewExtendSecs = $state('3600');
	let isRenewing = $state(false);

	// --- Revoke Lease ---
	let revokeTarget = $state<NhiSecretLease | null>(null);
	let isRevoking = $state(false);

	// --- Load on first render ---
	$effect(() => {
		loadAll();
	});

	async function loadAll() {
		await Promise.all([loadSecrets(), loadLeases()]);
	}

	async function loadSecrets() {
		if (secretsLoaded && !secretsError) return;
		secretsLoading = true;
		secretsError = null;
		try {
			secrets = await listSecretsClient(nhiId);
			secretsLoaded = true;
		} catch (err: unknown) {
			secretsError = err instanceof Error ? err.message : 'Failed to load secrets';
		} finally {
			secretsLoading = false;
		}
	}

	async function loadLeases() {
		if (leasesLoaded && !leasesError) return;
		leasesLoading = true;
		leasesError = null;
		try {
			leases = await listLeasesClient(nhiId);
			leasesLoaded = true;
		} catch (err: unknown) {
			leasesError = err instanceof Error ? err.message : 'Failed to load leases';
		} finally {
			leasesLoading = false;
		}
	}

	function resetAddForm() {
		newSecretName = '';
		newSecretValue = '';
		newSecretType = '';
		newSecretDescription = '';
		newSecretInjectAs = '';
		newSecretInjectFormat = '';
		newSecretExpiresAt = '';
		newSecretRotationDays = '';
		newSecretMaxLeaseSecs = '';
		newSecretMaxLeases = '';
	}

	async function storeNewSecret() {
		if (!newSecretName || !newSecretValue || isStoringSecret) return;
		isStoringSecret = true;
		try {
			const body: StoreSecretRequest = {
				name: newSecretName,
				value: newSecretValue
			};
			if (newSecretType) body.secret_type = newSecretType;
			if (newSecretDescription) body.description = newSecretDescription;
			if (newSecretInjectAs) body.inject_as = newSecretInjectAs;
			if (newSecretInjectFormat) body.inject_format = newSecretInjectFormat;
			if (newSecretExpiresAt) body.expires_at = new Date(newSecretExpiresAt).toISOString();
			if (newSecretRotationDays) body.rotation_interval_days = Number(newSecretRotationDays);
			if (newSecretMaxLeaseSecs) body.max_lease_duration_secs = Number(newSecretMaxLeaseSecs);
			if (newSecretMaxLeases) body.max_concurrent_leases = Number(newSecretMaxLeases);

			const created = await storeSecretClient(nhiId, body);
			secrets = [...secrets, created];
			showAddSecretDialog = false;
			resetAddForm();
			addToast('success', 'Secret stored');
		} catch (err: unknown) {
			addToast('error', err instanceof Error ? err.message : 'Failed to store secret');
		} finally {
			isStoringSecret = false;
		}
	}

	function openRotateDialog(secret: SecretMetadata) {
		rotateTarget = secret;
		rotateValue = '';
		showRotateDialog = true;
	}

	async function doRotate() {
		if (!rotateTarget || !rotateValue || isRotating) return;
		isRotating = true;
		try {
			const updated = await rotateSecretClient(nhiId, rotateTarget.id, { value: rotateValue });
			secrets = secrets.map((s) => (s.id === updated.id ? updated : s));
			showRotateDialog = false;
			addToast('success', 'Secret rotated');
		} catch (err: unknown) {
			addToast('error', err instanceof Error ? err.message : 'Failed to rotate secret');
		} finally {
			isRotating = false;
		}
	}

	function openDeleteDialog(secret: SecretMetadata) {
		deleteTarget = secret;
		showDeleteSecretDialog = true;
	}

	async function doDelete() {
		if (!deleteTarget || isDeleting) return;
		isDeleting = true;
		try {
			await deleteSecretClient(nhiId, deleteTarget.id);
			secrets = secrets.filter((s) => s.id !== deleteTarget!.id);
			showDeleteSecretDialog = false;
			addToast('success', 'Secret deleted');
		} catch (err: unknown) {
			addToast('error', err instanceof Error ? err.message : 'Failed to delete secret');
		} finally {
			isDeleting = false;
		}
	}

	function openCreateLeaseDialog() {
		newLeaseSecretId = '';
		newLeaseLesseeId = '';
		newLeaseLesseeType = '';
		newLeaseDurationSecs = '3600';
		showCreateLeaseDialog = true;
	}

	async function doCreateLease() {
		if (!newLeaseSecretId || !newLeaseLesseeId || isCreatingLease) return;
		isCreatingLease = true;
		try {
			const body: CreateLeaseRequest = {
				secret_id: newLeaseSecretId,
				lessee_nhi_id: newLeaseLesseeId
			};
			if (newLeaseLesseeType) body.lessee_type = newLeaseLesseeType;
			if (newLeaseDurationSecs) body.duration_secs = Number(newLeaseDurationSecs);

			const created = await createLeaseClient(nhiId, body);
			leases = [...leases, created];
			showCreateLeaseDialog = false;
			addToast('success', 'Lease created');
		} catch (err: unknown) {
			addToast('error', err instanceof Error ? err.message : 'Failed to create lease');
		} finally {
			isCreatingLease = false;
		}
	}

	function openRenewDialog(lease: NhiSecretLease) {
		renewTarget = lease;
		renewExtendSecs = '3600';
		showRenewLeaseDialog = true;
	}

	async function doRenew() {
		if (!renewTarget || isRenewing) return;
		isRenewing = true;
		try {
			const updated = await renewLeaseClient(nhiId, renewTarget.id, {
				extend_secs: Number(renewExtendSecs)
			});
			leases = leases.map((l) => (l.id === updated.id ? updated : l));
			showRenewLeaseDialog = false;
			addToast('success', 'Lease renewed');
		} catch (err: unknown) {
			addToast('error', err instanceof Error ? err.message : 'Failed to renew lease');
		} finally {
			isRenewing = false;
		}
	}

	function openRevokeDialog(lease: NhiSecretLease) {
		revokeTarget = lease;
		showRevokeLeaseDialog = true;
	}

	async function doRevoke() {
		if (!revokeTarget || isRevoking) return;
		isRevoking = true;
		try {
			await revokeLeaseClient(nhiId, revokeTarget.id);
			leases = leases.map((l) =>
				l.id === revokeTarget!.id ? { ...l, status: 'revoked', revoked_at: new Date().toISOString() } : l
			);
			showRevokeLeaseDialog = false;
			addToast('success', 'Lease revoked');
		} catch (err: unknown) {
			addToast('error', err instanceof Error ? err.message : 'Failed to revoke lease');
		} finally {
			isRevoking = false;
		}
	}

	function secretNameById(id: string): string {
		const s = secrets.find((s) => s.id === id);
		return s?.name ?? id.substring(0, 8) + '...';
	}

	function leaseStatusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
		switch (status) {
			case 'active':
				return 'default';
			case 'expired':
				return 'secondary';
			case 'revoked':
				return 'destructive';
			default:
				return 'outline';
		}
	}
</script>

<div class="space-y-6">
	<!-- Secrets Section -->
	<Card>
		<CardHeader>
			<div class="flex items-center justify-between">
				<h3 class="text-lg font-semibold">Secrets</h3>
				<Button size="sm" onclick={() => (showAddSecretDialog = true)}>Add Secret</Button>
			</div>
		</CardHeader>
		<CardContent>
			{#if secretsLoading}
				<div class="animate-pulse space-y-2">
					<div class="h-8 rounded bg-muted"></div>
					<div class="h-8 rounded bg-muted"></div>
				</div>
			{:else if secretsError}
				<p class="text-sm text-destructive">{secretsError}</p>
				<button
					onclick={() => { secretsLoaded = false; loadSecrets(); }}
					class="mt-2 text-sm font-medium text-primary hover:underline"
				>
					Retry
				</button>
			{:else if secrets.length === 0}
				<p class="text-sm text-muted-foreground">No secrets stored for this identity.</p>
			{:else}
				<div class="overflow-x-auto">
					<table class="w-full text-sm">
						<thead class="border-b bg-muted/50">
							<tr>
								<th class="px-3 py-2 text-left font-medium">Name</th>
								<th class="px-3 py-2 text-left font-medium">Type</th>
								<th class="px-3 py-2 text-left font-medium">Inject As</th>
								<th class="px-3 py-2 text-left font-medium">Expires</th>
								<th class="px-3 py-2 text-left font-medium">Last Rotated</th>
								<th class="px-3 py-2 text-right font-medium">Actions</th>
							</tr>
						</thead>
						<tbody>
							{#each secrets as secret (secret.id)}
								<tr class="border-b">
									<td class="px-3 py-2 font-medium">{secret.name}</td>
									<td class="px-3 py-2 text-muted-foreground">{secret.secret_type ?? '—'}</td>
									<td class="px-3 py-2 text-muted-foreground">{secret.inject_as ?? '—'}</td>
									<td class="px-3 py-2 text-muted-foreground">{secret.expires_at ? relativeTime(secret.expires_at) : '—'}</td>
									<td class="px-3 py-2 text-muted-foreground">{relativeTime(secret.last_rotated_at)}</td>
									<td class="px-3 py-2 text-right">
										<div class="flex justify-end gap-1">
											<Button variant="ghost" size="sm" onclick={() => openRotateDialog(secret)}>Rotate</Button>
											<Button variant="ghost" size="sm" onclick={() => openDeleteDialog(secret)}>Delete</Button>
										</div>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</CardContent>
	</Card>

	<Separator />

	<!-- Leases Section -->
	<Card>
		<CardHeader>
			<div class="flex items-center justify-between">
				<h3 class="text-lg font-semibold">Leases</h3>
				<Button size="sm" onclick={openCreateLeaseDialog} disabled={secrets.length === 0}>Issue Lease</Button>
			</div>
		</CardHeader>
		<CardContent>
			{#if leasesLoading}
				<div class="animate-pulse space-y-2">
					<div class="h-8 rounded bg-muted"></div>
					<div class="h-8 rounded bg-muted"></div>
				</div>
			{:else if leasesError}
				<p class="text-sm text-destructive">{leasesError}</p>
				<button
					onclick={() => { leasesLoaded = false; loadLeases(); }}
					class="mt-2 text-sm font-medium text-primary hover:underline"
				>
					Retry
				</button>
			{:else if leases.length === 0}
				<p class="text-sm text-muted-foreground">No active leases for this identity.</p>
			{:else}
				<div class="overflow-x-auto">
					<table class="w-full text-sm">
						<thead class="border-b bg-muted/50">
							<tr>
								<th class="px-3 py-2 text-left font-medium">Secret</th>
								<th class="px-3 py-2 text-left font-medium">Lessee</th>
								<th class="px-3 py-2 text-left font-medium">Type</th>
								<th class="px-3 py-2 text-left font-medium">Status</th>
								<th class="px-3 py-2 text-left font-medium">Issued</th>
								<th class="px-3 py-2 text-left font-medium">Expires</th>
								<th class="px-3 py-2 text-right font-medium">Actions</th>
							</tr>
						</thead>
						<tbody>
							{#each leases as lease (lease.id)}
								<tr class="border-b">
									<td class="px-3 py-2 font-medium">{secretNameById(lease.secret_id)}</td>
									<td class="px-3 py-2 font-mono text-xs">{lease.lessee_nhi_id.substring(0, 8)}...</td>
									<td class="px-3 py-2 text-muted-foreground">{lease.lessee_type ?? '—'}</td>
									<td class="px-3 py-2">
										<Badge variant={leaseStatusVariant(lease.status)}>{lease.status}</Badge>
									</td>
									<td class="px-3 py-2 text-muted-foreground">{relativeTime(lease.issued_at)}</td>
									<td class="px-3 py-2 text-muted-foreground">{relativeTime(lease.expires_at)}</td>
									<td class="px-3 py-2 text-right">
										{#if lease.status === 'active'}
											<div class="flex justify-end gap-1">
												<Button variant="ghost" size="sm" onclick={() => openRenewDialog(lease)}>Renew</Button>
												<Button variant="ghost" size="sm" onclick={() => openRevokeDialog(lease)}>Revoke</Button>
											</div>
										{:else}
											<span class="text-xs text-muted-foreground">—</span>
										{/if}
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</CardContent>
	</Card>
</div>

<!-- Add Secret Dialog -->
<Dialog.Root bind:open={showAddSecretDialog}>
	<Dialog.Content class="max-w-md">
		<Dialog.Header>
			<Dialog.Title>Add Secret</Dialog.Title>
			<Dialog.Description>Store a new encrypted secret for this identity.</Dialog.Description>
		</Dialog.Header>
		<div class="space-y-3 py-2">
			<div class="space-y-1">
				<Label for="secret-name">Name *</Label>
				<Input id="secret-name" bind:value={newSecretName} placeholder="e.g. API_KEY" />
			</div>
			<div class="space-y-1">
				<Label for="secret-value">Value *</Label>
				<Input id="secret-value" type="password" bind:value={newSecretValue} placeholder="Secret value" />
			</div>
			<div class="space-y-1">
				<Label for="secret-type">Type</Label>
				<select
					id="secret-type"
					class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
					bind:value={newSecretType}
				>
					<option value="">None</option>
					<option value="api_key">API Key</option>
					<option value="password">Password</option>
					<option value="token">Token</option>
					<option value="certificate">Certificate</option>
					<option value="other">Other</option>
				</select>
			</div>
			<div class="space-y-1">
				<Label for="secret-desc">Description</Label>
				<Input id="secret-desc" bind:value={newSecretDescription} placeholder="Optional description" />
			</div>
			<div class="grid grid-cols-2 gap-3">
				<div class="space-y-1">
					<Label for="secret-inject-as">Inject As</Label>
					<Input id="secret-inject-as" bind:value={newSecretInjectAs} placeholder="e.g. HEADER" />
				</div>
				<div class="space-y-1">
					<Label for="secret-inject-format">Inject Format</Label>
					<select
						id="secret-inject-format"
						class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
						bind:value={newSecretInjectFormat}
					>
						<option value="">None</option>
						<option value="plain">Plain</option>
						<option value="bearer">Bearer</option>
						<option value="basic">Basic</option>
					</select>
				</div>
			</div>
			<div class="space-y-1">
				<Label for="secret-expires">Expires At</Label>
				<Input id="secret-expires" type="datetime-local" bind:value={newSecretExpiresAt} />
			</div>
			<div class="grid grid-cols-3 gap-3">
				<div class="space-y-1">
					<Label for="secret-rot-days">Rotation (days)</Label>
					<Input id="secret-rot-days" type="number" bind:value={newSecretRotationDays} placeholder="90" />
				</div>
				<div class="space-y-1">
					<Label for="secret-max-lease">Max lease (s)</Label>
					<Input id="secret-max-lease" type="number" bind:value={newSecretMaxLeaseSecs} placeholder="3600" />
				</div>
				<div class="space-y-1">
					<Label for="secret-max-conc">Max leases</Label>
					<Input id="secret-max-conc" type="number" bind:value={newSecretMaxLeases} placeholder="5" />
				</div>
			</div>
		</div>
		<Dialog.Footer>
			<Button variant="outline" onclick={() => (showAddSecretDialog = false)}>Cancel</Button>
			<Button onclick={storeNewSecret} disabled={!newSecretName || !newSecretValue || isStoringSecret}>
				{isStoringSecret ? 'Storing...' : 'Store Secret'}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<!-- Rotate Secret Dialog -->
<Dialog.Root bind:open={showRotateDialog}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Rotate Secret</Dialog.Title>
			<Dialog.Description>
				Enter a new value for <strong>{rotateTarget?.name}</strong>.
			</Dialog.Description>
		</Dialog.Header>
		<div class="py-4">
			<Label for="rotate-value">New Value</Label>
			<Input id="rotate-value" type="password" bind:value={rotateValue} placeholder="New secret value" />
		</div>
		<Dialog.Footer>
			<Button variant="outline" onclick={() => (showRotateDialog = false)}>Cancel</Button>
			<Button onclick={doRotate} disabled={!rotateValue || isRotating}>
				{isRotating ? 'Rotating...' : 'Rotate'}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<!-- Delete Secret Dialog -->
<Dialog.Root bind:open={showDeleteSecretDialog}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Delete Secret</Dialog.Title>
			<Dialog.Description>
				Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This will also invalidate all active leases.
			</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer>
			<Button variant="outline" onclick={() => (showDeleteSecretDialog = false)}>Cancel</Button>
			<Button variant="destructive" onclick={doDelete} disabled={isDeleting}>
				{isDeleting ? 'Deleting...' : 'Delete'}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<!-- Create Lease Dialog -->
<Dialog.Root bind:open={showCreateLeaseDialog}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Issue Lease</Dialog.Title>
			<Dialog.Description>Grant temporary access to a secret.</Dialog.Description>
		</Dialog.Header>
		<div class="space-y-3 py-2">
			<div class="space-y-1">
				<Label for="lease-secret">Secret *</Label>
				<select
					id="lease-secret"
					class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
					bind:value={newLeaseSecretId}
				>
					<option value="">Select a secret</option>
					{#each secrets as secret}
						<option value={secret.id}>{secret.name}</option>
					{/each}
				</select>
			</div>
			<div class="space-y-1">
				<Label for="lease-lessee">Lessee NHI ID *</Label>
				<Input id="lease-lessee" bind:value={newLeaseLesseeId} placeholder="UUID of the lessee NHI" />
			</div>
			<div class="grid grid-cols-2 gap-3">
				<div class="space-y-1">
					<Label for="lease-type">Lessee Type</Label>
					<select
						id="lease-type"
						class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
						bind:value={newLeaseLesseeType}
					>
						<option value="">Auto-detect</option>
						<option value="agent">Agent</option>
						<option value="tool">Tool</option>
						<option value="service_account">Service Account</option>
					</select>
				</div>
				<div class="space-y-1">
					<Label for="lease-duration">Duration (seconds)</Label>
					<Input id="lease-duration" type="number" bind:value={newLeaseDurationSecs} placeholder="3600" />
				</div>
			</div>
		</div>
		<Dialog.Footer>
			<Button variant="outline" onclick={() => (showCreateLeaseDialog = false)}>Cancel</Button>
			<Button onclick={doCreateLease} disabled={!newLeaseSecretId || !newLeaseLesseeId || isCreatingLease}>
				{isCreatingLease ? 'Creating...' : 'Issue Lease'}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<!-- Renew Lease Dialog -->
<Dialog.Root bind:open={showRenewLeaseDialog}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Renew Lease</Dialog.Title>
			<Dialog.Description>Extend the lease duration.</Dialog.Description>
		</Dialog.Header>
		<div class="py-4">
			<Label for="renew-secs">Extend by (seconds)</Label>
			<Input id="renew-secs" type="number" bind:value={renewExtendSecs} placeholder="3600" />
		</div>
		<Dialog.Footer>
			<Button variant="outline" onclick={() => (showRenewLeaseDialog = false)}>Cancel</Button>
			<Button onclick={doRenew} disabled={!renewExtendSecs || isRenewing}>
				{isRenewing ? 'Renewing...' : 'Renew'}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<!-- Revoke Lease Dialog -->
<Dialog.Root bind:open={showRevokeLeaseDialog}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Revoke Lease</Dialog.Title>
			<Dialog.Description>
				Are you sure you want to revoke this lease? The lessee will immediately lose access.
			</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer>
			<Button variant="outline" onclick={() => (showRevokeLeaseDialog = false)}>Cancel</Button>
			<Button variant="destructive" onclick={doRevoke} disabled={isRevoking}>
				{isRevoking ? 'Revoking...' : 'Revoke'}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
