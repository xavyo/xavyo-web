<script lang="ts">
	import type {
		NhiSodRule,
		NhiCertificationCampaign,
		AutoSuspendResult
	} from '$lib/api/types';
	import {
		fetchNhiSodRules,
		deleteNhiSodRuleClient,
		fetchNhiCertCampaigns
	} from '$lib/api/nhi-governance-client';
	import {
		grantGracePeriodClient,
		triggerAutoSuspend
	} from '$lib/api/nhi-governance-client';
	import { invalidateAll } from '$app/navigation';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import RiskSummaryCards from '$lib/components/nhi/risk-summary-cards.svelte';
	import InactiveEntitiesTable from '$lib/components/nhi/inactive-entities-table.svelte';
	import OrphanEntitiesTable from '$lib/components/nhi/orphan-entities-table.svelte';
	import NhiSodRulesTable from '$lib/components/nhi/nhi-sod-rules-table.svelte';
	import NhiCertCampaignTable from '$lib/components/nhi/nhi-cert-campaign-table.svelte';
	import { addToast } from '$lib/stores/toast.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const tabs = [
		{ id: 'risk', label: 'Risk Overview' },
		{ id: 'inactive', label: 'Inactive NHIs' },
		{ id: 'orphans', label: 'Orphaned NHIs' },
		{ id: 'sod', label: 'SoD Rules' },
		{ id: 'certifications', label: 'Certifications' }
	];

	let activeTab = $state('risk');

	// Server-loaded data — use $derived so navigation/invalidation updates reactively
	let riskSummary = $derived(data.riskSummary);
	let stalenessReport = $derived(data.stalenessReport);
	let orphanDetections = $derived(data.orphanDetections);
	let nhiNameMap = $derived(data.nhiNameMap);

	// Client-loaded data (SoD + Certifications)
	let sodRules: NhiSodRule[] = $state([]);
	let sodLoaded = $state(false);
	let sodLoading = $state(false);
	let certCampaigns: NhiCertificationCampaign[] = $state([]);
	let certLoaded = $state(false);
	let certLoading = $state(false);

	$effect(() => {
		if (activeTab === 'sod' && !sodLoaded && !sodLoading) {
			loadSodRules();
		}
	});

	$effect(() => {
		if (activeTab === 'certifications' && !certLoaded && !certLoading) {
			loadCertCampaigns();
		}
	});

	async function loadSodRules() {
		sodLoading = true;
		try {
			const result = await fetchNhiSodRules();
			sodRules = result.items;
			sodLoaded = true;
		} catch {
			addToast('error', 'Failed to load SoD rules');
		} finally {
			sodLoading = false;
		}
	}

	async function loadCertCampaigns() {
		certLoading = true;
		try {
			certCampaigns = await fetchNhiCertCampaigns();
			certLoaded = true;
		} catch {
			addToast('error', 'Failed to load certification campaigns');
		} finally {
			certLoading = false;
		}
	}

	async function handleDeleteSodRule(id: string) {
		try {
			await deleteNhiSodRuleClient(id);
			sodRules = sodRules.filter((r) => r.id !== id);
			addToast('success', 'SoD rule deleted');
		} catch {
			addToast('error', 'Failed to delete SoD rule');
		}
	}

	async function handleGrantGracePeriod(id: string, days: number) {
		try {
			await grantGracePeriodClient(id, days);
			addToast('success', 'Grace period granted');
			await invalidateAll();
		} catch {
			addToast('error', 'Failed to grant grace period');
		}
	}

	async function handleAutoSuspend() {
		try {
			const result: AutoSuspendResult = await triggerAutoSuspend();
			const count = result.suspended.length;
			const failed = result.failed.length;
			if (failed > 0) {
				addToast('error', `Suspended ${count}, failed ${failed}`);
			} else {
				addToast('success', `Suspended ${count} entities`);
			}
			await invalidateAll();
		} catch {
			addToast('error', 'Failed to auto-suspend');
		}
	}
</script>

<PageHeader title="NHI Governance" description="Risk scoring, inactivity detection, orphan detection, SoD rules, and certifications for non-human identities" />

<nav class="-mb-px flex gap-4 border-b border-border" role="tablist" aria-label="NHI Governance tabs">
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
</nav>

<div class="mt-6" role="tabpanel" id="tabpanel-{activeTab}" aria-labelledby="tab-{activeTab}">
	{#if activeTab === 'risk'}
		<RiskSummaryCards summary={riskSummary} />
	{:else if activeTab === 'inactive'}
		<InactiveEntitiesTable
			report={stalenessReport}
			onGrantGracePeriod={handleGrantGracePeriod}
			onAutoSuspend={handleAutoSuspend}
		/>
	{:else if activeTab === 'orphans'}
		<OrphanEntitiesTable detections={orphanDetections} />
	{:else if activeTab === 'sod'}
		{#if sodLoading}
			<div class="animate-pulse space-y-3">
				<div class="h-8 rounded bg-muted"></div>
				<div class="h-48 rounded bg-muted"></div>
			</div>
		{:else}
			<NhiSodRulesTable rules={sodRules} nameMap={nhiNameMap} onDelete={handleDeleteSodRule} />
		{/if}
	{:else if activeTab === 'certifications'}
		{#if certLoading}
			<div class="animate-pulse space-y-3">
				<div class="h-8 rounded bg-muted"></div>
				<div class="h-48 rounded bg-muted"></div>
			</div>
		{:else}
			<NhiCertCampaignTable campaigns={certCampaigns} />
		{/if}
	{/if}
</div>
