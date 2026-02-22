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
	import PersonaStatusBadge from '../persona-status-badge.svelte';
	import { addToast } from '$lib/stores/toast.svelte';
	import type { PageData } from './$types';
	import * as Dialog from '$lib/components/ui/dialog';

	let { data }: { data: PageData } = $props();

	// svelte-ignore state_referenced_locally
	const { form, errors, enhance, message } = superForm(data.form, {
		onResult({ result }) {
			if (result.type === 'success' && result.data?.type !== 'error') {
				addToast('success', 'Persona updated successfully');
				isEditing = false;
				invalidateAll();
			}
		}
	});

	let isEditing: boolean = $state(false);
	let showDeactivateDialog: boolean = $state(false);
	let showArchiveDialog: boolean = $state(false);
	let deactivateReason: string = $state('');
	let archiveReason: string = $state('');

	function startEdit() {
		$form.display_name = data.persona.display_name;
		$form.valid_until = data.persona.valid_until ?? undefined;
		isEditing = true;
	}

	function cancelEdit() {
		isEditing = false;
	}

	const canActivate = $derived(
		data.persona.status === 'draft' || data.persona.status === 'suspended'
	);
	const canDeactivate = $derived(
		data.persona.status === 'active' || data.persona.status === 'expiring'
	);
	const canArchive = $derived(data.persona.status !== 'archived');
	const isArchived = $derived(data.persona.status === 'archived');
</script>

<div class="flex items-center justify-between">
	<PageHeader title={data.persona.persona_name} description="Persona details" />
	<a
		href="/personas"
		class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
	>
		Back to personas
	</a>
</div>

