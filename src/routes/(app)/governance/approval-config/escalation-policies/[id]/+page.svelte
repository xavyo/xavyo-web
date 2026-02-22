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
	import { addToast } from '$lib/stores/toast.svelte';
	import ConfirmDialog from '$lib/components/ui/confirm-dialog.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let showDeleteConfirm = $state(false);
	let deletePolicyFormRef: HTMLFormElement | undefined = $state(undefined);

	const {
		form: editForm,
		errors: editErrors,
		enhance: editEnhance,
		message: editMessage
	// svelte-ignore state_referenced_locally
	} = superForm(data.editForm, {
		invalidateAll: 'force',
		onResult({ result }) {
			if (result.type === 'success') {
				addToast('success', 'Policy updated');
			}
		}
	});

	const {
		form: levelForm,
		errors: levelErrors,
		enhance: levelEnhance,
		message: levelMessage
	// svelte-ignore state_referenced_locally
	} = superForm(data.levelForm, {
		invalidateAll: 'force',
		resetForm: true,
		onResult({ result }) {
			if (result.type === 'success') {
				addToast('success', 'Level added');
			}
		}
	});

	const targetTypeLabels: Record<string, string> = {
		specific_user: 'Specific User',
		approval_group: 'Approval Group',
		manager: 'Manager',
		manager_chain: 'Manager Chain',
		tenant_admin: 'Tenant Admin'
	};

	const fallbackLabels: Record<string, string> = {
		escalate_admin: 'Escalate to Admin',
		auto_approve: 'Auto Approve',
		auto_reject: 'Auto Reject',
		remain_pending: 'Remain Pending'
	};

	function formatSeconds(secs: number): string {
		if (secs >= 3600) return `${Math.round(secs / 3600)}h`;
		if (secs >= 60) return `${Math.round(secs / 60)}m`;
		return `${secs}s`;
	}
</script>

