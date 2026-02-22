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

	// svelte-ignore state_referenced_locally
	const { form, errors, enhance, message } = superForm(data.form, {
		onResult({ result }) {
			if (result.type === 'redirect') {
				addToast('success', 'Certification campaign created successfully');
			}
		}
	});

	const scopeType = $derived(String($form.scope_type ?? ''));
</script>

<PageHeader
	title="Create Certification Campaign"
	description="Define a new certification campaign for access review"
/>

<Card class="max-w-lg">
	<CardHeader>
		<h2 class="text-xl font-semibold">Campaign details</h2>
	</CardHeader>
	<CardContent>
		{#if $message}
			<Alert variant="destructive" class="mb-4">
				<AlertDescription>{$message}</AlertDescription>
			</Alert>
		{/if}

		<form method="POST" use:enhance class="space-y-4">
			<!-- Basic Info -->
			<h3 class="text-sm font-medium text-muted-foreground">Basic info</h3>

			<div class="space-y-2">
				<Label for="name">Name</Label>
				<Input
					id="name"
					name="name"
					type="text"
					placeholder="e.g. Q1 2026 Access Review"
					value={String($form.name ?? '')}
				/>
				{#if $errors.name}
					<p class="text-sm text-destructive">{$errors.name}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="description">Description (optional)</Label>
				<textarea
					id="description"
					name="description"
					class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
					placeholder="Brief description of this campaign"
					value={String($form.description ?? '')}
				></textarea>
				{#if $errors.description}
					<p class="text-sm text-destructive">{$errors.description}</p>
				{/if}
			</div>

			<Separator class="my-4" />

			<!-- Scope -->
			<h3 class="text-sm font-medium text-muted-foreground">Scope</h3>

			<div class="space-y-2">
				<Label for="scope_type">Scope type</Label>
				<select
					id="scope_type"
					name="scope_type"
					class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
					value={String($form.scope_type ?? '')}
				>
					<option value="">Select scope type</option>
					<option value="all_users">All Users</option>
					<option value="department">Department</option>
					<option value="application">Application</option>
					<option value="entitlement">Entitlement</option>
				</select>
				{#if $errors.scope_type}
					<p class="text-sm text-destructive">{$errors.scope_type}</p>
				{/if}
			</div>

			{#if scopeType === 'department'}
				<div class="space-y-2">
					<Label for="scope_config_department">Department</Label>
					<Input
						id="scope_config_department"
						name="scope_config_department"
						type="text"
						placeholder="e.g. Engineering"
						value={String($form.scope_config_department ?? '')}
					/>
					{#if $errors.scope_config_department}
						<p class="text-sm text-destructive">{$errors.scope_config_department}</p>
					{/if}
				</div>
			{/if}

			{#if scopeType === 'application'}
				<div class="space-y-2">
					<Label for="scope_config_application_id">Application ID</Label>
					<Input
						id="scope_config_application_id"
						name="scope_config_application_id"
						type="text"
						placeholder="UUID of the application"
						value={String($form.scope_config_application_id ?? '')}
					/>
					{#if $errors.scope_config_application_id}
						<p class="text-sm text-destructive">{$errors.scope_config_application_id}</p>
					{/if}
				</div>
			{/if}

			{#if scopeType === 'entitlement'}
				<div class="space-y-2">
					<Label for="scope_config_entitlement_id">Entitlement ID</Label>
					<Input
						id="scope_config_entitlement_id"
						name="scope_config_entitlement_id"
						type="text"
						placeholder="UUID of the entitlement"
						value={String($form.scope_config_entitlement_id ?? '')}
					/>
					{#if $errors.scope_config_entitlement_id}
						<p class="text-sm text-destructive">{$errors.scope_config_entitlement_id}</p>
					{/if}
				</div>
			{/if}

			<Separator class="my-4" />

			<!-- Reviewer -->
			<h3 class="text-sm font-medium text-muted-foreground">Reviewer</h3>

			<div class="space-y-2">
				<Label for="reviewer_type">Reviewer type</Label>
				<select
					id="reviewer_type"
					name="reviewer_type"
					class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
					value={String($form.reviewer_type ?? '')}
				>
					<option value="">Select reviewer type</option>
					<option value="user_manager">User Manager</option>
					<option value="application_owner">Application Owner</option>
					<option value="entitlement_owner">Entitlement Owner</option>
					<option value="specific_users">Specific Users</option>
				</select>
				{#if $errors.reviewer_type}
					<p class="text-sm text-destructive">{$errors.reviewer_type}</p>
				{/if}
			</div>

			<Separator class="my-4" />

			<!-- Deadline -->
			<h3 class="text-sm font-medium text-muted-foreground">Schedule</h3>

			<div class="space-y-2">
				<Label for="deadline">Deadline</Label>
				<Input
					id="deadline"
					name="deadline"
					type="date"
					value={String($form.deadline ?? '')}
				/>
				{#if $errors.deadline}
					<p class="text-sm text-destructive">{$errors.deadline}</p>
				{/if}
			</div>

			<div class="flex gap-2 pt-2">
				<Button type="submit">Create campaign</Button>
				<a
					href="/governance"
					class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
				>
					Cancel
				</a>
			</div>
		</form>
	</CardContent>
</Card>
