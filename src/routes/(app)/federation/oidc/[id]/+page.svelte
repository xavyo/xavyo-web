<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { enhance as formEnhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { Card, CardHeader, CardContent } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Separator } from '$lib/components/ui/separator';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import IdpForm from '$lib/components/federation/idp-form.svelte';
	import ValidationResult from '$lib/components/federation/validation-result.svelte';
	import DomainList from '$lib/components/federation/domain-list.svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import { addToast } from '$lib/stores/toast.svelte';
	import { CheckCircle, XCircle, RefreshCw } from 'lucide-svelte';
	import type { ValidationResult as ValidationResultType } from '$lib/api/types';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const sf = superForm(data.form, {
		onResult({ result }) {
			if (result.type === 'success' && result.data?.type !== 'error') {
				addToast('success', 'Identity provider updated');
				isEditing = false;
				invalidateAll();
			}
		}
	});

	let isEditing = $state(false);
	let showDeleteDialog = $state(false);
	let validationResult = $state<ValidationResultType | null>(null);
	let isValidating = $state(false);

	function startEdit() {
		isEditing = true;
	}

	function cancelEdit() {
		isEditing = false;
	}

	function formatDate(dateStr: string): string {
		return new Date(dateStr).toLocaleString();
	}

	function handleDomainsChange() {
		invalidateAll();
	}
</script>

<div class="flex items-center justify-between">
	<div class="flex items-center gap-3">
		<PageHeader title={data.idp.name} description="Identity provider details" />
		<div class="flex gap-1.5">
			{#if data.idp.is_enabled}
				<Badge class="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
					<CheckCircle class="mr-1 h-3 w-3" />Enabled
				</Badge>
			{:else}
				<Badge variant="secondary">
					<XCircle class="mr-1 h-3 w-3" />Disabled
				</Badge>
			{/if}
			{#if data.idp.validation_status === 'valid'}
				<Badge class="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Valid</Badge>
			{:else if data.idp.validation_status === 'invalid'}
				<Badge variant="destructive">Invalid</Badge>
			{/if}
		</div>
	</div>
	<a
		href="/federation?tab=oidc"
		class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
	>
		Back to OIDC
	</a>
</div>

{#if isEditing}
	<IdpForm superform={sf} mode="edit" onCancel={cancelEdit} />
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
					<span class="text-sm font-medium">{data.idp.name}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Provider type</span>
					<span class="text-sm">{data.idp.provider_type}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Issuer URL</span>
					<span class="truncate text-sm font-mono" title={data.idp.issuer_url}>
						{data.idp.issuer_url}
					</span>
				</div>
				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Client ID</span>
					<span class="truncate text-sm font-mono" title={data.idp.client_id}>
						{data.idp.client_id}
					</span>
				</div>
				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Scopes</span>
					<span class="text-sm">{data.idp.scopes || '—'}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Sync on login</span>
					<span class="text-sm">{data.idp.sync_on_login ? 'Yes' : 'No'}</span>
				</div>
				{#if data.idp.claim_mapping}
					<div>
						<span class="text-sm text-muted-foreground">Claim mapping</span>
						<pre class="mt-1 max-h-48 overflow-auto rounded-md bg-muted p-2 font-mono text-xs">{JSON.stringify(data.idp.claim_mapping, null, 2)}</pre>
					</div>
				{/if}

				<Separator />

				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Status</span>
					<span class="text-sm">{data.idp.is_enabled ? 'Enabled' : 'Disabled'}</span>
				</div>
				{#if data.idp.validation_status}
					<div class="flex justify-between">
						<span class="text-sm text-muted-foreground">Validation</span>
						<span class="text-sm">{data.idp.validation_status}</span>
					</div>
				{/if}
				{#if data.idp.last_validated_at}
					<div class="flex justify-between">
						<span class="text-sm text-muted-foreground">Last validated</span>
						<span class="text-sm">{formatDate(data.idp.last_validated_at)}</span>
					</div>
				{/if}
				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Created</span>
					<span class="text-sm">{formatDate(data.idp.created_at)}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Updated</span>
					<span class="text-sm">{formatDate(data.idp.updated_at)}</span>
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
			<!-- Validate -->
			<form
				method="POST"
				action="?/validate"
				use:formEnhance={() => {
					isValidating = true;
					return async ({ result }) => {
						isValidating = false;
						if (result.type === 'success' && result.data?.validationResult) {
							validationResult = result.data.validationResult as ValidationResultType;
							addToast(
								validationResult.is_valid ? 'success' : 'error',
								validationResult.is_valid ? 'Configuration is valid' : 'Validation failed'
							);
						} else if (result.type === 'failure') {
							addToast('error', String(result.data?.error ?? 'Validation failed'));
						}
					};
				}}
			>
				<Button type="submit" variant="outline" disabled={isValidating}>
					{#if isValidating}
						<RefreshCw class="mr-2 h-4 w-4 animate-spin" />
						Validating...
					{:else}
						Validate
					{/if}
				</Button>
			</form>

			<!-- Toggle enable/disable -->
			<form
				method="POST"
				action="?/toggle"
				use:formEnhance={() => {
					return async ({ result }) => {
						if (result.type === 'success') {
							const action = result.data?.action as string;
							addToast('success', `Identity provider ${action}`);
							await invalidateAll();
						} else if (result.type === 'failure') {
							addToast('error', String(result.data?.error ?? 'Failed to toggle'));
						}
					};
				}}
			>
				<input type="hidden" name="is_enabled" value={String(!data.idp.is_enabled)} />
				<Button type="submit" variant="outline">
					{data.idp.is_enabled ? 'Disable' : 'Enable'}
				</Button>
			</form>

			<!-- Delete -->
			<Button variant="destructive" onclick={() => (showDeleteDialog = true)}>Delete</Button>
		</CardContent>
	</Card>

	<!-- Validation result -->
	{#if validationResult}
		<div class="mt-6 max-w-lg">
			<ValidationResult result={validationResult} />
		</div>
	{/if}

	<Separator class="my-6" />

	<!-- Domains -->
	<div class="max-w-lg">
		<DomainList idpId={data.idp.id} domains={data.domains} onDomainsChange={handleDomainsChange} />
	</div>
{/if}

<!-- Delete confirmation dialog -->
<Dialog.Root bind:open={showDeleteDialog}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Delete identity provider</Dialog.Title>
			<Dialog.Description>
				Are you sure you want to delete <strong>{data.idp.name}</strong>? This action cannot be undone.
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
							addToast('success', 'Identity provider deleted');
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
