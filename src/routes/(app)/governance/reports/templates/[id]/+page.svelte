<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { enhance as svelteEnhance } from '$app/forms';
	import { updateTemplateSchema, cloneTemplateSchema } from '$lib/schemas/governance-reporting';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import { addToast } from '$lib/stores/toast.svelte';
	import ConfirmDialog from '$lib/components/ui/confirm-dialog.svelte';

	let { data } = $props();
	let template = $derived(data.template);

	const { form: editForm, errors: editErrors, enhance: editEnhance } = superForm(data.editForm, {
		validators: zodClient(updateTemplateSchema),
		onResult: ({ result }) => {
			if (result.type === 'redirect') addToast('success', 'Template updated');
		},
		onUpdated: ({ form: f }) => {
			if (f.message) addToast('error', f.message);
		}
	});

	const { form: cloneForm, errors: cloneErrors, enhance: cloneEnhance } = superForm(data.cloneForm, {
		validators: zodClient(cloneTemplateSchema),
		onResult: ({ result }) => {
			if (result.type === 'redirect') addToast('success', 'Template cloned');
		},
		onUpdated: ({ form: f }) => {
			if (f.message) addToast('error', f.message);
		}
	});

	let showClone: boolean = $state(false);
	let showArchiveConfirm = $state(false);
	let archiveFormRef: HTMLFormElement | undefined = $state(undefined);
</script>

<div class="mx-auto max-w-3xl space-y-6 p-6">
	<div class="flex items-start justify-between">
		<div>
			<h1 class="text-2xl font-bold tracking-tight">{template.name}</h1>
			{#if template.description}
				<p class="text-sm text-muted-foreground">{template.description}</p>
			{/if}
		</div>
		<div class="flex gap-2">
			<Badge class={template.is_system ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary'}>
				{template.is_system ? 'System' : 'Custom'}
			</Badge>
			{#if template.compliance_standard}
				<Badge>{template.compliance_standard.toUpperCase()}</Badge>
			{/if}
		</div>
	</div>

	<div class="grid grid-cols-2 gap-4 rounded-lg border border-border p-4 text-sm">
		<div><span class="text-muted-foreground">Type:</span> {template.template_type.replace(/_/g, ' ')}</div>
		<div><span class="text-muted-foreground">Status:</span> {template.status}</div>
		<div><span class="text-muted-foreground">Created:</span> {new Date(template.created_at).toLocaleString()}</div>
		<div><span class="text-muted-foreground">Updated:</span> {new Date(template.updated_at).toLocaleString()}</div>
	</div>

	<div class="rounded-lg border border-border p-4">
		<h2 class="mb-2 text-sm font-medium">Template Definition</h2>
		<pre class="max-h-64 overflow-auto rounded bg-muted p-3 text-xs">{JSON.stringify(template.definition, null, 2)}</pre>
	</div>

	<div class="flex gap-3">
		<a
			href="/governance/reports/generate?template_id={template.id}"
			class="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-xs hover:bg-primary/90"
		>
			Generate Report
		</a>
		<button
			type="button"
			class="inline-flex h-9 items-center rounded-md border border-border px-4 text-sm font-medium hover:bg-muted"
			onclick={() => (showClone = !showClone)}
		>
			Clone
		</button>
		{#if !template.is_system}
			<form bind:this={archiveFormRef} method="POST" action="?/archive" use:svelteEnhance={() => {
				return async ({ result, update }) => {
					if (result.type === 'redirect') {
						addToast('success', 'Template archived');
						await update();
					} else if (result.type === 'error') {
						addToast('error', result.error?.message ?? 'Archive failed');
					}
				};
			}}>
				<button
					type="button"
					class="inline-flex h-9 items-center rounded-md border border-destructive px-4 text-sm font-medium text-destructive hover:bg-destructive/10"
					onclick={() => (showArchiveConfirm = true)}
				>
					Archive
				</button>
			</form>
		{/if}
	</div>

	{#if showClone}
		<form method="POST" action="?/clone" use:cloneEnhance class="rounded-lg border border-border p-4 space-y-3">
			<h3 class="text-sm font-medium">Clone Template</h3>
			<div>
				<label for="clone-name" class="block text-sm">Name</label>
				<input
					id="clone-name"
					name="name"
					type="text"
					value={String($cloneForm.name ?? '')}
					oninput={(e) => ($cloneForm.name = e.currentTarget.value)}
					class="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
				/>
				{#if $cloneErrors.name}<p class="text-xs text-destructive">{$cloneErrors.name}</p>{/if}
			</div>
			<button type="submit" class="inline-flex h-8 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90">
				Clone
			</button>
		</form>
	{/if}

	{#if !template.is_system}
		<form method="POST" action="?/edit" use:editEnhance class="space-y-4 rounded-lg border border-border p-4">
			<h2 class="text-sm font-medium">Edit Template</h2>
			<div>
				<label for="edit-name" class="block text-sm">Name</label>
				<input
					id="edit-name"
					name="name"
					type="text"
					value={String($editForm.name ?? '')}
					oninput={(e) => ($editForm.name = e.currentTarget.value)}
					class="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
				/>
				{#if $editErrors.name}<p class="text-xs text-destructive">{$editErrors.name}</p>{/if}
			</div>
			<div>
				<label for="edit-desc" class="block text-sm">Description</label>
				<textarea
					id="edit-desc"
					name="description"
					value={String($editForm.description ?? '')}
					oninput={(e) => ($editForm.description = e.currentTarget.value)}
					rows={2}
					class="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
				></textarea>
			</div>
			<button type="submit" class="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90">
				Save Changes
			</button>
		</form>
	{/if}

	<a href="/governance/reports" class="inline-flex text-sm text-muted-foreground hover:text-foreground">
		&larr; Back to Reports
	</a>
</div>

<ConfirmDialog
	bind:open={showArchiveConfirm}
	title="Archive template"
	description="Are you sure you want to archive this template?"
	confirmLabel="Archive"
	variant="destructive"
	onconfirm={() => archiveFormRef?.requestSubmit()}
/>
