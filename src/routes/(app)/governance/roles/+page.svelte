<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { EmptyState } from '$lib/components/ui/empty-state';
	import type { PageData } from './$types';
	import type { GovernanceRole, RoleTreeNode } from '$lib/api/types';
	import { fetchRoleTree } from '$lib/api/governance-roles-client';
	import { Plus, List, GitBranch } from 'lucide-svelte';
	import RoleTree from '$lib/components/governance/role-tree.svelte';

	let { data }: { data: PageData } = $props();

	let viewMode = $state<'list' | 'tree'>('list');
	let treeData = $state<RoleTreeNode[]>([]);
	let treeLoading = $state(false);

	async function loadTree() {
		treeLoading = true;
		try {
			const result = await fetchRoleTree();
			treeData = result.roots;
		} catch {
			treeData = [];
		} finally {
			treeLoading = false;
		}
	}

	function toggleView() {
		if (viewMode === 'list') {
			viewMode = 'tree';
			loadTree();
		} else {
			viewMode = 'list';
		}
	}

	// Pagination
	const limit = $derived(data.roles.limit);
	const offset = $derived(data.roles.offset);
	const total = $derived(data.roles.total);
	const currentPage = $derived(Math.floor(offset / limit) + 1);
	const totalPages = $derived(Math.ceil(total / limit));

	function goToPage(page: number) {
		const newOffset = (page - 1) * limit;
		goto(`/governance/roles?offset=${newOffset}&limit=${limit}`);
	}

	function formatDate(dateStr: string): string {
		return new Date(dateStr).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}
</script>

<div class="mb-6 flex items-start justify-between">
	<div>
		<h1 class="text-2xl font-semibold tracking-tight">Governance Roles</h1>
		<p class="mt-1 text-sm text-muted-foreground">Manage RBAC roles and their hierarchy</p>
	</div>
	<div class="flex gap-2">
		<Button variant="outline" size="sm" onclick={toggleView}>
			{#if viewMode === 'list'}
				<GitBranch class="mr-2 h-4 w-4" />
				Tree View
			{:else}
				<List class="mr-2 h-4 w-4" />
				List View
			{/if}
		</Button>
		<a href="/governance/roles/create">
			<Button size="sm">
				<Plus class="mr-2 h-4 w-4" />
				Create Role
			</Button>
		</a>
	</div>
</div>

{#if viewMode === 'tree'}
	<!-- Tree View -->
	{#if treeLoading}
		<div class="space-y-3">
			{#each [1, 2, 3] as _}
				<div class="h-10 animate-pulse rounded-md bg-muted"></div>
			{/each}
		</div>
	{:else if treeData.length === 0}
		<EmptyState
			title="No roles found"
			description="Create your first governance role to get started."
		/>
	{:else}
		<RoleTree roots={treeData} />
	{/if}
{:else}
	<!-- List View -->
	{#if data.roles.items.length === 0}
		<EmptyState
			title="No governance roles"
			description="Create your first governance role to define your RBAC structure."
			actionLabel="Create Role"
			actionHref="/governance/roles/create"
		/>
	{:else}
		<div class="rounded-md border">
			<table class="w-full text-sm">
				<thead>
					<tr class="border-b bg-muted/50">
						<th class="px-4 py-3 text-left font-medium">Name</th>
						<th class="px-4 py-3 text-left font-medium">Description</th>
						<th class="px-4 py-3 text-left font-medium">Depth</th>
						<th class="px-4 py-3 text-left font-medium">Type</th>
						<th class="px-4 py-3 text-left font-medium">Created</th>
					</tr>
				</thead>
				<tbody>
					{#each data.roles.items as role (role.id)}
						<tr
							class="border-b transition-colors hover:bg-muted/50 cursor-pointer"
							onclick={() => goto(`/governance/roles/${role.id}`)}
						>
							<td class="px-4 py-3 font-medium">
								<a href="/governance/roles/{role.id}" class="text-primary hover:underline">
									{role.name}
								</a>
							</td>
							<td class="px-4 py-3 text-muted-foreground">
								{role.description ?? '—'}
							</td>
							<td class="px-4 py-3">
								<Badge variant="outline">{role.hierarchy_depth}</Badge>
							</td>
							<td class="px-4 py-3">
								{#if role.is_abstract}
									<Badge variant="secondary">Abstract</Badge>
								{:else}
									<Badge variant="default">Concrete</Badge>
								{/if}
							</td>
							<td class="px-4 py-3 text-muted-foreground">
								{formatDate(role.created_at)}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<!-- Pagination -->
		{#if totalPages > 1}
			<div class="mt-4 flex items-center justify-between">
				<p class="text-sm text-muted-foreground">
					Showing {offset + 1} to {Math.min(offset + limit, total)} of {total} roles
				</p>
				<div class="flex gap-2">
					<Button
						variant="outline"
						size="sm"
						disabled={currentPage <= 1}
						onclick={() => goToPage(currentPage - 1)}
					>
						Previous
					</Button>
					<Button
						variant="outline"
						size="sm"
						disabled={currentPage >= totalPages}
						onclick={() => goToPage(currentPage + 1)}
					>
						Next
					</Button>
				</div>
			</div>
		{/if}
	{/if}
{/if}
