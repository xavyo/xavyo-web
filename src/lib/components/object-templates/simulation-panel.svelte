<script lang="ts">
	import type { TemplateSimulationResult } from '$lib/api/types';

	interface Props {
		result?: TemplateSimulationResult | null;
		loading?: boolean;
		error?: string | null;
		onsubmit?: (sampleObject: string) => void;
	}

	let { result = null, loading = false, error = null, onsubmit }: Props = $props();

	let sampleObjectInput = $state('{\n  \n}');
	let jsonError = $state('');

	function handleSimulate() {
		jsonError = '';
		try {
			JSON.parse(sampleObjectInput);
		} catch {
			jsonError = 'Invalid JSON. Please check your input.';
			return;
		}
		onsubmit?.(sampleObjectInput);
	}
</script>

<div class="space-y-4">
	<div class="space-y-2">
		<label for="sample-object" class="text-sm font-medium text-zinc-700 dark:text-zinc-300">Sample Object (JSON)</label>
		<textarea
			id="sample-object"
			bind:value={sampleObjectInput}
			rows={6}
			class="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 font-mono text-sm text-zinc-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
			placeholder={'{"department": "", "title": "Engineer"}'}
		></textarea>
		{#if jsonError}
			<p class="text-sm text-red-600 dark:text-red-400">{jsonError}</p>
		{/if}
	</div>

	<button
		onclick={handleSimulate}
		disabled={loading}
		class="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
	>
		{loading ? 'Simulating...' : 'Run Simulation'}
	</button>

	{#if error}
		<div class="rounded-md border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
			<p class="text-sm text-red-800 dark:text-red-400">{error}</p>
		</div>
	{/if}

	{#if result}
		<div class="space-y-4">
			<!-- Affected Count -->
			<div class="rounded-md border border-zinc-200 p-4 dark:border-zinc-700">
				<h4 class="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">Affected Count</h4>
				<p class="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">{result.affected_count}</p>
			</div>

			<!-- Rules Applied -->
			{#if result.rules_applied.length > 0}
				<div class="rounded-md border border-zinc-200 p-4 dark:border-zinc-700">
					<h4 class="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">Rules Applied ({result.rules_applied.length})</h4>
					<div class="overflow-x-auto">
						<table class="w-full text-left text-sm">
							<thead class="bg-zinc-50 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
								<tr>
									<th class="px-3 py-2 font-medium">Attribute</th>
									<th class="px-3 py-2 font-medium">Rule Type</th>
									<th class="px-3 py-2 font-medium">Before</th>
									<th class="px-3 py-2 font-medium">After</th>
									<th class="px-3 py-2 font-medium">Applied</th>
									<th class="px-3 py-2 font-medium">Skip Reason</th>
								</tr>
							</thead>
							<tbody class="divide-y divide-zinc-200 dark:divide-zinc-700">
								{#each result.rules_applied as rule}
									<tr>
										<td class="px-3 py-2 font-medium">{rule.target_attribute}</td>
										<td class="px-3 py-2 text-zinc-500">{rule.rule_type}</td>
										<td class="px-3 py-2 text-red-600 dark:text-red-400">{String(rule.before_value ?? 'null')}</td>
										<td class="px-3 py-2 text-green-600 dark:text-green-400">{String(rule.after_value ?? 'null')}</td>
										<td class="px-3 py-2">
											{#if rule.applied}
												<span class="text-green-600 dark:text-green-400">Yes</span>
											{:else}
												<span class="text-zinc-400">No</span>
											{/if}
										</td>
										<td class="px-3 py-2 text-zinc-500">{rule.skip_reason ?? '-'}</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</div>
			{:else}
				<p class="text-sm text-zinc-500">No rules were applied.</p>
			{/if}

			<!-- Validation Errors -->
			{#if result.validation_errors.length > 0}
				<div class="rounded-md border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
					<h4 class="mb-2 text-sm font-medium text-red-800 dark:text-red-400">Validation Errors ({result.validation_errors.length})</h4>
					<ul class="list-inside list-disc space-y-1 text-sm text-red-700 dark:text-red-300">
						{#each result.validation_errors as ve}
							<li><strong>{ve.target_attribute}</strong>: {ve.message} <span class="text-xs opacity-70">({ve.expression})</span></li>
						{/each}
					</ul>
				</div>
			{/if}

			<!-- Computed Values -->
			{#if Object.keys(result.computed_values).length > 0}
				<div class="rounded-md border border-zinc-200 p-4 dark:border-zinc-700">
					<h4 class="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">Computed Values</h4>
					<pre class="overflow-auto rounded bg-zinc-50 p-3 text-xs dark:bg-zinc-900">{JSON.stringify(result.computed_values, null, 2)}</pre>
				</div>
			{/if}
		</div>
	{/if}
</div>
