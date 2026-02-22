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
	import * as Dialog from '$lib/components/ui/dialog';
	import { addToast } from '$lib/stores/toast.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const {
		form: editForm,
		errors: editErrors,
		enhance: editEnhance,
		message: editMessage
	// svelte-ignore state_referenced_locally
	} = superForm(data.editForm, {
		invalidateAll: 'force',
		onResult({ result }) {
			if (result.type === 'success' && result.data?.type !== 'error') {
				addToast('success', 'Workflow updated');
				isEditing = false;
			}
		}
	});

	const {
		form: stepForm,
		errors: stepErrors,
		enhance: stepEnhance,
		message: stepMessage
	// svelte-ignore state_referenced_locally
	} = superForm(data.stepForm, {
		invalidateAll: 'force',
		resetForm: true,
		onResult({ result }) {
			if (result.type === 'success' && result.data?.type !== 'error') {
				addToast('success', 'Step added');
			}
		}
	});

	let isEditing: boolean = $state(false);
	let showDeleteDialog: boolean = $state(false);

	const approverTypeLabels: Record<string, string> = {
		manager: 'Manager',
		entitlement_owner: 'Entitlement Owner',
		specific_users: 'Specific Users'
	};

	function startEdit() {
		$editForm.name = data.workflow.name;
		$editForm.description = data.workflow.description ?? undefined;
		isEditing = true;
	}

	function cancelEdit() {
		isEditing = false;
	}
</script>

