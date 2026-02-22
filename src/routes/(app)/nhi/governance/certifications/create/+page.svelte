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
</script>

<PageHeader title="Create NHI Certification Campaign" description="Define a new certification campaign for non-human identities" />

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
			<div class="space-y-2">
				<Label for="name">Campaign name</Label>
				<Input
					id="name"
					name="name"
					type="text"
					placeholder="e.g. Q1 2026 NHI Certification"
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
					class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
					placeholder="Brief description of this certification campaign"
					value={String($form.description ?? '')}
				></textarea>
				{#if $errors.description}
					<p class="text-sm text-destructive">{$errors.description}</p>
				{/if}
			</div>

			<Separator class="my-4" />

			<h3 class="text-sm font-medium text-muted-foreground">Scope</h3>

			<div class="space-y-2">
				<Label for="scope">Scope</Label>
				<select
					id="scope"
					name="scope"
					class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
					value={String($form.scope ?? 'all')}
				>
					<option value="all">All NHI entities</option>
					<option value="by_type">By NHI type</option>
					<option value="specific">Specific entities</option>
				</select>
			</div>

			<div class="space-y-2">
				<Label for="nhi_type_filter">NHI type filter (optional)</Label>
				<select
					id="nhi_type_filter"
					name="nhi_type_filter"
					class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
					value={String($form.nhi_type_filter ?? '')}
				>
					<option value="">All types</option>
					<option value="tool">Tools</option>
					<option value="agent">Agents</option>
					<option value="service_account">Service Accounts</option>
				</select>
			</div>

			<Separator class="my-4" />

			<div class="space-y-2">
				<Label for="due_date">Due date (optional)</Label>
				<Input
					id="due_date"
					name="due_date"
					type="date"
					value={String($form.due_date ?? '')}
				/>
			</div>

			<div class="flex gap-2 pt-2">
				<Button type="submit">Create campaign</Button>
				<a
					href="/nhi/governance"
					class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
				>
					Cancel
				</a>
			</div>
		</form>
	</CardContent>
</Card>
