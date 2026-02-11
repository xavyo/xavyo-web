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
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import ArchetypeStatusBadge from '../../archetype-status-badge.svelte';
	import { addToast } from '$lib/stores/toast.svelte';
	import type { PageData } from './$types';
	import * as Dialog from '$lib/components/ui/dialog';

	let { data }: { data: PageData } = $props();

	const { form, errors, enhance, message } = superForm(data.form, {
		onResult({ result }) {
			if (result.type === 'success' && result.data?.type !== 'error') {
				addToast('success', 'Archetype updated successfully');
				isEditing = false;
				invalidateAll();
			}
		}
	});

	let isEditing: boolean = $state(false);
	let showDeleteDialog: boolean = $state(false);

	function startEdit() {
		$form.name = data.archetype.name;
		$form.description = data.archetype.description ?? undefined;
		$form.naming_pattern = data.archetype.naming_pattern;
		$form.default_validity_days = data.archetype.lifecycle_policy?.default_validity_days;
		$form.max_validity_days = data.archetype.lifecycle_policy?.max_validity_days;
		$form.notification_before_expiry_days = data.archetype.lifecycle_policy?.notification_before_expiry_days;
		isEditing = true;
	}

	function cancelEdit() {
		isEditing = false;
	}
</script>

<div class="flex items-center justify-between">
	<PageHeader title={data.archetype.name} description="Archetype details" />
	<a
		href="/personas/archetypes"
		class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
	>
		Back to archetypes
	</a>
</div>

{#if isEditing}
	<Card class="max-w-lg">
		<CardHeader>
			<h2 class="text-xl font-semibold">Edit archetype</h2>
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
					<Input
						id="name"
						name="name"
						type="text"
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
						value={String($form.naming_pattern ?? '')}
					/>
					{#if $errors.naming_pattern}
						<p class="text-sm text-destructive">{$errors.naming_pattern}</p>
					{/if}
				</div>

				<div class="space-y-2">
					<Label for="description">Description</Label>
					<Input
						id="description"
						name="description"
						type="text"
						value={String($form.description ?? '')}
					/>
					{#if $errors.description}
						<p class="text-sm text-destructive">{$errors.description}</p>
					{/if}
				</div>

				<Separator class="my-4" />

				<h3 class="text-sm font-medium text-muted-foreground">Lifecycle policy</h3>

				<div class="space-y-2">
					<Label for="default_validity_days">Default validity (days)</Label>
					<Input
						id="default_validity_days"
						name="default_validity_days"
						type="number"
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
						value={$form.notification_before_expiry_days !== undefined ? String($form.notification_before_expiry_days) : ''}
					/>
					{#if $errors.notification_before_expiry_days}
						<p class="text-sm text-destructive">{$errors.notification_before_expiry_days}</p>
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
				<h2 class="text-xl font-semibold">Archetype information</h2>
				<Button variant="outline" size="sm" onclick={startEdit}>Edit</Button>
			</div>
		</CardHeader>
		<CardContent class="space-y-4">
			<div class="grid gap-3">
				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Name</span>
					<span class="text-sm font-medium">{data.archetype.name}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Description</span>
					<span class="text-sm">{data.archetype.description ?? '—'}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Naming pattern</span>
					<span class="text-sm font-mono">{data.archetype.naming_pattern}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Status</span>
					<ArchetypeStatusBadge isActive={data.archetype.is_active} />
				</div>
				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Personas</span>
					<span class="text-sm">{data.archetype.personas_count ?? 0}</span>
				</div>

				<Separator />

				<h3 class="text-sm font-medium text-muted-foreground">Lifecycle policy</h3>
				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Default validity</span>
					<span class="text-sm">{data.archetype.lifecycle_policy?.default_validity_days ?? '—'} days</span>
				</div>
				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Max validity</span>
					<span class="text-sm">{data.archetype.lifecycle_policy?.max_validity_days ?? '—'} days</span>
				</div>
				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Notification before expiry</span>
					<span class="text-sm">{data.archetype.lifecycle_policy?.notification_before_expiry_days ?? '—'} days</span>
				</div>

				<Separator />

				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Created</span>
					<span class="text-sm">{new Date(data.archetype.created_at).toLocaleString()}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Updated</span>
					<span class="text-sm">{new Date(data.archetype.updated_at).toLocaleString()}</span>
				</div>
			</div>
		</CardContent>
	</Card>

	<Separator class="my-6" />

	<Card class="max-w-lg">
		<CardHeader>
			<h2 class="text-xl font-semibold">Actions</h2>
		</CardHeader>
		<CardContent class="flex gap-2">
			{#if data.archetype.is_active}
				<form
					method="POST"
					action="?/deactivate"
					use:formEnhance={() => {
						return async ({ result, update }) => {
							if (result.type === 'success') {
								addToast('success', 'Archetype deactivated');
								await invalidateAll();
							} else if (result.type === 'failure') {
								addToast('error', String(result.data?.error ?? 'Failed to deactivate archetype'));
							}
						};
					}}
				>
					<Button type="submit" variant="outline">Deactivate</Button>
				</form>
			{:else}
				<form
					method="POST"
					action="?/activate"
					use:formEnhance={() => {
						return async ({ result, update }) => {
							if (result.type === 'success') {
								addToast('success', 'Archetype activated');
								await invalidateAll();
							} else if (result.type === 'failure') {
								addToast('error', String(result.data?.error ?? 'Failed to activate archetype'));
							}
						};
					}}
				>
					<Button type="submit" variant="outline">Activate</Button>
				</form>
			{/if}

			<Button variant="destructive" onclick={() => (showDeleteDialog = true)}>
				Delete
			</Button>
		</CardContent>
	</Card>

	<Dialog.Root bind:open={showDeleteDialog}>
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title>Delete archetype</Dialog.Title>
				<Dialog.Description>
					Are you sure you want to delete <strong>{data.archetype.name}</strong>? This action
					cannot be undone.
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
								addToast('success', 'Archetype deleted');
								await update();
							} else if (result.type === 'failure') {
								addToast('error', String(result.data?.error ?? 'Failed to delete archetype'));
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
{/if}
