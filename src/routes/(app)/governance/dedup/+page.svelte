<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';
	import { superForm } from 'sveltekit-superforms';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import ConfidenceBadge from '$lib/components/dedup/confidence-badge.svelte';
	import { addToast } from '$lib/stores/toast.svelte';
	import { fetchMergeAudits } from '$lib/api/dedup-client';
	import type { MergeAuditSummaryResponse } from '$lib/api/types';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const tabs = [
		{ id: 'duplicates', label: 'Duplicates' },
		{ id: 'batch', label: 'Batch Merge' },
		{ id: 'history', label: 'Merge History' }
	];

	let activeTab = $state('duplicates');
	let duplicates = $derived(data.duplicates);

	// Detection form
	// svelte-ignore state_referenced_locally
	const { form: detectFormData, enhance: detectEnhance, message: detectMessage } = superForm(data.detectForm, {
		resetForm: false,
		invalidateAll: 'force',
		onUpdated({ form }) {
			if (form.message) {
				addToast(form.valid ? 'success' : 'error', form.message);
			}
		}
	});

	// Filter state
	let statusFilter = $state($page.url.searchParams.get('status') ?? '');
	let confidenceFilter = $state($page.url.searchParams.get('min_confidence') ?? '');

	function applyFilters() {
		const params = new URLSearchParams();
		if (statusFilter) params.set('status', statusFilter);
		if (confidenceFilter) params.set('min_confidence', confidenceFilter);
		goto(`/governance/dedup?${params.toString()}`);
	}

	// Audit trail (client-loaded for Merge History tab)
	let audits: MergeAuditSummaryResponse[] = $state([]);
	let auditsLoaded = $state(false);
	let auditsLoading = $state(false);

	$effect(() => {
		if (activeTab === 'history' && !auditsLoaded && !auditsLoading) {
			loadAudits();
		}
	});

	async function loadAudits() {
		auditsLoading = true;
		try {
			const result = await fetchMergeAudits({ limit: 50 });
			audits = result.items;
			auditsLoaded = true;
		} catch {
			addToast('error', 'Failed to load merge history');
		} finally {
			auditsLoading = false;
		}
	}

	function statusBadgeClass(status: string): string {
		switch (status) {
			case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
			case 'merged': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
			case 'dismissed': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
			default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
		}
	}

	let showDetectDialog = $state(false);
</script>

<PageHeader title="Identity Deduplication" description="Detect and merge duplicate identities" />

