<script lang="ts">
	import type { StalenessReportResponse } from '$lib/api/types';
	import Button from '$lib/components/ui/button/button.svelte';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import { Dialog } from 'bits-ui';
	import DialogContent from '$lib/components/ui/dialog/dialog-content.svelte';
	import DialogHeader from '$lib/components/ui/dialog/dialog-header.svelte';
	import DialogTitle from '$lib/components/ui/dialog/dialog-title.svelte';
	import DialogFooter from '$lib/components/ui/dialog/dialog-footer.svelte';
	import { formatNhiDate } from './nhi-utils';

	interface Props {
		report: StalenessReportResponse;
		onGrantGracePeriod: (id: string, days: number) => Promise<void>;
		onAutoSuspend: () => Promise<void>;
	}

	let { report, onGrantGracePeriod, onAutoSuspend }: Props = $props();

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
		<div class="space-y-1">
			<p class="text-sm text-muted-foreground">
				{report.total_stale} stale entities detected
				{#if report.critical_count > 0}
					<Badge class="ml-2 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
						{report.critical_count} critical
					</Badge>
				{/if}
				{#if report.warning_count > 0}
					<Badge class="ml-2 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
						{report.warning_count} warning
					</Badge>
				{/if}
			</p>
		</div>
		{#if report.stale_nhis.length > 0}
			<Button variant="destructive" size="sm" onclick={handleAutoSuspend} disabled={suspending}>
				{suspending ? 'Suspending...' : 'Auto-Suspend All Expired'}
			</Button>
		{/if}
	</div>

	{#if report.stale_nhis.length === 0}
		<p class="py-8 text-center text-sm text-muted-foreground">No stale NHI entities detected.</p>
	{:else}
		<div class="overflow-x-auto">
			<table class="w-full text-sm">
				<thead>
					<tr class="border-b border-border text-left">
						<th class="px-3 py-2 font-medium text-muted-foreground">Name</th>
						<th class="px-3 py-2 font-medium text-muted-foreground">Days Inactive</th>
						<th class="px-3 py-2 font-medium text-muted-foreground">Threshold</th>
						<th class="px-3 py-2 font-medium text-muted-foreground">Last Used</th>
						<th class="px-3 py-2 font-medium text-muted-foreground">Grace Period</th>
						<th class="px-3 py-2 font-medium text-muted-foreground">Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each report.stale_nhis as entity}
						<tr class="border-b border-border">
							<td class="px-3 py-2 font-medium text-foreground">
								{entity.name}
							</td>
							<td class="px-3 py-2 font-mono">{entity.days_inactive}</td>
							<td class="px-3 py-2 font-mono">{entity.inactivity_threshold_days}</td>
							<td class="px-3 py-2 text-muted-foreground">{formatNhiDate(entity.last_used_at)}</td>
							<td class="px-3 py-2 text-muted-foreground">
								{#if entity.in_grace_period && entity.grace_period_ends_at}
									Until {formatNhiDate(entity.grace_period_ends_at)}
								{:else}
									—
								{/if}
							</td>
							<td class="px-3 py-2">
								{#if !entity.in_grace_period}
									<Button variant="outline" size="sm" onclick={() => openGraceDialog(entity.nhi_id)}>
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
