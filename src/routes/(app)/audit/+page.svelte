<script lang="ts">
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import StatsPanel from '$lib/components/audit/stats-panel.svelte';
	import LoginAttemptList from '$lib/components/audit/login-attempt-list.svelte';
	import DateRangeFilter from '$lib/components/audit/date-range-filter.svelte';
	import type { LoginAttemptStats } from '$lib/api/types';
	import { getAdminLoginStats } from '$lib/api/audit-client';

	let stats: LoginAttemptStats | null = $state(null);
	let statsLoading = $state(false);
	let statsError = $state('');

	// Default date range: last 30 days
	const defaultEnd = new Date();
	const defaultStart = new Date();
	defaultStart.setDate(defaultStart.getDate() - 30);

	let startDate = $state(defaultStart.toISOString().split('T')[0]);
	let endDate = $state(defaultEnd.toISOString().split('T')[0]);

	let startDateISO = $state(`${startDate}T00:00:00Z`);
	let endDateISO = $state(`${endDate}T23:59:59Z`);

	async function loadStats() {
		statsLoading = true;
		statsError = '';
		try {
			stats = await getAdminLoginStats(startDateISO, endDateISO);
		} catch {
			statsError = 'Failed to load statistics. Please try again.';
			stats = null;
		} finally {
			statsLoading = false;
		}
	}

	// Shared filter state for both panels
	let listStartDate = $state(startDateISO);
	let listEndDate = $state(endDateISO);

	function handleDateRangeChange(range: { start_date: string; end_date: string }) {
		startDateISO = range.start_date;
		endDateISO = range.end_date;
		listStartDate = range.start_date;
		listEndDate = range.end_date;
		loadStats();
	}

	// Load stats on mount
	$effect(() => {
		loadStats();
	});
</script>

<PageHeader title="Audit Dashboard" description="Tenant-wide login activity and security statistics" />

<div class="space-y-6">
	<!-- Shared Date Range Filter -->
	<div class="flex flex-wrap items-end gap-3">
		<DateRangeFilter
			startDate={startDate}
			endDate={endDate}
			onchange={handleDateRangeChange}
		/>
	</div>

	<!-- Stats Panel -->
	<StatsPanel {stats} loading={statsLoading} error={statsError} onretry={loadStats} />

	<!-- Login Attempts List -->
	<div>
		<h3 class="mb-3 text-lg font-semibold">Login Attempts</h3>
		<LoginAttemptList
			fetchUrl="/api/audit/admin/login-attempts"
			showFilters={true}
			showAdminFilters={true}
		/>
	</div>
</div>
