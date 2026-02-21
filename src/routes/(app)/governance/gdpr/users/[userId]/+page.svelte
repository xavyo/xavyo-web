<script lang="ts">
	import { Card, CardHeader, CardContent } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<div class="flex items-center justify-between">
	<PageHeader
		title="User Data Protection"
		description="Data protection summary for user {data.userId}"
	/>
	<a
		href="/governance/gdpr"
		class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
	>
		Back to GDPR
	</a>
</div>

<!-- Summary -->
<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
	<Card>
		<CardContent class="pt-6">
			<p class="text-sm text-muted-foreground">Total Classified Entitlements</p>
			<p class="text-2xl font-bold">{data.summary.total_classified}</p>
		</CardContent>
	</Card>
	{#each Object.entries(data.summary.classifications) as [classification, count]}
		<Card>
			<CardContent class="pt-6">
				<p class="text-sm text-muted-foreground">{classification}</p>
				<p class="text-2xl font-bold">{count}</p>
			</CardContent>
		</Card>
	{/each}
</div>

<!-- Entitlements -->
{#if data.summary.entitlements.length > 0}
	<Card class="mt-6">
		<CardHeader>
			<h2 class="text-xl font-semibold">Entitlements</h2>
		</CardHeader>
		<CardContent>
			<div class="overflow-auto">
				<table class="w-full text-sm">
					<thead>
						<tr class="border-b bg-muted/50">
							<th class="px-3 py-2 text-left font-medium">Name</th>
							<th class="px-3 py-2 text-left font-medium">Application</th>
							<th class="px-3 py-2 text-left font-medium">Classification</th>
						</tr>
					</thead>
					<tbody>
						{#each data.summary.entitlements as ent}
							<tr class="border-b last:border-0">
								<td class="px-3 py-2">{ent.name}</td>
								<td class="px-3 py-2 text-muted-foreground">{ent.application_id}</td>
								<td class="px-3 py-2">
									{#if ent.data_protection_classification}
										<Badge variant="outline">{ent.data_protection_classification}</Badge>
									{:else}
										<span class="text-muted-foreground">{'\u2014'}</span>
									{/if}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</CardContent>
	</Card>
{:else}
	<Card class="mt-6">
		<CardContent class="py-8 text-center text-muted-foreground">
			No classified entitlements found for this user.
		</CardContent>
	</Card>
{/if}
