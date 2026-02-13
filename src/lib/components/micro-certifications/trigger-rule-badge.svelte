<script lang="ts">
	import type { TriggerType, ScopeType } from '$lib/api/types';

	interface Props {
		type: 'trigger' | 'scope';
		value: TriggerType | ScopeType;
	}

	let { type, value }: Props = $props();

	const triggerColorMap: Record<string, string> = {
		high_risk_assignment: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
		sod_violation: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
		manager_change: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
		periodic_recert: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
		manual: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
	};

	const scopeColorMap: Record<string, string> = {
		tenant: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
		application: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400',
		entitlement: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
	};

	const labelMap: Record<string, string> = {
		high_risk_assignment: 'High Risk',
		sod_violation: 'SoD Violation',
		manager_change: 'Manager Change',
		periodic_recert: 'Periodic',
		manual: 'Manual',
		tenant: 'Tenant',
		application: 'Application',
		entitlement: 'Entitlement'
	};

	const colorMap = $derived(type === 'trigger' ? triggerColorMap : scopeColorMap);
	const badgeColor = $derived(colorMap[value] ?? 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400');
</script>

<span class="inline-flex items-center rounded-full text-xs px-2 py-0.5 font-medium {badgeColor}" data-testid="trigger-rule-badge">
	{labelMap[value] ?? value}
</span>
