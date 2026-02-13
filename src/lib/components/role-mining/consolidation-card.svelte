<script lang="ts">
	import type { ConsolidationSuggestion } from '$lib/api/types';
	import { GitMerge } from 'lucide-svelte';

	interface Props {
		suggestion: ConsolidationSuggestion;
		onDismiss?: (id: string) => void;
	}

	let { suggestion, onDismiss }: Props = $props();

	const statusConfig = $derived({
		pending: { label: 'Pending', class: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' },
		merged: { label: 'Merged', class: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' },
		dismissed: { label: 'Dismissed', class: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' }
	}[suggestion.status]);

	const overlapColor = $derived(
		suggestion.overlap_percent >= 75 ? 'bg-green-500' :
		suggestion.overlap_percent >= 50 ? 'bg-yellow-500' :
		suggestion.overlap_percent >= 25 ? 'bg-orange-500' :
		'bg-red-500'
	);

	function truncateId(id: string): string {
		return id.length > 8 ? id.slice(0, 8) + '...' : id;
	}
</script>

<div class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
	<div class="mb-3 flex items-start justify-between">
		<div class="flex items-center gap-2">
			<GitMerge class="h-4 w-4 text-purple-500" />
			<span class="text-sm font-medium text-gray-900 dark:text-gray-100">Role Consolidation</span>
		</div>
		<span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {statusConfig.class}">
			{statusConfig.label}
		</span>
	</div>

	<div class="mb-3 flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
		<span class="rounded bg-gray-100 px-2 py-0.5 font-mono dark:bg-gray-800" title={suggestion.role_a_id}>{truncateId(suggestion.role_a_id)}</span>
		<span class="text-gray-400 dark:text-gray-500">&harr;</span>
		<span class="rounded bg-gray-100 px-2 py-0.5 font-mono dark:bg-gray-800" title={suggestion.role_b_id}>{truncateId(suggestion.role_b_id)}</span>
	</div>

	<div class="mb-3">
		<div class="mb-1 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
			<span>Overlap</span>
			<span class="font-mono">{suggestion.overlap_percent.toFixed(1)}%</span>
		</div>
		<div class="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
			<div
				class="h-full rounded-full transition-all {overlapColor}"
				style:width="{suggestion.overlap_percent}%"
			></div>
		</div>
	</div>

	<div class="mb-3 space-y-1 text-xs text-gray-600 dark:text-gray-400">
		<div class="flex items-center justify-between">
			<span>Shared entitlements</span>
			<span class="font-medium text-gray-900 dark:text-gray-100">{suggestion.shared_entitlements.length}</span>
		</div>
		<div class="flex items-center justify-between">
			<span>Unique to A</span>
			<span class="font-medium text-gray-900 dark:text-gray-100">{suggestion.unique_to_a.length}</span>
		</div>
		<div class="flex items-center justify-between">
			<span>Unique to B</span>
			<span class="font-medium text-gray-900 dark:text-gray-100">{suggestion.unique_to_b.length}</span>
		</div>
	</div>

	{#if suggestion.status === 'pending' && onDismiss}
		<div class="flex items-center gap-2 border-t border-gray-100 pt-3 dark:border-gray-800">
			<button
				type="button"
				onclick={() => onDismiss?.(suggestion.id)}
				class="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
			>
				Dismiss
			</button>
		</div>
	{/if}
</div>