<div class="space-y-6">
	<!-- Tabs -->
	<div class="border-b border-border" role="tablist" aria-label="Deduplication tabs">
		{#each tabs as tab}
			<button
				role="tab"
				aria-selected={activeTab === tab.id}
				class="inline-block border-b-2 px-4 py-2 text-sm font-medium transition-colors {activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}"
				onclick={() => (activeTab = tab.id)}
			>
				{tab.label}
			</button>
		{/each}
	</div>

	<!-- Duplicates Tab -->
	{#if activeTab === 'duplicates'}
		<div class="space-y-4">
			<!-- Filters + Actions -->
			<div class="flex flex-wrap items-end gap-4">
				<div>
					<label for="status-filter" class="block text-sm font-medium text-muted-foreground">Status</label>
					<select
						id="status-filter"
						class="mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
						bind:value={statusFilter}
						onchange={applyFilters}
					>
						<option value="">All</option>
						<option value="pending">Pending</option>
						<option value="merged">Merged</option>
						<option value="dismissed">Dismissed</option>
					</select>
				</div>
				<div>
					<label for="confidence-filter" class="block text-sm font-medium text-muted-foreground">Min Confidence</label>
					<input
						id="confidence-filter"
						type="number"
						min="0"
						max="100"
						class="mt-1 w-24 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
						bind:value={confidenceFilter}
						onchange={applyFilters}
					/>
				</div>
				<button
					class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
					onclick={() => (showDetectDialog = true)}
				>
					Run Detection
				</button>
			</div>

			<!-- Detection Dialog -->
			{#if showDetectDialog}
				<div class="rounded-lg border border-border bg-card p-4">
					<h3 class="mb-3 text-sm font-semibold text-foreground">Run Detection Scan</h3>
					<form method="POST" action="?/detect" use:detectEnhance>
						<div class="flex items-end gap-4">
							<div>
								<label for="detect-confidence" class="block text-sm text-muted-foreground">Minimum Confidence (%)</label>
								<input
									id="detect-confidence"
									type="number"
									name="min_confidence"
									min="0"
									max="100"
									value={String($detectFormData.min_confidence ?? '70')}
									class="mt-1 w-24 rounded-md border border-input bg-background px-3 py-2 text-sm"
								/>
							</div>
							<button type="submit" class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
								Start Scan
							</button>
							<button type="button" class="rounded-md border border-input px-4 py-2 text-sm text-foreground hover:bg-muted" onclick={() => (showDetectDialog = false)}>
								Cancel
							</button>
						</div>
					</form>
				</div>
			{/if}

			<!-- Duplicates Table -->
			{#if duplicates.items.length === 0}
				<div class="rounded-lg border border-dashed border-border p-8 text-center">
					<p class="text-muted-foreground">No duplicate candidates found.</p>
					<p class="mt-1 text-sm text-muted-foreground">Run a detection scan to find potential duplicates.</p>
				</div>
			{:else}
				<div class="overflow-x-auto">
					<table class="w-full text-sm">
						<thead>
							<tr class="border-b border-border">
								<th class="py-3 pr-4 text-left font-medium text-muted-foreground">Identity A</th>
								<th class="py-3 pr-4 text-left font-medium text-muted-foreground">Identity B</th>
								<th class="py-3 pr-4 text-left font-medium text-muted-foreground">Confidence</th>
								<th class="py-3 pr-4 text-left font-medium text-muted-foreground">Status</th>
								<th class="py-3 pr-4 text-left font-medium text-muted-foreground">Detected</th>
								<th class="py-3 text-left font-medium text-muted-foreground"></th>
							</tr>
						</thead>
						<tbody>
							{#each duplicates.items as dup}
								<tr class="border-b border-border/50 hover:bg-muted/50">
									<td class="py-3 pr-4 font-mono text-xs text-foreground">{dup.identity_a_id.slice(0, 8)}...</td>
									<td class="py-3 pr-4 font-mono text-xs text-foreground">{dup.identity_b_id.slice(0, 8)}...</td>
									<td class="py-3 pr-4"><ConfidenceBadge score={dup.confidence_score} size="sm" /></td>
									<td class="py-3 pr-4">
										<span class="rounded-full px-2 py-0.5 text-xs font-medium {statusBadgeClass(dup.status)}">
											{dup.status}
										</span>
									</td>
									<td class="py-3 pr-4 text-muted-foreground">{new Date(dup.detected_at).toLocaleDateString()}</td>
									<td class="py-3">
										<a href="/governance/dedup/{dup.id}" class="text-primary hover:underline">View</a>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
				<!-- Pagination info -->
				<p class="text-sm text-muted-foreground">
					Showing {duplicates.offset + 1}–{Math.min(duplicates.offset + duplicates.limit, duplicates.total)} of {duplicates.total}
				</p>
			{/if}
		</div>
	{/if}

	<!-- Batch Merge Tab -->
	{#if activeTab === 'batch'}
		<div class="rounded-lg border border-dashed border-border p-8 text-center">
			<p class="text-muted-foreground">Batch merge operations</p>
			<a href="/governance/dedup/batch" class="mt-2 inline-block text-primary hover:underline">Open Batch Merge</a>
		</div>
	{/if}

	<!-- Merge History Tab -->
	{#if activeTab === 'history'}
		<div class="space-y-4">
			{#if auditsLoading}
				<div class="space-y-3">
					{#each Array(3) as _}
						<div class="h-12 animate-pulse rounded-lg bg-muted"></div>
					{/each}
				</div>
			{:else if audits.length === 0}
				<div class="rounded-lg border border-dashed border-border p-8 text-center">
					<p class="text-muted-foreground">No merge operations have been performed yet.</p>
				</div>
			{:else}
				<div class="overflow-x-auto">
					<table class="w-full text-sm">
						<thead>
							<tr class="border-b border-border">
								<th class="py-3 pr-4 text-left font-medium text-muted-foreground">Operation</th>
								<th class="py-3 pr-4 text-left font-medium text-muted-foreground">Source</th>
								<th class="py-3 pr-4 text-left font-medium text-muted-foreground">Target</th>
								<th class="py-3 pr-4 text-left font-medium text-muted-foreground">Date</th>
								<th class="py-3 text-left font-medium text-muted-foreground"></th>
							</tr>
						</thead>
						<tbody>
							{#each audits as audit}
								<tr class="border-b border-border/50 hover:bg-muted/50">
									<td class="py-3 pr-4 font-mono text-xs text-foreground">{audit.operation_id.slice(0, 8)}...</td>
									<td class="py-3 pr-4 font-mono text-xs text-foreground">{audit.source_identity_id.slice(0, 8)}...</td>
									<td class="py-3 pr-4 font-mono text-xs text-foreground">{audit.target_identity_id.slice(0, 8)}...</td>
									<td class="py-3 pr-4 text-muted-foreground">{new Date(audit.created_at).toLocaleDateString()}</td>
									<td class="py-3">
										<a href="/governance/dedup/audit/{audit.id}" class="text-primary hover:underline">Details</a>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</div>
	{/if}
</div>
