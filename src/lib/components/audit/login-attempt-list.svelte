<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import EmptyState from '$lib/components/ui/empty-state/empty-state.svelte';
	import DateRangeFilter from './date-range-filter.svelte';
	import type { LoginAttempt, CursorPaginatedResponse } from '$lib/api/types';
	import {
		CheckCircle2,
		XCircle,
		RefreshCw,
		Globe,
		Monitor,
		MapPin,
		Smartphone
	} from 'lucide-svelte';

	interface Props {
		/** The fetch URL for loading login attempts */
		fetchUrl: string;
		/** Additional fixed query params (e.g., user_id for per-user timeline) */
		extraParams?: Record<string, string>;
		/** Show date range and success filters */
		showFilters?: boolean;
		/** Show admin-specific filters (email, auth method) */
		showAdminFilters?: boolean;
		/** Maximum items to show (0 = unlimited with pagination) */
		maxItems?: number;
		/** Show "View all" link when maxItems is set */
		viewAllUrl?: string;
	}

	let {
		fetchUrl,
		extraParams = {},
		showFilters = true,
		showAdminFilters = false,
		maxItems = 0,
		viewAllUrl
	}: Props = $props();

	let items: LoginAttempt[] = $state([]);
	let total = $state(0);
	let nextCursor: string | null = $state(null);
	let loading = $state(false);
	let loadingMore = $state(false);
	let errorMessage = $state('');

	// Filters
	let successFilter = $state('all');
	let startDate = $state('');
	let endDate = $state('');
	let emailFilter = $state('');
	let authMethodFilter = $state('all');

	async function loadAttempts(append = false) {
		if (append) {
			loadingMore = true;
		} else {
			loading = true;
			items = [];
			nextCursor = null;
		}
		errorMessage = '';

		try {
			const params = new URLSearchParams();
			const limit = maxItems > 0 ? maxItems : 20;
			params.set('limit', String(limit));
			if (append && nextCursor) params.set('cursor', nextCursor);
			if (startDate) params.set('start_date', startDate);
			if (endDate) params.set('end_date', endDate);
			if (successFilter === 'true') params.set('success', 'true');
			if (successFilter === 'false') params.set('success', 'false');
			if (emailFilter) params.set('email', emailFilter);
			if (authMethodFilter !== 'all') params.set('auth_method', authMethodFilter);

			// Add extra fixed params
			for (const [key, value] of Object.entries(extraParams)) {
				params.set(key, value);
			}

			const url = `${fetchUrl}?${params.toString()}`;
			const res = await fetch(url);
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			const result: CursorPaginatedResponse<LoginAttempt> = await res.json();

			if (append) {
				items = [...items, ...result.items];
			} else {
				items = result.items;
			}
			total = result.total;
			nextCursor = maxItems > 0 ? null : result.next_cursor;
		} catch {
			errorMessage = 'Failed to load login history. Please try again.';
		} finally {
			loading = false;
			loadingMore = false;
		}
	}

	function handleDateRangeChange(range: { start_date: string; end_date: string }) {
		startDate = range.start_date;
		endDate = range.end_date;
		loadAttempts();
	}

	function handleFilterChange() {
		loadAttempts();
	}

	function formatLocation(attempt: LoginAttempt): string {
		const parts = [];
		if (attempt.geo_city) parts.push(attempt.geo_city);
		if (attempt.geo_country) parts.push(attempt.geo_country);
		return parts.join(', ') || 'Unknown';
	}

	function formatUserAgent(ua: string | null): string {
		if (!ua) return 'Unknown device';
		// Extract browser and OS from user agent string (simplified)
		const match = ua.match(/(Chrome|Firefox|Safari|Edge|Opera)\/[\d.]+/);
		return match ? match[0] : ua.slice(0, 50);
	}

	const authMethodLabels: Record<string, string> = {
		password: 'Password',
		social: 'Social',
		sso: 'SSO',
		mfa: 'MFA',
		refresh: 'Refresh'
	};

	// Load on mount
	$effect(() => {
		loadAttempts();
	});
</script>

