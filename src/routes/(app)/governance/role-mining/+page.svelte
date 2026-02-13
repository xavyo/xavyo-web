<script lang="ts">
	import type { MiningJob, MiningJobStatus } from '$lib/api/types';
	import {
		runJobClient,
		cancelJobClient,
		deleteJobClient
	} from '$lib/api/role-mining-client';
	import { page } from '$app/stores';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import JobStatusBadge from '$lib/components/role-mining/job-status-badge.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent } from '$lib/components/ui/card';
	import * as Dialog from '$lib/components/ui/dialog';
	import { addToast } from '$lib/stores/toast.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const tabs = [
		{ id: 'jobs', label: 'Jobs' },
		{ id: 'patterns', label: 'Patterns' },
		{ id: 'privileges', label: 'Privileges' },
		{ id: 'consolidation', label: 'Consolidation' },
		{ id: 'simulations', label: 'Simulations' },
		{ id: 'metrics', label: 'Metrics' }
	];

	let activeTab = $state($page.url.searchParams.get('tab') || 'jobs');

	// Server-loaded jobs data
	let jobs = $derived(data.jobs);

	// Local state for client-side updates
	let jobItems = $state<MiningJob[]>([]);
	let jobsInitialized = $state(false);

	$effect(() => {
		if (!jobsInitialized && jobs.items.length > 0) {
			jobItems = [...jobs.items];
			jobsInitialized = true;
		} else if (!jobsInitialized) {
			jobItems = jobs.items;
			jobsInitialized = true;
		}
	});

	// Delete confirmation
	let showDeleteDialog = $state(false);
	let deleteTarget: { id: string; name: string } | null = $state(null);

	// --- Actions ---

	async function handleRun(jobId: string) {
		try {
			const updated = await runJobClient(jobId);
			jobItems = jobItems.map((j) => (j.id === jobId ? { ...j, status: updated.status ?? 'running' as MiningJobStatus } : j));
			addToast('success', 'Mining job started');
		} catch {
			addToast('error', 'Failed to start job');
		}
	}

	async function handleCancel(jobId: string) {
		try {
			await cancelJobClient(jobId);
			jobItems = jobItems.map((j) => (j.id === jobId ? { ...j, status: 'cancelled' as MiningJobStatus } : j));
			addToast('success', 'Mining job cancelled');
		} catch {
			addToast('error', 'Failed to cancel job');
		}
	}

	function confirmDelete(id: string, name: string) {
		deleteTarget = { id, name };
		showDeleteDialog = true;
	}

	async function executeDelete() {
		if (!deleteTarget) return;
		const { id } = deleteTarget;
		showDeleteDialog = false;
		try {
			await deleteJobClient(id);
			jobItems = jobItems.filter((j) => j.id !== id);
			addToast('success', 'Mining job deleted');
		} catch {
			addToast('error', 'Failed to delete job');
		}
		deleteTarget = null;
	}

	function formatDate(d: string | null): string {
		if (!d) return '\u2014';
		return new Date(d).toLocaleDateString();
	}

	function formatDateTime(d: string | null): string {
		if (!d) return '\u2014';
		return new Date(d).toLocaleString();
	}
</script>

<PageHeader
	title="Role Mining"
	description="Discover role candidates, access patterns, excessive privileges, and consolidation opportunities"
/>

<nav class="-mb-px flex gap-4 overflow-x-auto border-b border-border" role="tablist" aria-label="Role Mining tabs">
	{#each tabs as tab}
		<button
			role="tab"
			aria-selected={activeTab === tab.id}
			aria-controls="tabpanel-{tab.id}"
			id="tab-{tab.id}"
			class="whitespace-nowrap border-b-2 px-1 py-3 text-sm font-medium transition-colors {activeTab === tab.id
				? 'border-primary text-primary'
				: 'border-transparent text-muted-foreground hover:border-muted-foreground/30 hover:text-foreground'}"
			onclick={() => (activeTab = tab.id)}
		>
			{tab.label}
		</button>
	{/each}
</nav>

