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

	// svelte-ignore state_referenced_locally
	const { form, errors, enhance, message } = superForm(data.form, {
		onResult({ result }) {
			if (result.type === 'redirect') {
				addToast('success', 'Archetype created successfully');
			}
		}
	});
</script>

<PageHeader title="Create archetype" description="Define a new persona archetype template" />

<Card class="max-w-lg">
	<CardHeader>
		<h2 class="text-xl font-semibold">Archetype details</h2>
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
					placeholder="e.g. Admin Template"
					value={String($form.name ?? '')}
				/>
				{#if $errors.name}
					<p class="text-sm text-destructive">{$errors.name}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="naming_pattern">Naming pattern</Label>
				<Input
					id="naming_pattern"
					name="naming_pattern"
					type="text"
					placeholder={'e.g. admin.{username}'}
					value={String($form.naming_pattern ?? '')}
				/>
				{#if $errors.naming_pattern}
					<p class="text-sm text-destructive">{$errors.naming_pattern}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="description">Description (optional)</Label>
				<Input
					id="description"
					name="description"
					type="text"
					placeholder="Brief description of this archetype"
					value={String($form.description ?? '')}
				/>
				{#if $errors.description}
					<p class="text-sm text-destructive">{$errors.description}</p>
				{/if}
			</div>

			<Separator class="my-4" />

			<h3 class="text-sm font-medium text-muted-foreground">Lifecycle policy (optional)</h3>

			<div class="space-y-2">
				<Label for="default_validity_days">Default validity (days)</Label>
				<Input
					id="default_validity_days"
					name="default_validity_days"
					type="number"
					placeholder="365"
					value={$form.default_validity_days !== undefined ? String($form.default_validity_days) : ''}
				/>
				{#if $errors.default_validity_days}
					<p class="text-sm text-destructive">{$errors.default_validity_days}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="max_validity_days">Max validity (days)</Label>
				<Input
					id="max_validity_days"
					name="max_validity_days"
					type="number"
					placeholder="730"
					value={$form.max_validity_days !== undefined ? String($form.max_validity_days) : ''}
				/>
				{#if $errors.max_validity_days}
					<p class="text-sm text-destructive">{$errors.max_validity_days}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="notification_before_expiry_days">Notification before expiry (days)</Label>
				<Input
					id="notification_before_expiry_days"
					name="notification_before_expiry_days"
					type="number"
					placeholder="30"
					value={$form.notification_before_expiry_days !== undefined ? String($form.notification_before_expiry_days) : ''}
				/>
				{#if $errors.notification_before_expiry_days}
					<p class="text-sm text-destructive">{$errors.notification_before_expiry_days}</p>
				{/if}
			</div>

			<div class="flex gap-2 pt-2">
				<Button type="submit">Create archetype</Button>
				<a
					href="/personas/archetypes"
					class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
				>
					Cancel
				</a>
			</div>
		</form>
	</CardContent>
</Card>
