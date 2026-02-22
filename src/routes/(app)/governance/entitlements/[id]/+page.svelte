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
	import { addToast } from '$lib/stores/toast.svelte';
	import RiskLevelBadge from '../../risk-level-badge.svelte';
	import ClassificationBadge from '../../classification-badge.svelte';
	import StatusBadge from '../../status-badge.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// svelte-ignore state_referenced_locally
	const { form, errors, enhance, message } = superForm(data.form, {
		onResult({ result }) {
			if (result.type === 'success' && result.data?.type !== 'error') {
				addToast('success', 'Entitlement updated successfully');
				isEditing = false;
				invalidateAll();
			}
		}
	});

	let isEditing: boolean = $state(false);
	let showDeleteDialog: boolean = $state(false);
	let ownerIdInput: string = $state('');

	const legalBasisLabels: Record<string, string> = {
		consent: 'Consent',
		contract: 'Contract',
		legal_obligation: 'Legal Obligation',
		vital_interest: 'Vital Interest',
		public_task: 'Public Task',
		legitimate_interest: 'Legitimate Interest'
	};

	function startEdit() {
		$form.name = data.entitlement.name;
		$form.description = data.entitlement.description ?? undefined;
		$form.risk_level = data.entitlement.risk_level;
		$form.data_protection_classification = data.entitlement.data_protection_classification;
		$form.legal_basis = data.entitlement.legal_basis ?? undefined;
		$form.is_delegable = data.entitlement.is_delegable;
		$form.retention_period_days = data.entitlement.retention_period_days ?? undefined;
		$form.data_controller = data.entitlement.data_controller ?? undefined;
		$form.data_processor = data.entitlement.data_processor ?? undefined;
		$form.purposes = data.entitlement.purposes?.join(', ') ?? undefined;
		isEditing = true;
	}

	function cancelEdit() {
		isEditing = false;
	}

	function formatLegalBasis(basis: string | null): string {
		if (!basis) return '\u2014';
		return legalBasisLabels[basis] ?? basis;
	}
</script>

<div class="flex items-center justify-between">
	<div class="flex items-center gap-3">
		<PageHeader title={data.entitlement.name} description="Entitlement details" />
		<StatusBadge status={data.entitlement.status} />
	</div>
	<a
		href="/governance"
		class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
	>
		Back to Governance
	</a>
</div>

