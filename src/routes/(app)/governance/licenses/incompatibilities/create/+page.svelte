<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { Card, CardHeader, CardContent } from '$lib/components/ui/card';
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
				addToast('success', 'Incompatibility rule created successfully');
			}
		}
	});
</script>

<PageHeader
	title="Create Incompatibility"
	description="Define a license incompatibility rule between two pools"
/>

<Card class="max-w-lg">
	<CardHeader>
		<h2 class="text-xl font-semibold">Incompatibility details</h2>
	</CardHeader>
	<CardContent>
		{#if $message}
			<Alert variant="destructive" class="mb-4">
				<AlertDescription>{$message}</AlertDescription>
			</Alert>
		{/if}

		<form method="POST" use:enhance class="space-y-4">
			<div class="space-y-2">
				<Label for="pool_a_id">Pool A</Label>
				<select
					id="pool_a_id"
					name="pool_a_id"
					class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
					value={String($form.pool_a_id ?? '')}
				>
					<option value="" disabled>Select first pool</option>
					{#each data.pools as pool}
						<option value={pool.id}>{pool.name} ({pool.vendor})</option>
					{/each}
				</select>
				{#if $errors.pool_a_id}
					<p class="text-sm text-destructive">{$errors.pool_a_id}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="pool_b_id">Pool B</Label>
				<select
					id="pool_b_id"
					name="pool_b_id"
					class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
					value={String($form.pool_b_id ?? '')}
				>
					<option value="" disabled>Select second pool</option>
					{#each data.pools as pool}
						<option value={pool.id}>{pool.name} ({pool.vendor})</option>
					{/each}
				</select>
				{#if $errors.pool_b_id}
					<p class="text-sm text-destructive">{$errors.pool_b_id}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="reason">Reason</Label>
				<textarea
					id="reason"
					name="reason"
					class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
					placeholder="Explain why these pools are incompatible"
					value={String($form.reason ?? '')}
				></textarea>
				{#if $errors.reason}
					<p class="text-sm text-destructive">{$errors.reason}</p>
				{/if}
			</div>

			<div class="flex gap-2 pt-2">
				<Button type="submit">Create incompatibility</Button>
				<a
					href="/governance/licenses?tab=incompatibilities"
					class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
				>
					Cancel
				</a>
			</div>
		</form>
	</CardContent>
</Card>
