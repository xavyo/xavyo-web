<script lang="ts">
	import type { NhiIdentityResponse } from '$lib/api/types';
	import { certifyNhiClient, revokeNhiCertClient } from '$lib/api/nhi-governance-client';
	import { Card, CardHeader, CardContent } from '$lib/components/ui/card';
	import Button from '$lib/components/ui/button/button.svelte';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import { addToast } from '$lib/stores/toast.svelte';
	import { campaignStatusClass, nhiTypeClass, formatNhiDate } from '$lib/components/nhi/nhi-utils';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let nhiEntities: NhiIdentityResponse[] = $state(data.nhiEntities);
	// Initialize certification status from entity data (last_certified_at)
	let certifiedIds = $state<Set<string>>(
		new Set(data.nhiEntities.filter((e) => e.last_certified_at).map((e) => e.id))
	);
	let revokedIds = $state<Set<string>>(new Set());
	let processing = $state<string | null>(null);

	async function handleCertify(nhiId: string) {
		processing = nhiId;
		try {
			await certifyNhiClient(data.campaign.id, nhiId);
			certifiedIds = new Set([...certifiedIds, nhiId]);
			revokedIds.delete(nhiId);
			revokedIds = new Set(revokedIds);
			addToast('success', 'NHI entity certified');
		} catch {
			addToast('error', 'Failed to certify NHI entity');
		} finally {
			processing = null;
		}
	}

	async function handleRevoke(nhiId: string) {
		processing = nhiId;
		try {
			await revokeNhiCertClient(data.campaign.id, nhiId);
			revokedIds = new Set([...revokedIds, nhiId]);
			certifiedIds.delete(nhiId);
			certifiedIds = new Set(certifiedIds);
			addToast('success', 'NHI entity certification revoked');
		} catch {
			addToast('error', 'Failed to revoke NHI certification');
		} finally {
			processing = null;
		}
	}
</script>

<PageHeader title={data.campaign.name} description={data.campaign.description ?? 'Certification campaign'} />

<div class="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
	<Card>
		<CardHeader><p class="text-sm text-muted-foreground">Status</p></CardHeader>
		<CardContent>
			<Badge class={campaignStatusClass(data.campaign.status)}>{data.campaign.status}</Badge>
		</CardContent>
	</Card>
	<Card>
		<CardHeader><p class="text-sm text-muted-foreground">Scope</p></CardHeader>
		<CardContent>
			<p class="text-lg font-semibold text-foreground">{data.campaign.scope}</p>
			{#if data.campaign.nhi_type_filter}
				<p class="text-sm text-muted-foreground">Filter: {data.campaign.nhi_type_filter}</p>
			{/if}
		</CardContent>
	</Card>
	<Card>
		<CardHeader><p class="text-sm text-muted-foreground">Due Date</p></CardHeader>
		<CardContent>
			<p class="text-lg font-semibold text-foreground">{formatNhiDate(data.campaign.due_date)}</p>
		</CardContent>
	</Card>
	<Card>
		<CardHeader><p class="text-sm text-muted-foreground">Entities in Scope</p></CardHeader>
		<CardContent>
			<p class="text-lg font-semibold text-foreground">{nhiEntities.length}</p>
		</CardContent>
	</Card>
</div>

<Card>
	<CardHeader>
		<h3 class="text-lg font-semibold text-foreground">NHI Entities</h3>
	</CardHeader>
	<CardContent>
		{#if nhiEntities.length === 0}
			<p class="py-8 text-center text-sm text-muted-foreground">No NHI entities in scope.</p>
		{:else}
			<div class="overflow-x-auto">
				<table class="w-full text-sm">
					<thead>
						<tr class="border-b border-border text-left">
							<th class="px-3 py-2 font-medium text-muted-foreground">Name</th>
							<th class="px-3 py-2 font-medium text-muted-foreground">Type</th>
							<th class="px-3 py-2 font-medium text-muted-foreground">State</th>
							<th class="px-3 py-2 font-medium text-muted-foreground">Status</th>
							<th class="px-3 py-2 font-medium text-muted-foreground">Actions</th>
						</tr>
					</thead>
					<tbody>
						{#each nhiEntities as entity}
							<tr class="border-b border-border">
								<td class="px-3 py-2 font-medium text-foreground">{entity.name}</td>
								<td class="px-3 py-2">
									<Badge class={nhiTypeClass(entity.nhi_type)}>{entity.nhi_type}</Badge>
								</td>
								<td class="px-3 py-2 text-muted-foreground">{entity.lifecycle_state}</td>
								<td class="px-3 py-2">
									{#if certifiedIds.has(entity.id)}
										<Badge class="bg-green-600 text-white hover:bg-green-600/80">Certified</Badge>
									{:else if revokedIds.has(entity.id)}
										<Badge class="bg-red-500 text-white hover:bg-red-500/80">Revoked</Badge>
									{:else}
										<span class="text-muted-foreground">Pending</span>
									{/if}
								</td>
								<td class="px-3 py-2">
									{#if data.campaign.status === 'active'}
										<div class="flex gap-2">
											{#if !certifiedIds.has(entity.id)}
												<Button
													size="sm"
													onclick={() => handleCertify(entity.id)}
													disabled={processing === entity.id}
												>
													{processing === entity.id ? '...' : 'Certify'}
												</Button>
											{/if}
											{#if !revokedIds.has(entity.id)}
												<Button
													variant="destructive"
													size="sm"
													onclick={() => handleRevoke(entity.id)}
													disabled={processing === entity.id}
												>
													{processing === entity.id ? '...' : 'Revoke'}
												</Button>
											{/if}
										</div>
									{:else}
										<span class="text-xs text-muted-foreground">Campaign not active</span>
									{/if}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</CardContent>
</Card>

<div class="mt-4">
	<a
		href="/nhi/governance"
		class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
	>
		Back to NHI Governance
	</a>
</div>
