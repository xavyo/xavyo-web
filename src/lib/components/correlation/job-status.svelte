<script lang="ts">
	import type { CorrelationJob } from '$lib/api/types';
	import { triggerCorrelationClient, fetchCorrelationJobStatus } from '$lib/api/correlation-client';
	import { Button } from '$lib/components/ui/button';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import { addToast } from '$lib/stores/toast.svelte';
	import { onMount } from 'svelte';
	import { Play, Loader2, CheckCircle, XCircle, Eye, HelpCircle, AlertTriangle } from 'lucide-svelte';

	interface Props {
		connectorId: string;
		onJobComplete?: () => void;
	}

	let { connectorId, onJobComplete }: Props = $props();

	let jobId = $state<string | null>(null);
	let currentJob = $state<CorrelationJob | null>(null);
	let isLoading = $state(false);
	let pollInterval = $state<ReturnType<typeof setInterval> | null>(null);

	// Derived values
	let progressPct = $derived(
		currentJob && currentJob.total_accounts > 0
			? Math.round((currentJob.processed_accounts / currentJob.total_accounts) * 100)
			: 0
	);

	let isTerminal = $derived(
		currentJob?.status === 'completed' || currentJob?.status === 'failed'
	);

	function statusBadgeClass(status: string): string {
		switch (status) {
			case 'running':
				return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
			case 'completed':
				return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
			case 'failed':
				return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
			default:
				return '';
		}
	}

	async function handleTrigger() {
		isLoading = true;
		currentJob = null;
		try {
			const job = await triggerCorrelationClient(connectorId);
			jobId = job.job_id;
			currentJob = job;
			addToast('info', 'Correlation job started');
			startPolling();
		} catch (err) {
			addToast('error', err instanceof Error ? err.message : 'Failed to trigger correlation');
		} finally {
			isLoading = false;
		}
	}

	function startPolling() {
		stopPolling();
		pollInterval = setInterval(async () => {
			if (!jobId) return;
			try {
				const job = await fetchCorrelationJobStatus(connectorId, jobId);
				currentJob = job;
				if (job.status === 'completed' || job.status === 'failed') {
					stopPolling();
					if (job.status === 'completed') {
						addToast('success', 'Correlation job completed');
						onJobComplete?.();
					} else {
						addToast('error', 'Correlation job failed');
					}
				}
			} catch (err) {
				// Polling failure is non-fatal; stop polling to avoid spam
				stopPolling();
				addToast('error', 'Lost connection to job status');
			}
		}, 5000);
	}

	function stopPolling() {
		if (pollInterval) {
			clearInterval(pollInterval);
			pollInterval = null;
		}
	}

	onMount(() => {
		return () => {
			stopPolling();
		};
	});
</script>

<div class="space-y-4">
	<!-- Trigger button -->
	<div class="flex items-center gap-3">
		<Button
			onclick={handleTrigger}
			disabled={isLoading || (!!currentJob && !isTerminal)}
		>
			{#if isLoading}
				<Loader2 class="mr-1 h-4 w-4 animate-spin" />
				Starting...
			{:else}
				<Play class="mr-1 h-4 w-4" />
				Run Correlation
			{/if}
		</Button>
		{#if currentJob && !isTerminal}
			<span class="text-sm text-muted-foreground">Job in progress...</span>
		{/if}
	</div>

	<!-- Job status display -->
	{#if currentJob}
		<div class="rounded-lg border bg-card p-4 space-y-4">
			<!-- Header row: status badge and job ID -->
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-2">
					{#if currentJob.status === 'running'}
						<Loader2 class="h-4 w-4 animate-spin text-yellow-600 dark:text-yellow-400" />
					{:else if currentJob.status === 'completed'}
						<CheckCircle class="h-4 w-4 text-green-600 dark:text-green-400" />
					{:else}
						<XCircle class="h-4 w-4 text-red-600 dark:text-red-400" />
					{/if}
					<Badge class={statusBadgeClass(currentJob.status)}>{currentJob.status}</Badge>
				</div>
				<span class="font-mono text-xs text-muted-foreground">{currentJob.job_id}</span>
			</div>

			<!-- Progress bar -->
			<div class="space-y-1">
				<div class="flex justify-between text-xs text-muted-foreground">
					<span>Progress</span>
					<span>{currentJob.processed_accounts} / {currentJob.total_accounts} accounts ({progressPct}%)</span>
				</div>
				<div class="h-2 w-full overflow-hidden rounded-full bg-muted">
					<div
						class="h-full rounded-full transition-all duration-300 {currentJob.status === 'failed' ? 'bg-destructive' : 'bg-primary'}"
						style="width: {progressPct}%"
					></div>
				</div>
			</div>

			<!-- Timestamps -->
			<div class="flex gap-4 text-xs text-muted-foreground">
				<span>Started: {new Date(currentJob.started_at).toLocaleString()}</span>
				{#if currentJob.completed_at}
					<span>Completed: {new Date(currentJob.completed_at).toLocaleString()}</span>
				{/if}
			</div>

			<!-- Result summary cards (when completed or has data) -->
			{#if isTerminal || currentJob.processed_accounts > 0}
				<div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
					<div class="rounded-md border bg-green-50 p-3 dark:bg-green-950">
						<div class="flex items-center gap-1.5">
							<CheckCircle class="h-4 w-4 text-green-600 dark:text-green-400" />
							<span class="text-xs font-medium text-green-800 dark:text-green-200">Auto-Confirmed</span>
						</div>
						<p class="mt-1 text-2xl font-bold text-green-900 dark:text-green-100">{currentJob.auto_confirmed}</p>
					</div>
					<div class="rounded-md border bg-amber-50 p-3 dark:bg-amber-950">
						<div class="flex items-center gap-1.5">
							<Eye class="h-4 w-4 text-amber-600 dark:text-amber-400" />
							<span class="text-xs font-medium text-amber-800 dark:text-amber-200">For Review</span>
						</div>
						<p class="mt-1 text-2xl font-bold text-amber-900 dark:text-amber-100">{currentJob.queued_for_review}</p>
					</div>
					<div class="rounded-md border bg-gray-50 p-3 dark:bg-gray-900">
						<div class="flex items-center gap-1.5">
							<HelpCircle class="h-4 w-4 text-gray-500 dark:text-gray-400" />
							<span class="text-xs font-medium text-gray-700 dark:text-gray-300">No Match</span>
						</div>
						<p class="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">{currentJob.no_match}</p>
					</div>
					<div class="rounded-md border bg-red-50 p-3 dark:bg-red-950">
						<div class="flex items-center gap-1.5">
							<AlertTriangle class="h-4 w-4 text-red-600 dark:text-red-400" />
							<span class="text-xs font-medium text-red-800 dark:text-red-200">Errors</span>
						</div>
						<p class="mt-1 text-2xl font-bold text-red-900 dark:text-red-100">{currentJob.errors}</p>
					</div>
				</div>
			{/if}
		</div>
	{/if}
</div>
