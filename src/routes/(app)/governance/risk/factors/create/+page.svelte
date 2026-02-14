<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { Card, CardHeader, CardContent } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import { Separator } from '$lib/components/ui/separator';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import { addToast } from '$lib/stores/toast.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const { form, errors, enhance, message } = superForm(data.form, {
		onResult({ result }) {
			if (result.type === 'redirect') {
				addToast('success', 'Risk factor created successfully');
			}
		}
	});
</script>

<PageHeader title="Create Risk Factor" description="Define a new risk scoring factor" />

<Card class="max-w-lg">
	<CardHeader>
		<h2 class="text-xl font-semibold">Factor details</h2>
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
					placeholder="e.g. Failed Login Attempts"
					bind:value={$form.name}
				/>
				{#if $errors.name}<p class="text-sm text-destructive">{$errors.name}</p>{/if}
			</div>

			<div class="space-y-2">
				<Label for="category">Category</Label>
				<select
					id="category"
					name="category"
					class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
					value={String($form.category ?? 'static')}
					onchange={(e) => {
						$form.category = (e.target as HTMLSelectElement).value as 'static' | 'dynamic';
					}}
				>
					<option value="static">Static</option>
					<option value="dynamic">Dynamic</option>
				</select>
				{#if $errors.category}<p class="text-sm text-destructive">{$errors.category}</p>{/if}
			</div>

			<div class="space-y-2">
				<Label for="factor_type">Factor Type</Label>
				<Input
					id="factor_type"
					name="factor_type"
					type="text"
					placeholder="e.g. authentication, access_pattern"
					bind:value={$form.factor_type}
				/>
				{#if $errors.factor_type}<p class="text-sm text-destructive">{$errors.factor_type}</p>{/if}
			</div>

			<div class="space-y-2">
				<Label for="weight">Weight (0-10)</Label>
				<Input
					id="weight"
					name="weight"
					type="number"
					min="0"
					max="10"
					step="0.1"
					bind:value={$form.weight}
				/>
				{#if $errors.weight}<p class="text-sm text-destructive">{$errors.weight}</p>{/if}
			</div>

			<Separator class="my-4" />

			<div class="space-y-2">
				<Label for="description">Description (optional)</Label>
				<textarea
					id="description"
					name="description"
					class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
					placeholder="Brief description of this risk factor"
					bind:value={$form.description}
				></textarea>
				{#if $errors.description}<p class="text-sm text-destructive">{$errors.description}</p>{/if}
			</div>

			<div class="flex items-center gap-2">
				<input
					type="checkbox"
					id="is_enabled"
					name="is_enabled"
					bind:checked={$form.is_enabled}
					class="h-4 w-4 rounded border-input"
				/>
				<Label for="is_enabled">Enabled</Label>
			</div>

			<div class="flex gap-2 pt-2">
				<Button type="submit">Create Factor</Button>
				<a
					href="/governance/risk/factors"
					class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
				>
					Cancel
				</a>
			</div>
		</form>
	</CardContent>
</Card>
