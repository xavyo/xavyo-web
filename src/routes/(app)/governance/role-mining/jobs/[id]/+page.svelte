<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { Card, CardHeader, CardContent } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import JobStatusBadge from '$lib/components/role-mining/job-status-badge.svelte';
	import CandidateCard from '$lib/components/role-mining/candidate-card.svelte';
	import { addToast } from '$lib/stores/toast.svelte';
	import {
		runJobClient,
		deleteJobClient,
		promoteCandidateClient,
		dismissCandidateClient
	} from '$lib/api/role-mining-client';
	import { Play, XCircle, Trash2, AlertTriangle } from 'lucide-svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let job = $derived(data.job);
	let candidates = $derived(data.candidates);

	let actionLoading = $state(false);

	const isPending = $derived(job.status === 'pending');
	const isRunning = $derived(job.status === 'running');
	const isCompleted = $derived(job.status === 'completed');
	const isFailed = $derived(job.status === 'failed');
	const isTerminal = $derived(
		job.status === 'completed' || job.status === 'failed' || job.status === 'cancelled'
	);

	function formatDate(val: string | null): string {
		if (!val) return '--';
		const d = new Date(val);
		if (isNaN(d.getTime())) return '--';
		return d.toLocaleString();
	}

	function formatParam(key: string, value: unknown): string {
		if (value === null || value === undefined) return '--';
		if (typeof value === 'boolean') return value ? 'Yes' : 'No';
		return String(value);
	}

	function paramLabel(key: string): string {
		return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
	}

	async function handleRun() {
		actionLoading = true;
		try {
			await runJobClient(job.id);
			addToast('success', 'Mining job started');
			await invalidateAll();
		} catch (e) {
			addToast('error', e instanceof Error ? e.message : 'Failed to run job');
		} finally {
			actionLoading = false;
		}
	}

	async function handleCancel() {
		actionLoading = true;
		try {
			await deleteJobClient(job.id);
			addToast('success', 'Mining job cancelled');
			await invalidateAll();
		} catch (e) {
			addToast('error', e instanceof Error ? e.message : 'Failed to cancel job');
		} finally {
			actionLoading = false;
		}
	}

	async function handleDelete() {
		actionLoading = true;
		try {
			await deleteJobClient(job.id);
			addToast('success', 'Mining job deleted');
			window.location.href = '/governance/role-mining';
		} catch (e) {
			addToast('error', e instanceof Error ? e.message : 'Failed to delete job');
			actionLoading = false;
		}
	}

	async function handlePromote(candidateId: string) {
		try {
			await promoteCandidateClient(candidateId);
			addToast('success', 'Candidate promoted to role');
			await invalidateAll();
		} catch (e) {
			addToast('error', e instanceof Error ? e.message : 'Failed to promote candidate');
		}
	}

	async function handleDismiss(candidateId: string) {
		try {
			await dismissCandidateClient(candidateId);
			addToast('success', 'Candidate dismissed');
			await invalidateAll();
		} catch (e) {
			addToast('error', e instanceof Error ? e.message : 'Failed to dismiss candidate');
		}
	}
</script>

<div class="flex items-center gap-2 mb-2">
	<a href="/governance/role-mining" class="text-sm text-muted-foreground hover:underline"
		>&larr; Back to Role Mining</a
	>
</div>

<PageHeader title={job.name} />

