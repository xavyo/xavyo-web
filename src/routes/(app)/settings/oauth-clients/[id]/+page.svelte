<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { enhance as formEnhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { Card, CardHeader, CardContent } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import { Badge } from '$lib/components/ui/badge';
	import { Separator } from '$lib/components/ui/separator';
	import * as Dialog from '$lib/components/ui/dialog';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import { addToast } from '$lib/stores/toast.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// svelte-ignore state_referenced_locally
	const { form, errors, enhance, message } = superForm(data.form, {
		onResult({ result }) {
			if (result.type === 'success' && result.data?.type !== 'error') {
				addToast('success', 'OAuth client updated successfully');
				isEditing = false;
				invalidateAll();
			}
		}
	});

	let isEditing: boolean = $state(false);
	let showDeleteDialog: boolean = $state(false);

	function startEdit() {
		$form.name = data.client.name;
		$form.redirect_uris = data.client.redirect_uris.join(', ');
		$form.grant_types = data.client.grant_types.join(', ');
		$form.scopes = data.client.scopes.join(', ');
		$form.post_logout_redirect_uris = data.client.post_logout_redirect_uris.join(', ');
		$form.logo_url = data.client.logo_url ?? '';
		$form.description = data.client.description ?? '';
		isEditing = true;
	}

	function cancelEdit() {
		isEditing = false;
	}
</script>

<div class="flex items-center justify-between">
	<div class="flex items-center gap-3">
		<PageHeader title={data.client.name} description="OAuth client details" />
		{#if data.client.is_active}
			<Badge variant="default">Active</Badge>
		{:else}
			<Badge variant="destructive">Inactive</Badge>
		{/if}
	</div>
	<a
		href="/settings/oauth-clients"
		class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
	>
		Back to Clients
	</a>
</div>

{#if isEditing}
	<Card class="max-w-lg">
		<CardHeader>
			<h2 class="text-xl font-semibold">Edit client</h2>
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
					<Label for="redirect_uris">Redirect URIs (comma-separated)</Label>
					<textarea
						id="redirect_uris"
						name="redirect_uris"
						class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
						value={String($form.redirect_uris ?? '')}
					></textarea>
					{#if $errors.redirect_uris}
						<p class="text-sm text-destructive">{$errors.redirect_uris}</p>
					{/if}
				</div>

				<div class="space-y-2">
					<Label for="grant_types">Grant Types (comma-separated)</Label>
					<textarea
						id="grant_types"
						name="grant_types"
						class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
						value={String($form.grant_types ?? '')}
					></textarea>
					{#if $errors.grant_types}
						<p class="text-sm text-destructive">{$errors.grant_types}</p>
					{/if}
				</div>

				<div class="space-y-2">
					<Label for="scopes">Scopes (comma-separated)</Label>
					<textarea
						id="scopes"
						name="scopes"
						class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
						value={String($form.scopes ?? '')}
					></textarea>
					{#if $errors.scopes}
						<p class="text-sm text-destructive">{$errors.scopes}</p>
					{/if}
				</div>

				<div class="space-y-2">
					<Label for="post_logout_redirect_uris">Post-Logout Redirect URIs (comma-separated, optional)</Label>
					<textarea
						id="post_logout_redirect_uris"
						name="post_logout_redirect_uris"
						class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
						placeholder="https://app.example.com/logout-callback"
						value={String($form.post_logout_redirect_uris ?? '')}
					></textarea>
					{#if $errors.post_logout_redirect_uris}
						<p class="text-sm text-destructive">{$errors.post_logout_redirect_uris}</p>
					{/if}
					<p class="text-xs text-muted-foreground">URIs where users can be redirected after OIDC logout.</p>
				</div>

				<div class="space-y-2">
					<Label for="logo_url">Logo URL</Label>
					<Input id="logo_url" name="logo_url" type="text" placeholder="https://example.com/app-logo.png" value={String($form.logo_url ?? '')} />
					{#if $errors.logo_url}
						<p class="text-sm text-destructive">{$errors.logo_url}</p>
					{/if}
				</div>

				<div class="space-y-2">
					<Label for="description">Description</Label>
					<textarea
						id="description"
						name="description"
						class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
						placeholder="Brief description of what this application does"
						value={String($form.description ?? '')}
					></textarea>
					{#if $errors.description}
						<p class="text-sm text-destructive">{$errors.description}</p>
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
				<h2 class="text-xl font-semibold">Client information</h2>
				<Button variant="outline" size="sm" onclick={startEdit}>Edit</Button>
			</div>
		</CardHeader>
		<CardContent class="space-y-4">
			<div class="grid gap-3">
				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Name</span>
					<span class="text-sm font-medium">{data.client.name}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Client ID</span>
					<span class="text-sm font-mono break-all">{data.client.client_id}</span>
				</div>
				<div class="flex justify-between items-center">
					<span class="text-sm text-muted-foreground">Client Type</span>
					{#if data.client.client_type === 'confidential'}
						<Badge variant="secondary">Confidential</Badge>
					{:else}
						<Badge variant="outline">Public</Badge>
					{/if}
				</div>

				{#if data.client.logo_url}
					<div class="flex justify-between items-start">
						<span class="text-sm text-muted-foreground">Logo</span>
						<img
							src={data.client.logo_url}
							alt="{data.client.name} logo"
							class="h-10 w-10 rounded object-contain"
						/>
					</div>
				{/if}
				{#if data.client.description}
					<div class="flex justify-between items-start">
						<span class="text-sm text-muted-foreground">Description</span>
						<span class="text-sm text-right max-w-[60%]">{data.client.description}</span>
					</div>
				{/if}

				<Separator />

				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Redirect URIs</span>
					<span class="text-sm text-right max-w-[60%] break-all">
						{data.client.redirect_uris.length
							? data.client.redirect_uris.join(', ')
							: '\u2014'}
					</span>
				</div>
				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Grant Types</span>
					<span class="text-sm">
						{data.client.grant_types.length
							? data.client.grant_types.join(', ')
							: '\u2014'}
					</span>
				</div>
				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Scopes</span>
					<span class="text-sm">
						{data.client.scopes.length ? data.client.scopes.join(', ') : '\u2014'}
					</span>
				</div>
				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Post-Logout URIs</span>
					<span class="text-sm text-right max-w-[60%] break-all">
						{data.client.post_logout_redirect_uris.length
							? data.client.post_logout_redirect_uris.join(', ')
							: '\u2014'}
					</span>
				</div>

				<Separator />

				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Created</span>
					<span class="text-sm">
						{new Date(data.client.created_at).toLocaleString()}
					</span>
				</div>
				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Updated</span>
					<span class="text-sm">
						{new Date(data.client.updated_at).toLocaleString()}
					</span>
				</div>
			</div>
		</CardContent>
	</Card>

	<Separator class="my-6" />

	<!-- Toggle active / Danger zone -->
	<Card class="max-w-lg">
		<CardHeader>
			<h2 class="text-xl font-semibold">Actions</h2>
		</CardHeader>
		<CardContent class="space-y-4">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm font-medium">
						{data.client.is_active ? 'Deactivate client' : 'Activate client'}
					</p>
					<p class="text-sm text-muted-foreground">
						{data.client.is_active
							? 'Disable this client from authenticating.'
							: 'Re-enable this client for authentication.'}
					</p>
				</div>
				<form
					method="POST"
					action="?/toggleActive"
					use:formEnhance={() => {
						return async ({ result, update }) => {
							if (result.type === 'success') {
								addToast(
									'success',
									data.client.is_active
										? 'Client deactivated'
										: 'Client activated'
								);
								await invalidateAll();
							} else if (result.type === 'failure') {
								addToast(
									'error',
									String(
										(result.data as Record<string, unknown> | undefined)
											?.error ?? 'Failed to toggle client'
									)
								);
							}
						};
					}}
				>
					<input type="hidden" name="is_active" value={String(data.client.is_active)} />
					<Button
						type="submit"
						variant={data.client.is_active ? 'destructive' : 'default'}
						size="sm"
					>
						{data.client.is_active ? 'Deactivate' : 'Activate'}
					</Button>
				</form>
			</div>

			<Separator />

			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm font-medium">Delete client</p>
					<p class="text-sm text-muted-foreground">
						Permanently remove this OAuth client. This action cannot be undone.
					</p>
				</div>
				<Button variant="destructive" size="sm" onclick={() => (showDeleteDialog = true)}>
					Delete
				</Button>
			</div>
		</CardContent>
	</Card>
{/if}

<!-- Delete dialog -->
<Dialog.Root bind:open={showDeleteDialog}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Delete OAuth client</Dialog.Title>
			<Dialog.Description>
				Are you sure you want to delete <strong>{data.client.name}</strong>? This action
				cannot be undone. Any applications using this client will stop working.
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
							addToast('success', 'OAuth client deleted');
							await update();
						} else if (result.type === 'failure') {
							addToast(
								'error',
								String(
									(result.data as Record<string, unknown> | undefined)?.error ??
										'Failed to delete'
								)
							);
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
