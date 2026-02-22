<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import type { PageData } from './$types';
	import TemplateStatusBadge from '$lib/components/object-templates/template-status-badge.svelte';
	import PageHeader from '$lib/components/layout/page-header.svelte';

	let { data }: { data: PageData } = $props();

	let templates = $derived(data.templates);
	let total = $derived(data.total);
	let offset = $derived(data.offset);
	let limit = $derived(data.limit);
	let filters = $derived(data.filters);

	function applyFilters(objectType: string, status: string) {
		const params = new URLSearchParams();
		if (objectType) params.set('object_type', objectType);
		if (status) params.set('status', status);
		params.set('offset', '0');
		params.set('limit', String(limit));
		goto(`/governance/object-templates?${params.toString()}`);
	}

	function changePage(newOffset: number) {
		const params = new URLSearchParams($page.url.searchParams);
		params.set('offset', String(newOffset));
		goto(`/governance/object-templates?${params.toString()}`);
	}

	// svelte-ignore state_referenced_locally
	let filterObjectType = $state(filters.object_type);
	// svelte-ignore state_referenced_locally
	let filterStatus = $state(filters.status);

	function handleFilterChange() {
		applyFilters(filterObjectType, filterStatus);
	}

	const objectTypeLabels: Record<string, string> = {
		user: 'User',
		role: 'Role',
		entitlement: 'Entitlement',
		application: 'Application'
	};
</script>

<PageHeader
	title="Object Templates"
	description="Manage templates that automatically apply rules to identity objects during their lifecycle."
/>

<div class="space-y-4">
	<div class="flex flex-wrap items-center gap-3">
		<select
			value={filterObjectType}
			onchange={(e) => { filterObjectType = (e.target as HTMLSelectElement).value; handleFilterChange(); }}
			class="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
		>
			<option value="">All Types</option>
			<option value="user">User</option>
			<option value="role">Role</option>
			<option value="entitlement">Entitlement</option>
			<option value="application">Application</option>
		</select>

		<select
			value={filterStatus}
			onchange={(e) => { filterStatus = (e.target as HTMLSelectElement).value; handleFilterChange(); }}
			class="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
		>
			<option value="">All Status</option>
			<option value="draft">Draft</option>
			<option value="active">Active</option>
			<option value="disabled">Disabled</option>
		</select>

		<a
			href="/governance/object-templates/create"
			class="ml-auto rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
		>
			Create Template
		</a>
	</div>

	{#if templates.length === 0}
		<div class="rounded-md border border-zinc-200 bg-white p-8 text-center dark:border-zinc-700 dark:bg-zinc-900">
			<p class="text-zinc-500 dark:text-zinc-400">No templates found.</p>
		</div>
	{:else}
		<div class="overflow-hidden rounded-md border border-zinc-200 dark:border-zinc-700">
			<table class="w-full text-left text-sm">
				<thead class="bg-zinc-50 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
					<tr>
						<th class="px-4 py-3 font-medium">Name</th>
						<th class="px-4 py-3 font-medium">Object Type</th>
						<th class="px-4 py-3 font-medium">Priority</th>
						<th class="px-4 py-3 font-medium">Status</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-zinc-200 bg-white dark:divide-zinc-700 dark:bg-zinc-900">
					{#each templates as template}
						<tr class="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
							<td class="px-4 py-3">
								<a href="/governance/object-templates/{template.id}" class="font-medium text-blue-600 hover:underline dark:text-blue-400">
									{template.name}
								</a>
								{#if template.description}
									<p class="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{template.description}</p>
								{/if}
							</td>
							<td class="px-4 py-3">
								<span class="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
									{objectTypeLabels[template.object_type] ?? template.object_type}
								</span>
							</td>
							<td class="px-4 py-3 text-zinc-600 dark:text-zinc-400">{template.priority}</td>
							<td class="px-4 py-3">
								<TemplateStatusBadge status={template.status} />
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<div class="flex items-center justify-between text-sm text-zinc-600 dark:text-zinc-400">
			<span>{total} template{total !== 1 ? 's' : ''}</span>
			<div class="flex gap-2">
				<button
					onclick={() => changePage(Math.max(0, offset - limit))}
					disabled={offset === 0}
					class="rounded-md border border-zinc-300 px-3 py-1.5 text-sm disabled:opacity-50 dark:border-zinc-600"
				>
					Previous
				</button>
				<button
					onclick={() => changePage(offset + limit)}
					disabled={offset + limit >= total}
					class="rounded-md border border-zinc-300 px-3 py-1.5 text-sm disabled:opacity-50 dark:border-zinc-600"
				>
					Next
				</button>
			</div>
		</div>
	{/if}
</div>