<div class="mt-6" role="tabpanel" id="tabpanel-{activeTab}" aria-labelledby="tab-{activeTab}">
	<!-- ===== JOBS TAB ===== -->
	{#if activeTab === 'jobs'}
		<div class="mb-4 flex items-center justify-between">
			<p class="text-sm text-muted-foreground">{jobs.total} job{jobs.total !== 1 ? 's' : ''}</p>
			<a
				href="/governance/role-mining/create"
				class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90"
			>
				Create job
			</a>
		</div>

		{#if jobItems.length === 0}
			<Card>
				<CardContent class="py-12 text-center">
					<p class="text-muted-foreground">No mining jobs yet.</p>
					<a href="/governance/role-mining/create" class="mt-2 inline-block text-sm text-primary hover:underline">
						Create your first mining job
					</a>
				</CardContent>
			</Card>
		{:else}
			<div class="overflow-x-auto rounded-md border border-border">
				<table class="w-full text-sm">
					<thead class="border-b bg-muted/50">
						<tr>
							<th class="px-4 py-3 text-left font-medium">Name</th>
							<th class="px-4 py-3 text-left font-medium">Status</th>
							<th class="px-4 py-3 text-right font-medium">Progress</th>
							<th class="px-4 py-3 text-right font-medium">Candidates</th>
							<th class="px-4 py-3 text-left font-medium">Created</th>
							<th class="px-4 py-3 text-right font-medium">Actions</th>
						</tr>
					</thead>
					<tbody>
						{#each jobItems as job}
							<tr class="border-b last:border-0 hover:bg-muted/30">
								<td class="px-4 py-3">
									<a href="/governance/role-mining/jobs/{job.id}" class="font-medium text-primary hover:underline">
										{job.name}
									</a>
								</td>
								<td class="px-4 py-3">
									<JobStatusBadge status={job.status} />
								</td>
								<td class="px-4 py-3 text-right">
									{#if job.status === 'running'}
										<div class="flex items-center justify-end gap-2">
											<div class="h-2 w-20 overflow-hidden rounded-full bg-muted">
												<div
													class="h-full rounded-full bg-primary transition-all"
													style="width: {job.progress_percent}%"
												></div>
											</div>
											<span class="text-xs text-muted-foreground">{job.progress_percent}%</span>
										</div>
									{:else if job.status === 'completed'}
										<span class="text-xs text-muted-foreground">100%</span>
									{:else}
										<span class="text-xs text-muted-foreground">\u2014</span>
									{/if}
								</td>
								<td class="px-4 py-3 text-right">{job.candidate_count}</td>
								<td class="px-4 py-3 text-muted-foreground">{formatDate(job.created_at)}</td>
								<td class="px-4 py-3 text-right">
									<div class="flex justify-end gap-1">
										{#if job.status === 'pending'}
											<button
												class="rounded px-2 py-1 text-xs text-primary hover:bg-primary/10"
												onclick={() => handleRun(job.id)}
											>
												Run
											</button>
										{/if}
										{#if job.status === 'running'}
											<button
												class="rounded px-2 py-1 text-xs text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-950"
												onclick={() => handleCancel(job.id)}
											>
												Cancel
											</button>
										{/if}
										{#if job.status === 'completed' || job.status === 'failed' || job.status === 'cancelled'}
											<button
												class="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
												onclick={() => confirmDelete(job.id, job.name)}
											>
												Delete
											</button>
										{/if}
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}

	<!-- ===== PATTERNS TAB ===== -->
	{:else if activeTab === 'patterns'}
		<Card>
			<CardContent class="py-12 text-center">
				<p class="text-lg font-medium text-muted-foreground">Access Patterns</p>
				<p class="mt-2 text-sm text-muted-foreground">
					Select a completed job to view discovered access patterns.
				</p>
				<p class="mt-1 text-xs text-muted-foreground">
					Patterns will be available after a mining job completes successfully.
				</p>
			</CardContent>
		</Card>

	<!-- ===== PRIVILEGES TAB ===== -->
	{:else if activeTab === 'privileges'}
		<Card>
			<CardContent class="py-12 text-center">
				<p class="text-lg font-medium text-muted-foreground">Excessive Privileges</p>
				<p class="mt-2 text-sm text-muted-foreground">
					Select a completed job to view excessive privilege flags.
				</p>
				<p class="mt-1 text-xs text-muted-foreground">
					Privilege analysis runs as part of mining jobs with the excessive privilege option enabled.
				</p>
			</CardContent>
		</Card>

	<!-- ===== CONSOLIDATION TAB ===== -->
	{:else if activeTab === 'consolidation'}
		<Card>
			<CardContent class="py-12 text-center">
				<p class="text-lg font-medium text-muted-foreground">Consolidation Suggestions</p>
				<p class="mt-2 text-sm text-muted-foreground">
					Select a completed job to view role consolidation suggestions.
				</p>
				<p class="mt-1 text-xs text-muted-foreground">
					Consolidation analysis runs as part of mining jobs with the consolidation option enabled.
				</p>
			</CardContent>
		</Card>

	<!-- ===== SIMULATIONS TAB ===== -->
	{:else if activeTab === 'simulations'}
		<Card>
			<CardContent class="py-12 text-center">
				<p class="text-lg font-medium text-muted-foreground">Simulations</p>
				<p class="mt-2 text-sm text-muted-foreground">
					Create and run what-if simulations to evaluate role changes before applying them.
				</p>
				<div class="mt-4">
					<a
						href="/governance/role-mining/simulations/create"
						class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90"
					>
						Create simulation
					</a>
				</div>
			</CardContent>
		</Card>

	<!-- ===== METRICS TAB ===== -->
	{:else if activeTab === 'metrics'}
		<Card>
			<CardContent class="py-12 text-center">
				<p class="text-lg font-medium text-muted-foreground">Role Metrics</p>
				<p class="mt-2 text-sm text-muted-foreground">
					View role usage metrics, trend analysis, and optimization recommendations.
				</p>
				<p class="mt-1 text-xs text-muted-foreground">
					Metrics will be populated after mining jobs complete and role assignments are analyzed.
				</p>
			</CardContent>
		</Card>
	{/if}
</div>

<!-- Delete Confirmation Dialog -->
<Dialog.Root bind:open={showDeleteDialog}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Confirm Delete</Dialog.Title>
			<Dialog.Description>
				Are you sure you want to delete the mining job <strong>{deleteTarget?.name ?? 'this job'}</strong>? This action cannot be undone.
			</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer>
			<Button variant="outline" onclick={() => (showDeleteDialog = false)}>Cancel</Button>
			<Button variant="destructive" onclick={executeDelete}>Confirm delete</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
