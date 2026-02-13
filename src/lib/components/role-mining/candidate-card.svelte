<script lang="ts">
	import type { RoleCandidate } from '$lib/api/types';
	import { Users, Shield } from 'lucide-svelte';

	interface Props {
		candidate: RoleCandidate;
		onPromote?: (id: string) => void;
		onDismiss?: (id: string) => void;
	}

	let { candidate, onPromote, onDismiss }: Props = $props();

	const statusConfig = $derived({
		pending: { label: 'Pending', class: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
		promoted: { label: 'Promoted', class: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' },
		dismissed: { label: 'Dismissed', class: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' }
	}[candidate.promotion_status]);

	const confidenceColor = $derived(
		candidate.confidence_score >= 75 ? 'bg-green-500' :
		candidate.confidence_score >= 50 ? 'bg-yellow-500' :
		candidate.confidence_score >= 25 ? 'bg-orange-500' :
		'bg-red-500'
	);
</script>

<div class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
	<div class="mb-3 flex items-start justify-between">
		<h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100">{candidate.proposed_name}</h3>
		<span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {statusConfig.class}">
			{statusConfig.label}
		</span>
	</div>

	<div class="mb-3">
		<div class="mb-1 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
			<span>Confidence</span>
			<span class="font-mono">{candidate.confidence_score.toFixed(1)}%</span>
		</div>
		<div class="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
			<div
				class="h-full rounded-full transition-all {confidenceColor}"
				style:width="{candidate.confidence_score}%"
			></div>
		</div>
	</div>

	<div class="mb-3 flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
		<span class="inline-flex items-center gap-1">
			<Users class="h-3.5 w-3.5" />
			{candidate.member_count} members
		</span>
		<span class="inline-flex items-center gap-1">
			<Shield class="h-3.5 w-3.5" />
			{candidate.entitlement_ids.length} entitlements
		</span>
	</div>

	{#if candidate.promotion_status === 'pending' && (onPromote || onDismiss)}
		<div class="flex items-center gap-2 border-t border-gray-100 pt-3 dark:border-gray-800">
			{#if onPromote}
				<button
					type="button"
					onclick={() => onPromote?.(candidate.id)}
					class="rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700"
				>
					Promote
				</button>
			{/if}
			{#if onDismiss}
				<button
					type="button"
					onclick={() => onDismiss?.(candidate.id)}
					class="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
				>
					Dismiss
				</button>
			{/if}
		</div>
	{/if}
</div>
