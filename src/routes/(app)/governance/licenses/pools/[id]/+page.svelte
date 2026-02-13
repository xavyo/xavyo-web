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
	import * as Dialog from '$lib/components/ui/dialog';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import { addToast } from '$lib/stores/toast.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let pool = $derived(data.pool);

	const { form, errors, enhance, message } = superForm(data.form, {
		onResult({ result }) {
			if (result.type === 'success' && result.data?.type !== 'error') {
				addToast('success', 'License pool updated successfully');
				isEditing = false;
				invalidateAll();
			}
		}
	});

	let isEditing: boolean = $state(false);
	let showDeleteDialog: boolean = $state(false);

	const statusColors: Record<string, string> = {
		active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
		expired: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
		archived: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
	};

	const statusLabels: Record<string, string> = {
		active: 'Active',
		expired: 'Expired',
		archived: 'Archived'
	};

	const expirationPolicyLabels: Record<string, string> = {
		block_new: 'Block New Assignments',
		revoke_all: 'Revoke All',
		warn_only: 'Warn Only'
	};

	const licenseTypeLabels: Record<string, string> = {
		named: 'Named',
		concurrent: 'Concurrent'
	};

	const billingPeriodLabels: Record<string, string> = {
		monthly: 'Monthly',
		annual: 'Annual',
		perpetual: 'Perpetual'
	};

	function getUtilizationColor(percent: number): string {
		if (percent > 90) return 'text-red-600 dark:text-red-400';
		if (percent > 70) return 'text-yellow-600 dark:text-yellow-400';
		return 'text-green-600 dark:text-green-400';
	}

	function startEdit() {
		// Pre-fill form with current pool data
		let expirationDate = pool.expiration_date ?? undefined;
		if (expirationDate && expirationDate.includes('T')) {
			expirationDate = expirationDate.split('T')[0];
		}

		$form.name = pool.name;
		$form.vendor = pool.vendor;
		$form.description = pool.description ?? undefined;
		$form.total_capacity = pool.total_capacity;
		$form.cost_per_license = pool.cost_per_license ?? undefined;
		$form.currency = pool.currency;
		$form.billing_period = pool.billing_period;
		$form.license_type = pool.license_type;
		$form.expiration_date = expirationDate;
		$form.expiration_policy = pool.expiration_policy;
		$form.warning_days = pool.warning_days;
		isEditing = true;
	}

	function cancelEdit() {
		isEditing = false;
	}

	function formatCost(cost: number | string | null, currency: string): string {
		if (cost === null || cost === undefined) return '\u2014';
		const num = Number(cost);
		if (isNaN(num)) return '\u2014';
		return `${currency} ${num.toFixed(2)}`;
	}

	function formatDate(dateStr: string | null): string {
		if (!dateStr) return '\u2014';
		return new Date(dateStr).toLocaleDateString();
	}

	function formatDateTime(dateStr: string): string {
		return new Date(dateStr).toLocaleString();
	}
</script>

<div class="flex items-center justify-between">
	<div class="flex items-center gap-3">
		<PageHeader title={pool.name} description="License pool details" />
		<span
			class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {statusColors[pool.status] ?? 'bg-gray-100 text-gray-800'}"
		>
			{statusLabels[pool.status] ?? pool.status}
		</span>
	</div>
	<a
		href="/governance/licenses"
		class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
	>
		Back to Licenses
	</a>
</div>

