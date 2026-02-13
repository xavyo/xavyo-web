<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { createMiningJobSchema } from '$lib/schemas/role-mining';
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
		validators: zodClient(createMiningJobSchema),
		onResult({ result }) {
			if (result.type === 'redirect') {
				addToast('success', 'Mining job created successfully');
			}
		}
	});
</script>

<PageHeader title="Create Mining Job" description="Configure and create a new role mining job" />

<Card class="max-w-lg">
	<CardHeader>
		<h2 class="text-xl font-semibold">Job configuration</h2>
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
				<Label for="name">Job name</Label>
				<Input
					id="name"
					name="name"
					type="text"
					placeholder="e.g. Q1 2026 Role Discovery"
					bind:value={$form.name}
				/>
				{#if $errors.name}
					<p class="text-sm text-destructive">{$errors.name}</p>
				{/if}
			</div>

			<Separator class="my-4" />

			<!-- Mining Parameters -->
			<h3 class="text-sm font-medium text-muted-foreground">Mining parameters</h3>

			<div class="grid grid-cols-2 gap-4">
				<div class="space-y-2">
					<Label for="min_users">Minimum users</Label>
					<Input
						id="min_users"
						name="min_users"
						type="number"
						min="1"
						max="100"
						bind:value={$form.min_users}
					/>
					<p class="text-xs text-muted-foreground">Min users sharing a pattern (1-100)</p>
					{#if $errors.min_users}
						<p class="text-sm text-destructive">{$errors.min_users}</p>
					{/if}
				</div>

				<div class="space-y-2">
					<Label for="min_entitlements">Minimum entitlements</Label>
					<Input
						id="min_entitlements"
						name="min_entitlements"
						type="number"
						min="1"
						max="50"
						bind:value={$form.min_entitlements}
					/>
					<p class="text-xs text-muted-foreground">Min entitlements in a pattern (1-50)</p>
					{#if $errors.min_entitlements}
						<p class="text-sm text-destructive">{$errors.min_entitlements}</p>
					{/if}
				</div>
			</div>

			<div class="space-y-2">
				<Label for="confidence_threshold">Confidence threshold</Label>
				<Input
					id="confidence_threshold"
					name="confidence_threshold"
					type="number"
					min="0"
					max="1"
					step="0.1"
					bind:value={$form.confidence_threshold}
				/>
				<p class="text-xs text-muted-foreground">Minimum confidence score for role candidates (0.0-1.0)</p>
				{#if $errors.confidence_threshold}
					<p class="text-sm text-destructive">{$errors.confidence_threshold}</p>
				{/if}
			</div>

			<Separator class="my-4" />

			<!-- Analysis Options -->
			<h3 class="text-sm font-medium text-muted-foreground">Analysis options</h3>

			<div class="space-y-3">
				<label class="flex items-center gap-3">
					<input
						type="checkbox"
						name="include_excessive_privilege"
						class="h-4 w-4 rounded border-input text-primary focus:ring-primary"
						bind:checked={$form.include_excessive_privilege}
					/>
					<div>
						<span class="text-sm font-medium">Include excessive privilege analysis</span>
						<p class="text-xs text-muted-foreground">Detect users with more access than their peers</p>
					</div>
				</label>

				<label class="flex items-center gap-3">
					<input
						type="checkbox"
						name="include_consolidation"
						class="h-4 w-4 rounded border-input text-primary focus:ring-primary"
						bind:checked={$form.include_consolidation}
					/>
					<div>
						<span class="text-sm font-medium">Include consolidation analysis</span>
						<p class="text-xs text-muted-foreground">Suggest merging overlapping roles</p>
					</div>
				</label>
			</div>

			<Separator class="my-4" />

			<!-- Advanced Thresholds -->
			<h3 class="text-sm font-medium text-muted-foreground">Advanced thresholds</h3>

			<div class="grid grid-cols-2 gap-4">
				<div class="space-y-2">
					<Label for="consolidation_threshold">Consolidation threshold (%)</Label>
					<Input
						id="consolidation_threshold"
						name="consolidation_threshold"
						type="number"
						min="0"
						max="100"
						bind:value={$form.consolidation_threshold}
					/>
					<p class="text-xs text-muted-foreground">Overlap % to suggest consolidation</p>
					{#if $errors.consolidation_threshold}
						<p class="text-sm text-destructive">{$errors.consolidation_threshold}</p>
					{/if}
				</div>

				<div class="space-y-2">
					<Label for="deviation_threshold">Deviation threshold (%)</Label>
					<Input
						id="deviation_threshold"
						name="deviation_threshold"
						type="number"
						min="0"
						max="100"
						bind:value={$form.deviation_threshold}
					/>
					<p class="text-xs text-muted-foreground">Deviation % to flag excessive privileges</p>
					{#if $errors.deviation_threshold}
						<p class="text-sm text-destructive">{$errors.deviation_threshold}</p>
					{/if}
				</div>
			</div>

			<div class="space-y-2">
				<Label for="peer_group_attribute">Peer group attribute (optional)</Label>
				<Input
					id="peer_group_attribute"
					name="peer_group_attribute"
					type="text"
					placeholder="e.g. department, job_title"
					bind:value={$form.peer_group_attribute}
				/>
				<p class="text-xs text-muted-foreground">User attribute for peer group comparison</p>
				{#if $errors.peer_group_attribute}
					<p class="text-sm text-destructive">{$errors.peer_group_attribute}</p>
				{/if}
			</div>

			<div class="flex gap-2 pt-2">
				<Button type="submit">Create job</Button>
				<a
					href="/governance/role-mining"
					class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
				>
					Cancel
				</a>
			</div>
		</form>
	</CardContent>
</Card>
