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
				addToast('success', 'Application created successfully');
			}
		}
	});
</script>

<PageHeader title="Create application" description="Register a new application for governance" />

<Card class="max-w-lg">
	<CardHeader>
		<h2 class="text-xl font-semibold">Application details</h2>
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
					placeholder="e.g. SAP ERP, Salesforce CRM"
					value={String($form.name ?? '')}
				/>
				{#if $errors.name}
					<p class="text-sm text-destructive">{$errors.name}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="app_type">Application type</Label>
				<select
					id="app_type"
					name="app_type"
					class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
					value={String($form.app_type ?? '')}
					onchange={(e) => { $form.app_type = e.currentTarget.value as 'internal' | 'external'; }}
				>
					<option value="">Select type</option>
					<option value="internal">Internal</option>
					<option value="external">External</option>
				</select>
				{#if $errors.app_type}
					<p class="text-sm text-destructive">{$errors.app_type}</p>
				{/if}
			</div>

			<Separator class="my-4" />

			<div class="space-y-2">
				<Label for="description">Description (optional)</Label>
				<textarea
					id="description"
					name="description"
					class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
					placeholder="Brief description of this application"
					value={String($form.description ?? '')}
				></textarea>
				{#if $errors.description}
					<p class="text-sm text-destructive">{$errors.description}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="external_id">External ID (optional)</Label>
				<Input
					id="external_id"
					name="external_id"
					type="text"
					placeholder="e.g. APP-001"
					value={String($form.external_id ?? '')}
				/>
				{#if $errors.external_id}
					<p class="text-sm text-destructive">{$errors.external_id}</p>
				{/if}
			</div>

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

			<div class="flex gap-2 pt-2">
				<Button type="submit">Create application</Button>
				<a
					href="/governance/applications"
					class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
				>
					Cancel
				</a>
			</div>
		</form>
	</CardContent>
</Card>
