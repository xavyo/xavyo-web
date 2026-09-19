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
		pending: { label: 'Pending', class: 'bg-muted text-muted-foreground ' },
		promoted: { label: 'Promoted', class: 'bg-success/15 text-success' },
		dismissed: { label: 'Dismissed', class: 'bg-destructive/15 text-destructive' }
	}[candidate.promotion_status]);

	const confidenceColor = $derived(
		candidate.confidence_score >= 75 ? 'bg-success' :
		candidate.confidence_score >= 50 ? 'bg-warning' :
		candidate.confidence_score >= 25 ? 'bg-warning' :
		'bg-destructive'
	);
</script>

<div class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 ">
	<div class="mb-3 flex items-start justify-between">
		<h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100">{candidate.proposed_name}</h3>
		<span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {statusConfig.class}">
			{statusConfig.label}
		</span>
	</div>

	<div class="mb-3">
		<div class="mb-1 flex items-center justify-between text-xs text-muted-foreground ">
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

	<div class="mb-3 flex items-center gap-4 text-xs text-muted-foreground ">
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
					class="rounded-md bg-success px-3 py-1.5 text-xs font-medium text-success-foreground hover:bg-success/90"
				>
					Promote
				</button>
			{/if}
			{#if onDismiss}
				<button
					type="button"
					onclick={() => onDismiss?.(candidate.id)}
					class="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
				>
					Dismiss
				</button>
			{/if}
		</div>
	{/if}
</div>
