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
	import NhiStateBadge from '../../nhi-state-badge.svelte';
	import CredentialsSection from '../../credentials-section.svelte';
	import McpToolsTab from '$lib/components/nhi/mcp-tools-tab.svelte';
	import PermissionsTab from '$lib/components/nhi/permissions-tab.svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import { addToast } from '$lib/stores/toast.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const { form, errors, enhance, message } = superForm(data.form, {
		onResult({ result }) {
			if (result.type === 'success' && result.data?.type !== 'error') {
				addToast('success', 'Tool updated successfully');
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
		$form.category = data.nhi.tool?.category ?? undefined;
		$form.input_schema = data.nhi.tool?.input_schema ? JSON.stringify(data.nhi.tool.input_schema, null, 2) : undefined;
		$form.output_schema = data.nhi.tool?.output_schema ? JSON.stringify(data.nhi.tool.output_schema, null, 2) : undefined;
		$form.requires_approval = data.nhi.tool?.requires_approval ?? false;
		$form.max_calls_per_hour = data.nhi.tool?.max_calls_per_hour ?? undefined;
		$form.provider = data.nhi.tool?.provider ?? undefined;
		isEditing = true;
	}

	function cancelEdit() {
		isEditing = false;
	}

	function formatJson(val: unknown): string {
		if (!val) return '—';
		try {
			return JSON.stringify(val, null, 2);
		} catch {
			return String(val);
		}
	}
</script>

<!-- Header section (outside tabs) -->
<div class="flex items-center justify-between">
	<div class="flex items-center gap-3">
		<PageHeader title={data.nhi.name} description="Tool details" />
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
	</TabsList>

	<TabsContent value="details">
		{#if isEditing}
			<Card class="max-w-lg">
				<CardHeader>
					<h2 class="text-xl font-semibold">Edit tool</h2>
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
							<Label for="category">Category</Label>
							<Input id="category" name="category" type="text" value={String($form.category ?? '')} />
							{#if $errors.category}
								<p class="text-sm text-destructive">{$errors.category}</p>
							{/if}
						</div>

						<div class="space-y-2">
							<Label for="input_schema">Input schema (JSON)</Label>
							<textarea
								id="input_schema"
								name="input_schema"
								class="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
								value={String($form.input_schema ?? '')}
							></textarea>
							{#if $errors.input_schema}
								<p class="text-sm text-destructive">{$errors.input_schema}</p>
							{/if}
						</div>

						<div class="space-y-2">
							<Label for="output_schema">Output schema (JSON)</Label>
							<textarea
								id="output_schema"
								name="output_schema"
								class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
								value={String($form.output_schema ?? '')}
							></textarea>
							{#if $errors.output_schema}
								<p class="text-sm text-destructive">{$errors.output_schema}</p>
							{/if}
						</div>

						<div class="flex items-center gap-2">
							<input id="requires_approval" name="requires_approval" type="checkbox" class="h-4 w-4 rounded border-input" checked={$form.requires_approval} />
							<Label for="requires_approval">Requires approval</Label>
						</div>

						<div class="space-y-2">
							<Label for="max_calls_per_hour">Max calls per hour</Label>
							<Input id="max_calls_per_hour" name="max_calls_per_hour" type="number" value={$form.max_calls_per_hour !== undefined ? String($form.max_calls_per_hour) : ''} />
							{#if $errors.max_calls_per_hour}
								<p class="text-sm text-destructive">{$errors.max_calls_per_hour}</p>
							{/if}
						</div>

						<div class="space-y-2">
							<Label for="provider">Provider</Label>
							<Input id="provider" name="provider" type="text" value={String($form.provider ?? '')} />
							{#if $errors.provider}
								<p class="text-sm text-destructive">{$errors.provider}</p>
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
						<h2 class="text-xl font-semibold">Tool information</h2>
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

						<h3 class="text-sm font-medium text-muted-foreground">Tool-specific</h3>
						<div class="flex justify-between">
							<span class="text-sm text-muted-foreground">Category</span>
							<span class="text-sm">{data.nhi.tool?.category ?? '—'}</span>
						</div>
						<div>
							<span class="text-sm text-muted-foreground">Input schema</span>
							<pre class="mt-1 max-h-48 overflow-auto rounded-md bg-muted p-2 font-mono text-xs">{formatJson(data.nhi.tool?.input_schema)}</pre>
						</div>
						{#if data.nhi.tool?.output_schema}
							<div>
								<span class="text-sm text-muted-foreground">Output schema</span>
								<pre class="mt-1 max-h-48 overflow-auto rounded-md bg-muted p-2 font-mono text-xs">{formatJson(data.nhi.tool?.output_schema)}</pre>
							</div>
						{/if}
						<div class="flex justify-between">
							<span class="text-sm text-muted-foreground">Requires approval</span>
							<span class="text-sm">{data.nhi.tool?.requires_approval ? 'Yes' : 'No'}</span>
						</div>
						<div class="flex justify-between">
							<span class="text-sm text-muted-foreground">Max calls/hour</span>
							<span class="text-sm">{data.nhi.tool?.max_calls_per_hour ?? '—'}</span>
						</div>
						<div class="flex justify-between">
							<span class="text-sm text-muted-foreground">Provider</span>
							<span class="text-sm">{data.nhi.tool?.provider ?? '—'}</span>
						</div>
						{#if data.nhi.tool?.provider_verified !== undefined}
							<div class="flex justify-between">
								<span class="text-sm text-muted-foreground">Provider verified</span>
								<span class="text-sm">{data.nhi.tool?.provider_verified ? 'Yes' : 'No'}</span>
							</div>
						{/if}
						{#if data.nhi.tool?.checksum}
							<div class="flex justify-between">
								<span class="text-sm text-muted-foreground">Checksum</span>
								<span class="font-mono text-xs">{data.nhi.tool?.checksum}</span>
							</div>
						{/if}

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

			<!-- Lifecycle actions -->
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

			<!-- Credentials section -->
			<CredentialsSection credentials={data.credentials} {isArchived} />
		{/if}
	</TabsContent>

	<TabsContent value="mcp-tools">
		<McpToolsTab nhiId={data.nhi.id} />
	</TabsContent>

	<TabsContent value="permissions">
		<PermissionsTab nhiId={data.nhi.id} entityType="tool" />
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
