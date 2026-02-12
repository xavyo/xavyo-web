<script lang="ts">
	import type { OrphanDetectionListResponse } from '$lib/api/types';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import { formatNhiDate } from './nhi-utils';

	interface Props {
		detections: OrphanDetectionListResponse;
	}

	let { detections }: Props = $props();

	function statusClass(status: string): string {
		switch (status) {
			case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
			case 'under_review': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
			case 'remediated': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
			case 'dismissed': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
			default: return 'bg-gray-100 text-gray-800';
		}
	}

	function reasonLabel(reason: string): string {
		switch (reason) {
			case 'no_manager': return 'No Manager';
			case 'disabled_manager': return 'Disabled Manager';
			case 'no_department': return 'No Department';
			case 'inactive': return 'Inactive';
			default: return reason.replace(/_/g, ' ');
		}
	}
</script>

<div class="space-y-4">
	<p class="text-sm text-muted-foreground">{detections.total} orphan detections found</p>

	{#if detections.items.length === 0}
		<p class="py-8 text-center text-sm text-muted-foreground">No orphan detections found.</p>
	{:else}
		<div class="overflow-x-auto">
			<table class="w-full text-sm">
				<thead>
					<tr class="border-b border-border text-left">
						<th class="px-3 py-2 font-medium text-muted-foreground">User ID</th>
						<th class="px-3 py-2 font-medium text-muted-foreground">Reason</th>
						<th class="px-3 py-2 font-medium text-muted-foreground">Status</th>
						<th class="px-3 py-2 font-medium text-muted-foreground">Detected</th>
						<th class="px-3 py-2 font-medium text-muted-foreground">Days Inactive</th>
					</tr>
				</thead>
				<tbody>
					{#each detections.items as detection}
						<tr class="border-b border-border">
							<td class="px-3 py-2 font-mono text-xs text-foreground">
								{detection.user_id}
							</td>
							<td class="px-3 py-2">
								{reasonLabel(detection.detection_reason)}
							</td>
							<td class="px-3 py-2">
								<Badge class={statusClass(detection.status)}>{detection.status}</Badge>
							</td>
							<td class="px-3 py-2 text-muted-foreground">{formatNhiDate(detection.detected_at)}</td>
							<td class="px-3 py-2 font-mono">
								{detection.days_inactive ?? '—'}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>
