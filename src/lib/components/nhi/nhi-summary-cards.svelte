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
				<p class="text-2xl font-bold text-success">{summary.active}</p>
			</CardContent>
		</Card>
		<Card>
			<CardContent class="pt-4">
				<p class="text-sm text-muted-foreground">Expired</p>
				<p class="text-2xl font-bold text-destructive">{summary.expired}</p>
			</CardContent>
		</Card>
		<Card>
			<CardContent class="pt-4">
				<p class="text-sm text-muted-foreground">Suspended</p>
				<p class="text-2xl font-bold text-warning">{summary.suspended}</p>
			</CardContent>
		</Card>
		<Card>
			<CardContent class="pt-4">
				<p class="text-sm text-muted-foreground">Needs Cert</p>
				<p class="text-2xl font-bold text-warning">{summary.needs_certification}</p>
			</CardContent>
		</Card>
		<Card>
			<CardContent class="pt-4">
				<p class="text-sm text-muted-foreground">Needs Rotation</p>
				<p class="text-2xl font-bold text-primary">{summary.needs_rotation}</p>
			</CardContent>
		</Card>
		<Card>
			<CardContent class="pt-4">
				<p class="text-sm text-muted-foreground">Inactive</p>
				<p class="text-2xl font-bold text-muted-foreground ">{summary.inactive}</p>
			</CardContent>
		</Card>
	</div>
{/if}
