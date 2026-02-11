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
	import { Tabs, TabsList, TabsTrigger, TabsContent } from '$lib/components/ui/tabs';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import { AGENT_TYPES } from '$lib/schemas/nhi';
	import NhiStateBadge from '../../nhi-state-badge.svelte';
	import CredentialsSection from '../../credentials-section.svelte';
	import McpToolsTab from '$lib/components/nhi/mcp-tools-tab.svelte';
	import PermissionsTab from '$lib/components/nhi/permissions-tab.svelte';
	import AgentCardTab from '$lib/components/nhi/agent-card-tab.svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import { addToast } from '$lib/stores/toast.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const { form, errors, enhance, message } = superForm(data.form, {
		onResult({ result }) {
			if (result.type === 'success' && result.data?.type !== 'error') {
				addToast('success', 'Agent updated successfully');
				isEditing = false;
				invalidateAll();
			}
		}
	});

	let isEditing: boolean = $state(false);
	let showDeleteDialog: boolean = $state(false);
	let showSuspendDialog: boolean = $state(false);
	let showArchiveDialog: boolean = $state(false);

	const isArchived = $derived(data.nhi.lifecycle_state === 'archived');

	function startEdit() {
		$form.name = data.nhi.name;
		$form.description = data.nhi.description ?? undefined;
		$form.agent_type = (data.nhi.agent?.agent_type as 'autonomous' | 'copilot' | 'workflow' | 'orchestrator' | undefined) ?? undefined;
		$form.model_provider = data.nhi.agent?.model_provider ?? undefined;
		$form.model_name = data.nhi.agent?.model_name ?? undefined;
		$form.model_version = data.nhi.agent?.model_version ?? undefined;
		$form.max_token_lifetime_secs = data.nhi.agent?.max_token_lifetime_secs ?? undefined;
		$form.requires_human_approval = data.nhi.agent?.requires_human_approval ?? false;
		isEditing = true;
	}

	function cancelEdit() {
		isEditing = false;
	}
</script>

<!-- Header section (outside tabs) -->
<div class="flex items-center justify-between">
	<div class="flex items-center gap-3">
		<PageHeader title={data.nhi.name} description="Agent details" />
		<NhiStateBadge state={data.nhi.lifecycle_state} />
	</div>
	<a
		href="/nhi"
		class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
	>
		Back to NHI
	</a>
</div>