<!-- Job Info -->
<Card class="mb-6">
	<CardHeader>
		<h2 class="text-lg font-semibold">Job Information</h2>
	</CardHeader>
	<CardContent>
		<div class="flex flex-wrap gap-6 text-sm">
			<div>
				<span class="text-muted-foreground">Status</span>
				<div class="mt-1">
					<JobStatusBadge status={job.status} />
				</div>
			</div>
			<div>
				<span class="text-muted-foreground">Progress</span>
				<div class="mt-1 font-medium">{job.progress_percent}%</div>
			</div>
			<div>
				<span class="text-muted-foreground">Created</span>
				<p class="mt-1 font-medium">{formatDate(job.created_at)}</p>
			</div>
			<div>
				<span class="text-muted-foreground">Started</span>
				<p class="mt-1 font-medium">{formatDate(job.started_at)}</p>
			</div>
			<div>
				<span class="text-muted-foreground">Completed</span>
				<p class="mt-1 font-medium">{formatDate(job.completed_at)}</p>
			</div>
		</div>

		{#if isRunning}
			<div class="mt-4">
				<div class="mb-1 flex items-center justify-between text-xs text-muted-foreground">
					<span>Progress</span>
					<span class="font-mono">{job.progress_percent}%</span>
				</div>
				<div class="h-2.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
					<div
						class="h-full rounded-full bg-blue-600 transition-all"
						style:width="{job.progress_percent}%"
					></div>
				</div>
			</div>
		{/if}
	</CardContent>
</Card>

<!-- Parameters -->
<Card class="mb-6">
	<CardHeader>
		<h2 class="text-lg font-semibold">Parameters</h2>
	</CardHeader>
	<CardContent>
		{#if job.parameters && Object.keys(job.parameters).length > 0}
			<dl class="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
				{#each Object.entries(job.parameters) as [key, value]}
					<div>
						<dt class="text-muted-foreground">{paramLabel(key)}</dt>
						<dd class="mt-0.5 font-medium">{formatParam(key, value)}</dd>
					</div>
				{/each}
			</dl>
		{:else}
			<p class="text-sm text-muted-foreground">Default parameters used.</p>
		{/if}
	</CardContent>
</Card>

<!-- Metrics (completed only) -->
{#if isCompleted}
	<Card class="mb-6">
		<CardHeader>
			<h2 class="text-lg font-semibold">Results</h2>
		</CardHeader>
		<CardContent>
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
				<div class="rounded-lg border p-4 text-center">
					<p class="text-2xl font-bold text-blue-600 dark:text-blue-400">
						{job.candidate_count}
					</p>
					<p class="text-sm text-muted-foreground">Role Candidates</p>
				</div>
				<div class="rounded-lg border p-4 text-center">
					<p class="text-2xl font-bold text-orange-600 dark:text-orange-400">
						{job.excessive_privilege_count}
					</p>
					<p class="text-sm text-muted-foreground">Excessive Privileges</p>
				</div>
				<div class="rounded-lg border p-4 text-center">
					<p class="text-2xl font-bold text-purple-600 dark:text-purple-400">
						{job.consolidation_suggestion_count}
					</p>
					<p class="text-sm text-muted-foreground">Consolidation Suggestions</p>
				</div>
			</div>
		</CardContent>
	</Card>
{/if}

<!-- Error (failed only) -->
{#if isFailed && job.error_message}
	<Alert variant="destructive" class="mb-6">
		<AlertTriangle class="h-4 w-4" />
		<AlertDescription>
			<strong>Job Failed:</strong>
			{job.error_message}
		</AlertDescription>
	</Alert>
{/if}

<!-- Actions -->
<Card class="mb-6">
	<CardHeader>
		<h2 class="text-lg font-semibold">Actions</h2>
	</CardHeader>
	<CardContent>
		<div class="flex flex-wrap gap-2">
			{#if isPending}
				<Button variant="default" disabled={actionLoading} onclick={handleRun}>
					<Play class="mr-1.5 h-4 w-4" />
					Run
				</Button>
			{/if}

			{#if isRunning}
				<Button variant="destructive" disabled={actionLoading} onclick={handleCancel}>
					<XCircle class="mr-1.5 h-4 w-4" />
					Cancel
				</Button>
			{/if}

			{#if isTerminal}
				<Button variant="destructive" disabled={actionLoading} onclick={handleDelete}>
					<Trash2 class="mr-1.5 h-4 w-4" />
					Delete
				</Button>
			{/if}
		</div>
	</CardContent>
</Card>

<!-- Candidates (completed only) -->
{#if isCompleted}
	<Card>
		<CardHeader>
			<div class="flex items-center justify-between">
				<h2 class="text-lg font-semibold">Role Candidates</h2>
				<span class="text-sm text-muted-foreground">{candidates.total} total</span>
			</div>
		</CardHeader>
		<CardContent>
			{#if candidates.items.length === 0}
				<p class="text-sm text-muted-foreground">No role candidates were discovered.</p>
			{:else}
				<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
					{#each candidates.items as candidate (candidate.id)}
						<CandidateCard
							{candidate}
							onPromote={handlePromote}
							onDismiss={handleDismiss}
						/>
					{/each}
				</div>
			{/if}
		</CardContent>
	</Card>
{/if}
