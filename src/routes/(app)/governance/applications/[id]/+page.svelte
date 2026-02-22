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
	import StatusBadge from '../../status-badge.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// svelte-ignore state_referenced_locally
	const { form, errors, enhance, message } = superForm(data.form, {
		onResult({ result }) {
			if (result.type === 'success' && result.data?.type !== 'error') {
				addToast('success', 'Application updated successfully');
				isEditing = false;
				invalidateAll();
			}
		}
	});

	let isEditing: boolean = $state(false);
	let showDeleteDialog: boolean = $state(false);
	let deleteError: string = $state('');

	function startEdit() {
		$form.name = data.application.name;
		$form.status = data.application.status;
		$form.description = data.application.description ?? undefined;
		$form.external_id = data.application.external_id ?? undefined;
		$form.is_delegable = data.application.is_delegable;
		isEditing = true;
	}

	function cancelEdit() {
		isEditing = false;
	}
</script>

<div class="flex items-center justify-between">
	<div class="flex items-center gap-3">
		<PageHeader title={data.application.name} description="Application details" />
		<StatusBadge status={data.application.status} />
	</div>
	<a
		href="/governance/applications"
		class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
	>
		Back to Applications
	</a>
</div>

{#if isEditing}
	<Card class="max-w-lg">
		<CardHeader>
			<h2 class="text-xl font-semibold">Edit application</h2>
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
					<Label for="status">Status</Label>
					<select
						id="status"
						name="status"
						class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
						value={String($form.status ?? '')}
						onchange={(e) => { $form.status = e.currentTarget.value as 'active' | 'inactive'; }}
					>
						<option value="active">Active</option>
						<option value="inactive">Inactive</option>
					</select>
					{#if $errors.status}
						<p class="text-sm text-destructive">{$errors.status}</p>
					{/if}
				</div>

				<Separator class="my-4" />

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
					<Label for="external_id">External ID</Label>
					<Input
						id="external_id"
						name="external_id"
						type="text"
						value={String($form.external_id ?? '')}
					/>
					{#if $errors.external_id}
						<p class="text-sm text-destructive">{$errors.external_id}</p>
					{/if}
				</div>

				<div class="flex items-center gap-2">
					<input
						id="is_delegable"
						name="is_delegable"
						type="checkbox"
						class="h-4 w-4 rounded border-input"
						checked={$form.is_delegable}
					/>
					<Label for="is_delegable">Is delegable</Label>
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
				<h2 class="text-xl font-semibold">Application information</h2>
				<Button variant="outline" size="sm" onclick={startEdit}>Edit</Button>
			</div>
		</CardHeader>
		<CardContent class="space-y-4">
			<div class="grid gap-3">
				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Name</span>
					<span class="text-sm font-medium">{data.application.name}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Type</span>
					<span class="text-sm">{data.application.app_type === 'internal' ? 'Internal' : 'External'}</span>
				</div>
				<div class="flex justify-between items-center">
					<span class="text-sm text-muted-foreground">Status</span>
					<StatusBadge status={data.application.status} />
				</div>
				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Description</span>
					<span class="max-w-[250px] text-right text-sm">{data.application.description ?? '\u2014'}</span>
				</div>

				<Separator />

				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">External ID</span>
					<span class="text-sm font-mono">{data.application.external_id ?? '\u2014'}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Is delegable</span>
					<span class="text-sm">{data.application.is_delegable ? 'Yes' : 'No'}</span>
				</div>

				<Separator />

				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">ID</span>
					<span class="text-sm font-mono">{data.application.id}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Created</span>
					<span class="text-sm">{new Date(data.application.created_at).toLocaleString()}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Updated</span>
					<span class="text-sm">{new Date(data.application.updated_at).toLocaleString()}</span>
				</div>
			</div>
		</CardContent>
	</Card>

	<Separator class="my-6" />

	<!-- Delete action -->
	<Card class="max-w-lg">
		<CardHeader>
			<h2 class="text-xl font-semibold">Danger zone</h2>
		</CardHeader>
		<CardContent>
			{#if deleteError}
				<Alert variant="destructive" class="mb-4">
					<AlertDescription>{deleteError}</AlertDescription>
				</Alert>
			{/if}
			<Button variant="destructive" onclick={() => { deleteError = ''; showDeleteDialog = true; }}>Delete application</Button>
		</CardContent>
	</Card>
{/if}

<!-- Delete dialog -->
<Dialog.Root bind:open={showDeleteDialog}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Delete application</Dialog.Title>
			<Dialog.Description>
				Are you sure you want to delete <strong>{data.application.name}</strong>? This action cannot
				be undone.
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
							addToast('success', 'Application deleted');
							await update();
						} else if (result.type === 'failure') {
							deleteError = String(result.data?.error ?? 'Failed to delete');
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
