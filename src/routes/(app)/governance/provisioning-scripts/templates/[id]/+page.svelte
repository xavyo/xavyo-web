<script lang="ts">
	import { goto } from '$app/navigation';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Card, CardContent, CardHeader } from '$lib/components/ui/card';
	import TemplateCategoryBadge from '$lib/components/provisioning-scripts/template-category-badge.svelte';
	import { addToast } from '$lib/stores/toast.svelte';
	import { Dialog } from 'bits-ui';
	import DialogContent from '$lib/components/ui/dialog/dialog-content.svelte';
	import DialogHeader from '$lib/components/ui/dialog/dialog-header.svelte';
	import DialogTitle from '$lib/components/ui/dialog/dialog-title.svelte';
	import DialogFooter from '$lib/components/ui/dialog/dialog-footer.svelte';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const template = $derived(data.template);
	let loading = $state(false);

	// Confirm delete dialog
	let confirmOpen = $state(false);
	let confirmTitle = $state('');
	let confirmMessage = $state('');
	let confirmAction = $state<(() => Promise<void>) | null>(null);

	function openConfirm(title: string, message: string, action: () => Promise<void>) {
		confirmTitle = title;
		confirmMessage = message;
		confirmAction = action;
		confirmOpen = true;
	}

	async function executeConfirm() {
		if (confirmAction) {
			await confirmAction();
		}
		confirmOpen = false;
		confirmAction = null;
	}

	// Instantiate dialog (replaces window.prompt)
	let instantiateOpen = $state(false);
	let instantiateName = $state('');

	function handleDelete() {
		openConfirm('Delete Template', 'Are you sure you want to delete this template?', async () => {
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
		});
	}

	function handleInstantiateClick() {
		instantiateName = '';
		instantiateOpen = true;
	}

	async function handleInstantiate() {
		if (!instantiateName.trim()) {
			addToast('error', 'Script name is required');
			return;
		}
		loading = true;
		instantiateOpen = false;
		try {
			const res = await fetch(`/api/provisioning-scripts/templates/${template.id}/instantiate`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name: instantiateName.trim() })
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
			<Button onclick={handleInstantiateClick} disabled={loading}>Use Template</Button>
			{#if !template.is_system}
				<Button variant="destructive" onclick={handleDelete} disabled={loading}>Delete</Button>
			{/if}
		</CardContent>
	</Card>
</div>

<!-- Confirm Dialog -->
<Dialog.Root bind:open={confirmOpen}>
	<DialogContent>
		<DialogHeader>
			<DialogTitle>{confirmTitle}</DialogTitle>
		</DialogHeader>
		<div class="py-4">
			<p class="text-sm text-muted-foreground">{confirmMessage}</p>
		</div>
		<DialogFooter>
			<Button variant="outline" onclick={() => (confirmOpen = false)}>Cancel</Button>
			<Button variant="destructive" onclick={executeConfirm}>Confirm</Button>
		</DialogFooter>
	</DialogContent>
</Dialog.Root>

<!-- Instantiate Dialog -->
<Dialog.Root bind:open={instantiateOpen}>
	<DialogContent>
		<DialogHeader>
			<DialogTitle>Create Script from Template</DialogTitle>
		</DialogHeader>
		<div class="space-y-4 py-4">
			<p class="text-sm text-muted-foreground">Enter a name for the new script that will be created from this template.</p>
			<div class="space-y-2">
				<Label for="instantiate-name">Script Name</Label>
				<Input id="instantiate-name" type="text" placeholder="Enter script name..." bind:value={instantiateName} />
			</div>
		</div>
		<DialogFooter>
			<Button variant="outline" onclick={() => (instantiateOpen = false)}>Cancel</Button>
			<Button onclick={handleInstantiate} disabled={!instantiateName.trim()}>Create Script</Button>
		</DialogFooter>
	</DialogContent>
</Dialog.Root>
