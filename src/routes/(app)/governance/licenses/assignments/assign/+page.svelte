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
				addToast('success', 'License assigned successfully');
			}
		}
	});
</script>

<PageHeader title="Assign License" description="Assign a license from a pool to a user" />

<Card class="max-w-lg">
	<CardHeader>
		<h2 class="text-xl font-semibold">Assignment details</h2>
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
					class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
					value={String($form.license_pool_id ?? '')}
				>
					<option value="">Select a pool</option>
					{#each data.pools as pool}
						<option value={pool.id}>{pool.name} ({pool.vendor}) - {pool.available_count} available</option>
					{/each}
				</select>
				{#if $errors.license_pool_id}
					<p class="text-sm text-destructive">{$errors.license_pool_id}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="user_id">User ID</Label>
				<Input
					id="user_id"
					name="user_id"
					type="text"
					placeholder="Enter user UUID"
					value={String($form.user_id ?? '')}
				/>
				{#if $errors.user_id}
					<p class="text-sm text-destructive">{$errors.user_id}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="source">Source</Label>
				<select
					id="source"
					name="source"
					class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
					value={String($form.source ?? 'manual')}
				>
					<option value="manual">Manual</option>
					<option value="automatic">Automatic</option>
					<option value="entitlement">Entitlement</option>
				</select>
				{#if $errors.source}
					<p class="text-sm text-destructive">{$errors.source}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="notes">Notes (optional)</Label>
				<textarea
					id="notes"
					name="notes"
					class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
					placeholder="Add notes about this assignment"
					value={String($form.notes ?? '')}
				></textarea>
				{#if $errors.notes}
					<p class="text-sm text-destructive">{$errors.notes}</p>
				{/if}
			</div>

			<div class="flex gap-2 pt-2">
				<Button type="submit">Assign license</Button>
				<a
					href="/governance/licenses?tab=assignments"
					class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
				>
					Cancel
				</a>
			</div>
		</form>
	</CardContent>
</Card>
