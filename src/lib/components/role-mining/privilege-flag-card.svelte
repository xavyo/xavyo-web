<script lang="ts">
	import type { ExcessivePrivilege } from '$lib/api/types';
	import { AlertTriangle, Users } from 'lucide-svelte';

	interface Props {
		flag: ExcessivePrivilege;
		onReview?: (id: string, action: 'accept' | 'remediate') => void;
	}

	let { flag, onReview }: Props = $props();

	const statusConfig = $derived({
		pending: { label: 'Pending', class: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' },
		accepted: { label: 'Accepted', class: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' },
		remediated: { label: 'Remediated', class: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
		reviewed: { label: 'Reviewed', class: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' }
	}[flag.status]);

	const deviationColor = $derived(
		flag.deviation_percent >= 75 ? 'bg-red-500' :
		flag.deviation_percent >= 50 ? 'bg-orange-500' :
		flag.deviation_percent >= 25 ? 'bg-yellow-500' :
		'bg-green-500'
	);

	const truncatedUserId = $derived(flag.user_id.length > 8 ? flag.user_id.slice(0, 8) + '...' : flag.user_id);
</script>

<div class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
	<div class="mb-3 flex items-start justify-between">
		<div class="flex items-center gap-2">
			<AlertTriangle class="h-4 w-4 text-yellow-500" />
			<span class="font-mono text-sm text-gray-900 dark:text-gray-100" title={flag.user_id}>{truncatedUserId}</span>
		</div>
		<span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {statusConfig.class}">
			{statusConfig.label}
		</span>
	</div>

	<div class="mb-3">
		<div class="mb-1 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
			<span>Deviation</span>
			<span class="font-mono">{flag.deviation_percent.toFixed(1)}%</span>
		</div>
		<div class="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
			<div
				class="h-full rounded-full transition-all {deviationColor}"
				style:width="{Math.min(flag.deviation_percent, 100)}%"
			></div>
		</div>
	</div>

	<div class="mb-3 space-y-1 text-xs text-gray-600 dark:text-gray-400">
		<div class="flex items-center justify-between">
			<span>Excess entitlements</span>
			<span class="font-medium text-gray-900 dark:text-gray-100">{flag.excess_entitlements.length}</span>
		</div>
		<div class="flex items-center justify-between">
			<span class="inline-flex items-center gap-1">
				<Users class="h-3 w-3" />
				Peer average
			</span>
			<span class="font-medium text-gray-900 dark:text-gray-100">{flag.peer_average.toFixed(1)}</span>
		</div>
		<div class="flex items-center justify-between">
			<span>User entitlement count</span>
			<span class="font-medium text-gray-900 dark:text-gray-100">{flag.user_count}</span>
		</div>
	</div>

	{#if flag.status === 'pending' && onReview}
		<div class="flex items-center gap-2 border-t border-gray-100 pt-3 dark:border-gray-800">
			<button
				type="button"
				onclick={() => onReview?.(flag.id, 'accept')}
				class="rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700"
			>
				Accept
			</button>
			<button
				type="button"
				onclick={() => onReview?.(flag.id, 'remediate')}
				class="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
			>
				Remediate
			</button>
		</div>
	{/if}
</div>