<!-- Tabs -->
<Tabs value="details" class="mt-4">
	<TabsList>
		<TabsTrigger value="details">Details</TabsTrigger>
		<TabsTrigger value="mcp-tools">MCP Tools</TabsTrigger>
		<TabsTrigger value="permissions">Permissions</TabsTrigger>
		<TabsTrigger value="agent-card">Agent Card</TabsTrigger>
	</TabsList>

	<TabsContent value="details">
		{#if isEditing}
			<Card class="max-w-lg">
				<CardHeader>
					<h2 class="text-xl font-semibold">Edit agent</h2>
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
							<Label for="description">Description</Label>
							<Input id="description" name="description" type="text" value={String($form.description ?? '')} />
							{#if $errors.description}
								<p class="text-sm text-destructive">{$errors.description}</p>
							{/if}
						</div>

						<div class="space-y-2">
							<Label for="agent_type">Agent type</Label>
							<select
								id="agent_type"
								name="agent_type"
								class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
								value={String($form.agent_type ?? '')}
							>
								<option value="" disabled>Select agent type</option>
								{#each AGENT_TYPES as type}
									<option value={type}>{type}</option>
								{/each}
							</select>
							{#if $errors.agent_type}
								<p class="text-sm text-destructive">{$errors.agent_type}</p>
							{/if}
						</div>

						<Separator class="my-4" />

						<h3 class="text-sm font-medium text-muted-foreground">Model configuration</h3>

						<div class="space-y-2">
							<Label for="model_provider">Model provider</Label>
							<Input id="model_provider" name="model_provider" type="text" value={String($form.model_provider ?? '')} />
							{#if $errors.model_provider}
								<p class="text-sm text-destructive">{$errors.model_provider}</p>
							{/if}
						</div>

						<div class="space-y-2">
							<Label for="model_name">Model name</Label>
							<Input id="model_name" name="model_name" type="text" value={String($form.model_name ?? '')} />
							{#if $errors.model_name}
								<p class="text-sm text-destructive">{$errors.model_name}</p>
							{/if}
						</div>

						<div class="space-y-2">
							<Label for="model_version">Model version</Label>
							<Input id="model_version" name="model_version" type="text" value={String($form.model_version ?? '')} />
							{#if $errors.model_version}
								<p class="text-sm text-destructive">{$errors.model_version}</p>
							{/if}
						</div>

						<div class="space-y-2">
							<Label for="max_token_lifetime_secs">Max token lifetime (seconds)</Label>
							<Input id="max_token_lifetime_secs" name="max_token_lifetime_secs" type="number" value={$form.max_token_lifetime_secs !== undefined ? String($form.max_token_lifetime_secs) : ''} />
							{#if $errors.max_token_lifetime_secs}
								<p class="text-sm text-destructive">{$errors.max_token_lifetime_secs}</p>
							{/if}
						</div>

						<div class="flex items-center gap-2">
							<input id="requires_human_approval" name="requires_human_approval" type="checkbox" class="h-4 w-4 rounded border-input" checked={$form.requires_human_approval} />
							<Label for="requires_human_approval">Requires human approval</Label>
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
						<h2 class="text-xl font-semibold">Agent information</h2>
						{#if !isArchived}
							<Button variant="outline" size="sm" onclick={startEdit}>Edit</Button>
						{/if}
					</div>
				</CardHeader>
				<CardContent class="space-y-4">
					<div class="grid gap-3">
						<div class="flex justify-between">
							<span class="text-sm text-muted-foreground">Name</span>
							<span class="text-sm font-medium">{data.nhi.name}</span>
						</div>
						<div class="flex justify-between">
							<span class="text-sm text-muted-foreground">Description</span>
							<span class="text-sm">{data.nhi.description ?? '—'}</span>
						</div>
						<div class="flex justify-between">
							<span class="text-sm text-muted-foreground">Lifecycle state</span>
							<NhiStateBadge state={data.nhi.lifecycle_state} />
						</div>
						{#if data.nhi.suspension_reason}
							<div class="flex justify-between">
								<span class="text-sm text-muted-foreground">Suspension reason</span>
								<span class="text-sm">{data.nhi.suspension_reason}</span>
							</div>
						{/if}

						<Separator />

						<h3 class="text-sm font-medium text-muted-foreground">Agent-specific</h3>
						<div class="flex justify-between">
							<span class="text-sm text-muted-foreground">Agent type</span>
							<span class="text-sm">{data.nhi.agent?.agent_type ?? '—'}</span>
						</div>
						<div class="flex justify-between">
							<span class="text-sm text-muted-foreground">Model provider</span>
							<span class="text-sm">{data.nhi.agent?.model_provider ?? '—'}</span>
						</div>
						<div class="flex justify-between">
							<span class="text-sm text-muted-foreground">Model name</span>
							<span class="text-sm">{data.nhi.agent?.model_name ?? '—'}</span>
						</div>
						<div class="flex justify-between">
							<span class="text-sm text-muted-foreground">Model version</span>
							<span class="text-sm">{data.nhi.agent?.model_version ?? '—'}</span>
						</div>
						<div class="flex justify-between">
							<span class="text-sm text-muted-foreground">Max token lifetime</span>
							<span class="text-sm">{data.nhi.agent?.max_token_lifetime_secs ? `${data.nhi.agent.max_token_lifetime_secs}s` : '—'}</span>
						</div>
						<div class="flex justify-between">
							<span class="text-sm text-muted-foreground">Requires human approval</span>
							<span class="text-sm">{data.nhi.agent?.requires_human_approval ? 'Yes' : 'No'}</span>
						</div>

						<Separator />

						<div class="flex justify-between">
							<span class="text-sm text-muted-foreground">Created</span>
							<span class="text-sm">{new Date(data.nhi.created_at).toLocaleString()}</span>
						</div>
						<div class="flex justify-between">
							<span class="text-sm text-muted-foreground">Updated</span>
							<span class="text-sm">{new Date(data.nhi.updated_at).toLocaleString()}</span>
						</div>
					</div>
				</CardContent>
			</Card>

			<Separator class="my-6" />

			{#if !isArchived}
				<Card class="max-w-lg">
					<CardHeader>
						<h2 class="text-xl font-semibold">Actions</h2>
					</CardHeader>
					<CardContent class="flex flex-wrap gap-2">
						{#if data.nhi.lifecycle_state === 'inactive' || data.nhi.lifecycle_state === 'suspended'}
							<form
								method="POST"
								action="?/activate"
								use:formEnhance={() => {
									return async ({ result }) => {
										if (result.type === 'success') {
											addToast('success', 'Identity activated');
											await invalidateAll();
										} else if (result.type === 'failure') {
											addToast('error', String(result.data?.error ?? 'Failed to activate'));
										}
									};
								}}
							>
								<Button type="submit" variant="outline">Activate</Button>
							</form>
						{/if}

						{#if data.nhi.lifecycle_state === 'active'}
							<Button variant="outline" onclick={() => (showSuspendDialog = true)}>Suspend</Button>
						{/if}

						{#if data.nhi.lifecycle_state === 'suspended'}
							<form
								method="POST"
								action="?/reactivate"
								use:formEnhance={() => {
									return async ({ result }) => {
										if (result.type === 'success') {
											addToast('success', 'Identity reactivated');
											await invalidateAll();
										} else if (result.type === 'failure') {
											addToast('error', String(result.data?.error ?? 'Failed to reactivate'));
										}
									};
								}}
							>
								<Button type="submit" variant="outline">Reactivate</Button>
							</form>
						{/if}

						{#if data.nhi.lifecycle_state === 'active'}
							<form
								method="POST"
								action="?/deprecate"
								use:formEnhance={() => {
									return async ({ result }) => {
										if (result.type === 'success') {
											addToast('success', 'Identity deprecated');
											await invalidateAll();
										} else if (result.type === 'failure') {
											addToast('error', String(result.data?.error ?? 'Failed to deprecate'));
										}
									};
								}}
							>
								<Button type="submit" variant="outline">Deprecate</Button>
							</form>
						{/if}

						{#if data.nhi.lifecycle_state === 'deprecated'}
							<Button variant="destructive" onclick={() => (showArchiveDialog = true)}>Archive</Button>
						{/if}

						{#if !isArchived}
							<Button variant="destructive" onclick={() => (showDeleteDialog = true)}>Delete</Button>
						{/if}
					</CardContent>
				</Card>
			{/if}

			<Separator class="my-6" />

			<CredentialsSection credentials={data.credentials} {isArchived} />
		{/if}
	</TabsContent>

	<TabsContent value="mcp-tools">
		<McpToolsTab nhiId={data.nhi.id} />
	</TabsContent>

	<TabsContent value="permissions">
		<PermissionsTab nhiId={data.nhi.id} entityType="agent" />
	</TabsContent>

	<TabsContent value="agent-card">
		<AgentCardTab agentId={data.nhi.id} />
	</TabsContent>
</Tabs>

<!-- Dialogs stay OUTSIDE tabs (they're modal overlays) -->

<!-- Suspend dialog -->
<Dialog.Root bind:open={showSuspendDialog}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Suspend identity</Dialog.Title>
			<Dialog.Description>Provide an optional reason for suspending this identity.</Dialog.Description>
		</Dialog.Header>
		<form
			method="POST"
			action="?/suspend"
			use:formEnhance={() => {
				return async ({ result }) => {
					if (result.type === 'success') {
						addToast('success', 'Identity suspended');
						showSuspendDialog = false;
						await invalidateAll();
					} else if (result.type === 'failure') {
						addToast('error', String(result.data?.error ?? 'Failed to suspend'));
						showSuspendDialog = false;
					}
				};
			}}
		>
			<div class="py-4">
				<Label for="reason">Reason (optional)</Label>
				<Input id="reason" name="reason" type="text" placeholder="e.g. Security review" />
			</div>
			<Dialog.Footer>
				<Button variant="outline" type="button" onclick={() => (showSuspendDialog = false)}>Cancel</Button>
				<Button type="submit">Suspend</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

<!-- Archive dialog -->
<Dialog.Root bind:open={showArchiveDialog}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Archive identity</Dialog.Title>
			<Dialog.Description>
				Are you sure you want to archive <strong>{data.nhi.name}</strong>? This action cannot be undone.
			</Dialog.Description>
		</Dialog.Header>
		<form
			method="POST"
			action="?/archive"
			use:formEnhance={() => {
				return async ({ result }) => {
					if (result.type === 'success') {
						addToast('success', 'Identity archived');
						showArchiveDialog = false;
						await invalidateAll();
					} else if (result.type === 'failure') {
						addToast('error', String(result.data?.error ?? 'Failed to archive'));
						showArchiveDialog = false;
					}
				};
			}}
		>
			<Dialog.Footer>
				<Button variant="outline" type="button" onclick={() => (showArchiveDialog = false)}>Cancel</Button>
				<Button type="submit" variant="destructive">Confirm archive</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

<!-- Delete dialog -->
<Dialog.Root bind:open={showDeleteDialog}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Delete identity</Dialog.Title>
			<Dialog.Description>
				Are you sure you want to delete <strong>{data.nhi.name}</strong>? This action cannot be undone.
			</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer>
			<Button variant="outline" onclick={() => (showDeleteDialog = false)}>Cancel</Button>
			<form
				method="POST"
				action="?/delete"
				use:formEnhance={() => {
					return async ({ result }) => {
						if (result.type === 'redirect') {
							addToast('success', 'Identity deleted');
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
