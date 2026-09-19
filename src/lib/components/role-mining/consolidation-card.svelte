<script lang="ts">
	import type { ConsolidationSuggestion } from '$lib/api/types';
	import { GitMerge } from 'lucide-svelte';

	interface Props {
		suggestion: ConsolidationSuggestion;
		onDismiss?: (id: string) => void;
	}

	let { suggestion, onDismiss }: Props = $props();

	const statusConfig = $derived({
		pending: { label: 'Pending', class: 'bg-warning/15 text-warning' },
		merged: { label: 'Merged', class: 'bg-success/15 text-success' },
		dismissed: { label: 'Dismissed', class: 'bg-destructive/15 text-destructive' }
	}[suggestion.status]);

	const overlapColor = $derived(
		suggestion.overlap_percent >= 75 ? 'bg-success' :
		suggestion.overlap_percent >= 50 ? 'bg-warning' :
		suggestion.overlap_percent >= 25 ? 'bg-warning' :
		'bg-destructive'
	);

	function truncateId(id: string): string {
		return id.length > 8 ? id.slice(0, 8) + '...' : id;
	}
</script>

<div class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 ">
	<div class="mb-3 flex items-start justify-between">
		<div class="flex items-center gap-2">
			<GitMerge class="h-4 w-4 text-primary" />
			<span class="text-sm font-medium text-gray-900 dark:text-gray-100">Role Consolidation</span>
		</div>
		<span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {statusConfig.class}">
			{statusConfig.label}
		</span>
	</div>

	<div class="mb-3 flex items-center gap-2 text-xs text-muted-foreground ">
		<span class="rounded bg-gray-100 px-2 py-0.5 font-mono dark:bg-gray-800" title={suggestion.role_a_id}>{truncateId(suggestion.role_a_id)}</span>
		<span class="text-gray-400 ">&harr;</span>
		<span class="rounded bg-gray-100 px-2 py-0.5 font-mono dark:bg-gray-800" title={suggestion.role_b_id}>{truncateId(suggestion.role_b_id)}</span>
	</div>

	<div class="mb-3">
		<div class="mb-1 flex items-center justify-between text-xs text-muted-foreground ">
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

	<div class="mb-3 space-y-1 text-xs text-muted-foreground ">
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
				class="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
			>
				Dismiss
			</button>
		</div>
	{/if}
</div>
