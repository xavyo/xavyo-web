<script lang="ts">
	import { createColumnHelper } from '@tanstack/table-core';
	import type { ColumnDef } from '@tanstack/table-core';
	import { renderComponent } from '@tanstack/svelte-table';
	import type { PaginationState, Updater } from '@tanstack/svelte-table';
	import DataTable from '$lib/components/data-table/data-table.svelte';
	import ResultLink from './result-link.svelte';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import { EmptyState } from '$lib/components/ui/empty-state';
	import { addToast } from '$lib/stores/toast.svelte';
	import type {
		OutlierAnalysis,
		OutlierResult,
		OutlierSummary,
		OutlierDisposition,
		DispositionSummary,
		OutlierAlert,
		AlertSummary,
		OutlierConfig
	} from '$lib/api/types';

	const tabs = [
		{ id: 'summary', label: 'Summary' },
		{ id: 'analyses', label: 'Analyses' },
		{ id: 'results', label: 'Results' },
		{ id: 'alerts', label: 'Alerts' },
		{ id: 'dispositions', label: 'Dispositions' },
		{ id: 'config', label: 'Config' }
	];

	let activeTab: string = $state('summary');

	// === Summary tab ===
	let summary: OutlierSummary | null = $state(null);
	let summaryLoading: boolean = $state(false);
	let alertSummary: AlertSummary | null = $state(null);
	let dispositionSummary: DispositionSummary | null = $state(null);

	async function fetchSummary() {
		summaryLoading = true;
		try {
			const [sumRes, alertRes, dispRes] = await Promise.all([
				fetch('/api/governance/outliers/summary'),
				fetch('/api/governance/outliers/alerts/summary'),
				fetch('/api/governance/outliers/dispositions/summary')
			]);
			if (sumRes.ok) summary = await sumRes.json();
			if (alertRes.ok) alertSummary = await alertRes.json();
			if (dispRes.ok) dispositionSummary = await dispRes.json();
		} catch {
			addToast('error', 'Failed to load summary');
		} finally {
			summaryLoading = false;
		}
	}

	// === Analyses tab ===
	const analysisColumnHelper = createColumnHelper<OutlierAnalysis>();
	const analysisColumns = [
		analysisColumnHelper.accessor('status', {
			header: 'Status',
			cell: (info) => {
				const status = info.getValue();
				const colors: Record<string, string> = {
					pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
					running: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
					completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
					failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
				};
				return `<span class="inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${colors[status] ?? ''}">${status}</span>`;
			}
		}),
		analysisColumnHelper.accessor('triggered_by', {
			header: 'Trigger',
			cell: (info) => info.getValue()
		}),
		analysisColumnHelper.accessor('users_analyzed', {
			header: 'Users Analyzed',
			cell: (info) => String(info.getValue())
		}),
		analysisColumnHelper.accessor('outliers_detected', {
			header: 'Outliers',
			cell: (info) => String(info.getValue())
		}),
		analysisColumnHelper.accessor('created_at', {
			header: 'Started',
			cell: (info) => new Date(info.getValue()).toLocaleString()
		})
	] as ColumnDef<OutlierAnalysis>[];

	let analysisData: OutlierAnalysis[] = $state([]);
	let analysisPageCount: number = $state(0);
	let analysisPagination: PaginationState = $state({ pageIndex: 0, pageSize: 20 });
	let analysisLoading: boolean = $state(false);
	let analysisStatusFilter: string = $state('');
	let triggeringAnalysis: boolean = $state(false);

	const analysisStatusOptions = [
		{ value: '', label: 'All statuses' },
		{ value: 'pending', label: 'Pending' },
		{ value: 'running', label: 'Running' },
		{ value: 'completed', label: 'Completed' },
		{ value: 'failed', label: 'Failed' }
	];

	async function fetchAnalyses() {
		analysisLoading = true;
		try {
			const params = new URLSearchParams({
				offset: String(analysisPagination.pageIndex * analysisPagination.pageSize),
				limit: String(analysisPagination.pageSize)
			});
			if (analysisStatusFilter) params.set('status', analysisStatusFilter);
			const res = await fetch(`/api/governance/outliers/analyses?${params}`);
			if (!res.ok) throw new Error('Failed to fetch');
			const result = await res.json();
			analysisData = result.items;
			analysisPageCount = Math.ceil(result.total / analysisPagination.pageSize);
		} catch {
			addToast('error', 'Failed to load analyses');
		} finally {
			analysisLoading = false;
		}
	}

	async function triggerAnalysis() {
		triggeringAnalysis = true;
		try {
			const res = await fetch('/api/governance/outliers/analyses', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ triggered_by: 'manual' })
			});
			if (!res.ok) {
				const err = await res.json().catch(() => null);
				throw new Error(err?.message || `Failed: ${res.status}`);
			}
			addToast('success', 'Analysis triggered successfully');
			fetchAnalyses();
		} catch (e) {
			addToast('error', e instanceof Error ? e.message : 'Failed to trigger analysis');
		} finally {
			triggeringAnalysis = false;
		}
	}

	function handleAnalysisPaginationChange(updater: Updater<PaginationState>) {
		analysisPagination = typeof updater === 'function' ? updater(analysisPagination) : updater;
	}

	// === Results tab ===
	const resultColumnHelper = createColumnHelper<OutlierResult>();
	const resultColumns = [
		resultColumnHelper.accessor('user_id', {
			header: 'User',
			cell: (info) =>
				renderComponent(ResultLink, { userId: info.getValue(), id: info.row.original.id })
		}),
		resultColumnHelper.accessor('overall_score', {
			header: 'Score',
			cell: (info) => {
				const score = info.getValue();
				const color = score >= 80 ? 'text-red-600 dark:text-red-400' : score >= 60 ? 'text-orange-600 dark:text-orange-400' : score >= 40 ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400';
				return `<span class="font-semibold ${color}">${score.toFixed(1)}</span>`;
			}
		}),
		resultColumnHelper.accessor('classification', {
			header: 'Classification',
			cell: (info) => {
				const c = info.getValue();
				const colors: Record<string, string> = {
					outlier: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
					normal: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
					unclassifiable: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
				};
				return `<span class="inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${colors[c] ?? ''}">${c}</span>`;
			}
		}),
		resultColumnHelper.accessor('peer_scores', {
			header: 'Peer Groups',
			cell: (info) => String(info.getValue().length)
		}),
		resultColumnHelper.accessor('score_change', {
			header: 'Change',
			cell: (info) => {
				const change = info.getValue();
				if (change === null) return '\u2014';
				const sign = change > 0 ? '+' : '';
				const color = change > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400';
				return `<span class="${color}">${sign}${change.toFixed(1)}</span>`;
			}
		}),
		resultColumnHelper.accessor('created_at', {
			header: 'Date',
			cell: (info) => new Date(info.getValue()).toLocaleDateString()
		})
	] as ColumnDef<OutlierResult>[];

	let resultData: OutlierResult[] = $state([]);
	let resultPageCount: number = $state(0);
	let resultPagination: PaginationState = $state({ pageIndex: 0, pageSize: 20 });
	let resultLoading: boolean = $state(false);
	let minScoreFilter: string = $state('');
	let classificationFilter: string = $state('');

	const classificationOptions = [
		{ value: '', label: 'All classifications' },
		{ value: 'outlier', label: 'Outlier' },
		{ value: 'normal', label: 'Normal' },
		{ value: 'unclassifiable', label: 'Unclassifiable' }
	];

	async function fetchResults() {
		resultLoading = true;
		try {
			const params = new URLSearchParams({
				offset: String(resultPagination.pageIndex * resultPagination.pageSize),
				limit: String(resultPagination.pageSize)
			});
			if (minScoreFilter) params.set('min_score', minScoreFilter);
			if (classificationFilter) params.set('classification', classificationFilter);
			const res = await fetch(`/api/governance/outliers/results?${params}`);
			if (!res.ok) throw new Error('Failed to fetch');
			const result = await res.json();
			resultData = result.items;
			resultPageCount = Math.ceil(result.total / resultPagination.pageSize);
		} catch {
			addToast('error', 'Failed to load results');
		} finally {
			resultLoading = false;
		}
	}

	function handleResultPaginationChange(updater: Updater<PaginationState>) {
		resultPagination = typeof updater === 'function' ? updater(resultPagination) : updater;
	}

	// === Alerts tab ===
	const alertColumnHelper = createColumnHelper<OutlierAlert>();
	const alertColumns = [
		alertColumnHelper.accessor('severity', {
			header: 'Severity',
			cell: (info) => {
				const sev = info.getValue();
				const colors: Record<string, string> = {
					critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
					high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
					medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
					low: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
				};
				return `<span class="inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${colors[sev] ?? ''}">${sev}</span>`;
			}
		}),
		alertColumnHelper.accessor('alert_type', {
			header: 'Type',
			cell: (info) => {
				const labels: Record<string, string> = {
					new_outlier: 'New Outlier',
					score_increase: 'Score Increase',
					repeated_outlier: 'Repeated Outlier'
				};
				return labels[info.getValue()] ?? info.getValue();
			}
		}),
		alertColumnHelper.accessor('user_id', {
			header: 'User',
			cell: (info) => info.getValue().substring(0, 8) + '...'
		}),
		alertColumnHelper.accessor('score', {
			header: 'Score',
			cell: (info) => info.getValue().toFixed(1)
		}),
		alertColumnHelper.accessor('is_read', {
			header: 'Read',
			cell: (info) => info.getValue() ? 'Yes' : 'No'
		}),
		alertColumnHelper.accessor('created_at', {
			header: 'Date',
			cell: (info) => new Date(info.getValue()).toLocaleString()
		})
	] as ColumnDef<OutlierAlert>[];

	let alertData: OutlierAlert[] = $state([]);
	let alertPageCount: number = $state(0);
	let alertPagination: PaginationState = $state({ pageIndex: 0, pageSize: 20 });
	let alertLoading: boolean = $state(false);
	let alertSeverityFilter: string = $state('');

	const severityOptions = [
		{ value: '', label: 'All severities' },
		{ value: 'critical', label: 'Critical' },
		{ value: 'high', label: 'High' },
		{ value: 'medium', label: 'Medium' },
		{ value: 'low', label: 'Low' }
	];

	async function fetchAlerts() {
		alertLoading = true;
		try {
			const params = new URLSearchParams({
				offset: String(alertPagination.pageIndex * alertPagination.pageSize),
				limit: String(alertPagination.pageSize)
			});
			if (alertSeverityFilter) params.set('severity', alertSeverityFilter);
			const res = await fetch(`/api/governance/outliers/alerts?${params}`);
			if (!res.ok) throw new Error('Failed to fetch');
			const result = await res.json();
			alertData = result.items;
			alertPageCount = Math.ceil(result.total / alertPagination.pageSize);
		} catch {
			addToast('error', 'Failed to load alerts');
		} finally {
			alertLoading = false;
		}
	}

	function handleAlertPaginationChange(updater: Updater<PaginationState>) {
		alertPagination = typeof updater === 'function' ? updater(alertPagination) : updater;
	}

	// === Dispositions tab ===
	const dispColumnHelper = createColumnHelper<OutlierDisposition>();
	const dispColumns = [
		dispColumnHelper.accessor('status', {
			header: 'Status',
			cell: (info) => {
				const s = info.getValue();
				const labels: Record<string, string> = {
					new: 'New',
					legitimate: 'Legitimate',
					requires_remediation: 'Requires Remediation',
					under_investigation: 'Under Investigation',
					remediated: 'Remediated'
				};
				const colors: Record<string, string> = {
					new: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
					legitimate: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
					requires_remediation: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
					under_investigation: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
					remediated: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
				};
				return `<span class="inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${colors[s] ?? ''}">${labels[s] ?? s}</span>`;
			}
		}),
		dispColumnHelper.accessor('user_id', {
			header: 'User',
			cell: (info) => info.getValue().substring(0, 8) + '...'
		}),
		dispColumnHelper.accessor('justification', {
			header: 'Justification',
			cell: (info) => {
				const val = info.getValue();
				if (!val) return '\u2014';
				return val.length > 50 ? val.substring(0, 50) + '...' : val;
			}
		}),
		dispColumnHelper.accessor('reviewed_at', {
			header: 'Reviewed',
			cell: (info) => {
				const val = info.getValue();
				return val ? new Date(val).toLocaleDateString() : '\u2014';
			}
		}),
		dispColumnHelper.accessor('created_at', {
			header: 'Created',
			cell: (info) => new Date(info.getValue()).toLocaleDateString()
		})
	] as ColumnDef<OutlierDisposition>[];

	let dispData: OutlierDisposition[] = $state([]);
	let dispPageCount: number = $state(0);
	let dispPagination: PaginationState = $state({ pageIndex: 0, pageSize: 20 });
	let dispLoading: boolean = $state(false);
	let dispStatusFilter: string = $state('');

	const dispStatusOptions = [
		{ value: '', label: 'All statuses' },
		{ value: 'new', label: 'New' },
		{ value: 'legitimate', label: 'Legitimate' },
		{ value: 'requires_remediation', label: 'Requires Remediation' },
		{ value: 'under_investigation', label: 'Under Investigation' },
		{ value: 'remediated', label: 'Remediated' }
	];

	async function fetchDispositions() {
		dispLoading = true;
		try {
			const params = new URLSearchParams({
				offset: String(dispPagination.pageIndex * dispPagination.pageSize),
				limit: String(dispPagination.pageSize)
			});
			if (dispStatusFilter) params.set('status', dispStatusFilter);
			const res = await fetch(`/api/governance/outliers/dispositions?${params}`);
			if (!res.ok) throw new Error('Failed to fetch');
			const result = await res.json();
			dispData = result.items;
			dispPageCount = Math.ceil(result.total / dispPagination.pageSize);
		} catch {
			addToast('error', 'Failed to load dispositions');
		} finally {
			dispLoading = false;
		}
	}

	function handleDispPaginationChange(updater: Updater<PaginationState>) {
		dispPagination = typeof updater === 'function' ? updater(dispPagination) : updater;
	}

	// === Config tab ===
	let config: OutlierConfig | null = $state(null);
	let configLoading: boolean = $state(false);
	let togglingConfig: boolean = $state(false);
	let savingConfig: boolean = $state(false);

	// Editable fields
	let editConfidenceThreshold: string = $state('');
	let editFrequencyThreshold: string = $state('');
	let editMinPeerGroupSize: string = $state('');
	let editRetentionDays: string = $state('');
	let editScheduleCron: string = $state('');

	async function fetchConfig() {
		configLoading = true;
		try {
			const res = await fetch('/api/governance/outliers/config');
			if (!res.ok) throw new Error('Failed to fetch');
			config = await res.json();
			if (config) {
				editConfidenceThreshold = String(config.confidence_threshold);
				editFrequencyThreshold = String(config.frequency_threshold);
				editMinPeerGroupSize = String(config.min_peer_group_size);
				editRetentionDays = String(config.retention_days);
				editScheduleCron = config.schedule_cron;
			}
		} catch {
			addToast('error', 'Failed to load config');
		} finally {
			configLoading = false;
		}
	}

	async function toggleDetection() {
		if (!config) return;
		togglingConfig = true;
		try {
			const endpoint = config.is_enabled ? '/api/governance/outliers/config/disable' : '/api/governance/outliers/config/enable';
			const res = await fetch(endpoint, { method: 'POST' });
			if (!res.ok) throw new Error('Failed');
			config = await res.json();
			addToast('success', config?.is_enabled ? 'Detection enabled' : 'Detection disabled');
		} catch {
			addToast('error', 'Failed to toggle detection');
		} finally {
			togglingConfig = false;
		}
	}

	async function saveConfig() {
		savingConfig = true;
		try {
			const body = {
				confidence_threshold: Number(editConfidenceThreshold),
				frequency_threshold: Number(editFrequencyThreshold),
				min_peer_group_size: Number(editMinPeerGroupSize),
				retention_days: Number(editRetentionDays),
				schedule_cron: editScheduleCron
			};
			const res = await fetch('/api/governance/outliers/config', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			if (!res.ok) throw new Error('Failed');
			config = await res.json();
			addToast('success', 'Configuration saved');
		} catch {
			addToast('error', 'Failed to save config');
		} finally {
			savingConfig = false;
		}
	}

	// === Reactive data fetching ===
	$effect(() => {
		if (activeTab === 'summary') {
			fetchSummary();
		}
	});

	$effect(() => {
		if (activeTab === 'analyses') {
			void analysisPagination;
			void analysisStatusFilter;
			fetchAnalyses();
		}
	});

	$effect(() => {
		if (activeTab === 'results') {
			void resultPagination;
			void minScoreFilter;
			void classificationFilter;
			fetchResults();
		}
	});

	$effect(() => {
		if (activeTab === 'alerts') {
			void alertPagination;
			void alertSeverityFilter;
			fetchAlerts();
		}
	});

	$effect(() => {
		if (activeTab === 'dispositions') {
			void dispPagination;
			void dispStatusFilter;
			fetchDispositions();
		}
	});

	$effect(() => {
		if (activeTab === 'config') {
			fetchConfig();
		}
	});
</script>

<div class="flex items-center justify-between">
	<PageHeader
		title="Outlier Detection"
		description="Detect users with anomalous entitlement assignments compared to their peers"
	/>
</div>

<!-- Tab navigation -->
<div class="border-b border-border">
	<nav class="-mb-px flex gap-4" aria-label="Tabs">
		{#each tabs as tab}
			<button
				class="border-b-2 px-1 py-3 text-sm font-medium transition-colors {activeTab === tab.id
					? 'border-primary text-primary'
					: 'border-transparent text-muted-foreground hover:border-muted-foreground/30 hover:text-foreground'}"
				onclick={() => (activeTab = tab.id)}
			>
				{tab.label}
			</button>
		{/each}
	</nav>
</div>

<!-- Tab content -->
<div class="mt-4">
	{#if activeTab === 'summary'}
		{#if summaryLoading}
			<div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
				{#each Array(4) as _}
					<div class="h-24 animate-pulse rounded-lg bg-muted"></div>
				{/each}
			</div>
		{:else if summary}
			<div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
				<div class="rounded-lg border border-border bg-card p-4">
					<p class="text-sm text-muted-foreground">Total Users Analyzed</p>
					<p class="text-2xl font-bold">{summary.total_users}</p>
				</div>
				<div class="rounded-lg border border-border bg-card p-4">
					<p class="text-sm text-muted-foreground">Outliers Detected</p>
					<p class="text-2xl font-bold text-red-600 dark:text-red-400">{summary.outlier_count}</p>
				</div>
				<div class="rounded-lg border border-border bg-card p-4">
					<p class="text-sm text-muted-foreground">Average Score</p>
					<p class="text-2xl font-bold">{summary.avg_score.toFixed(1)}</p>
				</div>
				<div class="rounded-lg border border-border bg-card p-4">
					<p class="text-sm text-muted-foreground">Max Score</p>
					<p class="text-2xl font-bold text-orange-600 dark:text-orange-400">{summary.max_score.toFixed(1)}</p>
				</div>
			</div>

			{#if alertSummary}
				<h3 class="mb-3 mt-6 text-lg font-semibold">Alert Summary</h3>
				<div class="grid grid-cols-2 gap-4 sm:grid-cols-5">
					<div class="rounded-lg border border-border bg-card p-4">
						<p class="text-sm text-muted-foreground">Total Alerts</p>
						<p class="text-xl font-bold">{alertSummary.total_count}</p>
					</div>
					<div class="rounded-lg border border-border bg-card p-4">
						<p class="text-sm text-muted-foreground">Unread</p>
						<p class="text-xl font-bold text-blue-600 dark:text-blue-400">{alertSummary.unread_count}</p>
					</div>
					<div class="rounded-lg border border-border bg-card p-4">
						<p class="text-sm text-muted-foreground">Critical</p>
						<p class="text-xl font-bold text-red-600 dark:text-red-400">{alertSummary.critical_count}</p>
					</div>
					<div class="rounded-lg border border-border bg-card p-4">
						<p class="text-sm text-muted-foreground">High</p>
						<p class="text-xl font-bold text-orange-600 dark:text-orange-400">{alertSummary.high_count}</p>
					</div>
					<div class="rounded-lg border border-border bg-card p-4">
						<p class="text-sm text-muted-foreground">Medium</p>
						<p class="text-xl font-bold text-yellow-600 dark:text-yellow-400">{alertSummary.medium_count}</p>
					</div>
				</div>
			{/if}

			{#if dispositionSummary}
				<h3 class="mb-3 mt-6 text-lg font-semibold">Disposition Summary</h3>
				<div class="grid grid-cols-2 gap-4 sm:grid-cols-5">
					<div class="rounded-lg border border-border bg-card p-4">
						<p class="text-sm text-muted-foreground">New</p>
						<p class="text-xl font-bold text-blue-600 dark:text-blue-400">{dispositionSummary.new_count}</p>
					</div>
					<div class="rounded-lg border border-border bg-card p-4">
						<p class="text-sm text-muted-foreground">Legitimate</p>
						<p class="text-xl font-bold text-green-600 dark:text-green-400">{dispositionSummary.legitimate_count}</p>
					</div>
					<div class="rounded-lg border border-border bg-card p-4">
						<p class="text-sm text-muted-foreground">Needs Remediation</p>
						<p class="text-xl font-bold text-red-600 dark:text-red-400">{dispositionSummary.requires_remediation_count}</p>
					</div>
					<div class="rounded-lg border border-border bg-card p-4">
						<p class="text-sm text-muted-foreground">Investigating</p>
						<p class="text-xl font-bold text-yellow-600 dark:text-yellow-400">{dispositionSummary.under_investigation_count}</p>
					</div>
					<div class="rounded-lg border border-border bg-card p-4">
						<p class="text-sm text-muted-foreground">Remediated</p>
						<p class="text-xl font-bold text-gray-600 dark:text-gray-400">{dispositionSummary.remediated_count}</p>
					</div>
				</div>
			{/if}

			{#if summary.analysis_completed_at}
				<p class="mt-4 text-sm text-muted-foreground">
					Last analysis completed: {new Date(summary.analysis_completed_at).toLocaleString()}
				</p>
			{/if}
		{:else}
			<EmptyState
				title="No outlier data yet"
				description="Run your first outlier detection analysis to see results here."
				icon="search"
			/>
		{/if}

	{:else if activeTab === 'analyses'}
		<div class="mb-4 flex items-center justify-between">
			<div class="flex gap-3">
				<select
					class="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
					bind:value={analysisStatusFilter}
					onchange={() => { analysisPagination = { ...analysisPagination, pageIndex: 0 }; }}
				>
					{#each analysisStatusOptions as opt}
						<option value={opt.value}>{opt.label}</option>
					{/each}
				</select>
			</div>
			<button
				class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
				onclick={triggerAnalysis}
				disabled={triggeringAnalysis}
			>
				{triggeringAnalysis ? 'Triggering...' : 'New Analysis'}
			</button>
		</div>

		{#snippet analysisEmptyState()}
			<EmptyState title="No analyses yet" description="Trigger your first outlier detection analysis." icon="search" />
		{/snippet}

		<DataTable columns={analysisColumns} data={analysisData} pageCount={analysisPageCount} pagination={analysisPagination} onPaginationChange={handleAnalysisPaginationChange} isLoading={analysisLoading} emptyState={analysisEmptyState} />

	{:else if activeTab === 'results'}
		<div class="mb-4 flex items-center gap-3">
			<select
				class="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
				bind:value={classificationFilter}
				onchange={() => { resultPagination = { ...resultPagination, pageIndex: 0 }; }}
			>
				{#each classificationOptions as opt}
					<option value={opt.value}>{opt.label}</option>
				{/each}
			</select>
			<input
				type="number"
				placeholder="Min score"
				class="w-32 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
				bind:value={minScoreFilter}
				onchange={() => { resultPagination = { ...resultPagination, pageIndex: 0 }; }}
			/>
		</div>

		{#snippet resultEmptyState()}
			<EmptyState title="No outlier results" description="Run an analysis to detect outliers." icon="search" />
		{/snippet}

		<DataTable columns={resultColumns} data={resultData} pageCount={resultPageCount} pagination={resultPagination} onPaginationChange={handleResultPaginationChange} isLoading={resultLoading} emptyState={resultEmptyState} />

	{:else if activeTab === 'alerts'}
		<div class="mb-4 flex gap-3">
			<select
				class="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
				bind:value={alertSeverityFilter}
				onchange={() => { alertPagination = { ...alertPagination, pageIndex: 0 }; }}
			>
				{#each severityOptions as opt}
					<option value={opt.value}>{opt.label}</option>
				{/each}
			</select>
		</div>

		{#snippet alertEmptyState()}
			<EmptyState title="No alerts" description="Alerts will appear when outliers are detected." icon="bell" />
		{/snippet}

		<DataTable columns={alertColumns} data={alertData} pageCount={alertPageCount} pagination={alertPagination} onPaginationChange={handleAlertPaginationChange} isLoading={alertLoading} emptyState={alertEmptyState} />

	{:else if activeTab === 'dispositions'}
		<div class="mb-4 flex gap-3">
			<select
				class="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
				bind:value={dispStatusFilter}
				onchange={() => { dispPagination = { ...dispPagination, pageIndex: 0 }; }}
			>
				{#each dispStatusOptions as opt}
					<option value={opt.value}>{opt.label}</option>
				{/each}
			</select>
		</div>

		{#snippet dispEmptyState()}
			<EmptyState title="No dispositions" description="Dispositions track admin decisions on outlier findings." icon="clipboard" />
		{/snippet}

		<DataTable columns={dispColumns} data={dispData} pageCount={dispPageCount} pagination={dispPagination} onPaginationChange={handleDispPaginationChange} isLoading={dispLoading} emptyState={dispEmptyState} />

	{:else if activeTab === 'config'}
		{#if configLoading}
			<div class="space-y-4">
				{#each Array(5) as _}
					<div class="h-12 animate-pulse rounded-lg bg-muted"></div>
				{/each}
			</div>
		{:else if config}
			<div class="max-w-2xl space-y-6">
				<div class="flex items-center justify-between rounded-lg border border-border bg-card p-4">
					<div>
						<h3 class="font-semibold">Detection Status</h3>
						<p class="text-sm text-muted-foreground">
							{config.is_enabled ? 'Outlier detection is currently enabled' : 'Outlier detection is currently disabled'}
						</p>
					</div>
					<div class="flex items-center gap-3">
						<span class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium {config.is_enabled ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}">
							{config.is_enabled ? 'Enabled' : 'Disabled'}
						</span>
						<button
							class="rounded-md px-3 py-1.5 text-sm font-medium {config.is_enabled ? 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400'} disabled:opacity-50"
							onclick={toggleDetection}
							disabled={togglingConfig}
						>
							{config.is_enabled ? 'Disable' : 'Enable'}
						</button>
					</div>
				</div>

				<div class="space-y-4 rounded-lg border border-border bg-card p-4">
					<h3 class="font-semibold">Detection Parameters</h3>

					<div class="grid grid-cols-2 gap-4">
						<div>
							<label for="confidence_threshold" class="mb-1 block text-sm font-medium">Confidence Threshold</label>
							<input
								id="confidence_threshold"
								type="number"
								step="0.1"
								min="0"
								max="10"
								class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
								bind:value={editConfidenceThreshold}
							/>
							<p class="mt-1 text-xs text-muted-foreground">Standard deviations (0-10)</p>
						</div>

						<div>
							<label for="frequency_threshold" class="mb-1 block text-sm font-medium">Frequency Threshold</label>
							<input
								id="frequency_threshold"
								type="number"
								step="0.05"
								min="0"
								max="1"
								class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
								bind:value={editFrequencyThreshold}
							/>
							<p class="mt-1 text-xs text-muted-foreground">Minimum frequency ratio (0-1)</p>
						</div>

						<div>
							<label for="min_peer_group_size" class="mb-1 block text-sm font-medium">Min Peer Group Size</label>
							<input
								id="min_peer_group_size"
								type="number"
								min="1"
								max="1000"
								class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
								bind:value={editMinPeerGroupSize}
							/>
							<p class="mt-1 text-xs text-muted-foreground">Minimum users for comparison</p>
						</div>

						<div>
							<label for="retention_days" class="mb-1 block text-sm font-medium">Retention Days</label>
							<input
								id="retention_days"
								type="number"
								min="1"
								max="3650"
								class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
								bind:value={editRetentionDays}
							/>
							<p class="mt-1 text-xs text-muted-foreground">Days to keep analysis data</p>
						</div>
					</div>

					<div>
						<label for="schedule_cron" class="mb-1 block text-sm font-medium">Schedule (Cron)</label>
						<input
							id="schedule_cron"
							type="text"
							class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
							bind:value={editScheduleCron}
						/>
						<p class="mt-1 text-xs text-muted-foreground">Cron expression for scheduled analysis</p>
					</div>

					<div class="flex justify-end">
						<button
							class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
							onclick={saveConfig}
							disabled={savingConfig}
						>
							{savingConfig ? 'Saving...' : 'Save Configuration'}
						</button>
					</div>
				</div>

				{#if config.scoring_weights}
					<div class="rounded-lg border border-border bg-card p-4">
						<h3 class="mb-3 font-semibold">Scoring Weights</h3>
						<div class="space-y-2">
							{#each Object.entries(config.scoring_weights) as [key, value]}
								<div class="flex items-center justify-between">
									<span class="text-sm">{key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</span>
									<div class="flex items-center gap-2">
										<div class="h-2 w-32 overflow-hidden rounded-full bg-muted">
											<div class="h-full rounded-full bg-primary" style="width: {(value as number) * 100}%"></div>
										</div>
										<span class="text-sm font-medium">{((value as number) * 100).toFixed(0)}%</span>
									</div>
								</div>
							{/each}
						</div>
					</div>
				{/if}
			</div>
		{:else}
			<EmptyState title="Configuration not available" description="Unable to load outlier detection configuration." icon="settings" />
		{/if}
	{/if}
</div>
