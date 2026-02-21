<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { enhance as formEnhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { Card, CardHeader, CardContent } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import { Separator } from '$lib/components/ui/separator';
	import { Tabs, TabsList, TabsTrigger, TabsContent } from '$lib/components/ui/tabs';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import NhiStateBadge from '../../nhi-state-badge.svelte';
	import PermissionsTab from '$lib/components/nhi/permissions-tab.svelte';
	import DelegationsTab from '$lib/components/nhi/delegations-tab.svelte';
	import VaultTab from '$lib/components/nhi/vault-tab.svelte';
	import RiskBreakdown from '$lib/components/nhi/risk-breakdown.svelte';
	import UsageHistoryTable from '$lib/components/nhi/usage-history-table.svelte';
	import UsageSummaryStats from '$lib/components/nhi/usage-summary-stats.svelte';
	import type { NhiRiskBreakdown, NhiUsageSummary, NhiUsageRecord } from '$lib/api/types';
	import { fetchNhiRisk } from '$lib/api/nhi-governance-client';
	import { fetchNhiUsageHistory, fetchNhiUsageSummary } from '$lib/api/nhi-usage-client';
	import * as Dialog from '$lib/components/ui/dialog';
	import { addToast } from '$lib/stores/toast.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const { form, errors, enhance, message } = superForm(data.form, {
		onResult({ result }) {
			if (result.type === 'success' && result.data?.type !== 'error') {
				addToast('success', 'Service account updated successfully');
				isEditing = false;
				invalidateAll();
			}
		}
	});

	let isEditing: boolean = $state(false);
	let showDeleteDialog: boolean = $state(false);
	let showSuspendDialog: boolean = $state(false);
	let showArchiveDialog: boolean = $state(false);

	let riskData = $state<NhiRiskBreakdown | null>(null);
	let riskLoading = $state(true);
	let riskError = $state<string | null>(null);

	let usageRecords = $state<NhiUsageRecord[]>([]);
	let usageSummary = $state<NhiUsageSummary | null>(null);
	let usageLoading = $state(false);
	let usageLoaded = $state(false);
	let usageError = $state<string | null>(null);

	$effect(() => {
		fetchNhiRisk(data.nhi.id)
			.then((r) => { riskData = r; })
			.catch((err: unknown) => { riskError = err instanceof Error ? err.message : 'Failed to load risk data'; })
			.finally(() => { riskLoading = false; });
	});

	const isArchived = $derived(data.nhi.lifecycle_state === 'archived');

	async function loadUsage() {
		if (usageLoaded && !usageError) return;
		usageLoading = true;
		usageError = null;
		usageLoaded = false;
		try {
			const [records, summary] = await Promise.all([
				fetchNhiUsageHistory(data.nhi.id),
				fetchNhiUsageSummary(data.nhi.id)
			]);
			usageRecords = records.items;
			usageSummary = summary;
			usageLoaded = true;
		} catch (err: unknown) {
			usageError = err instanceof Error ? err.message : 'Failed to load usage data';
		} finally {
			usageLoading = false;
		}
	}

	function startEdit() {
		$form.name = data.nhi.name;
		$form.description = data.nhi.description ?? undefined;
		$form.purpose = data.nhi.service_account?.purpose ?? undefined;
		$form.environment = data.nhi.service_account?.environment ?? undefined;
		isEditing = true;
	}

	function cancelEdit() {
		isEditing = false;
	}
</script>

<!-- Header section (outside tabs) -->
<div class="flex items-center justify-between">
	<div class="flex items-center gap-3">
		<PageHeader title={data.nhi.name} description="Service account details" />
		<NhiStateBadge state={data.nhi.lifecycle_state} />
	</div>
	<a
		href="/nhi"
		class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
	>
		Back to NHI
	</a>
</div>

