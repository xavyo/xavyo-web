<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { enhance as formEnhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { Card, CardHeader, CardContent } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import { Separator } from '$lib/components/ui/separator';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import ActivityTimeline from '$lib/components/audit/activity-timeline.svelte';
	import LifecycleStatus from '$lib/components/lifecycle/lifecycle-status.svelte';
	import { addToast } from '$lib/stores/toast.svelte';
	import type { PageData, ActionData } from './$types';
	import * as Dialog from '$lib/components/ui/dialog';

	let { data, form: actionData }: { data: PageData; form: ActionData } = $props();

	// svelte-ignore state_referenced_locally
	const { form, errors, enhance, message } = superForm(data.form, {
		onResult({ result }) {
			if (result.type === 'success' && result.data?.type !== 'error') {
				addToast('success', 'User updated successfully');
				isEditing = false;
				invalidateAll();
			}
		}
	});

	let isEditing: boolean = $state(false);
	let showDeleteDialog: boolean = $state(false);
	let showDisableConfirm: boolean = $state(false);

	const isSelf = $derived(data.user.id === data.currentUserId);

	const availableRoles = ['admin', 'user'];

	function toggleRole(role: string) {
		const current = $form.roles ?? [];
		if (current.includes(role)) {
			$form.roles = current.filter((r: string) => r !== role);
		} else {
			$form.roles = [...current, role];
		}
	}

	function startEdit() {
		$form.email = data.user.email;
		$form.roles = [...data.user.roles];
		$form.username = undefined;
		isEditing = true;
	}

	function cancelEdit() {
		isEditing = false;
	}
</script>

<div class="flex items-center justify-between">
	<PageHeader title={data.user.email} description="User details" />
	<a
		href="/users"
		class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
	>
		Back to users
	</a>
</div>

{#if isEditing}
	<Card class="max-w-lg">
		<CardHeader>
			<h2 class="text-xl font-semibold">Edit user</h2>
		</CardHeader>
		<CardContent>
			{#if $message}
				<Alert variant="destructive" class="mb-4">
					<AlertDescription>{$message}</AlertDescription>
				</Alert>
			{/if}

			<form method="POST" action="?/update" use:enhance class="space-y-4">
				<div class="space-y-2">
					<Label for="email">Email</Label>
					<Input
						id="email"
						name="email"
						type="email"
						value={String($form.email ?? '')}
					/>
					{#if $errors.email}
						<p class="text-sm text-destructive">{$errors.email}</p>
					{/if}
				</div>

				<div class="space-y-2">
					<Label for="username">Username</Label>
					<Input
						id="username"
						name="username"
						type="text"
						placeholder="Optional username"
						value={String($form.username ?? '')}
					/>
					{#if $errors.username}
						<p class="text-sm text-destructive">{$errors.username}</p>
					{/if}
				</div>

				<div class="space-y-2">
					<Label>Roles</Label>
					<div class="flex gap-4">
						{#each availableRoles as role}
							<label class="flex items-center gap-2 text-sm">
								<input
									type="checkbox"
									name="roles"
									value={role}
									checked={($form.roles ?? []).includes(role)}
									onchange={() => toggleRole(role)}
									class="h-4 w-4 rounded border-input"
								/>
								{role}
							</label>
						{/each}
					</div>
					{#if $errors.roles?._errors}
						<p class="text-sm text-destructive">{$errors.roles._errors}</p>
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
				<h2 class="text-xl font-semibold">User information</h2>
				<Button variant="outline" size="sm" onclick={startEdit}>Edit</Button>
			</div>
		</CardHeader>
		<CardContent class="space-y-4">
			<div class="grid gap-3">
				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Email</span>
					<span class="text-sm font-medium">{data.user.email}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Status</span>
					<span>
						{#if data.user.is_active}
							<Badge variant="default">Active</Badge>
						{:else}
							<Badge variant="secondary">Inactive</Badge>
						{/if}
					</span>
				</div>
				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Roles</span>
					<span class="flex gap-1">
						{#each data.user.roles as role}
							<Badge variant="outline">{role}</Badge>
						{/each}
					</span>
				</div>
				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Email verified</span>
					<span class="text-sm">{data.user.email_verified ? 'Yes' : 'No'}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Created</span>
					<span class="text-sm">{new Date(data.user.created_at).toLocaleString()}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Updated</span>
					<span class="text-sm">{new Date(data.user.updated_at).toLocaleString()}</span>
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
			{#if data.user.is_active}
				{#if !isSelf}
					<Button variant="outline" onclick={() => (showDisableConfirm = true)}>Disable</Button>
				{/if}
			{:else}
				<form
					method="POST"
					action="?/enable"
					use:formEnhance={() => {
						return async ({ result, update }) => {
							if (result.type === 'success') {
								addToast('success', 'User enabled');
								await invalidateAll();
							} else if (result.type === 'failure') {
								addToast('error', String(result.data?.error ?? 'Failed to enable user'));
							}
						};
					}}
				>
					<Button type="submit" variant="outline">Enable</Button>
				</form>
			{/if}

			<Button variant="destructive" onclick={() => (showDeleteDialog = true)}>
				Delete
			</Button>
		</CardContent>
	</Card>

	<Separator class="my-6" />

	<div class="max-w-lg">
		<LifecycleStatus status={data.lifecycleStatus ?? null} />
	</div>

	<Dialog.Root bind:open={showDisableConfirm}>
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title>Disable user</Dialog.Title>
				<Dialog.Description>
					Are you sure you want to disable <strong>{data.user.email}</strong>? They will no
					longer be able to sign in.
				</Dialog.Description>
			</Dialog.Header>
			<Dialog.Footer>
				<Button variant="outline" onclick={() => (showDisableConfirm = false)}>Cancel</Button>
				<form
					method="POST"
					action="?/disable"
					use:formEnhance={() => {
						return async ({ result }) => {
							if (result.type === 'success') {
								addToast('success', 'User disabled');
								showDisableConfirm = false;
								await invalidateAll();
							} else if (result.type === 'failure') {
								addToast('error', String(result.data?.error ?? 'Failed to disable user'));
								showDisableConfirm = false;
							}
						};
					}}
				>
					<Button type="submit" variant="destructive">Confirm disable</Button>
				</form>
			</Dialog.Footer>
		</Dialog.Content>
	</Dialog.Root>

	<Dialog.Root bind:open={showDeleteDialog}>
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title>Delete user</Dialog.Title>
				<Dialog.Description>
					Are you sure you want to delete <strong>{data.user.email}</strong>? This action
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
								addToast('success', 'User deleted');
								await update();
							} else if (result.type === 'failure') {
								addToast('error', String(result.data?.error ?? 'Failed to delete user'));
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

	<Separator class="my-6" />

	<Card>
		<CardHeader>
			<h2 class="text-xl font-semibold">Recent Activity</h2>
		</CardHeader>
		<CardContent>
			<ActivityTimeline userId={data.user.id} />
		</CardContent>
	</Card>
{/if}
