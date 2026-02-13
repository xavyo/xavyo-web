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
				addToast('success', 'SoD rule created successfully');
			}
		}
	});
</script>

<PageHeader title="Create SoD Rule" description="Define a new Separation of Duties rule" />

<Card class="max-w-lg">
	<CardHeader>
		<h2 class="text-xl font-semibold">Rule details</h2>
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
					placeholder="e.g. Payment Approval Segregation"
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
					placeholder="Brief description of this SoD rule"
					value={String($form.description ?? '')}
				></textarea>
				{#if $errors.description}
					<p class="text-sm text-destructive">{$errors.description}</p>
				{/if}
			</div>

			<Separator class="my-4" />

			<!-- Entitlement Pair -->
			<h3 class="text-sm font-medium text-muted-foreground">Conflicting entitlements</h3>

			<div class="space-y-2">
				<Label for="first_entitlement_id">First entitlement ID</Label>
				<Input
					id="first_entitlement_id"
					name="first_entitlement_id"
					type="text"
					placeholder="UUID of first entitlement"
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
					placeholder="UUID of second entitlement"
					value={String($form.second_entitlement_id ?? '')}
				/>
				{#if $errors.second_entitlement_id}
					<p class="text-sm text-destructive">{$errors.second_entitlement_id}</p>
				{/if}
			</div>

			<Separator class="my-4" />

			<!-- Severity & Rationale -->
			<h3 class="text-sm font-medium text-muted-foreground">Severity & rationale</h3>

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
				<Label for="business_rationale">Business rationale (optional)</Label>
				<textarea
					id="business_rationale"
					name="business_rationale"
					class="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
					placeholder="Explain why these entitlements should not be held by the same user"
					value={String($form.business_rationale ?? '')}
				></textarea>
				{#if $errors.business_rationale}
					<p class="text-sm text-destructive">{$errors.business_rationale}</p>
				{/if}
			</div>

			<div class="flex gap-2 pt-2">
				<Button type="submit">Create rule</Button>
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