<div class="flex items-center justify-between">
	<PageHeader title={data.policy.name} description="Escalation policy details" />
	<div class="flex items-center gap-2">
		{#if data.policy.is_default}
			<span
				class="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
				>Default</span
			>
		{/if}
		<a
			href="/governance/approval-config"
			class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
		>
			Back to Approval Config
		</a>
	</div>
</div>

<!-- Policy Info -->
<Card class="mt-6 max-w-lg">
	<CardHeader>
		<h2 class="text-lg font-semibold">Policy Info</h2>
	</CardHeader>
	<CardContent class="space-y-3">
		<div class="flex justify-between">
			<span class="text-sm text-muted-foreground">Default Timeout</span>
			<span class="text-sm font-medium">{formatSeconds(data.policy.default_timeout_secs)}</span>
		</div>
		{#if data.policy.warning_threshold_secs}
			<div class="flex justify-between">
				<span class="text-sm text-muted-foreground">Warning Threshold</span>
				<span class="text-sm font-medium"
					>{formatSeconds(data.policy.warning_threshold_secs)}</span
				>
			</div>
		{/if}
		<div class="flex justify-between">
			<span class="text-sm text-muted-foreground">Final Fallback</span>
			<span
				class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium
					{data.policy.final_fallback === 'auto_reject'
					? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
					: data.policy.final_fallback === 'auto_approve'
						? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
						: data.policy.final_fallback === 'escalate_admin'
							? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
							: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'}"
			>
				{fallbackLabels[data.policy.final_fallback] ?? data.policy.final_fallback}
			</span>
		</div>
		<div class="flex justify-between">
			<span class="text-sm text-muted-foreground">Status</span>
			<span
				class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {data
					.policy.is_active
					? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
					: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'}"
			>
				{data.policy.is_active ? 'Active' : 'Inactive'}
			</span>
		</div>
	</CardContent>
</Card>

<div class="mt-6 grid gap-6 lg:grid-cols-2">
	<!-- Edit Form -->
	<Card>
		<CardHeader>
			<h2 class="text-lg font-semibold">Edit Policy</h2>
		</CardHeader>
		<CardContent>
			{#if $editMessage}
				<Alert
					variant={$editMessage.includes('success') ? 'default' : 'destructive'}
					class="mb-4"
				>
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
						class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
						value={String($editForm.description ?? '')}
					></textarea>
					{#if $editErrors.description}
						<p class="text-sm text-destructive">{$editErrors.description}</p>
					{/if}
				</div>
				<div class="space-y-2">
					<Label for="default_timeout_secs">Default Timeout (seconds)</Label>
					<Input
						id="default_timeout_secs"
						name="default_timeout_secs"
						type="number"
						min="60"
						value={String($editForm.default_timeout_secs ?? '')}
					/>
					{#if $editErrors.default_timeout_secs}
						<p class="text-sm text-destructive">{$editErrors.default_timeout_secs}</p>
					{/if}
				</div>
				<div class="space-y-2">
					<Label for="warning_threshold_secs">Warning Threshold (seconds, optional)</Label>
					<Input
						id="warning_threshold_secs"
						name="warning_threshold_secs"
						type="number"
						min="60"
						value={String($editForm.warning_threshold_secs ?? '')}
					/>
					{#if $editErrors.warning_threshold_secs}
						<p class="text-sm text-destructive">{$editErrors.warning_threshold_secs}</p>
					{/if}
				</div>
				<div class="space-y-2">
					<Label for="final_fallback">Final Fallback</Label>
					<select
						id="final_fallback"
						name="final_fallback"
						class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
						value={String($editForm.final_fallback ?? '')}
					>
						<option value="">Select fallback action</option>
						<option value="escalate_admin">Escalate to Admin</option>
						<option value="auto_approve">Auto Approve</option>
						<option value="auto_reject">Auto Reject</option>
						<option value="remain_pending">Remain Pending</option>
					</select>
					{#if $editErrors.final_fallback}
						<p class="text-sm text-destructive">{$editErrors.final_fallback}</p>
					{/if}
				</div>
				<Button type="submit">Save Changes</Button>
			</form>
		</CardContent>
	</Card>

	<!-- Actions -->
	<Card>
		<CardHeader>
			<h2 class="text-lg font-semibold">Actions</h2>
		</CardHeader>
		<CardContent class="space-y-4">
			{#if !data.policy.is_default}
				<form
					method="POST"
					action="?/setDefault"
					use:formEnhance={() => {
						return async ({ result, update }) => {
							if (result.type === 'success') {
								addToast('success', 'Policy set as default');
								await invalidateAll();
							}
						};
					}}
				>
					<Button type="submit" variant="outline" class="w-full">Set as Default</Button>
				</form>
				<Separator />
			{/if}
			<form
				bind:this={deletePolicyFormRef}
				method="POST"
				action="?/delete"
				use:formEnhance={() => {
					return async ({ result, update }) => {
						if (result.type === 'redirect') {
							addToast('success', 'Policy deleted');
							await update();
						} else if (result.type === 'failure') {
							addToast('error', String(result.data?.error ?? 'Failed to delete policy'));
						}
					};
				}}
			>
				<Button type="button" variant="destructive" class="w-full" onclick={() => (showDeleteConfirm = true)}>Delete Policy</Button>
			</form>
		</CardContent>
	</Card>
</div>

<!-- Levels Section -->
<Separator class="my-6" />

<h2 class="mb-4 text-lg font-semibold">Escalation Levels ({data.policy.levels.length})</h2>

{#if data.policy.levels.length > 0}
	<div class="mb-6 overflow-x-auto rounded-lg border border-border">
		<table class="w-full text-sm">
			<thead>
				<tr class="border-b border-border bg-muted/50">
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Order</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Target Type</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Timeout</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Actions</th>
				</tr>
			</thead>
			<tbody>
				{#each data.policy.levels.sort((a, b) => a.level_order - b.level_order) as level}
					<tr class="border-b border-border last:border-0">
						<td class="px-4 py-3">{level.level_order}</td>
						<td class="px-4 py-3">{level.level_name ?? '---'}</td>
						<td class="px-4 py-3">
							<span
								class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium
									{level.target_type === 'tenant_admin'
									? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
									: level.target_type === 'manager' || level.target_type === 'manager_chain'
										? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
										: level.target_type === 'approval_group'
											? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
											: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'}"
							>
								{targetTypeLabels[level.target_type] ?? level.target_type}
							</span>
							{#if level.target_id}
								<span class="ml-1 font-mono text-xs text-muted-foreground"
									>({level.target_id.substring(0, 8)}...)</span
								>
							{/if}
							{#if level.manager_chain_depth}
								<span class="ml-1 text-xs text-muted-foreground"
									>(depth: {level.manager_chain_depth})</span
								>
							{/if}
						</td>
						<td class="px-4 py-3">{formatSeconds(level.timeout_secs)}</td>
						<td class="px-4 py-3">
							<form
								method="POST"
								action="?/removeLevel"
								use:formEnhance={() => {
									return async ({ result, update }) => {
										if (result.type === 'success') {
											addToast('success', 'Level removed');
											await invalidateAll();
										}
									};
								}}
							>
								<input type="hidden" name="level_id" value={level.id} />
								<Button type="submit" variant="outline" size="sm">Remove</Button>
							</form>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{:else}
	<p class="mb-6 text-sm text-muted-foreground">
		No escalation levels defined. Add levels to configure timeout behavior.
	</p>
{/if}

<!-- Add Level Form -->
<Card class="max-w-lg">
	<CardHeader>
		<h2 class="text-lg font-semibold">Add Level</h2>
	</CardHeader>
	<CardContent>
		{#if $levelMessage}
			<Alert
				variant={$levelMessage.includes('success') ? 'default' : 'destructive'}
				class="mb-4"
			>
				<AlertDescription>{$levelMessage}</AlertDescription>
			</Alert>
		{/if}
		<form method="POST" action="?/addLevel" use:levelEnhance class="space-y-4">
			<div class="grid gap-4 sm:grid-cols-2">
				<div class="space-y-2">
					<Label for="level_order">Order</Label>
					<Input
						id="level_order"
						name="level_order"
						type="number"
						min="1"
						max="10"
						placeholder="1"
						value={String($levelForm.level_order ?? '')}
					/>
					{#if $levelErrors.level_order}
						<p class="text-sm text-destructive">{$levelErrors.level_order}</p>
					{/if}
				</div>
				<div class="space-y-2">
					<Label for="level_name">Name (optional)</Label>
					<Input
						id="level_name"
						name="level_name"
						type="text"
						placeholder="e.g. First Escalation"
						value={String($levelForm.level_name ?? '')}
					/>
					{#if $levelErrors.level_name}
						<p class="text-sm text-destructive">{$levelErrors.level_name}</p>
					{/if}
				</div>
			</div>
			<div class="space-y-2">
				<Label for="target_type">Target Type</Label>
				<select
					id="target_type"
					name="target_type"
					class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
					value={String($levelForm.target_type ?? '')}
				>
					<option value="">Select target type</option>
					<option value="specific_user">Specific User</option>
					<option value="approval_group">Approval Group</option>
					<option value="manager">Manager</option>
					<option value="manager_chain">Manager Chain</option>
					<option value="tenant_admin">Tenant Admin</option>
				</select>
				{#if $levelErrors.target_type}
					<p class="text-sm text-destructive">{$levelErrors.target_type}</p>
				{/if}
			</div>
			<div class="space-y-2">
				<Label for="target_id">Target ID (optional, for specific_user or approval_group)</Label>
				<Input
					id="target_id"
					name="target_id"
					type="text"
					placeholder="UUID"
					value={String($levelForm.target_id ?? '')}
				/>
				{#if $levelErrors.target_id}
					<p class="text-sm text-destructive">{$levelErrors.target_id}</p>
				{/if}
			</div>
			<div class="grid gap-4 sm:grid-cols-2">
				<div class="space-y-2">
					<Label for="timeout_secs">Timeout (seconds)</Label>
					<Input
						id="timeout_secs"
						name="timeout_secs"
						type="number"
						min="60"
						placeholder="3600"
						value={String($levelForm.timeout_secs ?? '')}
					/>
					{#if $levelErrors.timeout_secs}
						<p class="text-sm text-destructive">{$levelErrors.timeout_secs}</p>
					{/if}
				</div>
				<div class="space-y-2">
					<Label for="manager_chain_depth"
						>Chain Depth (optional, for manager_chain)</Label
					>
					<Input
						id="manager_chain_depth"
						name="manager_chain_depth"
						type="number"
						min="1"
						max="10"
						value={String($levelForm.manager_chain_depth ?? '')}
					/>
					{#if $levelErrors.manager_chain_depth}
						<p class="text-sm text-destructive">{$levelErrors.manager_chain_depth}</p>
					{/if}
				</div>
			</div>
			<Button type="submit">Add Level</Button>
		</form>
	</CardContent>
</Card>

<ConfirmDialog
	bind:open={showDeleteConfirm}
	title="Delete escalation policy"
	description="Are you sure you want to delete this escalation policy?"
	confirmLabel="Delete"
	variant="destructive"
	onconfirm={() => deletePolicyFormRef?.requestSubmit()}
/>
