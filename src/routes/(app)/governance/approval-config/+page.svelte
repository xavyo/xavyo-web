<script lang="ts">
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import { EmptyState } from '$lib/components/ui/empty-state';
	import { addToast } from '$lib/stores/toast.svelte';
	import type {
		ApprovalWorkflowSummary,
		ApprovalWorkflowListResponse,
		ApprovalGroupSummary,
		ApprovalGroupListResponse,
		EscalationPolicySummary,
		EscalationPolicyListResponse
	} from '$lib/api/types';

	const tabs = [
		{ id: 'workflows', label: 'Workflows' },
		{ id: 'groups', label: 'Groups' },
		{ id: 'escalation-policies', label: 'Escalation Policies' }
	];

	let activeTab: string = $state('workflows');

	// === Workflows tab ===
	let workflows: ApprovalWorkflowSummary[] = $state([]);
	let workflowsLoading: boolean = $state(false);

	async function fetchWorkflows() {
		workflowsLoading = true;
		try {
			const response = await fetch('/api/governance/approval-workflows?limit=100');
			if (!response.ok) throw new Error('Failed to fetch');
			const result: ApprovalWorkflowListResponse = await response.json();
			workflows = result.items;
		} catch {
			addToast('error', 'Failed to load approval workflows');
		} finally {
			workflowsLoading = false;
		}
	}

	// === Groups tab ===
	let groups: ApprovalGroupSummary[] = $state([]);
	let groupsLoading: boolean = $state(false);

	async function fetchGroups() {
		groupsLoading = true;
		try {
			const response = await fetch('/api/governance/approval-groups?limit=100');
			if (!response.ok) throw new Error('Failed to fetch');
			const result: ApprovalGroupListResponse = await response.json();
			groups = result.items;
		} catch {
			addToast('error', 'Failed to load approval groups');
		} finally {
			groupsLoading = false;
		}
	}

	// === Escalation Policies tab ===
	let policies: EscalationPolicySummary[] = $state([]);
	let policiesLoading: boolean = $state(false);

	async function fetchPolicies() {
		policiesLoading = true;
		try {
			const response = await fetch('/api/governance/escalation-policies?limit=100');
			if (!response.ok) throw new Error('Failed to fetch');
			const result: EscalationPolicyListResponse = await response.json();
			policies = result.items;
		} catch {
			addToast('error', 'Failed to load escalation policies');
		} finally {
			policiesLoading = false;
		}
	}

	const fallbackLabels: Record<string, string> = {
		escalate_admin: 'Escalate to Admin',
		auto_approve: 'Auto Approve',
		auto_reject: 'Auto Reject',
		remain_pending: 'Remain Pending'
	};

	// === Reactive data fetching ===
	$effect(() => {
		if (activeTab === 'workflows') {
			fetchWorkflows();
		}
	});

	$effect(() => {
		if (activeTab === 'groups') {
			fetchGroups();
		}
	});

	$effect(() => {
		if (activeTab === 'escalation-policies') {
			fetchPolicies();
		}
	});
</script>

<div class="flex items-center justify-between">
	<PageHeader
		title="Approval Configuration"
		description="Manage approval workflows, groups, and escalation policies"
	/>
</div>

<!-- Tab navigation -->
<div class="border-b border-border">
	<nav class="-mb-px flex gap-4" aria-label="Tabs">
		{#each tabs as tab}
			<button
				class="border-b-2 px-1 py-3 text-sm font-medium transition-colors {activeTab === tab.id
					? 'border-primary text-primary'
					: 'border-transparent text-muted-foreground hover:border-muted-foreground/30 hover:text-foreground'}"
				onclick={() => (activeTab = tab.id)}
			>
				{tab.label}
			</button>
		{/each}
	</nav>
</div>

