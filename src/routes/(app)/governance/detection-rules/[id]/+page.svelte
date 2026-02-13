<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { enhance } from '$app/forms';
	import { Card, CardHeader, CardContent } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Separator } from '$lib/components/ui/separator';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import RuleTypeBadge from '$lib/components/detection-rules/rule-type-badge.svelte';
	import RuleParamsEditor from '$lib/components/detection-rules/rule-params-editor.svelte';
	import { addToast } from '$lib/stores/toast.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let rule = $derived(data.rule);
	let deleteOpen = $state(false);

	function handleResult(result: any) {
		if (result.type === 'success' && result.data?.success) {
			addToast('success', `Rule ${result.data.action} successfully`);
			invalidateAll();
		} else if (result.type === 'failure') {
			addToast('error', result.data?.error ?? 'Action failed');
		}
	}
</script>

<PageHeader title={rule.name} description="Detection rule details">
	<div class="flex gap-2">
		<a href="/governance/detection-rules/{rule.id}/edit">
			<Button variant="outline">Edit</Button>
		</a>
		{#if rule.is_enabled}
			<form method="POST" action="?/disable" use:enhance={() => ({ result }) => handleResult(result)}>
				<Button variant="outline" type="submit">Disable</Button>
			</form>
		{:else}
			<form method="POST" action="?/enable" use:enhance={() => ({ result }) => handleResult(result)}>
				<Button variant="outline" type="submit">Enable</Button>
			</form>
		{/if}
		<Button variant="destructive" onclick={() => (deleteOpen = true)}>Delete</Button>
	</div>
</PageHeader>

<div class="grid gap-6 lg:grid-cols-2">
	<Card>
		<CardHeader>
			<h2 class="text-lg font-semibold text-foreground">Rule Information</h2>
		</CardHeader>
		<CardContent>
			<div class="grid gap-4 sm:grid-cols-2">
				<div>
					<p class="text-sm text-muted-foreground">Name</p>
					<p class="font-medium text-foreground">{rule.name}</p>
				</div>
				<div>
					<p class="text-sm text-muted-foreground">Type</p>
					<RuleTypeBadge ruleType={rule.rule_type} />
				</div>
				<div>
					<p class="text-sm text-muted-foreground">Priority</p>
					<p class="font-medium text-foreground">{rule.priority}</p>
				</div>
				<div>
					<p class="text-sm text-muted-foreground">Status</p>
					<span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {rule.is_enabled ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'}">
						{rule.is_enabled ? 'Enabled' : 'Disabled'}
					</span>
				</div>
				{#if rule.description}
					<div class="sm:col-span-2">
						<p class="text-sm text-muted-foreground">Description</p>
						<p class="text-sm text-foreground">{rule.description}</p>
					</div>
				{/if}
			</div>

			<Separator class="my-4" />

			<div class="grid gap-4 sm:grid-cols-2">
				<div>
					<p class="text-sm text-muted-foreground">Created</p>
					<p class="text-sm text-foreground">{new Date(rule.created_at).toLocaleDateString()}</p>
				</div>
				<div>
					<p class="text-sm text-muted-foreground">Updated</p>
					<p class="text-sm text-foreground">{new Date(rule.updated_at).toLocaleDateString()}</p>
				</div>
			</div>
		</CardContent>
	</Card>

	<Card>
		<CardHeader>
			<h2 class="text-lg font-semibold text-foreground">Parameters</h2>
		</CardHeader>
		<CardContent>
			<RuleParamsEditor
				ruleType={rule.rule_type}
				daysThreshold={rule.parameters?.days_threshold as number ?? 90}
				expression={rule.parameters?.expression as string ?? ''}
				readonly={true}
			/>
		</CardContent>
	</Card>
</div>

<div class="mt-4">
	<a href="/governance/detection-rules" class="text-sm text-muted-foreground hover:text-foreground hover:underline">&larr; Back to Detection Rules</a>
</div>

<!-- Delete Dialog -->
<Dialog.Root bind:open={deleteOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Delete Detection Rule</Dialog.Title>
			<Dialog.Description>Delete "{rule.name}"? This cannot be undone.</Dialog.Description>
		</Dialog.Header>
		<form method="POST" action="?/delete" use:enhance={() => {
			deleteOpen = false;
			return async ({ result, update }) => {
				if (result.type === 'redirect') {
					addToast('success', 'Rule deleted');
				}
				await update();
			};
		}}>
			<Dialog.Footer>
				<Button variant="outline" type="button" onclick={() => (deleteOpen = false)}>Cancel</Button>
				<Button variant="destructive" type="submit">Delete</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
