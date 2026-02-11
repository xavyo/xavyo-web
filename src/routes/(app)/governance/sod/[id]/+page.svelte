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
	import type { RiskLevel, SodRuleStatus } from '$lib/api/types';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const { form, errors, enhance, message } = superForm(data.form, {
		onResult({ result }) {
			if (result.type === 'success' && result.data?.type !== 'error') {
				addToast('success', 'SoD rule updated successfully');
				isEditing = false;
				invalidateAll();
			}
		}
	});

	let isEditing: boolean = $state(false);
	let showDeleteDialog: boolean = $state(false);

	// Severity badge styles
	const severityStyles: Record<RiskLevel, string> = {
		low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
		medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
		high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
		critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
	};

	const severityLabels: Record<RiskLevel, string> = {
		low: 'Low',
		medium: 'Medium',
		high: 'High',
		critical: 'Critical'
	};

	// Status badge styles
	const statusStyles: Record<SodRuleStatus, string> = {
		active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
		inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
	};

	const statusLabels: Record<SodRuleStatus, string> = {
		active: 'Active',
		inactive: 'Inactive'
	};

	function startEdit() {
		$form.name = data.rule.name;
		$form.description = data.rule.description ?? undefined;
		$form.first_entitlement_id = data.rule.first_entitlement_id;
		$form.second_entitlement_id = data.rule.second_entitlement_id;
		$form.severity = data.rule.severity;
		$form.business_rationale = data.rule.business_rationale ?? undefined;
		isEditing = true;
	}

	function cancelEdit() {
		isEditing = false;
	}
</script>

<div class="flex items-center justify-between">
	<div class="flex items-center gap-3">
		<PageHeader title={data.rule.name} description="SoD rule details" />
		<span
			class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {statusStyles[data.rule.status]}"
			>{statusLabels[data.rule.status]}</span
		>
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
			<h2 class="text-xl font-semibold">Edit SoD rule</h2>
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

				<div class="space-y-2">
					<Label for="first_entitlement_id">First entitlement ID</Label>
					<Input
						id="first_entitlement_id"
						name="first_entitlement_id"
						type="text"
						value={String($form.first_entitlement_id ?? '')}
					/>
					{#if $errors.first_entitlement_id}
						<p class="text-sm text-destructive">{$errors.first_entitlement_id}</p>
					{/if}
				</div>

				<div class="space-y-2">
					<Label for="second_entitlement_id">Second entitlement ID</Label>
					<Input
						id="second_entitlement_id"
						name="second_entitlement_id"
						type="text"
						value={String($form.second_entitlement_id ?? '')}
					/>
					{#if $errors.second_entitlement_id}
						<p class="text-sm text-destructive">{$errors.second_entitlement_id}</p>
					{/if}
				</div>

				<Separator class="my-4" />

				<div class="space-y-2">
					<Label for="severity">Severity</Label>
					<select
						id="severity"
						name="severity"
						class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
						value={String($form.severity ?? '')}
					>
						<option value="">Select severity</option>
						<option value="low">Low</option>
						<option value="medium">Medium</option>
						<option value="high">High</option>
						<option value="critical">Critical</option>
					</select>
					{#if $errors.severity}
						<p class="text-sm text-destructive">{$errors.severity}</p>
					{/if}
				</div>

				<div class="space-y-2">
					<Label for="business_rationale">Business rationale</Label>
					<textarea
						id="business_rationale"
						name="business_rationale"
						class="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
						value={String($form.business_rationale ?? '')}
					></textarea>
					{#if $errors.business_rationale}
						<p class="text-sm text-destructive">{$errors.business_rationale}</p>
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
				<h2 class="text-xl font-semibold">Rule information</h2>
				<Button variant="outline" size="sm" onclick={startEdit}>Edit</Button>
			</div>
		</CardHeader>
		<CardContent class="space-y-4">
			<div class="grid gap-3">
				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Name</span>
					<span class="text-sm font-medium">{data.rule.name}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Description</span>
					<span class="text-sm">{data.rule.description ?? '---'}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Severity</span>
					<span
						class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {severityStyles[data.rule.severity]}"
						>{severityLabels[data.rule.severity]}</span
					>
				</div>
				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Status</span>
					<span
						class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {statusStyles[data.rule.status]}"
						>{statusLabels[data.rule.status]}</span
					>
				</div>

				<Separator />

				<h3 class="text-sm font-medium text-muted-foreground">Conflicting entitlements</h3>
				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">First entitlement ID</span>
					<span class="font-mono text-xs">{data.rule.first_entitlement_id}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Second entitlement ID</span>
					<span class="font-mono text-xs">{data.rule.second_entitlement_id}</span>
				</div>

				{#if data.rule.business_rationale}
					<Separator />

					<h3 class="text-sm font-medium text-muted-foreground">Business rationale</h3>
					<p class="text-sm">{data.rule.business_rationale}</p>
				{/if}

				<Separator />

				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Created by</span>
					<span class="font-mono text-xs">{data.rule.created_by}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Created</span>
					<span class="text-sm">{new Date(data.rule.created_at).toLocaleString()}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Updated</span>
					<span class="text-sm">{new Date(data.rule.updated_at).toLocaleString()}</span>
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
			{#if data.rule.status === 'inactive'}
				<form
					method="POST"
					action="?/enable"
					use:formEnhance={() => {
						return async ({ result, update }) => {
							if (result.type === 'success') {
								addToast('success', 'SoD rule enabled');
								await invalidateAll();
							} else if (result.type === 'failure') {
								addToast('error', String(result.data?.error ?? 'Failed to enable rule'));
							}
						};
					}}
				>
					<Button type="submit" variant="outline">Enable</Button>
				</form>
			{/if}

			{#if data.rule.status === 'active'}
				<form
					method="POST"
					action="?/disable"
					use:formEnhance={() => {
						return async ({ result, update }) => {
							if (result.type === 'success') {
								addToast('success', 'SoD rule disabled');
								await invalidateAll();
							} else if (result.type === 'failure') {
								addToast('error', String(result.data?.error ?? 'Failed to disable rule'));
							}
						};
					}}
				>
					<Button type="submit" variant="outline">Disable</Button>
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
			<Dialog.Title>Delete SoD rule</Dialog.Title>
			<Dialog.Description>
				Are you sure you want to delete <strong>{data.rule.name}</strong>? This action cannot be
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
							addToast('success', 'SoD rule deleted');
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
