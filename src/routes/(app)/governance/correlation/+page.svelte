<script lang="ts">
	import type {
		CorrelationCase,
		CorrelationCaseStatus,
		IdentityCorrelationRule,
		CorrelationAuditEvent
	} from '$lib/api/types';
	import {
		fetchCorrelationCases,
		fetchIdentityCorrelationRules,
		fetchCorrelationAuditEvents,
		deleteIdentityCorrelationRuleClient
	} from '$lib/api/correlation-client';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import { addToast } from '$lib/stores/toast.svelte';
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const tabs = [
		{ id: 'cases', label: 'Cases' },
		{ id: 'identity-rules', label: 'Identity Rules' },
		{ id: 'audit', label: 'Audit' }
	] as const;

	type TabId = (typeof tabs)[number]['id'];

	let activeTab: TabId = $state('cases');

	// --- Cases tab state ---
	// svelte-ignore state_referenced_locally
	let cases: CorrelationCase[] = $state(data.cases);
	// svelte-ignore state_referenced_locally
	let casesTotal = $state(data.casesTotal);
	let casesStatusFilter: CorrelationCaseStatus | '' = $state('pending');
	let casesOffset = $state(0);
	let casesLoading = $state(false);
	const casesLimit = 50;

	// --- Identity Rules tab state ---
	// svelte-ignore state_referenced_locally
	let identityRules: IdentityCorrelationRule[] = $state(data.identityRules);
	// svelte-ignore state_referenced_locally
	let identityRulesTotal = $state(data.identityRulesTotal);
	let identityRulesOffset = $state(0);
	let identityRulesLoading = $state(false);
	const identityRulesLimit = 50;

	// --- Audit tab state ---
	// svelte-ignore state_referenced_locally
	let auditEvents: CorrelationAuditEvent[] = $state(data.auditEvents);
	// svelte-ignore state_referenced_locally
	let auditTotal = $state(data.auditTotal);
	let auditOffset = $state(0);
	let auditLoading = $state(false);
	const auditLimit = 50;

	// --- Cases helpers ---
	async function loadCases() {
		casesLoading = true;
		try {
			const result = await fetchCorrelationCases({
				status: casesStatusFilter || undefined,
				limit: casesLimit,
				offset: casesOffset
			});
			cases = result.items;
			casesTotal = result.total;
		} catch {
			addToast('error', 'Failed to load correlation cases');
		} finally {
			casesLoading = false;
		}
	}

	function handleCasesStatusChange(e: Event) {
		casesStatusFilter = (e.target as HTMLSelectElement).value as CorrelationCaseStatus | '';
		casesOffset = 0;
		loadCases();
	}

	function handleCasesPrev() {
		if (casesOffset <= 0) return;
		casesOffset = Math.max(0, casesOffset - casesLimit);
		loadCases();
	}

	function handleCasesNext() {
		if (casesOffset + casesLimit >= casesTotal) return;
		casesOffset += casesLimit;
		loadCases();
	}

	function navigateToCase(caseId: string) {
		goto(`/governance/correlation/cases/${caseId}`);
	}

	function caseStatusBadgeClass(status: string): string {
		switch (status) {
			case 'pending':
				return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
			case 'confirmed':
				return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
			case 'rejected':
				return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
			case 'identity_created':
				return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
			default:
				return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
		}
	}

	function triggerTypeBadgeClass(type: string): string {
		switch (type) {
			case 'import':
				return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
			case 'reconciliation':
				return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400';
			case 'manual':
				return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
			default:
				return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
		}
	}

	// --- Identity Rules helpers ---
	async function loadIdentityRules() {
		identityRulesLoading = true;
		try {
			const result = await fetchIdentityCorrelationRules({
				limit: identityRulesLimit,
				offset: identityRulesOffset
			});
			identityRules = result.items;
			identityRulesTotal = result.total;
		} catch {
			addToast('error', 'Failed to load identity correlation rules');
		} finally {
			identityRulesLoading = false;
		}
	}

	function handleIdentityRulesPrev() {
		if (identityRulesOffset <= 0) return;
		identityRulesOffset = Math.max(0, identityRulesOffset - identityRulesLimit);
		loadIdentityRules();
	}

	function handleIdentityRulesNext() {
		if (identityRulesOffset + identityRulesLimit >= identityRulesTotal) return;
		identityRulesOffset += identityRulesLimit;
		loadIdentityRules();
	}

	async function handleDeleteIdentityRule(ruleId: string) {
		try {
			await deleteIdentityCorrelationRuleClient(ruleId);
			identityRules = identityRules.filter((r) => r.id !== ruleId);
			identityRulesTotal = Math.max(0, identityRulesTotal - 1);
			addToast('success', 'Identity rule deleted');
		} catch {
			addToast('error', 'Failed to delete identity rule');
		}
	}

	// --- Audit helpers ---
	async function loadAuditEvents() {
		auditLoading = true;
		try {
			const result = await fetchCorrelationAuditEvents({
				limit: auditLimit,
				offset: auditOffset
			});
			auditEvents = result.items;
			auditTotal = result.total;
		} catch {
			addToast('error', 'Failed to load audit events');
		} finally {
			auditLoading = false;
		}
	}

	function handleAuditPrev() {
		if (auditOffset <= 0) return;
		auditOffset = Math.max(0, auditOffset - auditLimit);
		loadAuditEvents();
	}

	function handleAuditNext() {
		if (auditOffset + auditLimit >= auditTotal) return;
		auditOffset += auditLimit;
		loadAuditEvents();
	}

	function eventTypeBadgeClass(type: string): string {
		switch (type) {
			case 'auto_confirm':
				return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
			case 'manual_confirm':
				return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
			case 'reject':
				return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
			case 'create_identity':
				return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
			case 'reassign':
				return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
			default:
				return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
		}
	}

	function outcomeBadgeClass(outcome: string): string {
		return outcome === 'success'
			? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
			: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
	}

	function formatDate(dateStr: string): string {
		if (!dateStr || isNaN(new Date(dateStr).getTime())) return '—';
		return new Date(dateStr).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<PageHeader
	title="Identity Correlation"
	description="Review correlation cases, manage identity matching rules, and audit correlation decisions."
/>

<div class="-mb-px flex gap-4 border-b border-border" role="tablist" aria-label="Correlation tabs">
	{#each tabs as tab}
		<button
			role="tab"
			aria-selected={activeTab === tab.id}
			aria-controls="tabpanel-{tab.id}"
			id="tab-{tab.id}"
			class="border-b-2 px-1 py-3 text-sm font-medium transition-colors {activeTab === tab.id
				? 'border-primary text-primary'
				: 'border-transparent text-muted-foreground hover:border-muted-foreground/30 hover:text-foreground'}"
			onclick={() => (activeTab = tab.id)}
		>
			{tab.label}
		</button>
	{/each}
</div>

<div class="mt-6" role="tabpanel" id="tabpanel-{activeTab}" aria-labelledby="tab-{activeTab}">
	<!-- Cases Tab -->
	{#if activeTab === 'cases'}
		<div class="space-y-4">
			<!-- Filters -->
			<div class="flex items-center gap-3">
				<label for="case-status-filter" class="text-sm text-muted-foreground">Status:</label>
				<select
					id="case-status-filter"
					class="rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground"
					value={casesStatusFilter}
					onchange={handleCasesStatusChange}
				>
					<option value="">All</option>
					<option value="pending">Pending</option>
					<option value="confirmed">Confirmed</option>
					<option value="rejected">Rejected</option>
					<option value="identity_created">Identity Created</option>
				</select>
				<span class="ml-auto text-sm text-muted-foreground">{casesTotal} total</span>
			</div>

			<!-- Table -->
			{#if casesLoading}
				<div class="animate-pulse space-y-3">
					<div class="h-8 rounded bg-muted"></div>
					<div class="h-48 rounded bg-muted"></div>
				</div>
			{:else if cases.length === 0}
				<div class="rounded-lg border border-border p-8 text-center text-sm text-muted-foreground">
					No correlation cases found.
				</div>
			{:else}
				<div class="overflow-x-auto">
					<table class="w-full text-sm">
						<thead>
							<tr class="border-b border-border">
								<th class="py-2 pr-4 text-left font-medium text-muted-foreground"
									>Account</th
								>
								<th class="py-2 pr-4 text-left font-medium text-muted-foreground"
									>Connector</th
								>
								<th class="py-2 pr-4 text-left font-medium text-muted-foreground"
									>Trigger</th
								>
								<th class="py-2 pr-4 text-right font-medium text-muted-foreground"
									>Candidates</th
								>
								<th class="py-2 pr-4 text-right font-medium text-muted-foreground"
									>Confidence</th
								>
								<th class="py-2 pr-4 text-left font-medium text-muted-foreground">Status</th
								>
								<th class="py-2 text-left font-medium text-muted-foreground">Created</th>
							</tr>
						</thead>
						<tbody>
							{#each cases as caseItem}
								<tr
									class="cursor-pointer border-b border-border/50 hover:bg-muted/50"
									onclick={() => navigateToCase(caseItem.id)}
									onkeydown={(e) => {
										if (e.key === 'Enter') navigateToCase(caseItem.id);
									}}
									tabindex="0"
									role="link"
								>
									<td class="py-2 pr-4 font-medium text-foreground"
										>{caseItem.account_identifier}</td
									>
									<td class="py-2 pr-4 text-foreground">{caseItem.connector_name}</td>
									<td class="py-2 pr-4">
										<span
											class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium {triggerTypeBadgeClass(caseItem.trigger_type)}"
										>
											{caseItem.trigger_type}
										</span>
									</td>
									<td class="py-2 pr-4 text-right text-foreground"
										>{caseItem.candidate_count}</td
									>
									<td class="py-2 pr-4 text-right font-mono text-foreground">
										{Math.round(caseItem.highest_confidence * 100)}%
									</td>
									<td class="py-2 pr-4">
										<span
											class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium {caseStatusBadgeClass(caseItem.status)}"
										>
											{caseItem.status}
										</span>
									</td>
									<td class="py-2 text-muted-foreground"
										>{formatDate(caseItem.created_at)}</td
									>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>

				<!-- Pagination -->
				<div class="flex items-center justify-between">
					<span class="text-sm text-muted-foreground">
						Showing {casesOffset + 1} to {Math.min(casesOffset + casesLimit, casesTotal)} of {casesTotal}
					</span>
					<div class="flex gap-2">
						<button
							class="rounded-md border border-input px-3 py-1.5 text-sm text-foreground hover:bg-muted disabled:opacity-50"
							disabled={casesOffset <= 0}
							onclick={handleCasesPrev}
						>
							Previous
						</button>
						<button
							class="rounded-md border border-input px-3 py-1.5 text-sm text-foreground hover:bg-muted disabled:opacity-50"
							disabled={casesOffset + casesLimit >= casesTotal}
							onclick={handleCasesNext}
						>
							Next
						</button>
					</div>
				</div>
			{/if}
		</div>

		<!-- Identity Rules Tab -->
	{:else if activeTab === 'identity-rules'}
		<div class="space-y-4">
			<div class="flex items-center justify-between">
				<span class="text-sm text-muted-foreground"
					>{identityRulesTotal} rule{identityRulesTotal !== 1 ? 's' : ''}</span
				>
			</div>

			{#if identityRulesLoading}
				<div class="animate-pulse space-y-3">
					<div class="h-8 rounded bg-muted"></div>
					<div class="h-48 rounded bg-muted"></div>
				</div>
			{:else if identityRules.length === 0}
				<div class="rounded-lg border border-border p-8 text-center text-sm text-muted-foreground">
					No identity correlation rules configured.
				</div>
			{:else}
				<div class="overflow-x-auto">
					<table class="w-full text-sm">
						<thead>
							<tr class="border-b border-border">
								<th class="py-2 pr-4 text-left font-medium text-muted-foreground">Name</th>
								<th class="py-2 pr-4 text-left font-medium text-muted-foreground"
									>Attribute</th
								>
								<th class="py-2 pr-4 text-left font-medium text-muted-foreground"
									>Match Type</th
								>
								<th class="py-2 pr-4 text-left font-medium text-muted-foreground"
									>Algorithm</th
								>
								<th class="py-2 pr-4 text-right font-medium text-muted-foreground"
									>Threshold</th
								>
								<th class="py-2 pr-4 text-right font-medium text-muted-foreground">Weight</th
								>
								<th class="py-2 pr-4 text-right font-medium text-muted-foreground"
									>Priority</th
								>
								<th class="py-2 pr-4 text-left font-medium text-muted-foreground">Active</th
								>
								<th class="py-2 text-left font-medium text-muted-foreground">Actions</th>
							</tr>
						</thead>
						<tbody>
							{#each identityRules as rule}
								<tr class="border-b border-border/50">
									<td class="py-2 pr-4 font-medium text-foreground">{rule.name}</td>
									<td class="py-2 pr-4 text-foreground">{rule.attribute}</td>
									<td class="py-2 pr-4">
										<Badge variant="outline">{rule.match_type}</Badge>
									</td>
									<td class="py-2 pr-4 text-muted-foreground"
										>{rule.algorithm ?? '—'}</td
									>
									<td class="py-2 pr-4 text-right font-mono text-foreground"
										>{rule.threshold}</td
									>
									<td class="py-2 pr-4 text-right font-mono text-foreground"
										>{rule.weight}</td
									>
									<td class="py-2 pr-4 text-right text-foreground">{rule.priority}</td>
									<td class="py-2 pr-4">
										{#if rule.is_active}
											<span
												class="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400"
												>Active</span
											>
										{:else}
											<span
												class="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
												>Inactive</span
											>
										{/if}
									</td>
									<td class="py-2">
										<button
											class="text-sm text-destructive hover:text-destructive/80"
											onclick={() => handleDeleteIdentityRule(rule.id)}
										>
											Delete
										</button>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>

				<!-- Pagination -->
				{#if identityRulesTotal > identityRulesLimit}
					<div class="flex items-center justify-between">
						<span class="text-sm text-muted-foreground">
							Showing {identityRulesOffset + 1} to {Math.min(identityRulesOffset + identityRulesLimit, identityRulesTotal)} of {identityRulesTotal}
						</span>
						<div class="flex gap-2">
							<button
								class="rounded-md border border-input px-3 py-1.5 text-sm text-foreground hover:bg-muted disabled:opacity-50"
								disabled={identityRulesOffset <= 0}
								onclick={handleIdentityRulesPrev}
							>
								Previous
							</button>
							<button
								class="rounded-md border border-input px-3 py-1.5 text-sm text-foreground hover:bg-muted disabled:opacity-50"
								disabled={identityRulesOffset + identityRulesLimit >= identityRulesTotal}
								onclick={handleIdentityRulesNext}
							>
								Next
							</button>
						</div>
					</div>
				{/if}
			{/if}
		</div>

		<!-- Audit Tab -->
	{:else if activeTab === 'audit'}
		<div class="space-y-4">
			<div class="flex items-center justify-between">
				<span class="text-sm text-muted-foreground"
					>{auditTotal} event{auditTotal !== 1 ? 's' : ''}</span
				>
			</div>

			{#if auditLoading}
				<div class="animate-pulse space-y-3">
					<div class="h-8 rounded bg-muted"></div>
					<div class="h-48 rounded bg-muted"></div>
				</div>
			{:else if auditEvents.length === 0}
				<div class="rounded-lg border border-border p-8 text-center text-sm text-muted-foreground">
					No audit events found.
				</div>
			{:else}
				<div class="overflow-x-auto">
					<table class="w-full text-sm">
						<thead>
							<tr class="border-b border-border">
								<th class="py-2 pr-4 text-left font-medium text-muted-foreground">Event</th
								>
								<th class="py-2 pr-4 text-left font-medium text-muted-foreground"
									>Outcome</th
								>
								<th class="py-2 pr-4 text-right font-medium text-muted-foreground"
									>Confidence</th
								>
								<th class="py-2 pr-4 text-right font-medium text-muted-foreground"
									>Candidates</th
								>
								<th class="py-2 pr-4 text-left font-medium text-muted-foreground"
									>Actor Type</th
								>
								<th class="py-2 pr-4 text-left font-medium text-muted-foreground">Reason</th
								>
								<th class="py-2 text-left font-medium text-muted-foreground">Date</th>
							</tr>
						</thead>
						<tbody>
							{#each auditEvents as event}
								<tr class="border-b border-border/50">
									<td class="py-2 pr-4">
										<span
											class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium {eventTypeBadgeClass(event.event_type)}"
										>
											{event.event_type.replace(/_/g, ' ')}
										</span>
									</td>
									<td class="py-2 pr-4">
										<span
											class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium {outcomeBadgeClass(event.outcome)}"
										>
											{event.outcome}
										</span>
									</td>
									<td class="py-2 pr-4 text-right font-mono text-foreground">
										{Math.round(event.confidence_score * 100)}%
									</td>
									<td class="py-2 pr-4 text-right text-foreground"
										>{event.candidate_count}</td
									>
									<td class="py-2 pr-4 text-foreground">{event.actor_type}</td>
									<td class="max-w-48 truncate py-2 pr-4 text-muted-foreground"
										>{event.reason ?? '—'}</td
									>
									<td class="py-2 text-muted-foreground"
										>{formatDate(event.created_at)}</td
									>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>

				<!-- Pagination -->
				{#if auditTotal > auditLimit}
					<div class="flex items-center justify-between">
						<span class="text-sm text-muted-foreground">
							Showing {auditOffset + 1} to {Math.min(auditOffset + auditLimit, auditTotal)} of {auditTotal}
						</span>
						<div class="flex gap-2">
							<button
								class="rounded-md border border-input px-3 py-1.5 text-sm text-foreground hover:bg-muted disabled:opacity-50"
								disabled={auditOffset <= 0}
								onclick={handleAuditPrev}
							>
								Previous
							</button>
							<button
								class="rounded-md border border-input px-3 py-1.5 text-sm text-foreground hover:bg-muted disabled:opacity-50"
								disabled={auditOffset + auditLimit >= auditTotal}
								onclick={handleAuditNext}
							>
								Next
							</button>
						</div>
					</div>
				{/if}
			{/if}
		</div>
	{/if}
</div>
