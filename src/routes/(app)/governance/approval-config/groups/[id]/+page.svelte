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
	import { addToast } from '$lib/stores/toast.svelte';
	import ConfirmDialog from '$lib/components/ui/confirm-dialog.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let showDeleteConfirm = $state(false);
	let deleteGroupFormRef: HTMLFormElement | undefined = $state(undefined);

	const {
		form: editForm,
		errors: editErrors,
		enhance: editEnhance,
		message: editMessage
	// svelte-ignore state_referenced_locally
	} = superForm(data.editForm, {
		invalidateAll: 'force',
		onResult({ result }) {
			if (result.type === 'success') {
				addToast('success', 'Group updated');
			}
		}
	});

	const {
		form: memberForm,
		errors: memberErrors,
		enhance: memberEnhance,
		message: memberMessage
	// svelte-ignore state_referenced_locally
	} = superForm(data.memberForm, {
		invalidateAll: 'force',
		resetForm: true,
		onResult({ result }) {
			if (result.type === 'success') {
				addToast('success', 'Member added');
			}
		}
	});
</script>

<div class="flex items-center justify-between">
	<PageHeader title={data.group.name} description="Approval group details" />
	<div class="flex items-center gap-2">
		<span
			class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {data.group
				.is_active
				? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
				: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'}"
		>
			{data.group.is_active ? 'Active' : 'Disabled'}
		</span>
		<a
			href="/governance/approval-config"
			class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
		>
			Back to Approval Config
		</a>
	</div>
</div>

<div class="mt-6 grid gap-6 lg:grid-cols-2">
	<!-- Edit Form -->
	<Card>
		<CardHeader>
			<h2 class="text-lg font-semibold">Edit Group</h2>
		</CardHeader>
		<CardContent>
			{#if $editMessage}
				<Alert
					variant={$editMessage.includes('success') ? 'default' : 'destructive'}
					class="mb-4"
				>
					<AlertDescription>{$editMessage}</AlertDescription>
				</Alert>
			{/if}

			<form method="POST" action="?/edit" use:editEnhance class="space-y-4">
				<div class="space-y-2">
					<Label for="name">Name</Label>
					<Input id="name" name="name" type="text" value={String($editForm.name ?? '')} />
					{#if $editErrors.name}
						<p class="text-sm text-destructive">{$editErrors.name}</p>
					{/if}
				</div>

				<div class="space-y-2">
					<Label for="description">Description</Label>
					<textarea
						id="description"
						name="description"
						class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
						value={String($editForm.description ?? '')}
					></textarea>
					{#if $editErrors.description}
						<p class="text-sm text-destructive">{$editErrors.description}</p>
					{/if}
				</div>

				<Button type="submit">Save Changes</Button>
			</form>
		</CardContent>
	</Card>

	<!-- Actions -->
	<Card>
		<CardHeader>
			<h2 class="text-lg font-semibold">Actions</h2>
		</CardHeader>
		<CardContent class="space-y-4">
			{#if data.group.is_active}
				<form
					method="POST"
					action="?/disable"
					use:formEnhance={() => {
						return async ({ result, update }) => {
							if (result.type === 'success') {
								addToast('success', 'Group disabled');
								await invalidateAll();
							}
						};
					}}
				>
					<Button type="submit" variant="outline" class="w-full">Disable Group</Button>
				</form>
			{:else}
				<form
					method="POST"
					action="?/enable"
					use:formEnhance={() => {
						return async ({ result, update }) => {
							if (result.type === 'success') {
								addToast('success', 'Group enabled');
								await invalidateAll();
							}
						};
					}}
				>
					<Button type="submit" variant="outline" class="w-full">Enable Group</Button>
				</form>
			{/if}

			<Separator />

			<form
				bind:this={deleteGroupFormRef}
				method="POST"
				action="?/delete"
				use:formEnhance={() => {
					return async ({ result, update }) => {
						if (result.type === 'redirect') {
							addToast('success', 'Group deleted');
							await update();
						} else if (result.type === 'failure') {
							addToast('error', String(result.data?.error ?? 'Failed to delete group'));
						}
					};
				}}
			>
				<Button type="button" variant="destructive" class="w-full" onclick={() => (showDeleteConfirm = true)}>Delete Group</Button>
			</form>
		</CardContent>
	</Card>
</div>

<!-- Members Section -->
<Separator class="my-6" />

<h2 class="mb-4 text-lg font-semibold">Members ({data.group.member_ids.length})</h2>

{#if data.group.member_ids.length > 0}
	<div class="mb-6 overflow-x-auto rounded-lg border border-border">
		<table class="w-full text-sm">
			<thead>
				<tr class="border-b border-border bg-muted/50">
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">User ID</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Actions</th>
				</tr>
			</thead>
			<tbody>
				{#each data.group.member_ids as memberId}
					<tr class="border-b border-border last:border-0">
						<td class="px-4 py-3 font-mono text-xs">{memberId}</td>
						<td class="px-4 py-3">
							<form
								method="POST"
								action="?/removeMember"
								use:formEnhance={() => {
									return async ({ result, update }) => {
										if (result.type === 'success') {
											addToast('success', 'Member removed');
											await invalidateAll();
										}
									};
								}}
							>
								<input type="hidden" name="user_id" value={memberId} />
								<Button type="submit" variant="outline" size="sm">Remove</Button>
							</form>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{:else}
	<p class="mb-6 text-sm text-muted-foreground">
		No members yet. Add members to enable this group for approval workflows.
	</p>
{/if}

<!-- Add Member Form -->
<Card class="max-w-lg">
	<CardHeader>
		<h2 class="text-lg font-semibold">Add Member</h2>
	</CardHeader>
	<CardContent>
		{#if $memberMessage}
			<Alert
				variant={$memberMessage.includes('success') ? 'default' : 'destructive'}
				class="mb-4"
			>
				<AlertDescription>{$memberMessage}</AlertDescription>
			</Alert>
		{/if}

		<form method="POST" action="?/addMember" use:memberEnhance class="space-y-4">
			<div class="space-y-2">
				<Label for="user_id">User ID</Label>
				<Input
					id="user_id"
					name="user_id"
					type="text"
					placeholder="UUID of user to add"
					value={String($memberForm.user_id ?? '')}
				/>
				{#if $memberErrors.user_id}
					<p class="text-sm text-destructive">{$memberErrors.user_id}</p>
				{/if}
			</div>

			<Button type="submit">Add Member</Button>
		</form>
	</CardContent>
</Card>

<ConfirmDialog
	bind:open={showDeleteConfirm}
	title="Delete group"
	description="Are you sure you want to delete this group? This will fail if the group is referenced by workflow steps."
	confirmLabel="Delete"
	variant="destructive"
	onconfirm={() => deleteGroupFormRef?.requestSubmit()}
/>