<!-- Tab content -->
<div class="mt-4">
	{#if activeTab === 'workflows'}
		<div class="mb-4 flex items-center justify-end">
			<a
				href="/governance/approval-config/workflows/create"
				class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90"
			>
				Create Workflow
			</a>
		</div>

		{#if workflowsLoading}
			<div class="space-y-3">
				{#each Array(3) as _}
					<div class="h-12 animate-pulse rounded-lg bg-muted"></div>
				{/each}
			</div>
		{:else if workflows.length === 0}
			<EmptyState
				title="No approval workflows yet"
				description="Create your first approval workflow to define multi-step approval processes."
			/>
		{:else}
			<div class="overflow-x-auto rounded-lg border border-border">
				<table class="w-full text-sm">
					<thead>
						<tr class="border-b border-border bg-muted/50">
							<th class="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
							<th class="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
							<th class="px-4 py-3 text-left font-medium text-muted-foreground">Default</th>
							<th class="px-4 py-3 text-left font-medium text-muted-foreground">Steps</th>
							<th class="px-4 py-3 text-left font-medium text-muted-foreground">Created</th>
						</tr>
					</thead>
					<tbody>
						{#each workflows as workflow}
							<tr class="border-b border-border last:border-0 hover:bg-muted/30">
								<td class="px-4 py-3">
									<a
										href="/governance/approval-config/workflows/{workflow.id}"
										class="font-medium text-primary hover:underline"
									>
										{workflow.name}
									</a>
								</td>
								<td class="px-4 py-3">
									<span
										class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium {workflow.is_active
											? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
											: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'}"
									>
										{workflow.is_active ? 'Active' : 'Inactive'}
									</span>
								</td>
								<td class="px-4 py-3">
									{#if workflow.is_default}
										<span
											class="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
										>
											Default
										</span>
									{/if}
								</td>
								<td class="px-4 py-3 text-muted-foreground">
									{workflow.step_count}
								</td>
								<td class="px-4 py-3 text-muted-foreground">
									{new Date(workflow.created_at).toLocaleDateString()}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	{:else if activeTab === 'groups'}
		<div class="mb-4 flex items-center justify-end">
			<a
				href="/governance/approval-config/groups/create"
				class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90"
			>
				Create Group
			</a>
		</div>

		{#if groupsLoading}
			<div class="space-y-3">
				{#each Array(3) as _}
					<div class="h-12 animate-pulse rounded-lg bg-muted"></div>
				{/each}
			</div>
		{:else if groups.length === 0}
			<EmptyState
				title="No approval groups yet"
				description="Create your first approval group to organize approvers."
			/>
		{:else}
			<div class="overflow-x-auto rounded-lg border border-border">
				<table class="w-full text-sm">
					<thead>
						<tr class="border-b border-border bg-muted/50">
							<th class="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
							<th class="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
							<th class="px-4 py-3 text-left font-medium text-muted-foreground">Members</th>
							<th class="px-4 py-3 text-left font-medium text-muted-foreground">Created</th>
						</tr>
					</thead>
					<tbody>
						{#each groups as group}
							<tr class="border-b border-border last:border-0 hover:bg-muted/30">
								<td class="px-4 py-3">
									<a
										href="/governance/approval-config/groups/{group.id}"
										class="font-medium text-primary hover:underline"
									>
										{group.name}
									</a>
								</td>
								<td class="px-4 py-3">
									<span
										class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium {group.is_active
											? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
											: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'}"
									>
										{group.is_active ? 'Active' : 'Disabled'}
									</span>
								</td>
								<td class="px-4 py-3 text-muted-foreground">
									{group.member_count}
								</td>
								<td class="px-4 py-3 text-muted-foreground">
									{new Date(group.created_at).toLocaleDateString()}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	{:else if activeTab === 'escalation-policies'}
		<div class="mb-4 flex items-center justify-end">
			<a
				href="/governance/approval-config/escalation-policies/create"
				class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90"
			>
				Create Policy
			</a>
		</div>

		{#if policiesLoading}
			<div class="space-y-3">
				{#each Array(3) as _}
					<div class="h-12 animate-pulse rounded-lg bg-muted"></div>
				{/each}
			</div>
		{:else if policies.length === 0}
			<EmptyState
				title="No escalation policies yet"
				description="Create your first escalation policy to define timeout and escalation behavior."
			/>
		{:else}
			<div class="overflow-x-auto rounded-lg border border-border">
				<table class="w-full text-sm">
					<thead>
						<tr class="border-b border-border bg-muted/50">
							<th class="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
							<th class="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
							<th class="px-4 py-3 text-left font-medium text-muted-foreground">Fallback</th>
							<th class="px-4 py-3 text-left font-medium text-muted-foreground">Levels</th>
							<th class="px-4 py-3 text-left font-medium text-muted-foreground">Created</th>
						</tr>
					</thead>
					<tbody>
						{#each policies as policy}
							<tr class="border-b border-border last:border-0 hover:bg-muted/30">
								<td class="px-4 py-3">
									<a
										href="/governance/approval-config/escalation-policies/{policy.id}"
										class="font-medium text-primary hover:underline"
									>
										{policy.name}
									</a>
								</td>
								<td class="px-4 py-3">
									<span
										class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium {policy.is_active
											? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
											: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'}"
									>
										{policy.is_active ? 'Active' : 'Inactive'}
									</span>
								</td>
								<td class="px-4 py-3">
									<span
										class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium
											{policy.final_fallback === 'auto_reject'
											? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
											: policy.final_fallback === 'auto_approve'
												? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
												: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'}"
									>
										{fallbackLabels[policy.final_fallback] ?? policy.final_fallback}
									</span>
								</td>
								<td class="px-4 py-3 text-muted-foreground">
									{policy.level_count}
								</td>
								<td class="px-4 py-3 text-muted-foreground">
									{new Date(policy.created_at).toLocaleDateString()}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	{/if}
</div>
