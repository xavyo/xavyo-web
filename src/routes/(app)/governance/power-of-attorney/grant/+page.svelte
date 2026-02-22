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
				addToast('success', 'Power of Attorney granted successfully');
			}
		}
	});

	// Filter out current user from grantee options
	const granteeOptions = $derived(
		data.users.filter((u) => u.id !== data.currentUserId)
	);
</script>

<PageHeader title="Grant Power of Attorney" description="Delegate your identity to another user" />

<Card class="max-w-lg">
	<CardHeader>
		<h2 class="text-xl font-semibold">Grant details</h2>
	</CardHeader>
	<CardContent>
		{#if $message}
			<Alert variant="destructive" class="mb-4">
				<AlertDescription>{$message}</AlertDescription>
			</Alert>
		{/if}

		<form method="POST" use:enhance class="space-y-4">
			<!-- Grantee -->
			<div class="space-y-2">
				<Label for="attorney_id">Grantee</Label>
				{#if granteeOptions.length > 0}
					<select
						id="attorney_id"
						name="attorney_id"
						class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
						value={String($form.attorney_id ?? '')}
					>
						<option value="">Select user</option>
						{#each granteeOptions as user}
							<option value={user.id}>{user.name} ({user.email})</option>
						{/each}
					</select>
				{:else}
					<Input
						id="attorney_id"
						name="attorney_id"
						type="text"
						placeholder="Enter user UUID"
						value={String($form.attorney_id ?? '')}
					/>
				{/if}
				{#if $errors.attorney_id}
					<p class="text-sm text-destructive">{$errors.attorney_id}</p>
				{/if}
			</div>

			<Separator class="my-4" />

			<!-- Scope -->
			<h3 class="text-sm font-medium text-muted-foreground">Scope (leave blank for full access)</h3>

			<div class="space-y-2">
				<Label for="scope_application_ids">Application IDs (comma-separated)</Label>
				<Input
					id="scope_application_ids"
					name="scope_application_ids"
					type="text"
					placeholder="e.g. app-id-1, app-id-2"
					value={String($form.scope_application_ids ?? '')}
				/>
			</div>

			<div class="space-y-2">
				<Label for="scope_workflow_types">Workflow types (comma-separated)</Label>
				<Input
					id="scope_workflow_types"
					name="scope_workflow_types"
					type="text"
					placeholder="e.g. approval, certification"
					value={String($form.scope_workflow_types ?? '')}
				/>
			</div>

			<Separator class="my-4" />

			<!-- Duration -->
			<h3 class="text-sm font-medium text-muted-foreground">Duration (max 90 days)</h3>

			<div class="grid grid-cols-2 gap-4">
				<div class="space-y-2">
					<Label for="starts_at">Start date</Label>
					<Input
						id="starts_at"
						name="starts_at"
						type="date"
						value={String($form.starts_at ?? '')}
					/>
					{#if $errors.starts_at}
						<p class="text-sm text-destructive">{$errors.starts_at}</p>
					{/if}
				</div>
				<div class="space-y-2">
					<Label for="ends_at">End date</Label>
					<Input
						id="ends_at"
						name="ends_at"
						type="date"
						value={String($form.ends_at ?? '')}
					/>
					{#if $errors.ends_at}
						<p class="text-sm text-destructive">{$errors.ends_at}</p>
					{/if}
				</div>
			</div>

			<Separator class="my-4" />

			<!-- Reason -->
			<div class="space-y-2">
				<Label for="reason">Reason</Label>
				<textarea
					id="reason"
					name="reason"
					class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
					placeholder="Why are you granting this Power of Attorney?"
					value={String($form.reason ?? '')}
				></textarea>
				{#if $errors.reason}
					<p class="text-sm text-destructive">{$errors.reason}</p>
				{/if}
			</div>

			<div class="flex justify-end gap-2 pt-2">
				<a
					href="/governance/power-of-attorney"
					class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
				>
					Cancel
				</a>
				<Button type="submit">Grant PoA</Button>
			</div>
		</form>
	</CardContent>
</Card>
