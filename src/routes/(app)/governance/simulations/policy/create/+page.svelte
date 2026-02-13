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
				addToast('success', 'Policy simulation created successfully');
			}
		}
	});
</script>

<PageHeader title="Create Policy Simulation" description="Simulate the impact of a policy change before applying it" />

<Card class="max-w-lg">
	<CardHeader>
		<h2 class="text-xl font-semibold">Simulation details</h2>
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
					placeholder="e.g. Q1 SoD rule impact analysis"
					value={String($form.name ?? '')}
				/>
				{#if $errors.name}
					<p class="text-sm text-destructive">{$errors.name}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="simulation_type">Simulation Type</Label>
				<select
					id="simulation_type"
					name="simulation_type"
					class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
					value={String($form.simulation_type ?? '')}
				>
					<option value="">Select type</option>
					<option value="sod_rule">SoD Rule</option>
					<option value="birthright_policy">Birthright Policy</option>
				</select>
				{#if $errors.simulation_type}
					<p class="text-sm text-destructive">{$errors.simulation_type}</p>
				{/if}
			</div>

			<Separator class="my-4" />

			<h3 class="text-sm font-medium text-muted-foreground">Configuration</h3>

			<div class="space-y-2">
				<Label for="policy_id">Policy ID (optional)</Label>
				<Input
					id="policy_id"
					name="policy_id"
					type="text"
					placeholder="UUID of existing policy to simulate against"
					value={String($form.policy_id ?? '')}
				/>
				{#if $errors.policy_id}
					<p class="text-sm text-destructive">{$errors.policy_id}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="policy_config">Policy Configuration (JSON)</Label>
				<textarea
					id="policy_config"
					name="policy_config"
					class="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
					placeholder={'{\n  "rules": [],\n  "scope": "all_users"\n}'}
					value={String($form.policy_config ?? '')}
				></textarea>
				{#if $errors.policy_config}
					<p class="text-sm text-destructive">{$errors.policy_config}</p>
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
