<script lang="ts">
	import type { NhiOverallSummary } from '$lib/api/types';
	import { Card, CardContent } from '$lib/components/ui/card';

	let { summary }: { summary: NhiOverallSummary | null } = $props();
</script>

{#if summary}
	<div class="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
		<Card>
			<CardContent class="pt-4">
				<p class="text-sm text-muted-foreground">Total</p>
				<p class="text-2xl font-bold">{summary.total}</p>
			</CardContent>
		</Card>
		<Card>
			<CardContent class="pt-4">
				<p class="text-sm text-muted-foreground">Active</p>
				<p class="text-2xl font-bold text-green-600 dark:text-green-400">{summary.active}</p>
			</CardContent>
		</Card>
		<Card>
			<CardContent class="pt-4">
				<p class="text-sm text-muted-foreground">Expired</p>
				<p class="text-2xl font-bold text-red-600 dark:text-red-400">{summary.expired}</p>
			</CardContent>
		</Card>
		<Card>
			<CardContent class="pt-4">
				<p class="text-sm text-muted-foreground">Suspended</p>
				<p class="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{summary.suspended}</p>
			</CardContent>
		</Card>
		<Card>
			<CardContent class="pt-4">
				<p class="text-sm text-muted-foreground">Needs Cert</p>
				<p class="text-2xl font-bold text-orange-600 dark:text-orange-400">{summary.needs_certification}</p>
			</CardContent>
		</Card>
		<Card>
			<CardContent class="pt-4">
				<p class="text-sm text-muted-foreground">Needs Rotation</p>
				<p class="text-2xl font-bold text-purple-600 dark:text-purple-400">{summary.needs_rotation}</p>
			</CardContent>
		</Card>
		<Card>
			<CardContent class="pt-4">
				<p class="text-sm text-muted-foreground">Inactive</p>
				<p class="text-2xl font-bold text-gray-600 dark:text-gray-400">{summary.inactive}</p>
			</CardContent>
		</Card>
	</div>
{/if}
