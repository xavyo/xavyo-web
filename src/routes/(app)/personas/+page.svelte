<script lang="ts">
	import { createColumnHelper } from '@tanstack/table-core';
	import type { ColumnDef } from '@tanstack/table-core';
	import { renderComponent } from '@tanstack/svelte-table';
	import type { PaginationState, Updater } from '@tanstack/svelte-table';
	import DataTable from '$lib/components/data-table/data-table.svelte';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import { EmptyState } from '$lib/components/ui/empty-state';
	import { addToast } from '$lib/stores/toast.svelte';
	import type {
		PersonaResponse,
		PersonaListResponse,
		ArchetypeResponse,
		ArchetypeListResponse
	} from '$lib/api/types';
	import PersonaStatusBadge from './persona-status-badge.svelte';
	import PersonaNameLink from './persona-name-link.svelte';

	const columnHelper = createColumnHelper<PersonaResponse>();

	const columns = [
		columnHelper.accessor('persona_name', {
			header: 'Persona Name',
			cell: (info) =>
				renderComponent(PersonaNameLink, {
					name: info.getValue(),
					href: `/personas/${info.row.original.id}`
				})
		}),
		columnHelper.accessor('display_name', {
			header: 'Display Name',
			cell: (info) => info.getValue()
		}),
		columnHelper.accessor('archetype_name', {
			header: 'Archetype',
			cell: (info) => info.getValue() ?? '—'
		}),
		columnHelper.accessor('physical_user_name', {
			header: 'Physical User',
			cell: (info) => info.getValue() ?? '—'
		}),
		columnHelper.accessor('status', {
			header: 'Status',
			cell: (info) =>
				renderComponent(PersonaStatusBadge, { status: info.getValue() })
		}),
		columnHelper.accessor('valid_from', {
			header: 'Valid From',
			cell: (info) => new Date(info.getValue()).toLocaleDateString()
		}),
		columnHelper.accessor('valid_until', {
			header: 'Valid Until',
			cell: (info) => {
				const val = info.getValue();
				return val ? new Date(val).toLocaleDateString() : '—';
			}
		})
	] as ColumnDef<PersonaResponse>[];

	let data: PersonaResponse[] = $state([]);
	let pageCount: number = $state(0);
	let pagination: PaginationState = $state({ pageIndex: 0, pageSize: 20 });
	let isLoading: boolean = $state(false);

	// Filters
	let statusFilter: string = $state('');
	let archetypeFilter: string = $state('');
	let hasFilters = $derived(statusFilter !== '' || archetypeFilter !== '');
	let archetypes: ArchetypeResponse[] = $state([]);

	const statusOptions = [
		{ value: '', label: 'All statuses' },
		{ value: 'draft', label: 'Draft' },
		{ value: 'active', label: 'Active' },
		{ value: 'expiring', label: 'Expiring' },
		{ value: 'expired', label: 'Expired' },
		{ value: 'suspended', label: 'Suspended' },
		{ value: 'archived', label: 'Archived' }
	];

	async function fetchArchetypes() {
		try {
			const response = await fetch('/api/archetypes?limit=100');
			if (response.ok) {
				const result: ArchetypeListResponse = await response.json();
				archetypes = result.items;
			}
		} catch {
			// Silent fail — filter will just not have archetype options
		}
	}

	async function fetchPersonas() {
		isLoading = true;
		try {
			const params = new URLSearchParams({
				offset: String(pagination.pageIndex * pagination.pageSize),
				limit: String(pagination.pageSize)
			});
			if (statusFilter) {
				params.set('status', statusFilter);
			}
			if (archetypeFilter) {
				params.set('archetype_id', archetypeFilter);
			}

			const response = await fetch(`/api/personas?${params}`);
			if (!response.ok) {
				throw new Error('Failed to fetch personas');
			}

			const result: PersonaListResponse = await response.json();
			data = result.items;
			pageCount = Math.ceil(result.total / pagination.pageSize);
		} catch {
			addToast('error', 'Failed to load personas');
		} finally {
			isLoading = false;
		}
	}

	function handlePaginationChange(updater: Updater<PaginationState>) {
		if (typeof updater === 'function') {
			pagination = updater(pagination);
		} else {
			pagination = updater;
		}
	}

	// Fetch archetypes for filter on mount
	$effect(() => {
		fetchArchetypes();
	});

	// Fetch personas when filters or pagination change
	$effect(() => {
		void pagination;
		void statusFilter;
		void archetypeFilter;
		fetchPersonas();
	});
</script>

<PageHeader title="Personas" description="Temporary or alternate identities for people.">
	<a
		href="/personas/create"
		class="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
	>
		Create persona
	</a>
</PageHeader>

<div class="mb-4 flex flex-wrap gap-3">
	<select
		class="h-10 rounded-md border border-input bg-card px-3 text-sm shadow-xs focus-visible:outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
		bind:value={statusFilter}
		onchange={() => { pagination = { ...pagination, pageIndex: 0 }; }}
	>
		{#each statusOptions as opt}
			<option value={opt.value}>{opt.label}</option>
		{/each}
	</select>

	<select
		class="h-10 rounded-md border border-input bg-card px-3 text-sm shadow-xs focus-visible:outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
		bind:value={archetypeFilter}
		onchange={() => { pagination = { ...pagination, pageIndex: 0 }; }}
	>
		<option value="">All archetypes</option>
		{#each archetypes as arch}
			<option value={arch.id}>{arch.name}</option>
		{/each}
	</select>
</div>

{#snippet emptyState()}
	{#if hasFilters}
		<EmptyState
			title="No personas match your filters"
			description="Try adjusting your filter criteria."
		/>
		<div class="flex justify-center pb-4">
			<button
				onclick={() => { statusFilter = ''; archetypeFilter = ''; }}
				class="text-sm font-medium text-primary hover:underline"
			>
				Clear filters
			</button>
		</div>
	{:else}
		<EmptyState
			title="No personas yet"
			description="Create your first persona to get started."
			actionLabel="Create persona"
			actionHref="/personas/create"
		/>
	{/if}
{/snippet}

<DataTable
	{columns}
	{data}
	{pageCount}
	{pagination}
	onPaginationChange={handlePaginationChange}
	{isLoading}
	{emptyState}
/>
