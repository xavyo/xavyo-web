<script lang="ts">
	import type { ReportSchedule } from '$lib/api/types';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import ConfirmDialog from '$lib/components/ui/confirm-dialog.svelte';
	import { pauseScheduleClient, resumeScheduleClient, deleteScheduleClient } from '$lib/api/governance-reporting-client';
	import { addToast } from '$lib/stores/toast.svelte';

	interface Props {
		schedules: ReportSchedule[];
		loading?: boolean;
		onRefresh?: () => void;
	}

	let { schedules, loading = false, onRefresh }: Props = $props();

	const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

	function statusClass(status: string): string {
		switch (status) {
			case 'active':
				return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
			case 'paused':
				return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
			case 'disabled':
				return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
			default:
				return 'bg-muted text-muted-foreground';
		}
	}

	function formatDate(d: string | null): string {
		if (!d) return '—';
		return new Date(d).toLocaleString();
	}

	function frequencyLabel(s: ReportSchedule): string {
		const hour = `${String(s.schedule_hour).padStart(2, '0')}:00`;
		if (s.frequency === 'daily') return `Daily at ${hour}`;
		if (s.frequency === 'weekly' && s.schedule_day_of_week !== null)
			return `Weekly on ${dayNames[s.schedule_day_of_week]} at ${hour}`;
		if (s.frequency === 'monthly' && s.schedule_day_of_month !== null)
			return `Monthly on day ${s.schedule_day_of_month} at ${hour}`;
		return s.frequency;
	}

	async function handlePause(id: string) {
		try {
			await pauseScheduleClient(id);
			addToast('success', 'Schedule paused');
			onRefresh?.();
		} catch {
			addToast('error', 'Failed to pause schedule');
		}
	}

	async function handleResume(id: string) {
		try {
			await resumeScheduleClient(id);
			addToast('success', 'Schedule resumed');
			onRefresh?.();
		} catch {
			addToast('error', 'Failed to resume schedule');
		}
	}

	let confirmDeleteId: string | null = $state(null);
	let showDeleteConfirm = $state(false);

	function requestDelete(id: string) {
		confirmDeleteId = id;
		showDeleteConfirm = true;
	}

	async function handleDelete() {
		if (!confirmDeleteId) return;
		try {
			await deleteScheduleClient(confirmDeleteId);
			addToast('success', 'Schedule deleted');
			onRefresh?.();
		} catch {
			addToast('error', 'Failed to delete schedule');
		} finally {
			confirmDeleteId = null;
		}
	}
</script>

<div class="space-y-4">
	<div class="flex items-center justify-between">
		<p class="text-sm text-muted-foreground">
			{schedules.length} {schedules.length === 1 ? 'schedule' : 'schedules'}
		</p>
		<a
			href="/governance/reports/schedules/create"
			class="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-xs hover:bg-primary/90"
		>
			Create Schedule
		</a>
	</div>

	{#if loading}
		<div class="space-y-3">
			{#each Array(3) as _}
				<div class="h-12 animate-pulse rounded-md bg-muted"></div>
			{/each}
		</div>
	{:else if schedules.length === 0}
		<p class="py-8 text-center text-sm text-muted-foreground">No report schedules configured.</p>
	{:else}
		<div class="overflow-x-auto">
			<table class="w-full text-sm">
				<thead>
					<tr class="border-b border-border text-left">
						<th class="px-3 py-2 font-medium text-muted-foreground">Name</th>
						<th class="px-3 py-2 font-medium text-muted-foreground">Frequency</th>
						<th class="px-3 py-2 font-medium text-muted-foreground">Status</th>
						<th class="px-3 py-2 font-medium text-muted-foreground">Next Run</th>
						<th class="px-3 py-2 font-medium text-muted-foreground">Last Run</th>
						<th class="px-3 py-2 font-medium text-muted-foreground">Failures</th>
						<th class="px-3 py-2 font-medium text-muted-foreground">Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each schedules as schedule}
						<tr class="border-b border-border">
							<td class="px-3 py-2">
								<a
									href="/governance/reports/schedules/{schedule.id}"
									class="font-medium text-primary hover:underline"
								>
									{schedule.name}
								</a>
							</td>
							<td class="px-3 py-2 text-muted-foreground">{frequencyLabel(schedule)}</td>
							<td class="px-3 py-2">
								<Badge class={statusClass(schedule.status)}>{schedule.status}</Badge>
							</td>
							<td class="px-3 py-2 text-muted-foreground">{formatDate(schedule.next_run_at)}</td>
							<td class="px-3 py-2 text-muted-foreground">{formatDate(schedule.last_run_at)}</td>
							<td class="px-3 py-2">
								{#if schedule.consecutive_failures > 0}
									<span class="text-destructive">{schedule.consecutive_failures}</span>
									{#if schedule.last_error}
										<span class="ml-1 text-xs text-destructive" title={schedule.last_error}>!</span>
									{/if}
								{:else}
									<span class="text-muted-foreground">0</span>
								{/if}
							</td>
							<td class="px-3 py-2">
								<div class="flex gap-2">
									{#if schedule.status === 'active'}
										<button
											type="button"
											class="text-sm font-medium text-yellow-600 hover:underline dark:text-yellow-400"
											onclick={() => handlePause(schedule.id)}
										>
											Pause
										</button>
									{:else}
										<button
											type="button"
											class="text-sm font-medium text-green-600 hover:underline dark:text-green-400"
											onclick={() => handleResume(schedule.id)}
										>
											Resume
										</button>
									{/if}
									<button
										type="button"
										class="text-sm font-medium text-destructive hover:underline"
										onclick={() => requestDelete(schedule.id)}
									>
										Delete
									</button>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>

<ConfirmDialog
	bind:open={showDeleteConfirm}
	title="Delete schedule"
	description="Are you sure you want to delete this schedule? This action cannot be undone."
	confirmLabel="Delete"
	onconfirm={handleDelete}
/>
