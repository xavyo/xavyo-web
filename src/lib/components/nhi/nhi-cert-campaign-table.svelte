<script lang="ts">
	import type { NhiCertificationCampaign } from '$lib/api/types';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import { campaignStatusClass, formatNhiDate } from './nhi-utils';

	interface Props {
		campaigns: NhiCertificationCampaign[];
	}

	let { campaigns }: Props = $props();
</script>

<div class="space-y-4">
	<div class="flex items-center justify-between">
		<p class="text-sm text-muted-foreground">{campaigns.length} certification {campaigns.length === 1 ? 'campaign' : 'campaigns'}</p>
		<a
			href="/nhi/governance/certifications/create"
			class="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-xs hover:bg-primary/90"
		>
			Create Campaign
		</a>
	</div>

	{#if campaigns.length === 0}
		<p class="py-8 text-center text-sm text-muted-foreground">No certification campaigns created.</p>
	{:else}
		<div class="overflow-x-auto">
			<table class="w-full text-sm">
				<thead>
					<tr class="border-b border-border text-left">
						<th class="px-3 py-2 font-medium text-muted-foreground">Name</th>
						<th class="px-3 py-2 font-medium text-muted-foreground">Scope</th>
						<th class="px-3 py-2 font-medium text-muted-foreground">Type Filter</th>
						<th class="px-3 py-2 font-medium text-muted-foreground">Status</th>
						<th class="px-3 py-2 font-medium text-muted-foreground">Due Date</th>
						<th class="px-3 py-2 font-medium text-muted-foreground">Created</th>
					</tr>
				</thead>
				<tbody>
					{#each campaigns as campaign}
						<tr class="border-b border-border">
							<td class="px-3 py-2">
								<a
									href="/nhi/governance/certifications/{campaign.id}"
									class="font-medium text-primary hover:underline"
								>
									{campaign.name}
								</a>
							</td>
							<td class="px-3 py-2 text-muted-foreground">{campaign.scope}</td>
							<td class="px-3 py-2 text-muted-foreground">{campaign.nhi_type_filter ?? 'All'}</td>
							<td class="px-3 py-2">
								<Badge class={campaignStatusClass(campaign.status)}>{campaign.status}</Badge>
							</td>
							<td class="px-3 py-2 text-muted-foreground">{formatNhiDate(campaign.due_date)}</td>
							<td class="px-3 py-2 text-muted-foreground">{formatNhiDate(campaign.created_at)}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>