<div class="mt-4 space-y-4">
	<!-- Filters -->
	{#if showFilters}
		<div class="flex flex-wrap items-end gap-3">
			<DateRangeFilter onchange={handleDateRangeChange} />
			<div class="space-y-1">
				<label for="success-filter" class="text-xs font-medium text-muted-foreground"
					>Status</label
				>
				<select
					id="success-filter"
					class="h-9 rounded-md border border-input bg-background px-3 text-sm"
					bind:value={successFilter}
					onchange={handleFilterChange}
				>
					<option value="all">All</option>
					<option value="true">Successful</option>
					<option value="false">Failed</option>
				</select>
			</div>
			{#if showAdminFilters}
				<div class="space-y-1">
					<label for="email-filter" class="text-xs font-medium text-muted-foreground"
						>Email</label
					>
					<input
						id="email-filter"
						type="text"
						placeholder="Search email..."
						class="h-9 rounded-md border border-input bg-background px-3 text-sm"
						bind:value={emailFilter}
						onchange={handleFilterChange}
					/>
				</div>
				<div class="space-y-1">
					<label for="method-filter" class="text-xs font-medium text-muted-foreground"
						>Method</label
					>
					<select
						id="method-filter"
						class="h-9 rounded-md border border-input bg-background px-3 text-sm"
						bind:value={authMethodFilter}
						onchange={handleFilterChange}
					>
						<option value="all">All methods</option>
						<option value="password">Password</option>
						<option value="social">Social</option>
						<option value="sso">SSO</option>
						<option value="mfa">MFA</option>
						<option value="refresh">Refresh</option>
					</select>
				</div>
			{/if}
		</div>
	{/if}

	<!-- Error -->
	{#if errorMessage}
		<Alert variant="destructive">
			<AlertDescription class="flex items-center justify-between">
				{errorMessage}
				<Button variant="outline" size="sm" onclick={() => loadAttempts()}>
					<RefreshCw class="mr-1 h-3 w-3" />Retry
				</Button>
			</AlertDescription>
		</Alert>
	{/if}

	<!-- Loading skeleton -->
	{#if loading}
		<div class="space-y-2">
			{#each Array(5) as _}
				<div class="h-16 animate-pulse rounded-lg border bg-muted"></div>
			{/each}
		</div>
	{:else if items.length === 0}
		<EmptyState icon="📋" title="No login activity" description="No login attempts match your current filters." />
	{:else}
		<!-- Login attempt list -->
		<div class="space-y-2">
			{#each items as attempt (attempt.id)}
				<div class="rounded-lg border bg-card p-3">
					<div class="flex items-center justify-between gap-2">
						<div class="flex items-center gap-2">
							{#if attempt.success}
								<CheckCircle2 class="h-4 w-4 shrink-0 text-green-600 dark:text-green-400" />
							{:else}
								<XCircle class="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
							{/if}
							<div class="min-w-0">
								<div class="flex flex-wrap items-center gap-1.5">
									<span class="text-sm font-medium">
										{attempt.success ? 'Successful login' : 'Failed login'}
									</span>
									<Badge variant="outline" class="text-xs">
										{authMethodLabels[attempt.auth_method] ?? attempt.auth_method}
									</Badge>
									{#if attempt.is_new_device}
										<Badge variant="secondary" class="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
											<Smartphone class="mr-1 h-3 w-3" />New device
										</Badge>
									{/if}
									{#if attempt.is_new_location}
										<Badge variant="secondary" class="text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
											<MapPin class="mr-1 h-3 w-3" />New location
										</Badge>
									{/if}
								</div>
								{#if !attempt.success && attempt.failure_reason}
									<p class="text-xs text-destructive">{attempt.failure_reason}</p>
								{/if}
								<div class="mt-0.5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
									{#if showAdminFilters && attempt.email}
										<span>{attempt.email}</span>
									{/if}
									{#if attempt.ip_address}
										<span class="flex items-center gap-1">
											<Globe class="h-3 w-3" />{attempt.ip_address}
										</span>
									{/if}
									<span class="flex items-center gap-1">
										<MapPin class="h-3 w-3" />{formatLocation(attempt)}
									</span>
									<span class="flex items-center gap-1">
										<Monitor class="h-3 w-3" />{formatUserAgent(attempt.user_agent)}
									</span>
								</div>
							</div>
						</div>
						<span class="shrink-0 text-xs text-muted-foreground">
							{new Date(attempt.created_at).toLocaleString()}
						</span>
					</div>
				</div>
			{/each}
		</div>

		<!-- View all link for compact view -->
		{#if viewAllUrl && maxItems > 0 && total > maxItems}
			<div class="flex justify-center pt-2">
				<a
					href={viewAllUrl}
					class="text-sm font-medium text-primary hover:underline"
				>
					View all {total} entries
				</a>
			</div>
		{/if}

		<!-- Pagination for full view -->
		{#if nextCursor && maxItems === 0}
			<div class="flex justify-center pt-2">
				<Button variant="outline" onclick={() => loadAttempts(true)} disabled={loadingMore}>
					{loadingMore ? 'Loading...' : `Load more (${items.length} of ${total})`}
				</Button>
			</div>
		{/if}
	{/if}
</div>
