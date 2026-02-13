<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { Card, CardHeader, CardContent } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import { Separator } from '$lib/components/ui/separator';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import { addToast } from '$lib/stores/toast.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const { form, errors, enhance, message } = superForm(data.form, {
		onResult({ result }) {
			if (result.type === 'redirect') {
				addToast('success', 'Batch simulation created successfully');
			}
		}
	});

	let isRoleOperation = $derived(
		$form.batch_type === 'role_add' || $form.batch_type === 'role_remove'
	);
	let isEntitlementOperation = $derived(
		$form.batch_type === 'entitlement_add' || $form.batch_type === 'entitlement_remove'
	);
</script>

<PageHeader
	title="Create Batch Simulation"
	description="Simulate a bulk role or entitlement change across multiple users"
/>

<Card class="max-w-lg">
	<CardHeader>
		<h2 class="text-xl font-semibold">Batch simulation details</h2>
	</CardHeader>
	<CardContent>
		{#if $message}
			<Alert variant="destructive" class="mb-4">
				<AlertDescription>{$message}</AlertDescription>
			</Alert>
		{/if}

		<form method="POST" use:enhance class="space-y-4">
			<div class="space-y-2">
				<Label for="name">Name</Label>
				<Input
					id="name"
					name="name"
					type="text"
					placeholder="e.g. Q1 contractor role cleanup"
					value={String($form.name ?? '')}
				/>
				{#if $errors.name}
					<p class="text-sm text-destructive">{$errors.name}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="batch_type">Batch Type</Label>
				<select
					id="batch_type"
					name="batch_type"
					class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
					value={String($form.batch_type ?? '')}
					onchange={(e) => { $form.batch_type = e.currentTarget.value; }}
				>
					<option value="">Select type</option>
					<option value="role_add">Role Add</option>
					<option value="role_remove">Role Remove</option>
					<option value="entitlement_add">Entitlement Add</option>
					<option value="entitlement_remove">Entitlement Remove</option>
				</select>
				{#if $errors.batch_type}
					<p class="text-sm text-destructive">{$errors.batch_type}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="selection_mode">Selection Mode</Label>
				<select
					id="selection_mode"
					name="selection_mode"
					class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
					value={String($form.selection_mode ?? '')}
					onchange={(e) => { $form.selection_mode = e.currentTarget.value; }}
				>
					<option value="">Select mode</option>
					<option value="user_list">User List</option>
					<option value="filter">Filter</option>
				</select>
				{#if $errors.selection_mode}
					<p class="text-sm text-destructive">{$errors.selection_mode}</p>
				{/if}
			</div>

			<Separator class="my-4" />

			{#if $form.selection_mode === 'user_list'}
				<h3 class="text-sm font-medium text-muted-foreground">User Selection</h3>
				<div class="space-y-2">
					<Label for="user_ids">User IDs (comma-separated UUIDs)</Label>
					<textarea
						id="user_ids"
						name="user_ids"
						class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
						placeholder="uuid-1, uuid-2, uuid-3"
						value={String($form.user_ids ?? '')}
					></textarea>
					{#if $errors.user_ids}
						<p class="text-sm text-destructive">{$errors.user_ids}</p>
					{/if}
				</div>
			{:else if $form.selection_mode === 'filter'}
				<h3 class="text-sm font-medium text-muted-foreground">Filter Criteria</h3>
				<div class="space-y-2">
					<Label for="filter_department">Department</Label>
					<Input
						id="filter_department"
						name="filter_department"
						type="text"
						placeholder="e.g. Engineering"
						value={String($form.filter_department ?? '')}
					/>
				</div>
				<div class="space-y-2">
					<Label for="filter_status">Status</Label>
					<Input
						id="filter_status"
						name="filter_status"
						type="text"
						placeholder="e.g. active"
						value={String($form.filter_status ?? '')}
					/>
				</div>
				<div class="space-y-2">
					<Label for="filter_role_ids">Role IDs (comma-separated UUIDs)</Label>
					<Input
						id="filter_role_ids"
						name="filter_role_ids"
						type="text"
						placeholder="uuid-1, uuid-2"
						value={String($form.filter_role_ids ?? '')}
					/>
				</div>
				<div class="space-y-2">
					<Label for="filter_entitlement_ids">Entitlement IDs (comma-separated UUIDs)</Label>
					<Input
						id="filter_entitlement_ids"
						name="filter_entitlement_ids"
						type="text"
						placeholder="uuid-1, uuid-2"
						value={String($form.filter_entitlement_ids ?? '')}
					/>
				</div>
				<div class="space-y-2">
					<Label for="filter_title">Title</Label>
					<Input
						id="filter_title"
						name="filter_title"
						type="text"
						placeholder="e.g. Senior Engineer"
						value={String($form.filter_title ?? '')}
					/>
				</div>
				<div class="space-y-2">
					<Label for="filter_metadata">Metadata (JSON)</Label>
					<textarea
						id="filter_metadata"
						name="filter_metadata"
						class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
						placeholder={'{\n  "location": "US"\n}'}
						value={String($form.filter_metadata ?? '')}
					></textarea>
					{#if $errors.filter_metadata}
						<p class="text-sm text-destructive">{$errors.filter_metadata}</p>
					{/if}
				</div>
			{/if}

			<Separator class="my-4" />

			<h3 class="text-sm font-medium text-muted-foreground">Change Specification</h3>

			{#if isRoleOperation}
				<div class="space-y-2">
					<Label for="change_role_id">Role ID</Label>
					<Input
						id="change_role_id"
						name="change_role_id"
						type="text"
						placeholder="UUID of role to add/remove"
						value={String($form.change_role_id ?? '')}
					/>
					{#if $errors.change_role_id}
						<p class="text-sm text-destructive">{$errors.change_role_id}</p>
					{/if}
				</div>
			{/if}

			{#if isEntitlementOperation}
				<div class="space-y-2">
					<Label for="change_entitlement_id">Entitlement ID</Label>
					<Input
						id="change_entitlement_id"
						name="change_entitlement_id"
						type="text"
						placeholder="UUID of entitlement to add/remove"
						value={String($form.change_entitlement_id ?? '')}
					/>
					{#if $errors.change_entitlement_id}
						<p class="text-sm text-destructive">{$errors.change_entitlement_id}</p>
					{/if}
				</div>
			{/if}

			<div class="space-y-2">
				<Label for="change_justification">Justification</Label>
				<textarea
					id="change_justification"
					name="change_justification"
					class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
					placeholder="Reason for this batch change..."
					value={String($form.change_justification ?? '')}
				></textarea>
				{#if $errors.change_justification}
					<p class="text-sm text-destructive">{$errors.change_justification}</p>
				{/if}
			</div>

			<div class="flex gap-2 pt-2">
				<Button type="submit">Create simulation</Button>
				<a
					href="/governance/simulations"
					class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
				>
					Cancel
				</a>
			</div>
		</form>
	</CardContent>
</Card>
