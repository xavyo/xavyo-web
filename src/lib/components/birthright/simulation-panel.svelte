<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label';
	import { addToast } from '$lib/stores/toast.svelte';
	import type { SimulatePolicyResponse, SimulateAllPoliciesResponse } from '$lib/api/types';
	import { simulatePolicyClient, simulateAllPoliciesClient } from '$lib/api/birthright-client';
	import { FlaskConical } from 'lucide-svelte';

	interface Props {
		policyId?: string;
		mode?: 'single' | 'all';
	}

	let { policyId, mode = 'single' }: Props = $props();

	let attributesJson = $state('');
	let loading = $state(false);
	let error = $state('');
	let singleResult = $state<SimulatePolicyResponse | null>(null);
	let allResult = $state<SimulateAllPoliciesResponse | null>(null);

	async function handleSimulate() {
		error = '';
		singleResult = null;
		allResult = null;

		if (!attributesJson.trim()) {
			error = 'Please enter JSON attributes';
			return;
		}

		let parsed: Record<string, unknown>;
		try {
			parsed = JSON.parse(attributesJson) as Record<string, unknown>;
			if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
				error = 'Must be a valid JSON object';
				return;
			}
		} catch {
			error = 'Invalid JSON format';
			return;
		}

		loading = true;
		try {
			if (mode === 'single' && policyId) {
				singleResult = await simulatePolicyClient(policyId, { attributes: parsed });
			} else {
				allResult = await simulateAllPoliciesClient({ attributes: parsed });
			}
		} catch (e) {
			addToast('error', e instanceof Error ? e.message : 'Simulation failed');
		} finally {
			loading = false;
		}
	}
</script>

<div class="space-y-4">
	<div class="flex items-center gap-2">
		<FlaskConical class="h-5 w-5 text-muted-foreground" />
		<h3 class="text-sm font-medium">{mode === 'single' ? 'Simulate Policy' : 'Simulate All Policies'}</h3>
	</div>

	<div class="space-y-2">
		<Label for="sim-attributes">User Attributes (JSON)</Label>
		<textarea
			id="sim-attributes"
			class="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
			placeholder={'{\n  "department": "Engineering",\n  "location": "US"\n}'}
			bind:value={attributesJson}
		></textarea>
		{#if error}
			<p class="text-sm text-destructive">{error}</p>
		{/if}
	</div>

	<Button onclick={handleSimulate} disabled={loading}>
		{loading ? 'Simulating...' : 'Simulate'}
	</Button>

	{#if singleResult}
		<div class="rounded-md border p-4">
			<div class="mb-2 flex items-center gap-2">
				<span class="inline-flex rounded-full px-2 py-0.5 text-xs font-medium {singleResult.matches ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}">
					{singleResult.matches ? 'Match' : 'No Match'}
				</span>
			</div>
			{#if singleResult.condition_results && singleResult.condition_results.length > 0}
				<div class="space-y-2">
					<p class="text-sm font-medium">Condition Results</p>
					<ul class="space-y-1 text-sm">
						{#each singleResult.condition_results as cr}
							<li class="flex items-center gap-2">
								<span class="inline-flex h-4 w-4 items-center justify-center rounded-full text-xs {cr.matched ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}">
									{cr.matched ? '✓' : '✗'}
								</span>
								<span class="text-muted-foreground">{cr.attribute} {cr.operator} {JSON.stringify(cr.expected)}</span>
								<span class="text-xs text-muted-foreground">(actual: {cr.actual !== null ? JSON.stringify(cr.actual) : 'null'})</span>
							</li>
						{/each}
					</ul>
				</div>
			{/if}
		</div>
	{/if}

	{#if allResult}
		<div class="rounded-md border p-4">
			<p class="mb-2 text-sm font-medium">{allResult.matching_policies.length} matching polic{allResult.matching_policies.length === 1 ? 'y' : 'ies'}</p>
			{#if allResult.matching_policies.length > 0}
				<ul class="mb-3 space-y-1">
					{#each allResult.matching_policies as mp}
						<li class="text-sm">
							<span class="font-medium">{mp.policy_name}</span>
							<span class="text-muted-foreground"> — {mp.entitlements.length} entitlement(s)</span>
						</li>
					{/each}
				</ul>
				<p class="text-sm text-muted-foreground">Total unique entitlements: {allResult.total_entitlements.length}</p>
			{:else}
				<p class="text-sm text-muted-foreground">No policies match the given attributes.</p>
			{/if}
		</div>
	{/if}
</div>
