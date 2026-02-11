<script lang="ts">
	import type { InactiveNhiEntity } from '$lib/api/types';
	import Button from '$lib/components/ui/button/button.svelte';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import { Dialog } from 'bits-ui';
	import DialogContent from '$lib/components/ui/dialog/dialog-content.svelte';
	import DialogHeader from '$lib/components/ui/dialog/dialog-header.svelte';
	import DialogTitle from '$lib/components/ui/dialog/dialog-title.svelte';
	import DialogFooter from '$lib/components/ui/dialog/dialog-footer.svelte';
	import { nhiTypeClass, formatNhiDate, nhiEntityPath } from './nhi-utils';

	interface Props {
		entities: InactiveNhiEntity[];
		onGrantGracePeriod: (id: string, days: number) => Promise<void>;
		onAutoSuspend: () => Promise<void>;
	}

	let { entities, onGrantGracePeriod, onAutoSuspend }: Props = $props();

	let showGraceDialog = $state(false);
	let selectedEntityId = $state<string | null>(null);
	let graceDays = $state(30);
	let granting = $state(false);
	let suspending = $state(false);

	function openGraceDialog(id: string) {
		selectedEntityId = id;
		graceDays = 30;
		showGraceDialog = true;
	}

	async function handleGrant() {
		if (!selectedEntityId) return;
		granting = true;
		try {
			await onGrantGracePeriod(selectedEntityId, graceDays);
			showGraceDialog = false;
		} finally {
			granting = false;
		}
	}

	async function handleAutoSuspend() {
		suspending = true;
		try {
			await onAutoSuspend();
		} finally {
			suspending = false;
		}
	}
</script>

<div class="space-y-4">
	<div class="flex items-center justify-between">
		<p class="text-sm text-muted-foreground">{entities.length} inactive entities detected</p>
		{#if entities.length > 0}
			<Button variant="destructive" size="sm" onclick={handleAutoSuspend} disabled={suspending}>
				{suspending ? 'Suspending...' : 'Auto-Suspend All Expired'}
			</Button>
		{/if}
	</div>

	{#if entities.length === 0}
		<p class="py-8 text-center text-sm text-muted-foreground">No inactive NHI entities detected.</p>
	{:else}
		<div class="overflow-x-auto">
			<table class="w-full text-sm">
				<thead>
					<tr class="border-b border-border text-left">
						<th class="px-3 py-2 font-medium text-muted-foreground">Name</th>
						<th class="px-3 py-2 font-medium text-muted-foreground">Type</th>
						<th class="px-3 py-2 font-medium text-muted-foreground">Days Inactive</th>
						<th class="px-3 py-2 font-medium text-muted-foreground">Threshold</th>
						<th class="px-3 py-2 font-medium text-muted-foreground">Last Activity</th>
						<th class="px-3 py-2 font-medium text-muted-foreground">Grace Period</th>
						<th class="px-3 py-2 font-medium text-muted-foreground">Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each entities as entity}
						<tr class="border-b border-border">
							<td class="px-3 py-2">
								<a href={nhiEntityPath(entity.nhi_type, entity.id)} class="font-medium text-primary hover:underline">
									{entity.name}
								</a>
							</td>
							<td class="px-3 py-2">
								<Badge class={nhiTypeClass(entity.nhi_type)}>{entity.nhi_type}</Badge>
							</td>
							<td class="px-3 py-2 font-mono">{entity.days_inactive}</td>
							<td class="px-3 py-2 font-mono">{entity.threshold_days}</td>
							<td class="px-3 py-2 text-muted-foreground">{formatNhiDate(entity.last_activity_at)}</td>
							<td class="px-3 py-2 text-muted-foreground">
								{entity.grace_period_ends_at ? `Until ${formatNhiDate(entity.grace_period_ends_at)}` : '—'}
							</td>
							<td class="px-3 py-2">
								{#if !entity.grace_period_ends_at}
									<Button variant="outline" size="sm" onclick={() => openGraceDialog(entity.id)}>
										Grant Grace
									</Button>
								{:else}
									<span class="text-xs text-muted-foreground">Grace active</span>
								{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>

<Dialog.Root bind:open={showGraceDialog}>
	<DialogContent>
		<DialogHeader>
			<DialogTitle>Grant Grace Period</DialogTitle>
		</DialogHeader>
		<div class="space-y-4 py-4">
			<label class="block text-sm font-medium text-foreground" for="grace-days-input">
				Grace Period (days)
			</label>
			<input
				id="grace-days-input"
				type="number"
				min={1}
				max={365}
				bind:value={graceDays}
				class="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
			/>
			<p class="text-xs text-muted-foreground">The entity will not be auto-suspended for this many days.</p>
		</div>
		<DialogFooter>
			<Button variant="outline" onclick={() => (showGraceDialog = false)}>Cancel</Button>
			<Button onclick={handleGrant} disabled={granting || graceDays < 1 || graceDays > 365}>
				{granting ? 'Granting...' : 'Grant'}
			</Button>
		</DialogFooter>
	</DialogContent>
</Dialog.Root>
