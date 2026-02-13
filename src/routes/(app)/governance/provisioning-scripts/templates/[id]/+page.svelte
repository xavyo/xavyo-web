<script lang="ts">
	import { goto } from '$app/navigation';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Card, CardContent, CardHeader } from '$lib/components/ui/card';
	import TemplateCategoryBadge from '$lib/components/provisioning-scripts/template-category-badge.svelte';
	import { addToast } from '$lib/stores/toast.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const template = $derived(data.template);
	let loading = $state(false);

	async function handleDelete() {
		if (!confirm('Are you sure you want to delete this template?')) return;
		loading = true;
		try {
			const res = await fetch(`/api/provisioning-scripts/templates/${template.id}`, { method: 'DELETE' });
			if (res.ok) {
				addToast('success', 'Template deleted');
				goto('/governance/provisioning-scripts');
			} else {
				const body = await res.json().catch(() => ({ error: 'Delete failed' }));
				addToast('error', body.error || 'Failed to delete template');
			}
		} catch { addToast('error', 'Failed to delete template'); }
		loading = false;
	}

	async function handleInstantiate() {
		const name = prompt('Enter a name for the new script:');
		if (!name) return;
		loading = true;
		try {
			const res = await fetch(`/api/provisioning-scripts/templates/${template.id}/instantiate`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name })
			});
			if (res.ok) {
				const script = await res.json();
				addToast('success', 'Script created from template');
				goto(`/governance/provisioning-scripts/${script.id}`);
			} else {
				const body = await res.json().catch(() => ({ error: 'Instantiate failed' }));
				addToast('error', body.error || 'Failed to create script from template');
			}
		} catch { addToast('error', 'Failed to create script from template'); }
		loading = false;
	}
</script>

<div class="flex items-center justify-between">
	<div class="flex items-center gap-3">
		<PageHeader title={template.name} description={template.description ?? 'No description'} />
		<TemplateCategoryBadge category={template.category} />
		{#if template.is_system}
			<Badge variant="outline">System</Badge>
		{/if}
	</div>
	<a
		href="/governance/provisioning-scripts"
		class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
	>
		Back to Scripts
	</a>
</div>

<div class="mt-6 space-y-6">
	<Card>
		<CardHeader>
			<h3 class="text-lg font-semibold">Template Information</h3>
		</CardHeader>
		<CardContent>
			<dl class="grid grid-cols-2 gap-4 text-sm">
				<div>
					<dt class="text-muted-foreground">Category</dt>
					<dd class="mt-1"><TemplateCategoryBadge category={template.category} /></dd>
				</div>
				<div>
					<dt class="text-muted-foreground">System Template</dt>
					<dd class="mt-1">{template.is_system ? 'Yes' : 'No'}</dd>
				</div>
				<div>
					<dt class="text-muted-foreground">Created</dt>
					<dd class="mt-1">{new Date(template.created_at).toLocaleString()}</dd>
				</div>
				<div>
					<dt class="text-muted-foreground">Updated</dt>
					<dd class="mt-1">{new Date(template.updated_at).toLocaleString()}</dd>
				</div>
			</dl>
		</CardContent>
	</Card>

	<Card>
		<CardHeader>
			<h3 class="text-lg font-semibold">Template Body</h3>
		</CardHeader>
		<CardContent>
			<pre class="rounded-md border bg-muted/50 p-4 text-sm font-mono whitespace-pre-wrap overflow-x-auto">{template.template_body}</pre>
		</CardContent>
	</Card>

	{#if template.placeholder_annotations}
		<Card>
			<CardHeader>
				<h3 class="text-lg font-semibold">Placeholder Annotations</h3>
			</CardHeader>
			<CardContent>
				<pre class="rounded-md border bg-muted/50 p-4 text-sm font-mono whitespace-pre-wrap overflow-x-auto">{typeof template.placeholder_annotations === 'string' ? template.placeholder_annotations : JSON.stringify(template.placeholder_annotations, null, 2)}</pre>
			</CardContent>
		</Card>
	{/if}

	<Card>
		<CardHeader>
			<h3 class="text-lg font-semibold">Actions</h3>
		</CardHeader>
		<CardContent class="flex flex-wrap gap-2">
			<Button onclick={handleInstantiate} disabled={loading}>Use Template</Button>
			{#if !template.is_system}
				<Button variant="destructive" onclick={handleDelete} disabled={loading}>Delete</Button>
			{/if}
		</CardContent>
	</Card>
</div>
