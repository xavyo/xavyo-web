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
	import { EmptyState } from '$lib/components/ui/empty-state';
	import { addToast } from '$lib/stores/toast.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// Edit form
	const {
		form: editFormData,
		errors: editErrors,
		enhance: editEnhance,
		message: editMessage
	// svelte-ignore state_referenced_locally
	} = superForm(data.editForm, {
		id: 'edit',
		onResult({ result }) {
			if (result.type === 'success' && result.data?.type !== 'error') {
				addToast('success', 'Group updated successfully');
				isEditing = false;
				invalidateAll();
			}
		}
	});

	// Add member form
	const {
		form: addMemberFormData,
		errors: addMemberErrors,
		enhance: addMemberEnhance,
		message: addMemberMessage
	// svelte-ignore state_referenced_locally
	} = superForm(data.addMemberForm, {
		id: 'addMember',
		onResult({ result }) {
			if (result.type === 'success' && result.data?.type !== 'error') {
				addToast('success', 'Members added successfully');
				$addMemberFormData.member_ids = '';
				invalidateAll();
			}
		}
	});

	let isEditing: boolean = $state(false);
	let showDeleteDialog: boolean = $state(false);

	function startEdit() {
		$editFormData.name = data.group.display_name;
		$editFormData.description = data.group.description ?? '';
		isEditing = true;
	}

	function cancelEdit() {
		isEditing = false;
	}

	function removeMemberEnhance(formEl: HTMLFormElement) {
		return formEnhance(formEl, () => {
			return async ({ result, update }) => {
				if (result.type === 'success') {
					addToast('success', 'Member removed');
					await update();
				} else if (result.type === 'failure') {
					addToast(
						'error',
						((result.data as Record<string, unknown>)?.error as string) ??
							'Failed to remove member'
					);
				}
			};
		});
	}
</script>

<div class="flex items-center justify-between">
	<PageHeader title={data.group.display_name} description="Group details" />
	<a
		href="/groups"
		class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
	>
		Back to Groups
	</a>
</div>

{#if isEditing}
	<Card class="max-w-lg">
		<CardHeader>
			<h2 class="text-xl font-semibold">Edit group</h2>
		</CardHeader>
		<CardContent>
			{#if $editMessage}
				<Alert variant="destructive" class="mb-4">
					<AlertDescription>{$editMessage}</AlertDescription>
				</Alert>
			{/if}

			<form method="POST" action="?/edit" use:editEnhance class="space-y-4">
				<div class="space-y-2">
					<Label for="edit-name">Name</Label>
					<Input
						id="edit-name"
						name="name"
						type="text"
						value={String($editFormData.name ?? '')}
					/>
					{#if $editErrors.name}
						<p class="text-sm text-destructive">{$editErrors.name}</p>
					{/if}
				</div>

				<div class="space-y-2">
					<Label for="edit-description">Description</Label>
					<textarea
						id="edit-description"
						name="description"
						class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
						value={String($editFormData.description ?? '')}
					></textarea>
					{#if $editErrors.description}
						<p class="text-sm text-destructive">{$editErrors.description}</p>
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
	<!-- Group info -->
	<Card class="max-w-lg">
		<CardHeader>
			<div class="flex items-center justify-between">
				<h2 class="text-xl font-semibold">Group information</h2>
				<Button variant="outline" size="sm" onclick={startEdit}>Edit</Button>
			</div>
		</CardHeader>
		<CardContent class="space-y-4">
			<div class="grid gap-3">
				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Name</span>
					<span class="text-sm font-medium">{data.group.display_name}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Description</span>
					<span class="text-sm">{data.group.description ?? '\u2014'}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Type</span>
					<span class="text-sm">{data.group.group_type}</span>
				</div>

				<Separator />

				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Created</span>
					<span class="text-sm">{new Date(data.group.created_at).toLocaleString()}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Updated</span>
					<span class="text-sm">{new Date(data.group.updated_at).toLocaleString()}</span>
				</div>
			</div>
		</CardContent>
	</Card>

	<Separator class="my-6" />

	<!-- Members section -->
	<Card class="max-w-2xl">
		<CardHeader>
			<h2 class="text-xl font-semibold">Members</h2>
		</CardHeader>
		<CardContent class="space-y-4">
			{#if data.members.length > 0}
				<div class="rounded-md border">
					<table class="w-full">
						<thead>
							<tr class="border-b bg-muted/50">
								<th class="px-4 py-3 text-left text-sm font-medium">Email</th>
								<th class="px-4 py-3 text-left text-sm font-medium">Display Name</th>
								<th class="px-4 py-3 text-right text-sm font-medium">Actions</th>
							</tr>
						</thead>
						<tbody>
							{#each data.members as member}
								<tr class="border-b">
									<td class="px-4 py-3 text-sm">{member.email}</td>
									<td class="px-4 py-3 text-sm">{member.display_name ?? '-'}</td>
									<td class="px-4 py-3 text-right">
										<form method="POST" action="?/removeMember" use:removeMemberEnhance>
											<input type="hidden" name="member_id" value={member.user_id} />
											<button type="submit" class="text-sm text-destructive hover:underline"
												>Remove</button
											>
										</form>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{:else}
				<EmptyState title="No members" description="Add members to this group." icon="👥" />
			{/if}

			<Separator />

			<!-- Add members form -->
			<div>
				<h3 class="mb-3 text-sm font-medium">Add members</h3>
				{#if $addMemberMessage}
					<Alert
						variant={String($addMemberMessage).includes('success') ? 'default' : 'destructive'}
						class="mb-4"
					>
						<AlertDescription>{$addMemberMessage}</AlertDescription>
					</Alert>
				{/if}
				<form method="POST" action="?/addMember" use:addMemberEnhance class="space-y-3">
					<div class="space-y-2">
						<Label for="member_ids">User IDs (comma-separated)</Label>
						<Input
							id="member_ids"
							name="member_ids"
							type="text"
							placeholder="e.g. uuid-1, uuid-2, uuid-3"
							value={String($addMemberFormData.member_ids ?? '')}
						/>
						{#if $addMemberErrors.member_ids}
							<p class="text-sm text-destructive">{$addMemberErrors.member_ids}</p>
						{/if}
					</div>
					<Button type="submit" size="sm">Add Members</Button>
				</form>
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
			<Button variant="destructive" onclick={() => (showDeleteDialog = true)}
				>Delete group</Button
			>
		</CardContent>
	</Card>
{/if}

<!-- Delete dialog -->
<Dialog.Root bind:open={showDeleteDialog}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Delete group</Dialog.Title>
			<Dialog.Description>
				Are you sure you want to delete <strong>{data.group.display_name}</strong>? This action
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
							addToast('success', 'Group deleted');
							await update();
						} else if (result.type === 'failure') {
							addToast('error', String(result.data?.error ?? 'Failed to delete'));
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
