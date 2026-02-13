<script lang="ts">
	import type { RoleMetrics } from '$lib/api/types';
	import { TrendingUp, TrendingDown, Minus, Users } from 'lucide-svelte';

	interface Props {
		metrics: RoleMetrics;
	}

	let { metrics }: Props = $props();

	const trendConfig = $derived({
		up: { label: 'Up', icon: TrendingUp, class: 'text-green-600 dark:text-green-400' },
		down: { label: 'Down', icon: TrendingDown, class: 'text-red-600 dark:text-red-400' },
		stable: { label: 'Stable', icon: Minus, class: 'text-gray-600 dark:text-gray-400' }
	}[metrics.trend_direction]);
</script>

<div class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
	<div class="mb-3 grid grid-cols-2 gap-3">
		<div>
			<div class="text-xs text-gray-500 dark:text-gray-400">Utilization Rate</div>
			<div class="text-lg font-semibold text-gray-900 dark:text-gray-100">{metrics.utilization_rate.toFixed(1)}%</div>
		</div>
		<div>
			<div class="text-xs text-gray-500 dark:text-gray-400">Coverage Rate</div>
			<div class="text-lg font-semibold text-gray-900 dark:text-gray-100">{metrics.coverage_rate.toFixed(1)}%</div>
		</div>
	</div>

	<div class="mb-3 flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
		<span class="inline-flex items-center gap-1">
			<Users class="h-3.5 w-3.5" />
			{metrics.user_count} users
		</span>
		<span class="text-xs">({metrics.active_user_count} active)</span>
	</div>

	<div class="flex items-center gap-1.5 text-xs {trendConfig.class}">
		<span>Trend: {trendConfig.label}</span>
	</div>
</div>
