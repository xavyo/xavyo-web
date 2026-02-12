<script lang="ts">
	import { Card, CardHeader, CardContent } from '$lib/components/ui/card';
	import { Separator } from '$lib/components/ui/separator';
	import { Button } from '$lib/components/ui/button';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import { enhance as formEnhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { addToast } from '$lib/stores/toast.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	function effectBadgeColor(effect: string): string {
		switch (effect) {
			case 'allow':
				return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
			case 'deny':
				return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
			default:
				return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
		}
	}

	function statusBadgeColor(status: string): string {
		switch (status) {
			case 'active':
				return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
			case 'inactive':
				return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
			default:
				return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
		}
	}

	function conditionTypeBadgeColor(type: string): string {
		switch (type) {
			case 'time_window':
				return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
			case 'user_attribute':
				return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
			case 'entitlement_check':
				return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
			default:
				return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
		}
	}

	function conditionTypeLabel(type: string): string {
		switch (type) {
			case 'time_window':
				return 'Time Window';
			case 'user_attribute':
				return 'User Attribute';
			case 'entitlement_check':
				return 'Entitlement Check';
			default:
				return type;
		}
	}

	function operatorLabel(op: string | null): string {
		if (!op) return '—';
		switch (op) {
			case 'equals':
				return 'Equals';
			case 'not_equals':
				return 'Not Equals';
			case 'contains':
				return 'Contains';
			case 'in_list':
				return 'In List';
			default:
				return op;
		}
	}

	function formatValue(value: unknown): string {
		if (value === null || value === undefined) return '—';
		if (typeof value === 'object') {
			try {
				return JSON.stringify(value, null, 2);
			} catch {
				return String(value);
			}
		}
		return String(value);
	}

	function formatDate(dateStr: string): string {
		return new Date(dateStr).toLocaleString();
	}
</script>

<!-- Header -->
<div class="flex items-center justify-between">
	<div class="flex items-center gap-3">
		<PageHeader title={data.policy.name} description="Authorization policy details" />
		<span
			class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {effectBadgeColor(data.policy.effect)}"
		>
			{data.policy.effect}
		</span>
		<span
			class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {statusBadgeColor(data.policy.status)}"
		>
			{data.policy.status}
		</span>
	</div>
	<div class="flex items-center gap-2">
		<a
			href="/governance/authorization/{data.policy.id}/edit"
			class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
		>
			Edit
		</a>
		{#if data.policy.status === 'active'}
			<form
				method="POST"
				action="?/disable"
				use:formEnhance={() => {
					return async ({ result }) => {
						if (result.type === 'success') {
							addToast('success', 'Policy disabled');
							await invalidateAll();
						} else if (result.type === 'failure') {
							addToast('error', (result.data?.error as string) || 'Failed to disable policy');
						}
					};
				}}
			>
				<Button type="submit" variant="outline">Disable</Button>
			</form>
		{:else}
			<form
				method="POST"
				action="?/enable"
				use:formEnhance={() => {
					return async ({ result }) => {
						if (result.type === 'success') {
							addToast('success', 'Policy enabled');
							await invalidateAll();
						} else if (result.type === 'failure') {
							addToast('error', (result.data?.error as string) || 'Failed to enable policy');
						}
					};
				}}
			>
				<Button type="submit" variant="outline">Enable</Button>
			</form>
		{/if}
		<a
			href="/governance/authorization"
			class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
		>
			Back to Policies
		</a>
	</div>
</div>

<!-- Navigation Tabs -->
<div class="mb-4 mt-4 flex gap-1 border-b">
	<a
		href="/governance/authorization"
		class="border-b-2 border-primary px-4 py-2 text-sm font-medium text-primary"
	>
		Policies
	</a>
	<a
		href="/governance/authorization/mappings"
		class="border-b-2 border-transparent px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
	>
		Mappings
	</a>
	<a
		href="/governance/authorization/test"
		class="border-b-2 border-transparent px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
	>
		Test
	</a>
</div>

<!-- Policy Information Card -->
<Card class="max-w-2xl">
	<CardHeader>
		<h2 class="text-xl font-semibold">Policy information</h2>
	</CardHeader>
	<CardContent class="space-y-4">
		<div class="grid gap-3">
			<div class="flex justify-between">
				<span class="text-sm text-muted-foreground">Name</span>
				<span class="text-sm font-medium">{data.policy.name}</span>
			</div>
			<div class="flex justify-between">
				<span class="text-sm text-muted-foreground">Description</span>
				<span class="text-sm">{data.policy.description ?? 'No description'}</span>
			</div>
			<div class="flex justify-between">
				<span class="text-sm text-muted-foreground">Effect</span>
				<span
					class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {effectBadgeColor(data.policy.effect)}"
				>
					{data.policy.effect}
				</span>
			</div>
			<div class="flex justify-between">
				<span class="text-sm text-muted-foreground">Status</span>
				<span
					class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {statusBadgeColor(data.policy.status)}"
				>
					{data.policy.status}
				</span>
			</div>
			<div class="flex justify-between">
				<span class="text-sm text-muted-foreground">Priority</span>
				<span class="text-sm">{data.policy.priority}</span>
			</div>
			<div class="flex justify-between">
				<span class="text-sm text-muted-foreground">Resource Type</span>
				<span class="text-sm">{data.policy.resource_type ?? '—'}</span>
			</div>
			<div class="flex justify-between">
				<span class="text-sm text-muted-foreground">Action</span>
				<span class="text-sm">{data.policy.action ?? '—'}</span>
			</div>

			<Separator />

			<div class="flex justify-between">
				<span class="text-sm text-muted-foreground">Created By</span>
				<span class="text-sm">{data.policy.created_by ?? '—'}</span>
			</div>
			<div class="flex justify-between">
				<span class="text-sm text-muted-foreground">Created</span>
				<span class="text-sm">{formatDate(data.policy.created_at)}</span>
			</div>
			<div class="flex justify-between">
				<span class="text-sm text-muted-foreground">Updated</span>
				<span class="text-sm">{formatDate(data.policy.updated_at)}</span>
			</div>
		</div>
	</CardContent>
</Card>

<!-- Conditions Card -->
<Card class="mt-4 max-w-2xl">
	<CardHeader>
		<h2 class="text-xl font-semibold">Conditions</h2>
	</CardHeader>
	<CardContent>
		{#if data.policy.conditions.length === 0}
			<p class="text-sm text-muted-foreground">
				No conditions. This policy applies unconditionally.
			</p>
		{:else}
			<div class="space-y-3">
				{#each data.policy.conditions as condition, index}
					<div class="rounded-md border p-4">
						<div class="flex items-center justify-between mb-2">
							<span class="text-sm font-medium">Condition {index + 1}</span>
							<span
								class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {conditionTypeBadgeColor(condition.condition_type)}"
							>
								{conditionTypeLabel(condition.condition_type)}
							</span>
						</div>
						<div class="grid gap-2">
							{#if condition.attribute_path}
								<div class="flex justify-between">
									<span class="text-sm text-muted-foreground">Attribute Path</span>
									<span class="text-sm font-mono">{condition.attribute_path}</span>
								</div>
							{/if}
							{#if condition.operator}
								<div class="flex justify-between">
									<span class="text-sm text-muted-foreground">Operator</span>
									<span class="text-sm">{operatorLabel(condition.operator)}</span>
								</div>
							{/if}
							<div class="flex justify-between">
								<span class="text-sm text-muted-foreground">Value</span>
								<span class="text-sm font-mono">{formatValue(condition.value)}</span>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</CardContent>
</Card>


