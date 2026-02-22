<script lang="ts">
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Card, CardContent } from '$lib/components/ui/card';
	import ScriptStatusBadge from '$lib/components/provisioning-scripts/script-status-badge.svelte';
	import TemplateCategoryBadge from '$lib/components/provisioning-scripts/template-category-badge.svelte';
	import AnalyticsDashboard from '$lib/components/provisioning-scripts/analytics-dashboard.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const scripts = $derived(data.scripts);
	const templates = $derived(data.templates);
	const dashboard = $derived(data.dashboard);

	let activeTab = $state('scripts');

	const tabs = [
		// svelte-ignore state_referenced_locally
		{ id: 'scripts', label: 'Scripts', count: data.scriptsTotal },
		// svelte-ignore state_referenced_locally
		{ id: 'templates', label: 'Templates', count: data.templatesTotal },
		{ id: 'analytics', label: 'Analytics' }
	];
</script>

<div class="flex items-center justify-between">
	<PageHeader
		title="Provisioning Scripts"
		description="Manage automation scripts for provisioning operations"
	/>
	<div class="flex gap-2">
		{#if activeTab === 'scripts'}
			<a
				href="/governance/provisioning-scripts/create"
				class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90"
			>
				Create Script
			</a>
		{:else if activeTab === 'templates'}
			<a
				href="/governance/provisioning-scripts/templates/create"
				class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90"
			>
				Create Template
			</a>
		{/if}
	</div>
</div>

<!-- Tab navigation -->
<div class="mt-6 border-b" role="tablist">
	{#each tabs as tab}
		<button
			role="tab"
			aria-selected={activeTab === tab.id}
			class="inline-flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition-colors {activeTab === tab.id
				? 'border-primary text-primary'
				: 'border-transparent text-muted-foreground hover:text-foreground'}"
			onclick={() => (activeTab = tab.id)}
		>
			{tab.label}
			{#if tab.count !== undefined}
				<Badge variant="secondary" class="ml-1 text-xs">{tab.count}</Badge>
			{/if}
		</button>
	{/each}
</div>

<!-- Tab content -->
<div class="mt-6">
	{#if activeTab === 'scripts'}
		<!-- Scripts tab -->
		{#if scripts.length === 0}
			<Card>
				<CardContent class="flex flex-col items-center justify-center py-12">
					<p class="text-muted-foreground mb-4">No provisioning scripts found</p>
					<a
						href="/governance/provisioning-scripts/create"
						class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
					>
						Create your first script
					</a>
				</CardContent>
			</Card>
		{:else}
			<div class="rounded-md border">
				<table class="w-full text-sm">
					<thead>
						<tr class="border-b bg-muted/50">
							<th class="px-4 py-3 text-left font-medium">Name</th>
							<th class="px-4 py-3 text-left font-medium">Status</th>
							<th class="px-4 py-3 text-right font-medium">Version</th>
							<th class="px-4 py-3 text-left font-medium">Created</th>
						</tr>
					</thead>
					<tbody>
						{#each scripts as script}
							<tr class="border-b last:border-0 hover:bg-muted/50">
								<td class="px-4 py-3">
									<a href="/governance/provisioning-scripts/{script.id}" class="font-medium text-primary hover:underline">
										{script.name}
									</a>
									{#if script.is_system}
										<Badge variant="outline" class="ml-2 text-xs">System</Badge>
									{/if}
									{#if script.description}
										<p class="text-xs text-muted-foreground mt-0.5">{script.description}</p>
									{/if}
								</td>
								<td class="px-4 py-3">
									<ScriptStatusBadge status={script.status} />
								</td>
								<td class="px-4 py-3 text-right font-mono">v{script.current_version}</td>
								<td class="px-4 py-3 text-muted-foreground">
									{new Date(script.created_at).toLocaleDateString()}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}

	{:else if activeTab === 'templates'}
		<!-- Templates tab -->
		{#if templates.length === 0}
			<Card>
				<CardContent class="flex flex-col items-center justify-center py-12">
					<p class="text-muted-foreground mb-4">No script templates found</p>
					<a
						href="/governance/provisioning-scripts/templates/create"
						class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
					>
						Create your first template
					</a>
				</CardContent>
			</Card>
		{:else}
			<div class="rounded-md border">
				<table class="w-full text-sm">
					<thead>
						<tr class="border-b bg-muted/50">
							<th class="px-4 py-3 text-left font-medium">Name</th>
							<th class="px-4 py-3 text-left font-medium">Category</th>
							<th class="px-4 py-3 text-left font-medium">Created</th>
						</tr>
					</thead>
					<tbody>
						{#each templates as template}
							<tr class="border-b last:border-0 hover:bg-muted/50">
								<td class="px-4 py-3">
									<a href="/governance/provisioning-scripts/templates/{template.id}" class="font-medium text-primary hover:underline">
										{template.name}
									</a>
									{#if template.is_system}
										<Badge variant="outline" class="ml-2 text-xs">System</Badge>
									{/if}
									{#if template.description}
										<p class="text-xs text-muted-foreground mt-0.5">{template.description}</p>
									{/if}
								</td>
								<td class="px-4 py-3">
									<TemplateCategoryBadge category={template.category} />
								</td>
								<td class="px-4 py-3 text-muted-foreground">
									{new Date(template.created_at).toLocaleDateString()}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}

	{:else if activeTab === 'analytics'}
		<!-- Analytics tab -->
		<AnalyticsDashboard {dashboard} />
	{/if}
</div>
