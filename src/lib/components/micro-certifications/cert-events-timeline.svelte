<script lang="ts">
	import type { CertificationEvent } from '$lib/api/types';

	interface Props {
		events: CertificationEvent[];
	}

	let { events }: Props = $props();

	const sortedEvents = $derived([...events].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));

	const eventIconMap: Record<string, string> = {
		created: '🔵',
		reminder_sent: '🔔',
		escalated: '⚠️',
		approved: '✅',
		rejected: '❌',
		flagged_for_review: '🚩',
		delegated: '🔄',
		auto_revoked: '🔒',
		expired: '⏰',
		skipped: '⏭️'
	};

	const eventLabelMap: Record<string, string> = {
		created: 'Created',
		reminder_sent: 'Reminder Sent',
		escalated: 'Escalated',
		approved: 'Approved',
		rejected: 'Rejected',
		flagged_for_review: 'Flagged for Review',
		delegated: 'Delegated',
		auto_revoked: 'Auto-Revoked',
		expired: 'Expired',
		skipped: 'Skipped'
	};

	function formatDate(dateStr: string): string {
		try {
			return new Date(dateStr).toLocaleString();
		} catch {
			return dateStr;
		}
	}

	function getEventDetail(event: CertificationEvent): string {
		if (!event.details) return '';
		const d = event.details;
		if (d.decision) return `Decision: ${d.decision}`;
		if (d.comment) return String(d.comment);
		return '';
	}
</script>

<div class="space-y-0" data-testid="events-timeline">
	{#if sortedEvents.length === 0}
		<p class="text-sm text-muted-foreground">No events recorded.</p>
	{:else}
		{#each sortedEvents as event (event.id)}
			{@const detail = getEventDetail(event)}
			<div class="relative flex gap-3 pb-4" data-testid="timeline-event">
				<div class="flex flex-col items-center">
					<span class="text-lg">{eventIconMap[event.event_type] ?? '📋'}</span>
					{#if sortedEvents.indexOf(event) < sortedEvents.length - 1}
						<div class="mt-1 h-full w-px bg-border"></div>
					{/if}
				</div>
				<div class="flex-1 pb-2">
					<div class="flex items-center gap-2">
						<span class="text-sm font-medium">{eventLabelMap[event.event_type] ?? event.event_type}</span>
						<span class="text-xs text-muted-foreground">{formatDate(event.created_at)}</span>
					</div>
					{#if event.actor_id}
						<p class="text-xs text-muted-foreground">By: {event.actor_id.slice(0, 8)}...</p>
					{/if}
					{#if detail}
						<p class="mt-1 text-sm text-muted-foreground">{detail}</p>
					{/if}
				</div>
			</div>
		{/each}
	{/if}
</div>
