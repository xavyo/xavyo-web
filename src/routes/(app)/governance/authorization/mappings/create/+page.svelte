<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { Card, CardHeader, CardContent } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import { addToast } from '$lib/stores/toast.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const { form, errors, enhance, message } = superForm(data.form, {
		onResult({ result }) {
			if (result.type === 'redirect') {
				addToast('success', 'Mapping created successfully');
			}
		}
	});

	const entitlements = $derived(data.entitlements);
	const hasEntitlements = $derived(entitlements.length > 0);
</script>

<PageHeader
	title="Create Mapping"
	description="Map an entitlement to an action and resource type"
/>

<div class="mb-6 flex gap-4 border-b">
	<a
		href="/governance/authorization"
		class="border-b-2 border-transparent px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
		>Policies</a
	>
	<a
		href="/governance/authorization/mappings"
		class="border-b-2 border-primary px-3 py-2 text-sm font-medium text-foreground">Mappings</a
	>
	<a
		href="/governance/authorization/test"
		class="border-b-2 border-transparent px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
		>Test</a
	>
</div>

<Card class="max-w-lg">
	<CardHeader>
		<h2 class="text-xl font-semibold">Mapping details</h2>
	</CardHeader>
	<CardContent>
		{#if $message}
			<Alert variant="destructive" class="mb-4">
				<AlertDescription>{$message}</AlertDescription>
			</Alert>
		{/if}

		<form method="POST" use:enhance class="space-y-4">
			<div class="space-y-2">
				<Label for="entitlement_id">Entitlement</Label>
				{#if hasEntitlements}
					<select
						id="entitlement_id"
						name="entitlement_id"
						class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
						value={String($form.entitlement_id ?? '')}
						onchange={(e) => {
							$form.entitlement_id = e.currentTarget.value;
						}}
					>
						<option value="">Select an entitlement</option>
						{#each entitlements as ent}
							<option value={ent.id}>{ent.name} ({ent.id.slice(0, 8)}...)</option>
						{/each}
					</select>
				{:else}
					<Input
						id="entitlement_id"
						name="entitlement_id"
						type="text"
						placeholder="Entitlement UUID"
						value={String($form.entitlement_id ?? '')}
					/>
				{/if}
				{#if $errors.entitlement_id}
					<p class="text-sm text-destructive">{$errors.entitlement_id}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="resource_type">Resource Type</Label>
				<Input
					id="resource_type"
					name="resource_type"
					type="text"
					placeholder="e.g. document, project, report"
					value={String($form.resource_type ?? '')}
				/>
				{#if $errors.resource_type}
					<p class="text-sm text-destructive">{$errors.resource_type}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="action">Action</Label>
				<Input
					id="action"
					name="action"
					type="text"
					placeholder="e.g. read, write, delete, manage"
					value={String($form.action ?? '')}
				/>
				{#if $errors.action}
					<p class="text-sm text-destructive">{$errors.action}</p>
				{/if}
			</div>

			<div class="flex gap-2 pt-2">
				<Button type="submit">Create Mapping</Button>
				<a
					href="/governance/authorization/mappings"
					class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
				>
					Cancel
				</a>
			</div>
		</form>
	</CardContent>
</Card>