{#if isEditing}
	<Card class="max-w-lg">
		<CardHeader>
			<h2 class="text-xl font-semibold">Edit license pool</h2>
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
					<Label for="vendor">Vendor</Label>
					<Input id="vendor" name="vendor" type="text" value={String($form.vendor ?? '')} />
					{#if $errors.vendor}
						<p class="text-sm text-destructive">{$errors.vendor}</p>
					{/if}
				</div>

				<div class="space-y-2">
					<Label for="description">Description</Label>
					<textarea
						id="description"
						name="description"
						class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
						value={String($form.description ?? '')}
					></textarea>
					{#if $errors.description}
						<p class="text-sm text-destructive">{$errors.description}</p>
					{/if}
				</div>

				<div class="space-y-2">
					<Label for="total_capacity">Total Capacity</Label>
					<Input
						id="total_capacity"
						name="total_capacity"
						type="number"
						min="0"
						value={$form.total_capacity !== undefined ? String($form.total_capacity) : ''}
					/>
					{#if $errors.total_capacity}
						<p class="text-sm text-destructive">{$errors.total_capacity}</p>
					{/if}
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div class="space-y-2">
						<Label for="cost_per_license">Cost per License</Label>
						<Input
							id="cost_per_license"
							name="cost_per_license"
							type="number"
							min="0"
							step="0.01"
							value={$form.cost_per_license !== undefined ? String($form.cost_per_license) : ''}
						/>
						{#if $errors.cost_per_license}
							<p class="text-sm text-destructive">{$errors.cost_per_license}</p>
						{/if}
					</div>

					<div class="space-y-2">
						<Label for="currency">Currency</Label>
						<select
							id="currency"
							name="currency"
							class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
							value={String($form.currency ?? 'USD')}
						>
							<option value="USD">USD</option>
							<option value="EUR">EUR</option>
							<option value="GBP">GBP</option>
						</select>
						{#if $errors.currency}
							<p class="text-sm text-destructive">{$errors.currency}</p>
						{/if}
					</div>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div class="space-y-2">
						<Label for="billing_period">Billing Period</Label>
						<select
							id="billing_period"
							name="billing_period"
							class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
							value={String($form.billing_period ?? '')}
						>
							<option value="" disabled>Select billing period</option>
							<option value="monthly">Monthly</option>
							<option value="annual">Annual</option>
							<option value="perpetual">Perpetual</option>
						</select>
						{#if $errors.billing_period}
							<p class="text-sm text-destructive">{$errors.billing_period}</p>
						{/if}
					</div>

					<div class="space-y-2">
						<Label for="license_type">License Type</Label>
						<select
							id="license_type"
							name="license_type"
							class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
							value={String($form.license_type ?? 'named')}
						>
							<option value="named">Named</option>
							<option value="concurrent">Concurrent</option>
						</select>
						{#if $errors.license_type}
							<p class="text-sm text-destructive">{$errors.license_type}</p>
						{/if}
					</div>
				</div>

				<div class="space-y-2">
					<Label for="expiration_date">Expiration Date</Label>
					<Input
						id="expiration_date"
						name="expiration_date"
						type="date"
						value={String($form.expiration_date ?? '')}
					/>
					{#if $errors.expiration_date}
						<p class="text-sm text-destructive">{$errors.expiration_date}</p>
					{/if}
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div class="space-y-2">
						<Label for="expiration_policy">Expiration Policy</Label>
						<select
							id="expiration_policy"
							name="expiration_policy"
							class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
							value={String($form.expiration_policy ?? 'block_new')}
						>
							<option value="block_new">Block New Assignments</option>
							<option value="revoke_all">Revoke All</option>
							<option value="warn_only">Warn Only</option>
						</select>
						{#if $errors.expiration_policy}
							<p class="text-sm text-destructive">{$errors.expiration_policy}</p>
						{/if}
					</div>

					<div class="space-y-2">
						<Label for="warning_days">Warning Days</Label>
						<Input
							id="warning_days"
							name="warning_days"
							type="number"
							min="1"
							max="365"
							value={$form.warning_days !== undefined ? String($form.warning_days) : ''}
						/>
						{#if $errors.warning_days}
							<p class="text-sm text-destructive">{$errors.warning_days}</p>
						{/if}
					</div>
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
				<h2 class="text-xl font-semibold">Pool information</h2>
				<Button variant="outline" size="sm" onclick={startEdit}>Edit</Button>
			</div>
		</CardHeader>
		<CardContent class="space-y-4">
			<div class="grid gap-3">
				<!-- Basic Info -->
				<h3 class="text-sm font-medium text-muted-foreground">Basic info</h3>
				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Name</span>
					<span class="text-sm font-medium">{pool.name}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Vendor</span>
					<span class="text-sm">{pool.vendor}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Description</span>
					<span class="text-sm">{pool.description ?? '\u2014'}</span>
				</div>
				<div class="flex justify-between items-center">
					<span class="text-sm text-muted-foreground">Status</span>
					<span
						class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {statusColors[pool.status] ?? 'bg-gray-100 text-gray-800'}"
					>
						{statusLabels[pool.status] ?? pool.status}
					</span>
				</div>
				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">License Type</span>
					<span class="text-sm">{licenseTypeLabels[pool.license_type] ?? pool.license_type}</span>
				</div>

				<Separator />

				<!-- Capacity & Utilization -->
				<h3 class="text-sm font-medium text-muted-foreground">Capacity & utilization</h3>
				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Total Capacity</span>
					<span class="text-sm font-medium">{pool.total_capacity}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Allocated</span>
					<span class="text-sm">{pool.allocated_count}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Available</span>
					<span class="text-sm">{pool.available_count}</span>
				</div>
				<div class="flex justify-between items-center">
					<span class="text-sm text-muted-foreground">Utilization</span>
					<span class="text-sm font-medium {getUtilizationColor(pool.utilization_percent)}">
						{Number(pool.utilization_percent).toFixed(1)}%
					</span>
				</div>

				<Separator />

				<!-- Cost & Billing -->
				<h3 class="text-sm font-medium text-muted-foreground">Cost & billing</h3>
				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Cost per License</span>
					<span class="text-sm">{formatCost(pool.cost_per_license, pool.currency)}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Currency</span>
					<span class="text-sm">{pool.currency}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Billing Period</span>
					<span class="text-sm">{billingPeriodLabels[pool.billing_period] ?? pool.billing_period}</span>
				</div>

				<Separator />

				<!-- Expiration -->
				<h3 class="text-sm font-medium text-muted-foreground">Expiration</h3>
				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Expiration Date</span>
					<span class="text-sm">{formatDate(pool.expiration_date)}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Expiration Policy</span>
					<span class="text-sm"
						>{expirationPolicyLabels[pool.expiration_policy] ?? pool.expiration_policy}</span
					>
				</div>
				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Warning Days</span>
					<span class="text-sm">{pool.warning_days} days</span>
				</div>

				<Separator />

				<!-- Timestamps -->
				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Created</span>
					<span class="text-sm">{formatDateTime(pool.created_at)}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Updated</span>
					<span class="text-sm">{formatDateTime(pool.updated_at)}</span>
				</div>
			</div>
		</CardContent>
	</Card>

	<Separator class="my-6" />

	<!-- Archive action -->
	{#if pool.status !== 'archived'}
		<Card class="max-w-lg">
			<CardHeader>
				<h2 class="text-xl font-semibold">Archive</h2>
			</CardHeader>
			<CardContent>
				<p class="mb-3 text-sm text-muted-foreground">
					Archiving this pool will prevent new assignments. Existing assignments remain active.
				</p>
				<form
					method="POST"
					action="?/archive"
					use:formEnhance={() => {
						return async ({ result }) => {
							if (result.type === 'success') {
								addToast('success', 'License pool archived');
								await invalidateAll();
							} else if (result.type === 'failure') {
								addToast('error', String(result.data?.error ?? 'Failed to archive pool'));
							}
						};
					}}
				>
					<Button type="submit" variant="outline">Archive pool</Button>
				</form>
			</CardContent>
		</Card>

		<Separator class="my-6" />
	{/if}

	<!-- Delete action -->
	<Card class="max-w-lg">
		<CardHeader>
			<h2 class="text-xl font-semibold">Danger zone</h2>
		</CardHeader>
		<CardContent>
			<Button variant="destructive" onclick={() => (showDeleteDialog = true)}
				>Delete license pool</Button
			>
		</CardContent>
	</Card>
{/if}

<!-- Delete dialog -->
<Dialog.Root bind:open={showDeleteDialog}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Delete license pool</Dialog.Title>
			<Dialog.Description>
				Are you sure you want to delete <strong>{pool.name}</strong>? This action cannot be undone.
				All assignments associated with this pool will also be removed.
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
							addToast('success', 'License pool deleted');
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