<!-- Tabs -->
<Tabs value="details" class="mt-4">
	<TabsList>
		<TabsTrigger value="details">Details</TabsTrigger>
		<TabsTrigger value="permissions">Permissions</TabsTrigger>
		<TabsTrigger value="delegations">Delegations</TabsTrigger>
		<TabsTrigger value="vault">Vault</TabsTrigger>
		<TabsTrigger value="usage">Usage</TabsTrigger>
		<TabsTrigger value="risk">Risk</TabsTrigger>
	</TabsList>

	<TabsContent value="details">
		{#if isEditing}
			<Card class="max-w-lg">
				<CardHeader>
					<h2 class="text-xl font-semibold">Edit service account</h2>
				</CardHeader>
				<CardContent>
					{#if $message}
						<Alert variant="destructive" class="mb-4">
							<AlertDescription>{$message}</AlertDescription>
						</Alert>
					{/if}

					<form method="POST" action="?/update" use:enhance class="space-y-4">
						<div class="space-y-2">
							<Label for="name">Name</Label>
							<Input id="name" name="name" type="text" value={String($form.name ?? '')} />
							{#if $errors.name}
								<p class="text-sm text-destructive">{$errors.name}</p>
							{/if}
						</div>

						<div class="space-y-2">
							<Label for="description">Description</Label>
							<Input id="description" name="description" type="text" value={String($form.description ?? '')} />
							{#if $errors.description}
								<p class="text-sm text-destructive">{$errors.description}</p>
							{/if}
						</div>

						<div class="space-y-2">
							<Label for="purpose">Purpose</Label>
							<Input id="purpose" name="purpose" type="text" value={String($form.purpose ?? '')} />
							{#if $errors.purpose}
								<p class="text-sm text-destructive">{$errors.purpose}</p>
							{/if}
						</div>

						<div class="space-y-2">
							<Label for="environment">Environment</Label>
							<Input id="environment" name="environment" type="text" value={String($form.environment ?? '')} />
							{#if $errors.environment}
								<p class="text-sm text-destructive">{$errors.environment}</p>
							{/if}
						</div>

						<div class="flex gap-2 pt-2">
							<Button type="submit">Save changes</Button>
							<Button type="button" variant="outline" onclick={cancelEdit}>Cancel</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		{:else}
			<Card class="max-w-lg">
				<CardHeader>
					<div class="flex items-center justify-between">
						<h2 class="text-xl font-semibold">Service account information</h2>
						{#if !isArchived}
							<Button variant="outline" size="sm" onclick={startEdit}>Edit</Button>
						{/if}
					</div>
				</CardHeader>
				<CardContent class="space-y-4">
					<div class="grid gap-3">
						<div class="flex justify-between">
							<span class="text-sm text-muted-foreground">Name</span>
							<span class="text-sm font-medium">{data.nhi.name}</span>
						</div>
						<div class="flex justify-between">
							<span class="text-sm text-muted-foreground">Description</span>
							<span class="text-sm">{data.nhi.description ?? '—'}</span>
						</div>
						<div class="flex justify-between">
							<span class="text-sm text-muted-foreground">Lifecycle state</span>
							<NhiStateBadge state={data.nhi.lifecycle_state} />
						</div>
						{#if data.nhi.suspension_reason}
							<div class="flex justify-between">
								<span class="text-sm text-muted-foreground">Suspension reason</span>
								<span class="text-sm">{data.nhi.suspension_reason}</span>
							</div>
						{/if}

						<Separator />

						<h3 class="text-sm font-medium text-muted-foreground">Service account-specific</h3>
						<div class="flex justify-between">
							<span class="text-sm text-muted-foreground">Purpose</span>
							<span class="text-sm">{data.nhi.service_account?.purpose ?? '—'}</span>
						</div>
						<div class="flex justify-between">
							<span class="text-sm text-muted-foreground">Environment</span>
							<span class="text-sm">{data.nhi.service_account?.environment ?? '—'}</span>
						</div>

						<Separator />

						<div class="flex justify-between">
							<span class="text-sm text-muted-foreground">Created</span>
							<span class="text-sm">{new Date(data.nhi.created_at).toLocaleString()}</span>
						</div>
						<div class="flex justify-between">
							<span class="text-sm text-muted-foreground">Updated</span>
							<span class="text-sm">{new Date(data.nhi.updated_at).toLocaleString()}</span>
						</div>
					</div>
				</CardContent>
			</Card>

			<Separator class="my-6" />

			{#if !isArchived}
				<Card class="max-w-lg">
					<CardHeader>
						<h2 class="text-xl font-semibold">Actions</h2>
					</CardHeader>
					<CardContent class="flex flex-wrap gap-2">
						{#if data.nhi.lifecycle_state === 'inactive' || data.nhi.lifecycle_state === 'suspended'}
							<form
								method="POST"
								action="?/activate"
								use:formEnhance={() => {
									return async ({ result, update }) => {
										if (result.type === 'success') {
											addToast('success', 'Identity activated');
											await invalidateAll();
										} else if (result.type === 'failure') {
											addToast('error', String(result.data?.error ?? 'Failed to activate'));
										}
									};
								}}
							>
								<Button type="submit" variant="outline">Activate</Button>
							</form>
						{/if}

						{#if data.nhi.lifecycle_state === 'active'}
							<Button variant="outline" onclick={() => (showSuspendDialog = true)}>Suspend</Button>
						{/if}

						{#if data.nhi.lifecycle_state === 'suspended'}
							<form
								method="POST"
								action="?/reactivate"
								use:formEnhance={() => {
									return async ({ result, update }) => {
										if (result.type === 'success') {
											addToast('success', 'Identity reactivated');
											await invalidateAll();
										} else if (result.type === 'failure') {
											addToast('error', String(result.data?.error ?? 'Failed to reactivate'));
										}
									};
								}}
							>
								<Button type="submit" variant="outline">Reactivate</Button>
							</form>
						{/if}

						{#if data.nhi.lifecycle_state === 'active'}
							<form
								method="POST"
								action="?/deprecate"
								use:formEnhance={() => {
									return async ({ result, update }) => {
										if (result.type === 'success') {
											addToast('success', 'Identity deprecated');
											await invalidateAll();
										} else if (result.type === 'failure') {
											addToast('error', String(result.data?.error ?? 'Failed to deprecate'));
										}
									};
								}}
							>
								<Button type="submit" variant="outline">Deprecate</Button>
							</form>
						{/if}

						{#if data.nhi.lifecycle_state === 'deprecated'}
							<Button variant="destructive" onclick={() => (showArchiveDialog = true)}>Archive</Button>
						{/if}

						{#if !isArchived}
							<Button variant="destructive" onclick={() => (showDeleteDialog = true)}>Delete</Button>
						{/if}
					</CardContent>
				</Card>
			{/if}

		{/if}
	</TabsContent>

	<TabsContent value="permissions">
		<PermissionsTab nhiId={data.nhi.id} entityType="service_account" />
	</TabsContent>

	<TabsContent value="delegations">
		<DelegationsTab nhiId={data.nhi.id} />
	</TabsContent>

	<TabsContent value="vault">
		<VaultTab nhiId={data.nhi.id} />
	</TabsContent>

	<TabsContent value="usage">
		{#if !usageLoaded && !usageLoading}
			<div class="space-y-2">
				<p class="text-sm text-muted-foreground">Click to load usage data.</p>
				<button
					onclick={loadUsage}
					class="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:bg-primary/90"
				>
					Load Usage
				</button>
			</div>
		{:else if usageLoading}
			<div class="animate-pulse space-y-3">
				<div class="h-8 rounded bg-muted"></div>
				<div class="h-48 rounded bg-muted"></div>
			</div>
		{:else if usageError}
			<Alert variant="destructive">
				<AlertDescription>{usageError}</AlertDescription>
			</Alert>
			<button
				onclick={loadUsage}
				class="mt-2 rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:bg-primary/90"
			>
				Retry
			</button>
		{:else}
			{#if usageSummary}
				<UsageSummaryStats summary={usageSummary} />
			{/if}
			<div class="mt-4">
				<UsageHistoryTable records={usageRecords} />
			</div>
		{/if}
	</TabsContent>

	<TabsContent value="risk">
		{#if riskLoading}
			<div class="animate-pulse space-y-3">
				<div class="h-8 rounded bg-muted"></div>
				<div class="h-48 rounded bg-muted"></div>
			</div>
		{:else if riskError}
			<p class="text-sm text-destructive">{riskError}</p>
		{:else if riskData}
			<RiskBreakdown breakdown={riskData} />
		{:else}
			<p class="text-sm text-muted-foreground">Click the Risk tab to load risk data.</p>
		{/if}
	</TabsContent>
</Tabs>

<!-- Dialogs stay OUTSIDE tabs (they're modal overlays) -->

<!-- Suspend dialog -->
<Dialog.Root bind:open={showSuspendDialog}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Suspend identity</Dialog.Title>
			<Dialog.Description>Provide an optional reason for suspending this identity.</Dialog.Description>
		</Dialog.Header>
		<form
			method="POST"
			action="?/suspend"
			use:formEnhance={() => {
				return async ({ result, update }) => {
					if (result.type === 'success') {
						addToast('success', 'Identity suspended');
						showSuspendDialog = false;
						await invalidateAll();
					} else if (result.type === 'failure') {
						addToast('error', String(result.data?.error ?? 'Failed to suspend'));
						showSuspendDialog = false;
					}
				};
			}}
		>
			<div class="py-4">
				<Label for="reason">Reason (optional)</Label>
				<Input id="reason" name="reason" type="text" placeholder="e.g. Security review" />
			</div>
			<Dialog.Footer>
				<Button variant="outline" type="button" onclick={() => (showSuspendDialog = false)}>Cancel</Button>
				<Button type="submit">Suspend</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

<!-- Archive dialog -->
<Dialog.Root bind:open={showArchiveDialog}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Archive identity</Dialog.Title>
			<Dialog.Description>
				Are you sure you want to archive <strong>{data.nhi.name}</strong>? This action cannot be undone.
			</Dialog.Description>
		</Dialog.Header>
		<form
			method="POST"
			action="?/archive"
			use:formEnhance={() => {
				return async ({ result, update }) => {
					if (result.type === 'success') {
						addToast('success', 'Identity archived');
						showArchiveDialog = false;
						await invalidateAll();
					} else if (result.type === 'failure') {
						addToast('error', String(result.data?.error ?? 'Failed to archive'));
						showArchiveDialog = false;
					}
				};
			}}
		>
			<Dialog.Footer>
				<Button variant="outline" type="button" onclick={() => (showArchiveDialog = false)}>Cancel</Button>
				<Button type="submit" variant="destructive">Confirm archive</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

<!-- Delete dialog -->
<Dialog.Root bind:open={showDeleteDialog}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Delete identity</Dialog.Title>
			<Dialog.Description>
				Are you sure you want to delete <strong>{data.nhi.name}</strong>? This action cannot be undone.
			</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer>
			<Button variant="outline" onclick={() => (showDeleteDialog = false)}>Cancel</Button>
			<form
				method="POST"
				action="?/delete"
				use:formEnhance={() => {
					return async ({ result, update }) => {
						if (result.type === 'redirect') {
							addToast('success', 'Identity deleted');
							await update();
						} else if (result.type === 'failure') {
							addToast('error', String(result.data?.error ?? 'Failed to delete'));
							showDeleteDialog = false;
						}
					};
				}}
			>
				<Button type="submit" variant="destructive">Confirm delete</Button>
			</form>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
