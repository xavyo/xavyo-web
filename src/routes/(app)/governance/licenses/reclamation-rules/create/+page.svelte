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
				addToast('success', 'Reclamation rule created successfully');
			}
		}
	});

	let triggerType = $derived(String($form.trigger_type ?? ''));
</script>

<PageHeader
	title="Create Reclamation Rule"
	description="Define an automatic license reclamation rule for a pool"
/>

<Card class="max-w-lg">
	<CardHeader>
		<h2 class="text-xl font-semibold">Rule details</h2>
	</CardHeader>
	<CardContent>
		{#if $message}
			<Alert variant="destructive" class="mb-4">
				<AlertDescription>{$message}</AlertDescription>
			</Alert>
		{/if}

		<form method="POST" use:enhance class="space-y-4">
			<div class="space-y-2">
				<Label for="license_pool_id">License Pool</Label>
				<select
					id="license_pool_id"
					name="license_pool_id"
					class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
					value={String($form.license_pool_id ?? '')}
				>
					<option value="" disabled>Select a license pool</option>
					{#each data.pools as pool}
						<option value={pool.id}>{pool.name} ({pool.vendor})</option>
					{/each}
				</select>
				{#if $errors.license_pool_id}
					<p class="text-sm text-destructive">{$errors.license_pool_id}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="trigger_type">Trigger Type</Label>
				<select
					id="trigger_type"
					name="trigger_type"
					class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
					value={String($form.trigger_type ?? '')}
				>
					<option value="" disabled>Select trigger type</option>
					<option value="inactivity">Inactivity</option>
					<option value="lifecycle_state">Lifecycle State</option>
				</select>
				{#if $errors.trigger_type}
					<p class="text-sm text-destructive">{$errors.trigger_type}</p>
				{/if}
			</div>

			<div class="space-y-2" class:hidden={triggerType !== 'inactivity'}>
				<Label for="threshold_days">Threshold Days</Label>
				<Input
					id="threshold_days"
					name="threshold_days"
					type="number"
					min="1"
					placeholder="e.g. 90"
					value={String($form.threshold_days ?? '')}
				/>
				{#if $errors.threshold_days}
					<p class="text-sm text-destructive">{$errors.threshold_days}</p>
				{/if}
				<p class="text-xs text-muted-foreground">
					Number of days of inactivity before the license is reclaimed
				</p>
			</div>

			<div class="space-y-2" class:hidden={triggerType !== 'lifecycle_state'}>
				<Label for="lifecycle_state">Lifecycle State</Label>
				<Input
					id="lifecycle_state"
					name="lifecycle_state"
					type="text"
					placeholder="e.g. suspended, terminated"
					value={String($form.lifecycle_state ?? '')}
				/>
				{#if $errors.lifecycle_state}
					<p class="text-sm text-destructive">{$errors.lifecycle_state}</p>
				{/if}
				<p class="text-xs text-muted-foreground">
					Reclaim licenses when user enters this lifecycle state
				</p>
			</div>

			<div class="space-y-2">
				<Label for="notification_days_before">Notification Days Before</Label>
				<Input
					id="notification_days_before"
					name="notification_days_before"
					type="number"
					min="0"
					max="365"
					placeholder="7"
					value={String($form.notification_days_before ?? '7')}
				/>
				{#if $errors.notification_days_before}
					<p class="text-sm text-destructive">{$errors.notification_days_before}</p>
				{/if}
				<p class="text-xs text-muted-foreground">
					Days before reclamation to notify the user (0 = no notification)
				</p>
			</div>

			<div class="flex gap-2 pt-2">
				<Button type="submit">Create rule</Button>
				<a
					href="/governance/licenses?tab=reclamation-rules"
					class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
				>
					Cancel
				</a>
			</div>
		</form>
	</CardContent>
</Card>
