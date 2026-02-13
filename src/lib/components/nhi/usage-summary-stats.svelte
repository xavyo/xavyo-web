<script lang="ts">
	import type { NhiUsageSummary } from '$lib/api/types';
	import { Card, CardContent } from '$lib/components/ui/card';

	let { summary }: { summary: NhiUsageSummary | null } = $props();
</script>

{#if summary}
	<div class="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
		<Card>
			<CardContent class="pt-4">
				<p class="text-sm text-muted-foreground">Total Events</p>
				<p class="text-2xl font-bold">{summary.total_events}</p>
			</CardContent>
		</Card>
		<Card>
			<CardContent class="pt-4">
				<p class="text-sm text-muted-foreground">Daily Average</p>
				<p class="text-2xl font-bold">{summary.daily_average.toFixed(1)}</p>
			</CardContent>
		</Card>
		<Card>
			<CardContent class="pt-4">
				<p class="text-sm text-muted-foreground">First Activity</p>
				<p class="text-sm font-medium">{summary.first_activity_at ? new Date(summary.first_activity_at).toLocaleDateString() : 'Never'}</p>
			</CardContent>
		</Card>
		<Card>
			<CardContent class="pt-4">
				<p class="text-sm text-muted-foreground">Last Activity</p>
				<p class="text-sm font-medium">{summary.last_activity_at ? new Date(summary.last_activity_at).toLocaleDateString() : 'Never'}</p>
			</CardContent>
		</Card>
	</div>
	{#if Object.keys(summary.activity_types).length > 0}
		<Card>
			<CardContent class="pt-4">
				<h4 class="mb-2 text-sm font-medium">Activity by Type</h4>
				<div class="space-y-1">
					{#each Object.entries(summary.activity_types) as [type, count]}
						<div class="flex justify-between text-sm">
							<span class="text-muted-foreground">{type}</span>
							<span class="font-medium">{count}</span>
						</div>
					{/each}
				</div>
			</CardContent>
		</Card>
	{/if}
{:else}
	<p class="text-sm text-muted-foreground">No usage data available.</p>
{/if}
