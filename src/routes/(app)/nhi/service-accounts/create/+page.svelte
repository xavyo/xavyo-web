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
				addToast('success', 'Service account created successfully');
			}
		}
	});
</script>

<PageHeader title="Create service account" description="Register a new machine-to-machine credential" />

<Card class="max-w-lg">
	<CardHeader>
		<h2 class="text-xl font-semibold">Service account details</h2>
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
					placeholder="e.g. CI Pipeline"
					value={String($form.name ?? '')}
				/>
				{#if $errors.name}
					<p class="text-sm text-destructive">{$errors.name}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="description">Description (optional)</Label>
				<Input
					id="description"
					name="description"
					type="text"
					placeholder="Brief description of this service account"
					value={String($form.description ?? '')}
				/>
				{#if $errors.description}
					<p class="text-sm text-destructive">{$errors.description}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="purpose">Purpose</Label>
				<Input
					id="purpose"
					name="purpose"
					type="text"
					placeholder="e.g. Continuous integration builds"
					value={String($form.purpose ?? '')}
				/>
				{#if $errors.purpose}
					<p class="text-sm text-destructive">{$errors.purpose}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="environment">Environment (optional)</Label>
				<Input
					id="environment"
					name="environment"
					type="text"
					placeholder="e.g. production, staging"
					value={String($form.environment ?? '')}
				/>
				{#if $errors.environment}
					<p class="text-sm text-destructive">{$errors.environment}</p>
				{/if}
			</div>

			<div class="flex gap-2 pt-2">
				<Button type="submit">Create service account</Button>
				<a
					href="/nhi"
					class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
				>
					Cancel
				</a>
			</div>
		</form>
	</CardContent>
</Card>
