<script lang="ts">
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import { addToast } from '$lib/stores/toast.svelte';
	import { enhance } from '$app/forms';

	let { data } = $props();
	let group = $derived(data.group);
	let confirmDelete: boolean = $state(false);
	let refreshing: boolean = $state(false);

	const groupTypeLabels: Record<string, string> = {
		department: 'Department',
		role: 'Role',
		location: 'Location',
		custom: 'Custom'
	};
</script>

<div class="flex items-center justify-between">
	<PageHeader title={group.name} description="Peer group details" />
	<div class="flex gap-2">
		<form
			method="POST"
			action="?/refresh"
			use:enhance={() => {
				refreshing = true;
				return async ({ result, update }) => {
					refreshing = false;
					if (result.type === 'success') {
						addToast('success', 'Peer group refreshed');
						await update();
					} else {
						addToast('error', 'Failed to refresh');
					}
				};
			}}
		>
			<button
				type="submit"
				class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
				disabled={refreshing}
			>
				{refreshing ? 'Refreshing...' : 'Refresh Stats'}
			</button>
		</form>
		{#if !confirmDelete}
			<button
				class="inline-flex items-center justify-center rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground ring-offset-background transition-colors hover:bg-destructive/90"
				onclick={() => (confirmDelete = true)}
			>
				Delete
			</button>
		{:else}
			<form
				method="POST"
				action="?/delete"
				use:enhance={() => {
					return async ({ result, update }) => {
						if (result.type === 'redirect') {
							addToast('success', 'Peer group deleted');
							await update();
						} else {
							addToast('error', 'Failed to delete');
							confirmDelete = false;
						}
					};
				}}
			>
				<div class="flex gap-2">
					<button
						type="submit"
						class="inline-flex items-center justify-center rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground ring-offset-background transition-colors hover:bg-destructive/90"
					>
						Confirm Delete
					</button>
					<button
						type="button"
						class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
						onclick={() => (confirmDelete = false)}
					>
						Cancel
					</button>
				</div>
			</form>
		{/if}
	</div>
</div>

<div class="mt-6 max-w-2xl space-y-6">
	<div class="rounded-lg border border-border bg-card p-6">
		<h3 class="mb-4 text-lg font-semibold">Group Information</h3>
		<dl class="grid grid-cols-2 gap-4">
			<div>
				<dt class="text-sm text-muted-foreground">Name</dt>
				<dd class="font-medium">{group.name}</dd>
			</div>
			<div>
				<dt class="text-sm text-muted-foreground">Type</dt>
				<dd class="font-medium">{groupTypeLabels[group.group_type] ?? group.group_type}</dd>
			</div>
			<div>
				<dt class="text-sm text-muted-foreground">Attribute Key</dt>
				<dd class="font-medium">{group.attribute_key}</dd>
			</div>
			<div>
				<dt class="text-sm text-muted-foreground">Attribute Value</dt>
				<dd class="font-medium">{group.attribute_value}</dd>
			</div>
		</dl>
	</div>

	<div class="rounded-lg border border-border bg-card p-6">
		<h3 class="mb-4 text-lg font-semibold">Statistics</h3>
		<dl class="grid grid-cols-3 gap-4">
			<div>
				<dt class="text-sm text-muted-foreground">User Count</dt>
				<dd class="text-2xl font-bold">{group.user_count}</dd>
			</div>
			<div>
				<dt class="text-sm text-muted-foreground">Avg Entitlements</dt>
				<dd class="text-2xl font-bold">{group.avg_entitlements !== null ? group.avg_entitlements.toFixed(1) : '—'}</dd>
			</div>
			<div>
				<dt class="text-sm text-muted-foreground">Std Dev</dt>
				<dd class="text-2xl font-bold">{group.stddev_entitlements !== null ? group.stddev_entitlements.toFixed(1) : '—'}</dd>
			</div>
		</dl>
	</div>

	<div class="rounded-lg border border-border bg-card p-6">
		<h3 class="mb-4 text-lg font-semibold">Metadata</h3>
		<dl class="grid grid-cols-2 gap-4">
			<div>
				<dt class="text-sm text-muted-foreground">ID</dt>
				<dd class="font-mono text-sm">{group.id}</dd>
			</div>
			<div>
				<dt class="text-sm text-muted-foreground">Created</dt>
				<dd class="text-sm">{new Date(group.created_at).toLocaleString()}</dd>
			</div>
			<div>
				<dt class="text-sm text-muted-foreground">Updated</dt>
				<dd class="text-sm">{new Date(group.updated_at).toLocaleString()}</dd>
			</div>
		</dl>
	</div>
</div>

<div class="mt-4">
	<a href="/governance/peer-groups" class="text-sm text-primary hover:underline">Back to Peer Groups</a>
</div>
