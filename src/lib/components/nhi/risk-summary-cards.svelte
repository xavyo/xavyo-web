<script lang="ts">
	import type { NhiRiskSummary } from '$lib/api/types';
	import { Card, CardHeader, CardContent } from '$lib/components/ui/card';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import { riskLevelClass } from './nhi-utils';

	interface Props {
		summary: NhiRiskSummary;
	}

	let { summary }: Props = $props();

	const riskLevels = ['critical', 'high', 'medium', 'low'] as const;
</script>

<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
	<Card>
		<CardHeader>
			<p class="text-sm text-muted-foreground">Total NHI Entities</p>
		</CardHeader>
		<CardContent>
			<p class="text-3xl font-bold text-foreground">{summary.total_count}</p>
		</CardContent>
	</Card>

	<Card>
		<CardHeader>
			<p class="text-sm text-muted-foreground">Service Accounts</p>
		</CardHeader>
		<CardContent>
			<p class="text-2xl font-bold text-foreground">{summary.by_type.service_account}</p>
		</CardContent>
	</Card>

	<Card>
		<CardHeader>
			<p class="text-sm text-muted-foreground">AI Agents</p>
		</CardHeader>
		<CardContent>
			<p class="text-2xl font-bold text-foreground">{summary.by_type.ai_agent}</p>
		</CardContent>
	</Card>

	<Card>
		<CardHeader>
			<p class="text-sm text-muted-foreground">Pending Certification</p>
		</CardHeader>
		<CardContent>
			<p class="text-2xl font-bold text-foreground">{summary.pending_certification}</p>
		</CardContent>
	</Card>
</div>

<div class="mt-4 grid gap-4 sm:grid-cols-2">
	<Card>
		<CardHeader>
			<h3 class="text-sm font-medium text-muted-foreground">Risk Distribution</h3>
		</CardHeader>
		<CardContent>
			<div class="flex flex-wrap gap-3">
				{#each riskLevels as level}
					<div class="flex items-center gap-2">
						<Badge class={riskLevelClass(level)}>{level}</Badge>
						<span class="text-lg font-semibold text-foreground">{summary.by_risk_level[level]}</span>
					</div>
				{/each}
			</div>
		</CardContent>
	</Card>

	<Card>
		<CardHeader>
			<h3 class="text-sm font-medium text-muted-foreground">Attention Required</h3>
		</CardHeader>
		<CardContent>
			<div class="space-y-2 text-sm">
				<div class="flex justify-between">
					<span class="text-muted-foreground">Inactive (30+ days)</span>
					<span class="font-semibold text-foreground">{summary.inactive_30_days}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-muted-foreground">Expiring (7 days)</span>
					<span class="font-semibold text-foreground">{summary.expiring_7_days}</span>
				</div>
			</div>
		</CardContent>
	</Card>
</div>
