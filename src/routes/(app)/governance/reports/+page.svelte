<script lang="ts">
	import type { ReportTemplate, GeneratedReport, ReportSchedule } from '$lib/api/types';
	import { fetchTemplates, fetchReports, fetchSchedules } from '$lib/api/governance-reporting-client';
	import { addToast } from '$lib/stores/toast.svelte';
	import ReportTemplatesTab from '$lib/components/governance/report-templates-tab.svelte';
	import GeneratedReportsTab from '$lib/components/governance/generated-reports-tab.svelte';
	import ReportSchedulesTab from '$lib/components/governance/report-schedules-tab.svelte';

	const tabs = [
		{ id: 'templates', label: 'Templates' },
		{ id: 'reports', label: 'Generated Reports' },
		{ id: 'schedules', label: 'Schedules' }
	];

	let activeTab: string = $state('templates');

	// Templates state
	let templates: ReportTemplate[] = $state([]);
	let templatesLoading: boolean = $state(false);

	// Reports state
	let reports: GeneratedReport[] = $state([]);
	let reportsLoading: boolean = $state(false);
	let reportStatusFilter: string = $state('');

	// Schedules state
	let schedules: ReportSchedule[] = $state([]);
	let schedulesLoading: boolean = $state(false);

	async function loadTemplates() {
		templatesLoading = true;
		try {
			const result = await fetchTemplates({ limit: 100 });
			templates = result.items;
		} catch {
			addToast('error', 'Failed to load templates');
		} finally {
			templatesLoading = false;
		}
	}

	async function loadReports() {
		reportsLoading = true;
		try {
			const params: Record<string, string | number> = { limit: 100 };
			if (reportStatusFilter) params.status = reportStatusFilter;
			const result = await fetchReports(params);
			reports = result.items;
		} catch {
			addToast('error', 'Failed to load reports');
		} finally {
			reportsLoading = false;
		}
	}

	async function loadSchedules() {
		schedulesLoading = true;
		try {
			const result = await fetchSchedules({ limit: 100 });
			schedules = result.items;
		} catch {
			addToast('error', 'Failed to load schedules');
		} finally {
			schedulesLoading = false;
		}
	}

	function handleTabChange(tabId: string) {
		activeTab = tabId;
		if (tabId === 'templates') loadTemplates();
		if (tabId === 'reports') loadReports();
		if (tabId === 'schedules') loadSchedules();
	}

	function handleStatusFilterChange(status: string) {
		reportStatusFilter = status;
		loadReports();
	}

	// Load initial tab data
	$effect(() => {
		loadTemplates();
	});
</script>

<div class="space-y-6 p-6">
	<div>
		<h1 class="text-2xl font-bold tracking-tight">Governance Reports</h1>
		<p class="text-sm text-muted-foreground">
			Generate compliance reports, manage templates, and configure automated schedules.
		</p>
	</div>

	<div class="border-b border-border">
		<nav class="-mb-px flex space-x-8" aria-label="Tabs">
			{#each tabs as tab}
				<button
					type="button"
					class="whitespace-nowrap border-b-2 px-1 py-3 text-sm font-medium transition-colors {activeTab === tab.id
						? 'border-primary text-primary'
						: 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'}"
					onclick={() => handleTabChange(tab.id)}
				>
					{tab.label}
				</button>
			{/each}
		</nav>
	</div>

	<div>
		{#if activeTab === 'templates'}
			<ReportTemplatesTab {templates} loading={templatesLoading} />
		{:else if activeTab === 'reports'}
			<GeneratedReportsTab
				{reports}
				loading={reportsLoading}
				statusFilter={reportStatusFilter}
				onStatusFilterChange={handleStatusFilterChange}
				onRefresh={loadReports}
			/>
		{:else if activeTab === 'schedules'}
			<ReportSchedulesTab {schedules} loading={schedulesLoading} onRefresh={loadSchedules} />
		{/if}
	</div>
</div>
