<script lang="ts">
	import type { ReportTemplate } from '$lib/api/types';
	import Badge from '$lib/components/ui/badge/badge.svelte';

	interface Props {
		templates: ReportTemplate[];
		loading?: boolean;
	}

	let { templates, loading = false }: Props = $props();

	function complianceClass(standard: string | null): string {
		switch (standard) {
			case 'sox':
				return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
			case 'gdpr':
				return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
			case 'hipaa':
				return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
			case 'custom':
				return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
			default:
				return 'bg-muted text-muted-foreground';
		}
	}

	function typeLabel(type: string): string {
		return type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
	}
</script>

<div class="space-y-4">
	<div class="flex items-center justify-between">
		<p class="text-sm text-muted-foreground">
			{templates.length} {templates.length === 1 ? 'template' : 'templates'}
		</p>
		<a
			href="/governance/reports/templates/create"
			class="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-xs hover:bg-primary/90"
		>
			Create Template
		</a>
	</div>

	{#if loading}
		<div class="space-y-3">
			{#each Array(3) as _}
				<div class="h-12 animate-pulse rounded-md bg-muted"></div>
			{/each}
		</div>
	{:else if templates.length === 0}
		<p class="py-8 text-center text-sm text-muted-foreground">No report templates available.</p>
	{:else}
		<div class="overflow-x-auto">
			<table class="w-full text-sm">
				<thead>
					<tr class="border-b border-border text-left">
						<th class="px-3 py-2 font-medium text-muted-foreground">Name</th>
						<th class="px-3 py-2 font-medium text-muted-foreground">Type</th>
						<th class="px-3 py-2 font-medium text-muted-foreground">Standard</th>
						<th class="px-3 py-2 font-medium text-muted-foreground">Source</th>
						<th class="px-3 py-2 font-medium text-muted-foreground">Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each templates as template}
						<tr class="border-b border-border">
							<td class="px-3 py-2">
								<a
									href="/governance/reports/templates/{template.id}"
									class="font-medium text-primary hover:underline"
								>
									{template.name}
								</a>
								{#if template.description}
									<p class="text-xs text-muted-foreground">{template.description}</p>
								{/if}
							</td>
							<td class="px-3 py-2 text-muted-foreground">{typeLabel(template.template_type)}</td>
							<td class="px-3 py-2">
								{#if template.compliance_standard}
									<Badge class={complianceClass(template.compliance_standard)}>
										{template.compliance_standard.toUpperCase()}
									</Badge>
								{:else}
									<span class="text-muted-foreground">—</span>
								{/if}
							</td>
							<td class="px-3 py-2">
								<Badge class={template.is_system ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary'}>
									{template.is_system ? 'System' : 'Custom'}
								</Badge>
							</td>
							<td class="px-3 py-2">
								<a
									href="/governance/reports/generate?template_id={template.id}"
									class="text-sm font-medium text-primary hover:underline"
								>
									Generate
								</a>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>
