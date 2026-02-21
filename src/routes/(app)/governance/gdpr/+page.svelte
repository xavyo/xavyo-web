<script lang="ts">
	import { Card, CardHeader, CardContent } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Separator } from '$lib/components/ui/separator';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<PageHeader
	title="GDPR Data Protection"
	description="Data protection compliance overview"
/>

{#if !data.report}
	<Card class="max-w-2xl">
		<CardContent class="py-8 text-center text-muted-foreground">
			No GDPR report data available. Ensure entitlements have data protection classifications configured.
		</CardContent>
	</Card>
{:else}
	<!-- Summary Cards -->
	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
		<Card>
			<CardContent class="pt-6">
				<p class="text-sm text-muted-foreground">Total Entitlements</p>
				<p class="text-2xl font-bold">{data.report.total_entitlements}</p>
			</CardContent>
		</Card>
		<Card>
			<CardContent class="pt-6">
				<p class="text-sm text-muted-foreground">Classified</p>
				<p class="text-2xl font-bold">{data.report.classified_entitlements}</p>
			</CardContent>
		</Card>
		<Card>
			<CardContent class="pt-6">
				<p class="text-sm text-muted-foreground">Unclassified</p>
				<p class="text-2xl font-bold">{data.report.total_entitlements - data.report.classified_entitlements}</p>
			</CardContent>
		</Card>
		<Card>
			<CardContent class="pt-6">
				<p class="text-sm text-muted-foreground">With Retention Policy</p>
				<p class="text-2xl font-bold">{data.report.entitlements_with_retention.length}</p>
			</CardContent>
		</Card>
	</div>

	<!-- Classification Summary -->
	<Card class="mt-6">
		<CardHeader>
			<h2 class="text-xl font-semibold">Classification Summary</h2>
		</CardHeader>
		<CardContent>
			<div class="flex flex-wrap gap-3">
				{#each Object.entries(data.report.classification_summary) as [classification, count]}
					<Badge variant="outline" class="text-sm">
						{classification}: {count}
					</Badge>
				{/each}
			</div>

			{#if Object.keys(data.report.legal_basis_summary).length > 0}
				<Separator class="my-4" />
				<h3 class="mb-2 font-medium">Legal Basis Summary</h3>
				<div class="flex flex-wrap gap-3">
					{#each Object.entries(data.report.legal_basis_summary) as [basis, count]}
						<Badge variant="secondary" class="text-sm">
							{basis}: {count}
						</Badge>
					{/each}
				</div>
			{/if}
		</CardContent>
	</Card>

	<!-- Classified Entitlements Detail -->
	{#if data.report.classified_entitlements_detail.length > 0}
		<Card class="mt-6">
			<CardHeader>
				<h2 class="text-xl font-semibold">Classified Entitlements</h2>
			</CardHeader>
			<CardContent>
				<div class="overflow-auto">
					<table class="w-full text-sm">
						<thead>
							<tr class="border-b bg-muted/50">
								<th class="px-3 py-2 text-left font-medium">Entitlement</th>
								<th class="px-3 py-2 text-left font-medium">Application</th>
								<th class="px-3 py-2 text-left font-medium">Classification</th>
								<th class="px-3 py-2 text-left font-medium">Legal Basis</th>
								<th class="px-3 py-2 text-left font-medium">Retention (days)</th>
								<th class="px-3 py-2 text-right font-medium">Assignments</th>
							</tr>
						</thead>
						<tbody>
							{#each data.report.classified_entitlements_detail as ent}
								<tr class="border-b last:border-0">
									<td class="px-3 py-2">{ent.entitlement_name}</td>
									<td class="px-3 py-2 text-muted-foreground">{ent.application_name}</td>
									<td class="px-3 py-2">
										<Badge variant="outline">{ent.classification}</Badge>
									</td>
									<td class="px-3 py-2">{ent.legal_basis ?? '\u2014'}</td>
									<td class="px-3 py-2">{ent.retention_period_days ?? '\u2014'}</td>
									<td class="px-3 py-2 text-right">{ent.active_assignment_count}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</CardContent>
		</Card>
	{/if}

	<!-- Report Metadata -->
	<Card class="mt-6 max-w-md">
		<CardContent class="pt-6">
			<p class="text-xs text-muted-foreground">
				Report generated: {new Date(data.report.generated_at).toLocaleString()}
			</p>
		</CardContent>
	</Card>
{/if}
