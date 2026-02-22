<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { enhance } from '$app/forms';
	import { superForm } from 'sveltekit-superforms';
	import { Card, CardHeader, CardContent } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import { Separator } from '$lib/components/ui/separator';
	import * as Dialog from '$lib/components/ui/dialog';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import SeverityBadge from '../../severity-badge.svelte';
	import { addToast } from '$lib/stores/toast.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let threshold = $derived(data.threshold);
	let editing = $state(false);
	let deleteOpen = $state(false);

	const actionLabels: Record<string, string> = {
		alert: 'Alert',
		require_mfa: 'Require MFA',
		block: 'Block'
	};

	const {
		form,
		errors,
		enhance: formEnhance,
		message
	// svelte-ignore state_referenced_locally
	} = superForm(data.form, {
		invalidateAll: 'force',
		onResult({ result }) {
			if (result.type === 'success') {
				addToast('success', 'Threshold updated successfully');
				editing = false;
			}
		}
	});

	function handleResult(result: any) {
		if (result.type === 'success' && result.data?.success) {
			addToast('success', `Threshold ${result.data.action} successfully`);
			invalidateAll();
		} else if (result.type === 'failure') {
			addToast('error', result.data?.error ?? 'Action failed');
		}
	}
</script>

<PageHeader title={threshold.name} description="Risk threshold details">
	<div class="flex gap-2">
		{#if !editing}
			<Button variant="outline" onclick={() => (editing = true)}>Edit</Button>
		{/if}
		{#if threshold.is_enabled}
			<form
				method="POST"
				action="?/disable"
				use:enhance={() => ({ result }) => handleResult(result)}
			>
				<Button variant="outline" type="submit">Disable</Button>
			</form>
		{:else}
			<form
				method="POST"
				action="?/enable"
				use:enhance={() => ({ result }) => handleResult(result)}
			>
				<Button variant="outline" type="submit">Enable</Button>
			</form>
		{/if}
		<Button variant="destructive" onclick={() => (deleteOpen = true)}>Delete</Button>
	</div>
</PageHeader>

{#if editing}
	<!-- Edit Mode -->
	<Card class="max-w-lg">
		<CardHeader>
			<h2 class="text-lg font-semibold text-foreground">Edit Threshold</h2>
		</CardHeader>
		<CardContent>
			{#if $message}
				<Alert variant="destructive" class="mb-4">
					<AlertDescription>{$message}</AlertDescription>
				</Alert>
			{/if}

			<form method="POST" action="?/update" use:formEnhance class="space-y-4">
				<div class="space-y-2">
					<Label for="name">Name</Label>
					<Input id="name" name="name" type="text" bind:value={$form.name} />
					{#if $errors.name}<p class="text-sm text-destructive">{$errors.name}</p>{/if}
				</div>

				<div class="space-y-2">
					<Label for="score_value">Score Value (1-100)</Label>
					<Input
						id="score_value"
						name="score_value"
						type="number"
						min="1"
						max="100"
						bind:value={$form.score_value}
					/>
					{#if $errors.score_value}<p class="text-sm text-destructive">{$errors.score_value}</p
					>{/if}
				</div>

				<div class="space-y-2">
					<Label for="severity">Severity</Label>
					<select
						id="severity"
						name="severity"
						class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
						value={String($form.severity ?? 'info')}
						onchange={(e) => ($form.severity = e.currentTarget.value as 'info' | 'warning' | 'critical')}
					>
						<option value="info">Info</option>
						<option value="warning">Warning</option>
						<option value="critical">Critical</option>
					</select>
					{#if $errors.severity}<p class="text-sm text-destructive">{$errors.severity}</p>{/if}
				</div>

				<div class="space-y-2">
					<Label for="action">Action</Label>
					<select
						id="action"
						name="action"
						class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
						value={String($form.action ?? '')}
						onchange={(e) => ($form.action = (e.currentTarget.value || undefined) as 'alert' | 'require_mfa' | 'block' | undefined)}
					>
						<option value="">None</option>
						<option value="alert">Alert</option>
						<option value="require_mfa">Require MFA</option>
						<option value="block">Block</option>
					</select>
					{#if $errors.action}<p class="text-sm text-destructive">{$errors.action}</p>{/if}
				</div>

				<div class="space-y-2">
					<Label for="cooldown_hours">Cooldown Hours (1-720)</Label>
					<Input
						id="cooldown_hours"
						name="cooldown_hours"
						type="number"
						min="1"
						max="720"
						bind:value={$form.cooldown_hours}
					/>
					{#if $errors.cooldown_hours}<p class="text-sm text-destructive"
						>{$errors.cooldown_hours}</p
					>{/if}
				</div>

				<div class="flex items-center gap-2">
					<input
						id="is_enabled"
						name="is_enabled"
						type="checkbox"
						class="h-4 w-4 rounded border-input"
						bind:checked={$form.is_enabled}
					/>
					<Label for="is_enabled">Enabled</Label>
				</div>

				<div class="flex gap-2 pt-2">
					<Button type="submit">Save Changes</Button>
					<Button variant="outline" type="button" onclick={() => (editing = false)}>Cancel</Button>
				</div>
			</form>
		</CardContent>
	</Card>
{:else}
	<!-- View Mode -->
	<div class="grid gap-6 lg:grid-cols-2">
		<Card>
			<CardHeader>
				<h2 class="text-lg font-semibold text-foreground">Threshold Information</h2>
			</CardHeader>
			<CardContent>
				<div class="grid gap-4 sm:grid-cols-2">
					<div>
						<p class="text-sm text-muted-foreground">Name</p>
						<p class="font-medium text-foreground">{threshold.name}</p>
					</div>
					<div>
						<p class="text-sm text-muted-foreground">Score Value</p>
						<p class="font-medium text-foreground">{threshold.score_value}</p>
					</div>
					<div>
						<p class="text-sm text-muted-foreground">Severity</p>
						<SeverityBadge severity={threshold.severity} />
					</div>
					<div>
						<p class="text-sm text-muted-foreground">Action</p>
						<p class="font-medium text-foreground">
							{actionLabels[threshold.action] ?? threshold.action}
						</p>
					</div>
					<div>
						<p class="text-sm text-muted-foreground">Cooldown</p>
						<p class="font-medium text-foreground">
							{threshold.cooldown_hours ? `${threshold.cooldown_hours} hours` : 'None'}
						</p>
					</div>
					<div>
						<p class="text-sm text-muted-foreground">Status</p>
						<span
							class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {threshold.is_enabled
								? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
								: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'}"
						>
							{threshold.is_enabled ? 'Enabled' : 'Disabled'}
						</span>
					</div>
				</div>

				<Separator class="my-4" />

				<div class="grid gap-4 sm:grid-cols-2">
					<div>
						<p class="text-sm text-muted-foreground">Created</p>
						<p class="text-sm text-foreground">
							{new Date(threshold.created_at).toLocaleDateString()}
						</p>
					</div>
					<div>
						<p class="text-sm text-muted-foreground">Updated</p>
						<p class="text-sm text-foreground">
							{new Date(threshold.updated_at).toLocaleDateString()}
						</p>
					</div>
				</div>
			</CardContent>
		</Card>
	</div>

	<div class="mt-4">
		<a
			href="/governance/risk/thresholds"
			class="text-sm text-muted-foreground hover:text-foreground hover:underline"
		>
			&larr; Back to Thresholds
		</a>
	</div>
{/if}

<!-- Delete Dialog -->
<Dialog.Root bind:open={deleteOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Delete Risk Threshold</Dialog.Title>
			<Dialog.Description
				>Delete "{threshold.name}"? This cannot be undone.</Dialog.Description
			>
		</Dialog.Header>
		<form
			method="POST"
			action="?/delete"
			use:enhance={() => {
				deleteOpen = false;
				return async ({ result, update }) => {
					if (result.type === 'redirect') {
						addToast('success', 'Threshold deleted');
					}
					await update();
				};
			}}
		>
			<Dialog.Footer>
				<Button variant="outline" type="button" onclick={() => (deleteOpen = false)}>Cancel</Button>
				<Button variant="destructive" type="submit">Delete</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
