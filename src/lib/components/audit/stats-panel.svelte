<script lang="ts">
	import { Card, CardContent } from '$lib/components/ui/card';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import { Button } from '$lib/components/ui/button';
	import HourlyChart from './hourly-chart.svelte';
	import { RefreshCw, CheckCircle2, XCircle, Users, Smartphone, MapPin } from 'lucide-svelte';
	import type { LoginAttemptStats } from '$lib/api/types';

	interface Props {
		stats: LoginAttemptStats | null;
		loading?: boolean;
		error?: string;
		onretry?: () => void;
	}

	let { stats, loading = false, error = '', onretry }: Props = $props();
</script>

{#if loading}
	<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
		{#each Array(4) as _}
			<div class="h-24 animate-pulse rounded-lg border bg-muted"></div>
		{/each}
	</div>
{:else if error}
	<Alert variant="destructive">
		<AlertDescription class="flex items-center justify-between">
			{error}
			{#if onretry}
				<Button variant="outline" size="sm" onclick={onretry}>
					<RefreshCw class="mr-1 h-3 w-3" />Retry
				</Button>
			{/if}
		</AlertDescription>
	</Alert>
{:else if stats}
	<div class="space-y-4">
		<!-- Stat Cards -->
		<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
			<Card>
				<CardContent class="p-4">
					<p class="text-sm text-muted-foreground">Total Attempts</p>
					<p class="text-2xl font-bold">{stats.total_attempts.toLocaleString()}</p>
				</CardContent>
			</Card>
			<Card>
				<CardContent class="flex items-center gap-3 p-4">
					<CheckCircle2 class="h-5 w-5 text-green-600 dark:text-green-400" />
					<div>
						<p class="text-sm text-muted-foreground">Successful</p>
						<p class="text-2xl font-bold">{stats.successful_attempts.toLocaleString()}</p>
					</div>
				</CardContent>
			</Card>
			<Card>
				<CardContent class="flex items-center gap-3 p-4">
					<XCircle class="h-5 w-5 text-red-600 dark:text-red-400" />
					<div>
						<p class="text-sm text-muted-foreground">Failed</p>
						<p class="text-2xl font-bold">{stats.failed_attempts.toLocaleString()}</p>
					</div>
				</CardContent>
			</Card>
			<Card>
				<CardContent class="p-4">
					<p class="text-sm text-muted-foreground">Success Rate</p>
					<p class="text-2xl font-bold">{stats.success_rate.toFixed(1)}%</p>
				</CardContent>
			</Card>
		</div>

		<!-- Secondary Stats -->
		<div class="grid gap-3 sm:grid-cols-3">
			<Card>
				<CardContent class="flex items-center gap-3 p-4">
					<Users class="h-5 w-5 text-muted-foreground" />
					<div>
						<p class="text-sm text-muted-foreground">Unique Users</p>
						<p class="text-lg font-semibold">{stats.unique_users.toLocaleString()}</p>
					</div>
				</CardContent>
			</Card>
			<Card>
				<CardContent class="flex items-center gap-3 p-4">
					<Smartphone class="h-5 w-5 text-blue-600 dark:text-blue-400" />
					<div>
						<p class="text-sm text-muted-foreground">New Device Logins</p>
						<p class="text-lg font-semibold">{stats.new_device_logins.toLocaleString()}</p>
					</div>
				</CardContent>
			</Card>
			<Card>
				<CardContent class="flex items-center gap-3 p-4">
					<MapPin class="h-5 w-5 text-purple-600 dark:text-purple-400" />
					<div>
						<p class="text-sm text-muted-foreground">New Location Logins</p>
						<p class="text-lg font-semibold">{stats.new_location_logins.toLocaleString()}</p>
					</div>
				</CardContent>
			</Card>
		</div>

		<!-- Hourly Distribution Chart -->
		{#if stats.hourly_distribution.length > 0}
			<Card>
				<CardContent class="p-4">
					<HourlyChart data={stats.hourly_distribution} />
				</CardContent>
			</Card>
		{/if}

		<!-- Failure Reasons -->
		{#if stats.failure_reasons.length > 0}
			<Card>
				<CardContent class="p-4">
					<h4 class="mb-2 text-sm font-medium">Top Failure Reasons</h4>
					<div class="space-y-1">
						{#each stats.failure_reasons as fr}
							<div class="flex items-center justify-between text-sm">
								<span class="text-muted-foreground">{fr.reason}</span>
								<span class="font-medium">{fr.count}</span>
							</div>
						{/each}
					</div>
				</CardContent>
			</Card>
		{/if}
	</div>
{/if}
