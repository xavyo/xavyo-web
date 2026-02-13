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
				addToast('success', 'Comparison created successfully');
			}
		}
	});

	let comparisonType = $derived(String($form.comparison_type ?? ''));
	let simulationAType = $derived(String($form.simulation_a_type ?? ''));
	let simulationBType = $derived(String($form.simulation_b_type ?? ''));

	let simulationsForA = $derived(
		simulationAType === 'policy'
			? data.policySimulations
			: simulationAType === 'batch'
				? data.batchSimulations
				: []
	);

	let simulationsForB = $derived(
		simulationBType === 'policy'
			? data.policySimulations
			: simulationBType === 'batch'
				? data.batchSimulations
				: []
	);

	function getSimLabel(sim: { id: string; name: string; simulation_type?: string; batch_type?: string }): string {
		const typeLabel = sim.simulation_type ?? sim.batch_type ?? '';
		return `${sim.name} (${typeLabel.replace(/_/g, ' ')})`;
	}
</script>

<PageHeader title="Create Comparison" description="Compare two simulations or a simulation against the current state" />

<Card class="max-w-lg">
	<CardHeader>
		<h2 class="text-xl font-semibold">Comparison details</h2>
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
					placeholder="e.g. Q1 policy comparison"
					value={String($form.name ?? '')}
				/>
				{#if $errors.name}
					<p class="text-sm text-destructive">{$errors.name}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="comparison_type">Comparison Type</Label>
				<select
					id="comparison_type"
					name="comparison_type"
					class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
					value={String($form.comparison_type ?? '')}
					onchange={(e) => { $form.comparison_type = e.currentTarget.value as typeof $form.comparison_type; }}
				>
					<option value="">Select type</option>
					<option value="simulation_vs_simulation">Simulation vs Simulation</option>
					<option value="simulation_vs_current">Simulation vs Current</option>
				</select>
				{#if $errors.comparison_type}
					<p class="text-sm text-destructive">{$errors.comparison_type}</p>
				{/if}
			</div>

			<Separator class="my-4" />

			<h3 class="text-sm font-medium text-muted-foreground">Simulation A</h3>

			<div class="space-y-2">
				<Label for="simulation_a_type">Simulation A Type</Label>
				<select
					id="simulation_a_type"
					name="simulation_a_type"
					class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
					value={String($form.simulation_a_type ?? '')}
					onchange={(e) => { $form.simulation_a_type = e.currentTarget.value as typeof $form.simulation_a_type; }}
				>
					<option value="">Select type</option>
					<option value="policy">Policy</option>
					<option value="batch">Batch</option>
				</select>
				{#if $errors.simulation_a_type}
					<p class="text-sm text-destructive">{$errors.simulation_a_type}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="simulation_a_id">Simulation A</Label>
				<select
					id="simulation_a_id"
					name="simulation_a_id"
					class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
					value={String($form.simulation_a_id ?? '')}
					onchange={(e) => { $form.simulation_a_id = e.currentTarget.value; }}
				>
					<option value="">Select simulation</option>
					{#each simulationsForA as sim}
						<option value={sim.id}>{getSimLabel(sim)}</option>
					{/each}
				</select>
				{#if $errors.simulation_a_id}
					<p class="text-sm text-destructive">{$errors.simulation_a_id}</p>
				{/if}
			</div>

			{#if comparisonType === 'simulation_vs_simulation'}
				<Separator class="my-4" />

				<h3 class="text-sm font-medium text-muted-foreground">Simulation B</h3>

				<div class="space-y-2">
					<Label for="simulation_b_type">Simulation B Type</Label>
					<select
						id="simulation_b_type"
						name="simulation_b_type"
						class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
						value={String($form.simulation_b_type ?? '')}
						onchange={(e) => { $form.simulation_b_type = e.currentTarget.value as typeof $form.simulation_b_type; }}
					>
						<option value="">Select type</option>
						<option value="policy">Policy</option>
						<option value="batch">Batch</option>
					</select>
					{#if $errors.simulation_b_type}
						<p class="text-sm text-destructive">{$errors.simulation_b_type}</p>
					{/if}
				</div>

				<div class="space-y-2">
					<Label for="simulation_b_id">Simulation B</Label>
					<select
						id="simulation_b_id"
						name="simulation_b_id"
						class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
						value={String($form.simulation_b_id ?? '')}
						onchange={(e) => { $form.simulation_b_id = e.currentTarget.value; }}
					>
						<option value="">Select simulation</option>
						{#each simulationsForB as sim}
							<option value={sim.id}>{getSimLabel(sim)}</option>
						{/each}
					</select>
					{#if $errors.simulation_b_id}
						<p class="text-sm text-destructive">{$errors.simulation_b_id}</p>
					{/if}
				</div>
			{/if}

			<div class="flex gap-2 pt-2">
				<Button type="submit">Create comparison</Button>
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
