<script lang="ts">
	import type { SimulatePolicyResponse, SimulateAllPoliciesResponse } from '$lib/api/types';
	import { CheckCircle2, XCircle } from 'lucide-svelte';

	interface Props {
		singleResult?: SimulatePolicyResponse | null;
		allResult?: SimulateAllPoliciesResponse | null;
	}

	let { singleResult = null, allResult = null }: Props = $props();
</script>

<div class="space-y-4" data-testid="simulation-results">
	{#if singleResult}
		<div class="rounded-lg border p-4">
			<div class="mb-3 flex items-center gap-2">
				{#if singleResult.matches}
					<CheckCircle2 class="h-5 w-5 text-green-600" />
					<span class="font-semibold text-green-700 dark:text-green-400">Match</span>
				{:else}
					<XCircle class="h-5 w-5 text-red-500" />
					<span class="font-semibold text-red-600 dark:text-red-400">No Match</span>
				{/if}
			</div>
			{#if singleResult.condition_results.length > 0}
				<table class="w-full text-sm">
					<thead>
						<tr class="border-b text-left text-muted-foreground">
							<th class="pb-2">Attribute</th>
							<th class="pb-2">Operator</th>
							<th class="pb-2">Expected</th>
							<th class="pb-2">Actual</th>
							<th class="pb-2">Result</th>
						</tr>
					</thead>
					<tbody>
						{#each singleResult.condition_results as cr}
							<tr class="border-b last:border-0">
								<td class="py-2 font-medium">{cr.attribute}</td>
								<td class="py-2">{cr.operator}</td>
								<td class="py-2">{JSON.stringify(cr.expected)}</td>
								<td class="py-2">{cr.actual !== null && cr.actual !== undefined ? JSON.stringify(cr.actual) : '—'}</td>
								<td class="py-2">
									{#if cr.matched}
										<CheckCircle2 class="h-4 w-4 text-green-600" />
									{:else}
										<XCircle class="h-4 w-4 text-red-500" />
									{/if}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			{/if}
		</div>
	{/if}

	{#if allResult}
		<div class="rounded-lg border p-4">
			<h4 class="mb-3 font-semibold">
				{allResult.matching_policies.length} Matching Polic{allResult.matching_policies.length === 1 ? 'y' : 'ies'}
			</h4>
			{#if allResult.matching_policies.length > 0}
				<ul class="space-y-2">
					{#each allResult.matching_policies as mp}
						<li class="rounded-md bg-muted p-3">
							<span class="font-medium">{mp.policy_name}</span>
							<span class="text-sm text-muted-foreground"> — {mp.entitlements.length} entitlement(s)</span>
						</li>
					{/each}
				</ul>
				<p class="mt-3 text-sm text-muted-foreground">
					Total unique entitlements: {allResult.total_entitlements.length}
				</p>
			{:else}
				<p class="text-sm text-muted-foreground">No policies matched the given attributes.</p>
			{/if}
		</div>
	{/if}
</div>
