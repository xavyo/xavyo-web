<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { enhance as formEnhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { Card, CardHeader, CardContent } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Separator } from '$lib/components/ui/separator';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import SpForm from '$lib/components/federation/sp-form.svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import { addToast } from '$lib/stores/toast.svelte';
	import { CheckCircle, XCircle } from 'lucide-svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const sf = superForm(data.form, {
		onResult({ result }) {
			if (result.type === 'success' && result.data?.type !== 'error') {
				addToast('success', 'Service provider updated');
				isEditing = false;
				invalidateAll();
			}
		}
	});

	let isEditing = $state(false);
	let showDeleteDialog = $state(false);

	function startEdit() {
		isEditing = true;
	}

	function cancelEdit() {
		isEditing = false;
	}

	function formatDate(dateStr: string): string {
		return new Date(dateStr).toLocaleString();
	}
</script>

<div class="flex items-center justify-between">
	<div class="flex items-center gap-3">
		<PageHeader title={data.sp.name} description="Service provider details" />
		<div class="flex gap-1.5">
			{#if data.sp.enabled}
				<Badge class="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
					<CheckCircle class="mr-1 h-3 w-3" />Enabled
				</Badge>
			{:else}
				<Badge variant="secondary">
					<XCircle class="mr-1 h-3 w-3" />Disabled
				</Badge>
			{/if}
		</div>
	</div>
	<a
		href="/federation?tab=saml"
		class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
	>
		Back to SAML
	</a>
</div>

{#if isEditing}
	<SpForm superform={sf} mode="edit" onCancel={cancelEdit} />
{:else}
	<Card class="max-w-lg">
		<CardHeader>
			<div class="flex items-center justify-between">
				<h2 class="text-xl font-semibold">Provider information</h2>
				<Button variant="outline" size="sm" onclick={startEdit}>Edit</Button>
			</div>
		</CardHeader>
		<CardContent class="space-y-4">
			<div class="grid gap-3">
				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Name</span>
					<span class="text-sm font-medium">{data.sp.name}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Entity ID</span>
					<span class="truncate text-sm font-mono" title={data.sp.entity_id}>
						{data.sp.entity_id}
					</span>
				</div>
				<div>
					<span class="text-sm text-muted-foreground">ACS URLs</span>
					<ul class="mt-1 space-y-1">
						{#each data.sp.acs_urls as url}
							<li class="truncate text-sm font-mono" title={url}>{url}</li>
						{/each}
					</ul>
				</div>
				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Name ID format</span>
					<span class="text-sm">{data.sp.name_id_format || '\u2014'}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Sign assertions</span>
					<span class="text-sm">{data.sp.sign_assertions ? 'Yes' : 'No'}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Validate signatures</span>
					<span class="text-sm">{data.sp.validate_signatures ? 'Yes' : 'No'}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Assertion validity</span>
					<span class="text-sm">{data.sp.assertion_validity_seconds}s</span>
				</div>
				{#if data.sp.metadata_url}
					<div class="flex justify-between">
						<span class="text-sm text-muted-foreground">Metadata URL</span>
						<span class="truncate text-sm font-mono" title={data.sp.metadata_url}>
							{data.sp.metadata_url}
						</span>
					</div>
				{/if}
				{#if data.sp.certificate}
					<div>
						<span class="text-sm text-muted-foreground">Certificate</span>
						<pre class="mt-1 max-h-24 overflow-auto rounded-md bg-muted p-2 font-mono text-xs">{data.sp.certificate}</pre>
					</div>
				{/if}
				{#if data.sp.attribute_mapping}
					<div>
						<span class="text-sm text-muted-foreground">Attribute mapping</span>
						<pre class="mt-1 max-h-48 overflow-auto rounded-md bg-muted p-2 font-mono text-xs">{JSON.stringify(data.sp.attribute_mapping, null, 2)}</pre>
					</div>
				{/if}

				<Separator />

				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Status</span>
					<span class="text-sm">{data.sp.enabled ? 'Enabled' : 'Disabled'}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Created</span>
					<span class="text-sm">{formatDate(data.sp.created_at)}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Updated</span>
					<span class="text-sm">{formatDate(data.sp.updated_at)}</span>
				</div>
			</div>
		</CardContent>
	</Card>

	<Separator class="my-6" />

	<!-- Actions -->
	<Card class="max-w-lg">
		<CardHeader>
			<h2 class="text-xl font-semibold">Actions</h2>
		</CardHeader>
		<CardContent class="flex flex-wrap gap-2">
			<!-- Delete -->
			<Button variant="destructive" onclick={() => (showDeleteDialog = true)}>Delete</Button>
		</CardContent>
	</Card>
{/if}

<!-- Delete confirmation dialog -->
<Dialog.Root bind:open={showDeleteDialog}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Delete service provider</Dialog.Title>
			<Dialog.Description>
				Are you sure you want to delete <strong>{data.sp.name}</strong>? This action cannot be undone.
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
							addToast('success', 'Service provider deleted');
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
