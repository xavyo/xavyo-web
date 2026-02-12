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

	const { form, errors, enhance, message } = superForm(data.form, {
		onResult({ result }) {
			if (result.type === 'redirect') {
				addToast('success', 'Entitlement link created successfully');
			}
		}
	});
</script>

<PageHeader
	title="Create Entitlement Link"
	description="Link a license pool to a governance entitlement"
/>

<Card class="max-w-lg">
	<CardHeader>
		<h2 class="text-xl font-semibold">Link details</h2>
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
				<Label for="entitlement_id">Entitlement</Label>
				<select
					id="entitlement_id"
					name="entitlement_id"
					class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
					value={String($form.entitlement_id ?? '')}
				>
					<option value="" disabled>Select an entitlement</option>
					{#each data.entitlements as entitlement}
						<option value={entitlement.id}>{entitlement.name}</option>
					{/each}
				</select>
				{#if $errors.entitlement_id}
					<p class="text-sm text-destructive">{$errors.entitlement_id}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="priority">Priority</Label>
				<Input
					id="priority"
					name="priority"
					type="number"
					min="0"
					placeholder="0"
					value={String($form.priority ?? '0')}
				/>
				{#if $errors.priority}
					<p class="text-sm text-destructive">{$errors.priority}</p>
				{/if}
				<p class="text-xs text-muted-foreground">
					Higher priority links are preferred when multiple pools provide the same entitlement
				</p>
			</div>

			<div class="flex gap-2 pt-2">
				<Button type="submit">Create link</Button>
				<a
					href="/governance/licenses?tab=entitlement-links"
					class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
				>
					Cancel
				</a>
			</div>
		</form>
	</CardContent>
</Card>
