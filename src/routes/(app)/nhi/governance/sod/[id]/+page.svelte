<script lang="ts">
	import { enhance as formEnhance } from '$app/forms';
	import { Card, CardHeader, CardContent } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import { addToast } from '$lib/stores/toast.svelte';
	import type { NhiSodEnforcement } from '$lib/api/types';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let showDeleteDialog: boolean = $state(false);

	// Enforcement badge styles
	const enforcementStyles: Record<NhiSodEnforcement, string> = {
		prevent: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
		warn: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
	};

	const enforcementLabels: Record<NhiSodEnforcement, string> = {
		prevent: 'Prevent',
		warn: 'Warn'
	};
</script>

<div class="flex items-center justify-between">
	<div class="flex items-center gap-3">
		<PageHeader title="NHI SoD Rule" description="Separation of duties rule details" />
		<span
			class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {enforcementStyles[data.rule.enforcement]}"
			>{enforcementLabels[data.rule.enforcement]}</span
		>
	</div>
	<a
		href="/nhi/governance"
		class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
	>
		Back to NHI Governance
	</a>
</div>

<Card class="max-w-lg">
	<CardHeader>
		<h2 class="text-xl font-semibold">Rule information</h2>
	</CardHeader>
	<CardContent class="space-y-4">
		<div class="grid gap-3">
			<div class="flex justify-between">
				<span class="text-sm text-muted-foreground">ID</span>
				<span class="font-mono text-xs">{data.rule.id}</span>
			</div>
			<div class="flex justify-between">
				<span class="text-sm text-muted-foreground">Enforcement</span>
				<span
					class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {enforcementStyles[data.rule.enforcement]}"
					>{enforcementLabels[data.rule.enforcement]}</span
				>
			</div>
			<div class="flex justify-between">
				<span class="text-sm text-muted-foreground">Description</span>
				<span class="text-sm">{data.rule.description ?? '---'}</span>
			</div>

			<Separator />

			<h3 class="text-sm font-medium text-muted-foreground">Conflicting tools</h3>
			<div class="flex justify-between">
				<span class="text-sm text-muted-foreground">Tool A</span>
				<span class="font-mono text-xs">{data.rule.tool_id_a}</span>
			</div>
			<div class="flex justify-between">
				<span class="text-sm text-muted-foreground">Tool B</span>
				<span class="font-mono text-xs">{data.rule.tool_id_b}</span>
			</div>

			<Separator />

			{#if data.rule.created_by}
				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Created by</span>
					<span class="font-mono text-xs">{data.rule.created_by}</span>
				</div>
			{/if}
			<div class="flex justify-between">
				<span class="text-sm text-muted-foreground">Created</span>
				<span class="text-sm">{new Date(data.rule.created_at).toLocaleString()}</span>
			</div>
		</div>
	</CardContent>
</Card>

<Separator class="my-6" />

<!-- Actions -->
<Card class="max-w-lg">
	<CardHeader>
		<h2 class="text-xl font-semibold">Actions</h2>
	</CardHeader>
	<CardContent class="flex flex-wrap gap-2">
		<Button variant="destructive" onclick={() => (showDeleteDialog = true)}>Delete</Button>
	</CardContent>
</Card>

<!-- Delete dialog -->
<Dialog.Root bind:open={showDeleteDialog}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Delete NHI SoD rule</Dialog.Title>
			<Dialog.Description>
				Are you sure you want to delete this SoD rule? This action cannot be undone.
			</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer>
			<Button variant="outline" onclick={() => (showDeleteDialog = false)}>Cancel</Button>
			<form
				method="POST"
				action="?/delete"
				use:formEnhance={() => {
					return async ({ result, update }) => {
						if (result.type === 'redirect') {
							addToast('success', 'NHI SoD rule deleted');
							await update();
						} else if (result.type === 'failure') {
							addToast('error', String(result.data?.error ?? 'Failed to delete'));
							showDeleteDialog = false;
						}
					};
				}}
			>
				<Button type="submit" variant="destructive">Confirm delete</Button>
			</form>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
