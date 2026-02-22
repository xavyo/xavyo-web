<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { Card, CardHeader, CardContent } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import { addToast } from '$lib/stores/toast.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// svelte-ignore state_referenced_locally
	const { form, errors, enhance, message } = superForm(data.form, {
		onResult({ result }) {
			if (result.type === 'redirect') {
				addToast('success', 'License pool created successfully');
			}
		}
	});
</script>

<PageHeader title="Create License Pool" description="Define a new license pool for software license management" />

<Card class="max-w-lg">
	<CardHeader>
		<h2 class="text-xl font-semibold">Pool details</h2>
	</CardHeader>
	<CardContent>
		{#if $message}
			<Alert variant="destructive" class="mb-4">
				<AlertDescription>{$message}</AlertDescription>
			</Alert>
		{/if}

		<form method="POST" use:enhance class="space-y-4">
			<div class="space-y-2">
				<Label for="name">Name</Label>
				<Input
					id="name"
					name="name"
					type="text"
					placeholder="e.g. Microsoft 365 E3"
					value={String($form.name ?? '')}
				/>
				{#if $errors.name}
					<p class="text-sm text-destructive">{$errors.name}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="vendor">Vendor</Label>
				<Input
					id="vendor"
					name="vendor"
					type="text"
					placeholder="e.g. Microsoft"
					value={String($form.vendor ?? '')}
				/>
				{#if $errors.vendor}
					<p class="text-sm text-destructive">{$errors.vendor}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="description">Description (optional)</Label>
				<textarea
					id="description"
					name="description"
					class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
					placeholder="Describe this license pool"
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
					placeholder="e.g. 100"
					value={String($form.total_capacity ?? '')}
				/>
				{#if $errors.total_capacity}
					<p class="text-sm text-destructive">{$errors.total_capacity}</p>
				{/if}
			</div>

			<div class="grid grid-cols-2 gap-4">
				<div class="space-y-2">
					<Label for="cost_per_license">Cost per License (optional)</Label>
					<Input
						id="cost_per_license"
						name="cost_per_license"
						type="number"
						min="0"
						step="0.01"
						placeholder="e.g. 36.00"
						value={String($form.cost_per_license ?? '')}
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
				<Label for="expiration_date">Expiration Date (optional)</Label>
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
						placeholder="60"
						value={String($form.warning_days ?? '60')}
					/>
					{#if $errors.warning_days}
						<p class="text-sm text-destructive">{$errors.warning_days}</p>
					{/if}
				</div>
			</div>

			<div class="flex gap-2 pt-2">
				<Button type="submit">Create pool</Button>
				<a
					href="/governance/licenses"
					class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
				>
					Cancel
				</a>
			</div>
		</form>
	</CardContent>
</Card>
