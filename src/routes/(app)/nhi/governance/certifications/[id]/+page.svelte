<script lang="ts">
	import type { NhiCertificationItem } from '$lib/api/types';
	import { Card, CardHeader, CardContent } from '$lib/components/ui/card';
	import Button from '$lib/components/ui/button/button.svelte';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import { addToast } from '$lib/stores/toast.svelte';
	import { campaignStatusClass, formatNhiDate } from '$lib/components/nhi/nhi-utils';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// svelte-ignore state_referenced_locally
	let items: NhiCertificationItem[] = $state(data.campaignItems ?? []);
	let processing = $state<string | null>(null);

	async function handleDecide(itemId: string, decision: 'certify' | 'revoke') {
		processing = itemId;
		try {
			const res = await fetch(`/api/nhi/governance/certifications/items/${itemId}/decide`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ decision })
			});
			if (!res.ok) throw new Error(`Failed: ${res.status}`);
			const updated: NhiCertificationItem = await res.json();
			items = items.map((it) => (it.id === itemId ? updated : it));
			addToast('success', decision === 'certify' ? 'NHI entity certified' : 'NHI certification revoked');
		} catch {
			addToast('error', `Failed to ${decision} NHI entity`);
		} finally {
			processing = null;
		}
	}

	function decisionBadgeClass(decision: string | null): string {
		switch (decision) {
			case 'certify':
				return 'bg-green-600 text-white hover:bg-green-600/80';
			case 'revoke':
				return 'bg-red-500 text-white hover:bg-red-500/80';
			default:
				return '';
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
		<CardHeader><p class="text-sm text-muted-foreground">Items</p></CardHeader>
		<CardContent>
			<p class="text-lg font-semibold text-foreground">{items.length}</p>
		</CardContent>
	</Card>
</div>

<Card>
	<CardHeader>
		<h3 class="text-lg font-semibold text-foreground">Certification Items</h3>
	</CardHeader>
	<CardContent>
		{#if items.length === 0}
			<p class="py-8 text-center text-sm text-muted-foreground">No certification items in this campaign.</p>
		{:else}
			<div class="overflow-x-auto">
				<table class="w-full text-sm">
					<thead>
						<tr class="border-b border-border text-left">
							<th class="px-3 py-2 font-medium text-muted-foreground">NHI Name</th>
							<th class="px-3 py-2 font-medium text-muted-foreground">Type</th>
							<th class="px-3 py-2 font-medium text-muted-foreground">Decision</th>
							<th class="px-3 py-2 font-medium text-muted-foreground">Decided At</th>
							<th class="px-3 py-2 font-medium text-muted-foreground">Actions</th>
						</tr>
					</thead>
					<tbody>
						{#each items as item}
							<tr class="border-b border-border">
								<td class="px-3 py-2 font-medium text-foreground">{item.nhi_name ?? item.nhi_id}</td>
								<td class="px-3 py-2 text-muted-foreground">{item.nhi_type ?? '—'}</td>
								<td class="px-3 py-2">
									{#if item.decision}
										<Badge class={decisionBadgeClass(item.decision)}>{item.decision}</Badge>
									{:else}
										<span class="text-muted-foreground">Pending</span>
									{/if}
								</td>
								<td class="px-3 py-2 text-muted-foreground">{formatNhiDate(item.decided_at)}</td>
								<td class="px-3 py-2">
									{#if data.campaign.status === 'active' && !item.decision}
										<div class="flex gap-2">
											<Button
												size="sm"
												onclick={() => handleDecide(item.id, 'certify')}
												disabled={processing === item.id}
											>
												{processing === item.id ? '...' : 'Certify'}
											</Button>
											<Button
												variant="destructive"
												size="sm"
												onclick={() => handleDecide(item.id, 'revoke')}
												disabled={processing === item.id}
											>
												{processing === item.id ? '...' : 'Revoke'}
											</Button>
										</div>
									{:else if item.decision}
										<span class="text-xs text-muted-foreground">Decided</span>
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
