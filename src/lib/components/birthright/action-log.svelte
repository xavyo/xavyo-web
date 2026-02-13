<script lang="ts">
	import type { LifecycleAction } from '$lib/api/types';

	interface Props {
		actions: LifecycleAction[];
	}

	let { actions }: Props = $props();

	const actionTypeBadgeClass: Record<string, string> = {
		provision: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
		revoke: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
		schedule_revoke: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
		cancel_revoke: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
		skip: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
	};

	function formatActionType(type: string): string {
		return type.replace(/_/g, ' ');
	}

	function formatDate(dateStr: string | null): string {
		if (!dateStr) return '-';
		return new Date(dateStr).toLocaleString();
	}
</script>

<div class="space-y-2">
	<h3 class="text-sm font-medium">Action Log</h3>

	{#if actions.length === 0}
		<p class="text-sm text-muted-foreground">No actions recorded.</p>
	{:else}
		<div class="rounded-md border">
			<table class="w-full text-sm">
				<thead>
					<tr class="border-b bg-muted/50">
						<th class="px-3 py-2 text-left font-medium">Type</th>
						<th class="px-3 py-2 text-left font-medium">Entitlement</th>
						<th class="px-3 py-2 text-left font-medium">Policy</th>
						<th class="px-3 py-2 text-left font-medium">Scheduled</th>
						<th class="px-3 py-2 text-left font-medium">Executed</th>
						<th class="px-3 py-2 text-left font-medium">Error</th>
					</tr>
				</thead>
				<tbody>
					{#each actions as action}
						<tr class="border-b last:border-0">
							<td class="px-3 py-2">
								<span class="inline-flex rounded-full px-2 py-0.5 text-xs font-medium {actionTypeBadgeClass[action.action_type] ?? 'bg-gray-100 text-gray-800'}">
									{formatActionType(action.action_type)}
								</span>
							</td>
							<td class="px-3 py-2 font-mono text-xs">{action.entitlement_id.slice(0, 8)}...</td>
							<td class="px-3 py-2 font-mono text-xs">{action.policy_id ? action.policy_id.slice(0, 8) + '...' : '-'}</td>
							<td class="px-3 py-2 text-xs">{formatDate(action.scheduled_at)}</td>
							<td class="px-3 py-2 text-xs">{formatDate(action.executed_at)}</td>
							<td class="px-3 py-2">
								{#if action.error_message}
									<span class="text-xs text-destructive">{action.error_message}</span>
								{:else}
									<span class="text-xs text-muted-foreground">-</span>
								{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>