{#if isEditing}
	<Card class="max-w-lg">
		<CardHeader>
			<h2 class="text-xl font-semibold">Edit entitlement</h2>
		</CardHeader>
		<CardContent>
			{#if $message}
				<Alert variant="destructive" class="mb-4">
					<AlertDescription>{$message}</AlertDescription>
				</Alert>
			{/if}

			<form method="POST" action="?/update" use:enhance class="space-y-4">
				<!-- Basic Info -->
				<h3 class="text-sm font-medium text-muted-foreground">Basic info</h3>

				<div class="space-y-2">
					<Label for="name">Name</Label>
					<Input id="name" name="name" type="text" value={String($form.name ?? '')} />
					{#if $errors.name}
						<p class="text-sm text-destructive">{$errors.name}</p>
					{/if}
				</div>

				<div class="space-y-2">
					<Label for="description">Description</Label>
					<textarea
						id="description"
						name="description"
						class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
						value={String($form.description ?? '')}
					></textarea>
					{#if $errors.description}
						<p class="text-sm text-destructive">{$errors.description}</p>
					{/if}
				</div>

				<Separator class="my-4" />

				<!-- Risk & Classification -->
				<h3 class="text-sm font-medium text-muted-foreground">Risk & classification</h3>

				<div class="space-y-2">
					<Label for="risk_level">Risk level</Label>
					<select
						id="risk_level"
						name="risk_level"
						class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
						value={String($form.risk_level ?? '')}
					>
						<option value="">Select risk level</option>
						<option value="low">Low</option>
						<option value="medium">Medium</option>
						<option value="high">High</option>
						<option value="critical">Critical</option>
					</select>
					{#if $errors.risk_level}
						<p class="text-sm text-destructive">{$errors.risk_level}</p>
					{/if}
				</div>

				<div class="space-y-2">
					<Label for="data_protection_classification">Data protection classification</Label>
					<select
						id="data_protection_classification"
						name="data_protection_classification"
						class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
						value={String($form.data_protection_classification ?? '')}
					>
						<option value="">Select classification</option>
						<option value="none">None</option>
						<option value="personal">Personal Data</option>
						<option value="sensitive">Sensitive Data</option>
						<option value="special_category">Special Category</option>
					</select>
					{#if $errors.data_protection_classification}
						<p class="text-sm text-destructive">{$errors.data_protection_classification}</p>
					{/if}
				</div>

				<div class="space-y-2">
					<Label for="legal_basis">Legal basis</Label>
					<select
						id="legal_basis"
						name="legal_basis"
						class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
						value={String($form.legal_basis ?? '')}
					>
						<option value="">Select legal basis</option>
						<option value="consent">Consent</option>
						<option value="contract">Contract</option>
						<option value="legal_obligation">Legal Obligation</option>
						<option value="vital_interest">Vital Interest</option>
						<option value="public_task">Public Task</option>
						<option value="legitimate_interest">Legitimate Interest</option>
					</select>
					{#if $errors.legal_basis}
						<p class="text-sm text-destructive">{$errors.legal_basis}</p>
					{/if}
				</div>

				<Separator class="my-4" />

				<!-- GDPR Details -->
				<h3 class="text-sm font-medium text-muted-foreground">GDPR details</h3>

				<div class="flex items-center gap-2">
					<input
						id="is_delegable"
						name="is_delegable"
						type="checkbox"
						class="h-4 w-4 rounded border-input"
						checked={$form.is_delegable}
					/>
					<Label for="is_delegable">Is delegable</Label>
				</div>

				<div class="space-y-2">
					<Label for="retention_period_days">Retention period (days)</Label>
					<Input
						id="retention_period_days"
						name="retention_period_days"
						type="number"
						value={$form.retention_period_days !== undefined ? String($form.retention_period_days) : ''}
					/>
					{#if $errors.retention_period_days}
						<p class="text-sm text-destructive">{$errors.retention_period_days}</p>
					{/if}
				</div>

				<div class="space-y-2">
					<Label for="data_controller">Data controller</Label>
					<Input
						id="data_controller"
						name="data_controller"
						type="text"
						value={String($form.data_controller ?? '')}
					/>
					{#if $errors.data_controller}
						<p class="text-sm text-destructive">{$errors.data_controller}</p>
					{/if}
				</div>

				<div class="space-y-2">
					<Label for="data_processor">Data processor</Label>
					<Input
						id="data_processor"
						name="data_processor"
						type="text"
						value={String($form.data_processor ?? '')}
					/>
					{#if $errors.data_processor}
						<p class="text-sm text-destructive">{$errors.data_processor}</p>
					{/if}
				</div>

				<div class="space-y-2">
					<Label for="purposes">Purposes (comma-separated)</Label>
					<Input
						id="purposes"
						name="purposes"
						type="text"
						value={String($form.purposes ?? '')}
					/>
					{#if $errors.purposes}
						<p class="text-sm text-destructive">{$errors.purposes}</p>
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
				<h2 class="text-xl font-semibold">Entitlement information</h2>
				<Button variant="outline" size="sm" onclick={startEdit}>Edit</Button>
			</div>
		</CardHeader>
		<CardContent class="space-y-4">
			<div class="grid gap-3">
				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Name</span>
					<span class="text-sm font-medium">{data.entitlement.name}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Description</span>
					<span class="text-sm">{data.entitlement.description ?? '\u2014'}</span>
				</div>

				<Separator />

				<h3 class="text-sm font-medium text-muted-foreground">Risk & classification</h3>
				<div class="flex justify-between items-center">
					<span class="text-sm text-muted-foreground">Risk level</span>
					<RiskLevelBadge level={data.entitlement.risk_level} />
				</div>
				<div class="flex justify-between items-center">
					<span class="text-sm text-muted-foreground">Classification</span>
					<ClassificationBadge classification={data.entitlement.data_protection_classification} />
				</div>
				<div class="flex justify-between items-center">
					<span class="text-sm text-muted-foreground">Status</span>
					<StatusBadge status={data.entitlement.status} />
				</div>
				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Legal basis</span>
					<span class="text-sm">{formatLegalBasis(data.entitlement.legal_basis)}</span>
				</div>

				<Separator />

				<h3 class="text-sm font-medium text-muted-foreground">GDPR details</h3>
				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Is delegable</span>
					<span class="text-sm">{data.entitlement.is_delegable ? 'Yes' : 'No'}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Retention period</span>
					<span class="text-sm"
						>{data.entitlement.retention_period_days
							? `${data.entitlement.retention_period_days} days`
							: '\u2014'}</span
					>
				</div>
				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Data controller</span>
					<span class="text-sm">{data.entitlement.data_controller ?? '\u2014'}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Data processor</span>
					<span class="text-sm">{data.entitlement.data_processor ?? '\u2014'}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Purposes</span>
					<span class="text-sm"
						>{data.entitlement.purposes?.length
							? data.entitlement.purposes.join(', ')
							: '\u2014'}</span
					>
				</div>

				<Separator />

				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Owner ID</span>
					<span class="text-sm font-mono">{data.entitlement.owner_id ?? '\u2014'}</span>
				</div>

				<Separator />

				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Created</span>
					<span class="text-sm">{new Date(data.entitlement.created_at).toLocaleString()}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Updated</span>
					<span class="text-sm">{new Date(data.entitlement.updated_at).toLocaleString()}</span>
				</div>
			</div>
		</CardContent>
	</Card>

	<Separator class="my-6" />

	<!-- Owner management -->
	<Card class="max-w-lg">
		<CardHeader>
			<h2 class="text-xl font-semibold">Owner management</h2>
		</CardHeader>
		<CardContent class="space-y-4">
			{#if data.entitlement.owner_id}
				<div class="flex items-center justify-between">
					<div>
						<span class="text-sm text-muted-foreground">Current owner:</span>
						<span class="ml-2 text-sm font-mono">{data.entitlement.owner_id}</span>
					</div>
					<form
						method="POST"
						action="?/removeOwner"
						use:formEnhance={() => {
							return async ({ result, update }) => {
								if (result.type === 'success') {
									addToast('success', 'Owner removed');
									await invalidateAll();
								} else if (result.type === 'failure') {
									addToast('error', String(result.data?.error ?? 'Failed to remove owner'));
								}
							};
						}}
					>
						<Button type="submit" variant="destructive" size="sm">Remove owner</Button>
					</form>
				</div>
			{:else}
				<p class="text-sm text-muted-foreground">No owner assigned.</p>
			{/if}

			<Separator />

			<form
				method="POST"
				action="?/setOwner"
				use:formEnhance={() => {
					return async ({ result, update }) => {
						if (result.type === 'success') {
							addToast('success', 'Owner set successfully');
							ownerIdInput = '';
							await invalidateAll();
						} else if (result.type === 'failure') {
							addToast('error', String(result.data?.error ?? 'Failed to set owner'));
						}
					};
				}}
				class="space-y-3"
			>
				<div class="space-y-2">
					<Label for="owner_id">Set owner (User ID)</Label>
					<Input
						id="owner_id"
						name="owner_id"
						type="text"
						placeholder="Enter user ID"
						value={ownerIdInput}
					/>
				</div>
				<Button type="submit" size="sm">Set owner</Button>
			</form>
		</CardContent>
	</Card>

	<Separator class="my-6" />

	<!-- Delete action -->
	<Card class="max-w-lg">
		<CardHeader>
			<h2 class="text-xl font-semibold">Danger zone</h2>
		</CardHeader>
		<CardContent>
			<Button variant="destructive" onclick={() => (showDeleteDialog = true)}>Delete entitlement</Button>
		</CardContent>
	</Card>
{/if}

<!-- Delete dialog -->
<Dialog.Root bind:open={showDeleteDialog}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Delete entitlement</Dialog.Title>
			<Dialog.Description>
				Are you sure you want to delete <strong>{data.entitlement.name}</strong>? This action cannot
				be undone.
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
							addToast('success', 'Entitlement deleted');
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