{#if isEditing}
	<Card class="max-w-lg">
		<CardHeader>
			<h2 class="text-xl font-semibold">Edit persona</h2>
		</CardHeader>
		<CardContent>
			{#if $message}
				<Alert variant="destructive" class="mb-4">
					<AlertDescription>{$message}</AlertDescription>
				</Alert>
			{/if}

			<form method="POST" action="?/update" use:enhance class="space-y-4">
				<div class="space-y-2">
					<Label for="display_name">Display name</Label>
					<Input
						id="display_name"
						name="display_name"
						type="text"
						value={String($form.display_name ?? '')}
					/>
					{#if $errors.display_name}
						<p class="text-sm text-destructive">{$errors.display_name}</p>
					{/if}
				</div>

				<div class="space-y-2">
					<Label for="valid_until">Valid until</Label>
					<Input
						id="valid_until"
						name="valid_until"
						type="date"
						value={String($form.valid_until ?? '')}
					/>
					{#if $errors.valid_until}
						<p class="text-sm text-destructive">{$errors.valid_until}</p>
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
				<h2 class="text-xl font-semibold">Persona information</h2>
				{#if !isArchived}
					<Button variant="outline" size="sm" onclick={startEdit}>Edit</Button>
				{/if}
			</div>
		</CardHeader>
		<CardContent class="space-y-4">
			<div class="grid gap-3">
				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Persona name</span>
					<span class="text-sm font-medium">{data.persona.persona_name}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Display name</span>
					<span class="text-sm">{data.persona.display_name}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Archetype</span>
					<a
						href="/personas/archetypes/{data.persona.archetype_id}"
						class="text-sm text-primary hover:underline"
					>
						{data.persona.archetype_name ?? data.persona.archetype_id}
					</a>
				</div>
				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Physical user</span>
					<span class="text-sm">{data.persona.physical_user_name ?? data.persona.physical_user_id}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Status</span>
					<PersonaStatusBadge status={data.persona.status} />
				</div>
				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Valid from</span>
					<span class="text-sm">{new Date(data.persona.valid_from).toLocaleDateString()}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Valid until</span>
					<span class="text-sm">{data.persona.valid_until ? new Date(data.persona.valid_until).toLocaleDateString() : '—'}</span>
				</div>
				{#if data.persona.deactivated_at}
					<div class="flex justify-between">
						<span class="text-sm text-muted-foreground">Deactivated at</span>
						<span class="text-sm">{new Date(data.persona.deactivated_at).toLocaleString()}</span>
					</div>
				{/if}
				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Created</span>
					<span class="text-sm">{new Date(data.persona.created_at).toLocaleString()}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Updated</span>
					<span class="text-sm">{new Date(data.persona.updated_at).toLocaleString()}</span>
				</div>
			</div>
		</CardContent>
	</Card>

	<!-- Attributes -->
	{#if data.persona.attributes}
		<Card class="mt-4 max-w-lg">
			<CardHeader>
				<h2 class="text-xl font-semibold">Attributes</h2>
			</CardHeader>
			<CardContent class="space-y-4">
				{#if Object.keys(data.persona.attributes.inherited).length > 0}
					<div>
						<h3 class="mb-2 text-sm font-medium text-muted-foreground">Inherited</h3>
						<div class="grid gap-2">
							{#each Object.entries(data.persona.attributes.inherited) as [key, value]}
								<div class="flex justify-between">
									<span class="text-sm font-mono">{key}</span>
									<span class="text-sm">{String(value)}</span>
								</div>
							{/each}
						</div>
					</div>
				{/if}

				{#if Object.keys(data.persona.attributes.overrides).length > 0}
					<Separator />
					<div>
						<h3 class="mb-2 text-sm font-medium text-muted-foreground">Overrides</h3>
						<div class="grid gap-2">
							{#each Object.entries(data.persona.attributes.overrides) as [key, value]}
								<div class="flex justify-between">
									<span class="text-sm font-mono">{key}</span>
									<span class="text-sm">{String(value)}</span>
								</div>
							{/each}
						</div>
					</div>
				{/if}

				{#if Object.keys(data.persona.attributes.persona_specific).length > 0}
					<Separator />
					<div>
						<h3 class="mb-2 text-sm font-medium text-muted-foreground">Persona-specific</h3>
						<div class="grid gap-2">
							{#each Object.entries(data.persona.attributes.persona_specific) as [key, value]}
								<div class="flex justify-between">
									<span class="text-sm font-mono">{key}</span>
									<span class="text-sm">{String(value)}</span>
								</div>
							{/each}
						</div>
					</div>
				{/if}

				{#if Object.keys(data.persona.attributes.inherited).length === 0 && Object.keys(data.persona.attributes.overrides).length === 0 && Object.keys(data.persona.attributes.persona_specific).length === 0}
					<p class="text-sm text-muted-foreground">No attributes defined</p>
				{/if}
			</CardContent>
		</Card>
	{/if}

	<!-- Actions -->
	{#if !isArchived}
		<Separator class="my-6" />

		<Card class="max-w-lg">
			<CardHeader>
				<h2 class="text-xl font-semibold">Actions</h2>
			</CardHeader>
			<CardContent class="flex gap-2">
				{#if canActivate}
					<form
						method="POST"
						action="?/activate"
						use:formEnhance={() => {
							return async ({ result }) => {
								if (result.type === 'success') {
									addToast('success', 'Persona activated');
									await invalidateAll();
								} else if (result.type === 'failure') {
									addToast('error', String(result.data?.error ?? 'Failed to activate persona'));
								}
							};
						}}
					>
						<Button type="submit" variant="outline">Activate</Button>
					</form>
				{/if}

				{#if canDeactivate}
					<Button variant="outline" onclick={() => (showDeactivateDialog = true)}>
						Deactivate
					</Button>
				{/if}

				{#if canArchive}
					<Button variant="destructive" onclick={() => (showArchiveDialog = true)}>
						Archive
					</Button>
				{/if}

				<form
					method="POST"
					action="?/propagate"
					use:formEnhance={() => {
						return async ({ result }) => {
							if (result.type === 'success') {
								const attrCount = (result.data as Record<string, unknown>)?.attributesUpdated ?? 0;
								addToast('success', `Propagated ${attrCount} attributes from archetype`);
								await invalidateAll();
							} else if (result.type === 'failure') {
								addToast('error', String(result.data?.error ?? 'Failed to propagate attributes'));
							}
						};
					}}
				>
					<Button type="submit" variant="outline">Propagate Attributes</Button>
				</form>
			</CardContent>
		</Card>
	{/if}

	<!-- Deactivate Dialog -->
	<Dialog.Root bind:open={showDeactivateDialog}>
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title>Deactivate persona</Dialog.Title>
				<Dialog.Description>
					Please provide a reason for deactivating <strong>{data.persona.persona_name}</strong>.
				</Dialog.Description>
			</Dialog.Header>
			<form
				method="POST"
				action="?/deactivate"
				use:formEnhance={() => {
					return async ({ result }) => {
						if (result.type === 'success') {
							addToast('success', 'Persona deactivated');
							showDeactivateDialog = false;
							deactivateReason = '';
							await invalidateAll();
						} else if (result.type === 'failure') {
							addToast('error', String(result.data?.error ?? 'Failed to deactivate persona'));
						}
					};
				}}
			>
				<div class="space-y-2 py-4">
					<Label for="deactivate-reason">Reason</Label>
					<textarea
						id="deactivate-reason"
						name="reason"
						class="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
						placeholder="Minimum 5 characters"
						bind:value={deactivateReason}
					></textarea>
					{#if deactivateReason.length > 0 && deactivateReason.length < 5}
						<p class="text-sm text-destructive">Reason must be at least 5 characters</p>
					{/if}
				</div>
				<Dialog.Footer>
					<Button type="button" variant="outline" onclick={() => (showDeactivateDialog = false)}>Cancel</Button>
					<Button type="submit" variant="destructive" disabled={deactivateReason.length < 5}>Confirm</Button>
				</Dialog.Footer>
			</form>
		</Dialog.Content>
	</Dialog.Root>

	<!-- Archive Dialog -->
	<Dialog.Root bind:open={showArchiveDialog}>
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title>Archive persona</Dialog.Title>
				<Dialog.Description>
					Please provide a reason for archiving <strong>{data.persona.persona_name}</strong>.
					<strong class="block mt-2 text-destructive">This action cannot be undone.</strong>
				</Dialog.Description>
			</Dialog.Header>
			<form
				method="POST"
				action="?/archive"
				use:formEnhance={() => {
					return async ({ result }) => {
						if (result.type === 'success') {
							addToast('success', 'Persona archived');
							showArchiveDialog = false;
							archiveReason = '';
							await invalidateAll();
						} else if (result.type === 'failure') {
							addToast('error', String(result.data?.error ?? 'Failed to archive persona'));
						}
					};
				}}
			>
				<div class="space-y-2 py-4">
					<Label for="archive-reason">Reason</Label>
					<textarea
						id="archive-reason"
						name="reason"
						class="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
						placeholder="Minimum 5 characters"
						bind:value={archiveReason}
					></textarea>
					{#if archiveReason.length > 0 && archiveReason.length < 5}
						<p class="text-sm text-destructive">Reason must be at least 5 characters</p>
					{/if}
				</div>
				<Dialog.Footer>
					<Button type="button" variant="outline" onclick={() => (showArchiveDialog = false)}>Cancel</Button>
					<Button type="submit" variant="destructive" disabled={archiveReason.length < 5}>Confirm</Button>
				</Dialog.Footer>
			</form>
		</Dialog.Content>
	</Dialog.Root>
{/if}
