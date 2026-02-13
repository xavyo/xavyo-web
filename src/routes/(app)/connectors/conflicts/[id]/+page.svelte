<script lang="ts">
	import type { PageData } from './$types';
	import { Card, CardHeader, CardContent } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Separator } from '$lib/components/ui/separator';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import { enhance as formEnhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { addToast } from '$lib/stores/toast.svelte';

	let { data }: { data: PageData } = $props();

	let showResolveDialog = $state(false);
	let selectedOutcome = $state('applied');
	let resolveNotes = $state('');

	const conflict = $derived(data.conflict);

	function formatDate(dateStr: string | null): string {
		if (!dateStr) return '\u2014';
		return new Date(dateStr).toLocaleString();
	}

	function statusBadgeClass(status: string): string {
		switch (status) {
			case 'pending':
				return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800';
			case 'resolved':
				return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800';
			default:
				return '';
		}
	}

	function outcomeBadgeClass(outcome: string): string {
		switch (outcome) {
			case 'applied':
				return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800';
			case 'superseded':
				return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800';
			case 'merged':
				return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800';
			case 'rejected':
				return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
			default:
				return '';
		}
	}

	const outcomeOptions = [
		{ value: 'applied', label: 'Applied' },
		{ value: 'superseded', label: 'Superseded' },
		{ value: 'merged', label: 'Merged' },
		{ value: 'rejected', label: 'Rejected' }
	];
</script>

<div class="flex items-center justify-between">
	<div class="flex items-center gap-3">
		<PageHeader title="Conflict Detail" description={conflict.conflict_type} />
		<Badge class={statusBadgeClass(conflict.status)}>{conflict.status}</Badge>
	</div>
	<div class="flex items-center gap-2">
		{#if conflict.status === 'pending'}
			<Button variant="outline" onclick={() => { showResolveDialog = true; }}>Resolve</Button>
		{/if}
		<a
			href="/connectors/conflicts"
			class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
		>
			Back to Conflicts
		</a>
	</div>
</div>

<Card class="mt-4 max-w-2xl">
	<CardHeader>
		<h2 class="text-xl font-semibold">Conflict Information</h2>
	</CardHeader>
	<CardContent class="space-y-4">
		<div class="grid gap-3">
			<div class="flex justify-between">
				<span class="text-sm text-muted-foreground">ID</span>
				<span class="text-sm font-mono">{conflict.id}</span>
			</div>
			<div class="flex justify-between">
				<span class="text-sm text-muted-foreground">Conflict Type</span>
				<span class="text-sm">{conflict.conflict_type}</span>
			</div>
			<div class="flex justify-between">
				<span class="text-sm text-muted-foreground">Status</span>
				<Badge class={statusBadgeClass(conflict.status)}>{conflict.status}</Badge>
			</div>
			<div class="flex items-start justify-between">
				<span class="text-sm text-muted-foreground">Affected Attributes</span>
				<div class="flex flex-wrap justify-end gap-1">
					{#each conflict.affected_attributes as attr}
						<Badge variant="outline">{attr}</Badge>
					{/each}
				</div>
			</div>

			<Separator />

			<div class="flex justify-between">
				<span class="text-sm text-muted-foreground">Operation A</span>
				<a href="/connectors/operations/{conflict.operation_id_a}" class="text-sm text-primary hover:underline font-mono">
					{conflict.operation_id_a}
				</a>
			</div>
			<div class="flex justify-between">
				<span class="text-sm text-muted-foreground">Operation B</span>
				<a href="/connectors/operations/{conflict.operation_id_b}" class="text-sm text-primary hover:underline font-mono">
					{conflict.operation_id_b}
				</a>
			</div>

			<Separator />

			<div class="flex justify-between">
				<span class="text-sm text-muted-foreground">Created</span>
				<span class="text-sm">{formatDate(conflict.created_at)}</span>
			</div>
			<div class="flex justify-between">
				<span class="text-sm text-muted-foreground">Resolved</span>
				<span class="text-sm">{formatDate(conflict.resolved_at)}</span>
			</div>

			{#if conflict.outcome}
				<Separator />
				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Outcome</span>
					<Badge class={outcomeBadgeClass(conflict.outcome)}>{conflict.outcome}</Badge>
				</div>
			{/if}

			{#if conflict.notes}
				<Separator />
				<div>
					<span class="text-sm text-muted-foreground">Notes</span>
					<p class="mt-1 text-sm">{conflict.notes}</p>
				</div>
			{/if}
		</div>
	</CardContent>
</Card>

<Dialog.Root bind:open={showResolveDialog}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Resolve Conflict</Dialog.Title>
			<Dialog.Description>
				Choose an outcome and provide optional notes for this conflict resolution.
			</Dialog.Description>
		</Dialog.Header>
		<form method="POST" action="?/resolve" use:formEnhance={() => {
			return async ({ result }) => {
				if (result.type === 'success') {
					addToast('success', 'Conflict resolved');
					showResolveDialog = false;
					selectedOutcome = 'applied';
					resolveNotes = '';
					await invalidateAll();
				} else if (result.type === 'failure') {
					addToast('error', (result.data?.error as string) || 'Failed to resolve conflict');
				}
			};
		}}>
			<div class="space-y-4 py-4">
				<div>
					<label for="outcome" class="text-sm font-medium">Outcome</label>
					<select
						id="outcome"
						name="outcome"
						bind:value={selectedOutcome}
						class="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
					>
						{#each outcomeOptions as opt}
							<option value={opt.value}>{opt.label}</option>
						{/each}
					</select>
				</div>
				<div>
					<label for="notes" class="text-sm font-medium">Notes</label>
					<textarea
						id="notes"
						name="notes"
						bind:value={resolveNotes}
						rows={3}
						class="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
						placeholder="Describe the resolution rationale..."
					></textarea>
				</div>
			</div>
			<Dialog.Footer>
				<Button variant="outline" onclick={() => { showResolveDialog = false; }}>Cancel</Button>
				<Button type="submit">Resolve</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
