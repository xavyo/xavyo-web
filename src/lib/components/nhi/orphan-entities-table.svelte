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
			case 'pending': return 'bg-warning/15 text-warning';
			case 'under_review': return 'bg-info/15 text-info';
			case 'remediated': return 'bg-success/15 text-success';
			case 'dismissed': return 'bg-muted text-muted-foreground ';
			default: return 'bg-muted text-muted-foreground';
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