<div class="flex items-center justify-between">
	<div class="flex items-center gap-3">
		<PageHeader title={data.workflow.name} description="Approval workflow details" />
		<span
			class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {data.workflow.is_active
				? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
				: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'}"
		>
			{data.workflow.is_active ? 'Active' : 'Inactive'}
		</span>
		{#if data.workflow.is_default}
			<span
				class="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
			>
				Default
			</span>
		{/if}
	</div>
	<a
		href="/governance/approval-config"
		class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
	>
		Back to Approval Config
	</a>
</div>

{#if isEditing}
	<Card class="max-w-lg">
		<CardHeader>
			<h2 class="text-xl font-semibold">Edit workflow</h2>
		</CardHeader>
		<CardContent>
			{#if $editMessage}
				<Alert variant="destructive" class="mb-4">
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

				<div class="flex gap-2 pt-2">
					<Button type="submit">Save changes</Button>
					<Button type="button" variant="outline" onclick={cancelEdit}>Cancel</Button>
				</div>
			</form>
		</CardContent>
	</Card>
{:else}
	<!-- Workflow Information -->
	<Card class="max-w-lg">
		<CardHeader>
			<div class="flex items-center justify-between">
				<h2 class="text-xl font-semibold">Workflow information</h2>
				<Button variant="outline" size="sm" onclick={startEdit}>Edit</Button>
			</div>
		</CardHeader>
		<CardContent class="space-y-4">
			<div class="grid gap-3">
				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Name</span>
					<span class="text-sm font-medium">{data.workflow.name}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Description</span>
					<span class="text-sm">{data.workflow.description ?? '---'}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Status</span>
					<span
						class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {data.workflow.is_active
							? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
							: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'}"
					>
						{data.workflow.is_active ? 'Active' : 'Inactive'}
					</span>
				</div>
				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Default</span>
					<span class="text-sm">{data.workflow.is_default ? 'Yes' : 'No'}</span>
				</div>

				<Separator />

				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Created</span>
					<span class="text-sm">{new Date(data.workflow.created_at).toLocaleString()}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Updated</span>
					<span class="text-sm">{new Date(data.workflow.updated_at).toLocaleString()}</span>
				</div>
			</div>
		</CardContent>
	</Card>

	<Separator class="my-6" />

	<!-- Workflow Steps -->
	<Card>
		<CardHeader>
			<h2 class="text-xl font-semibold">Approval Steps</h2>
		</CardHeader>
		<CardContent class="space-y-4">
			{#if data.workflow.steps.length > 0}
				<div class="overflow-x-auto rounded-lg border border-border">
					<table class="w-full text-sm">
						<thead>
							<tr class="border-b border-border bg-muted/50">
								<th class="px-4 py-3 text-left font-medium text-muted-foreground">Order</th>
								<th class="px-4 py-3 text-left font-medium text-muted-foreground">Approver Type</th>
								<th class="px-4 py-3 text-left font-medium text-muted-foreground">Details</th>
								<th class="px-4 py-3 text-left font-medium text-muted-foreground">Actions</th>
							</tr>
						</thead>
						<tbody>
							{#each data.workflow.steps.sort((a, b) => a.step_order - b.step_order) as step}
								<tr class="border-b border-border last:border-0">
									<td class="px-4 py-3">{step.step_order}</td>
									<td class="px-4 py-3">
										<span
											class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium
												{step.approver_type === 'manager'
												? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
												: step.approver_type === 'entitlement_owner'
													? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
													: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'}"
										>
											{approverTypeLabels[step.approver_type] ?? step.approver_type}
										</span>
									</td>
									<td class="px-4 py-3 font-mono text-xs">
										{#if step.specific_approvers && step.specific_approvers.length > 0}
											{step.specific_approvers.length} user(s)
										{:else}
											---
										{/if}
									</td>
									<td class="px-4 py-3">
										<form
											method="POST"
											action="?/removeStep"
											use:formEnhance={() => {
												return async ({ result, update }) => {
													if (result.type === 'success') {
														addToast('success', 'Step removed');
														await invalidateAll();
													} else if (result.type === 'failure') {
														addToast(
															'error',
															String(result.data?.error ?? 'Failed to remove step')
														);
													}
												};
											}}
										>
											<input type="hidden" name="step_id" value={step.id} />
											<Button type="submit" variant="outline" size="sm">Remove</Button>
										</form>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{:else}
				<p class="text-sm text-muted-foreground">
					No steps yet. Add a step to define the approval process.
				</p>
			{/if}

			<Separator class="my-4" />

			<!-- Add Step Form -->
			<h3 class="text-sm font-medium text-muted-foreground">Add a new step</h3>

			{#if $stepMessage}
				<Alert variant="destructive" class="mb-4">
					<AlertDescription>{$stepMessage}</AlertDescription>
				</Alert>
			{/if}

			<form method="POST" action="?/addStep" use:stepEnhance class="space-y-4">
				<div class="grid gap-4 sm:grid-cols-2">
					<div class="space-y-2">
						<Label for="approver_type">Approver Type</Label>
						<select
							id="approver_type"
							name="approver_type"
							class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
							value={String($stepForm.approver_type ?? '')}
						>
							<option value="">Select type</option>
							<option value="manager">Manager</option>
							<option value="entitlement_owner">Entitlement Owner</option>
							<option value="specific_users">Specific Users</option>
						</select>
						{#if $stepErrors.approver_type}
							<p class="text-sm text-destructive">{$stepErrors.approver_type}</p>
						{/if}
					</div>

					<div class="space-y-2">
						<Label for="specific_approvers">Specific Approver IDs (comma-separated, optional)</Label>
						<Input
							id="specific_approvers"
							name="specific_approvers"
							type="text"
							placeholder="uuid1,uuid2"
							value={String($stepForm.specific_approvers ?? '')}
						/>
						{#if $stepErrors.specific_approvers}
							<p class="text-sm text-destructive">{$stepErrors.specific_approvers}</p>
						{/if}
					</div>
				</div>

				<Button type="submit">Add step</Button>
			</form>
		</CardContent>
	</Card>

	<Separator class="my-6" />

	<!-- Actions -->
	<Card class="max-w-lg">
		<CardHeader>
			<h2 class="text-xl font-semibold">Actions</h2>
		</CardHeader>
		<CardContent class="flex flex-wrap gap-2">
			{#if !data.workflow.is_default}
				<form
					method="POST"
					action="?/setDefault"
					use:formEnhance={() => {
						return async ({ result, update }) => {
							if (result.type === 'success') {
								addToast('success', 'Workflow set as default');
								await invalidateAll();
							} else if (result.type === 'failure') {
								addToast(
									'error',
									String(result.data?.error ?? 'Failed to set as default')
								);
							}
						};
					}}
				>
					<Button type="submit" variant="outline">Set as Default</Button>
				</form>
			{/if}

			<Button variant="destructive" onclick={() => (showDeleteDialog = true)}>Delete</Button>
		</CardContent>
	</Card>
{/if}

<!-- Delete dialog -->
<Dialog.Root bind:open={showDeleteDialog}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Delete workflow</Dialog.Title>
			<Dialog.Description>
				Are you sure you want to delete <strong>{data.workflow.name}</strong>? This action cannot be
				undone.
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
							addToast('success', 'Workflow deleted');
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
