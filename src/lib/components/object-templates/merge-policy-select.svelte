<script lang="ts">
	import type { TemplateMergePolicy } from '$lib/api/types';

	interface Props {
		policies: TemplateMergePolicy[];
		onAdd?: (body: { attribute: string; strategy: string; null_handling: string }) => void;
		onDelete?: (policyId: string) => void;
	}

	let { policies, onAdd, onDelete }: Props = $props();

	let showForm = $state(false);
	let newAttribute = $state('');
	let newStrategy = $state('source_precedence');
	let newNullHandling = $state('merge');

	const strategyLabels: Record<string, string> = {
		source_precedence: 'Source Precedence',
		timestamp_wins: 'Timestamp Wins',
		concatenate_unique: 'Concatenate Unique',
		first_wins: 'First Wins',
		manual_only: 'Manual Only'
	};

	const strategyColors: Record<string, string> = {
		source_precedence: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
		timestamp_wins: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
		concatenate_unique: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400',
		first_wins: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
		manual_only: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
	};

	function handleAdd() {
		if (!newAttribute.trim()) return;
		onAdd?.({
			attribute: newAttribute.trim(),
			strategy: newStrategy,
			null_handling: newNullHandling
		});
		newAttribute = '';
		newStrategy = 'source_precedence';
		newNullHandling = 'merge';
		showForm = false;
	}
</script>

<div class="space-y-4">
	<div class="flex items-center justify-between">
		<h3 class="text-sm font-medium text-zinc-700 dark:text-zinc-300">Merge Policies</h3>
		<button
			onclick={() => showForm = !showForm}
			class="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
		>
			{showForm ? 'Cancel' : 'Add Policy'}
		</button>
	</div>

	{#if showForm}
		<div class="space-y-3 rounded-md border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900">
			<div class="grid gap-3 md:grid-cols-3">
				<div>
					<label for="mp-attribute" class="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Attribute</label>
					<input
						id="mp-attribute"
						type="text"
						bind:value={newAttribute}
						placeholder="e.g., department"
						class="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
					/>
				</div>
				<div>
					<label for="mp-strategy" class="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Strategy</label>
					<select
						id="mp-strategy"
						bind:value={newStrategy}
						class="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
					>
						<option value="source_precedence">Source Precedence</option>
						<option value="timestamp_wins">Timestamp Wins</option>
						<option value="concatenate_unique">Concatenate Unique</option>
						<option value="first_wins">First Wins</option>
						<option value="manual_only">Manual Only</option>
					</select>
				</div>
				<div>
					<label for="mp-null-handling" class="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Null Handling</label>
					<select
						id="mp-null-handling"
						bind:value={newNullHandling}
						class="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
					>
						<option value="merge">Merge</option>
						<option value="preserve_empty">Preserve Empty</option>
					</select>
				</div>
			</div>
			<button
				onclick={handleAdd}
				class="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
			>
				Add Policy
			</button>
		</div>
	{/if}

	{#if policies.length === 0}
		<p class="py-4 text-sm text-zinc-500 dark:text-zinc-400">No merge policies defined.</p>
	{:else}
		<div class="space-y-2">
			{#each policies as policy}
				<div class="flex items-center justify-between rounded-md border border-zinc-200 p-3 dark:border-zinc-700">
					<div class="flex items-center gap-3">
						<span class="font-medium text-sm text-zinc-900 dark:text-zinc-100">{policy.attribute}</span>
						<span class="text-zinc-400">&rarr;</span>
						<span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {strategyColors[policy.strategy] ?? 'bg-zinc-100 text-zinc-600'}">
							{strategyLabels[policy.strategy] ?? policy.strategy}
						</span>
						<span class="text-xs text-zinc-500 dark:text-zinc-400">({policy.null_handling})</span>
					</div>
					{#if onDelete}
						<button
							onclick={() => onDelete(policy.id)}
							class="text-sm text-red-600 hover:underline dark:text-red-400"
						>
							Delete
						</button>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>
