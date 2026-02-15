<script lang="ts">
	import { goto } from '$app/navigation';
	import { superForm } from 'sveltekit-superforms';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import SpForm from '$lib/components/federation/sp-form.svelte';
	import { Card, CardContent, CardHeader } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Separator } from '$lib/components/ui/separator';
	import { addToast } from '$lib/stores/toast.svelte';
	import { Upload, Loader2 } from 'lucide-svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const sf = superForm(data.form, {
		onResult({ result }) {
			if (result.type === 'redirect') {
				addToast('success', 'Service provider created successfully');
			}
		}
	});

	// Metadata import state
	let metadataUrl = $state('');
	let metadataXml = $state('');
	let importing = $state(false);
	let importError = $state<string | null>(null);

	async function handleImport() {
		if (!metadataUrl && !metadataXml) {
			importError = 'Please provide a metadata URL or paste metadata XML';
			return;
		}

		importing = true;
		importError = null;

		try {
			const res = await fetch('/api/federation/saml/service-providers/from-metadata', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					metadata_url: metadataUrl || undefined,
					metadata_xml: metadataXml || undefined
				})
			});

			if (!res.ok) {
				const err = await res.json().catch(() => null);
				throw new Error(err?.message || `Import failed: ${res.status}`);
			}

			const sp = await res.json();
			addToast('success', `Service provider "${sp.name}" created from metadata`);
			goto(`/federation/saml/${sp.id}`);
		} catch (e) {
			importError = e instanceof Error ? e.message : 'Failed to import metadata';
		} finally {
			importing = false;
		}
	}
</script>

<PageHeader title="Add service provider" description="Configure a new SAML service provider" />

<!-- Metadata Import section (P3) -->
<Card class="mb-6">
	<CardHeader>
		<h2 class="text-base font-semibold">Import from Metadata (optional)</h2>
		<p class="text-sm text-muted-foreground">
			Automatically create a service provider by importing its SAML metadata
		</p>
	</CardHeader>
	<CardContent class="space-y-4">
		<div class="space-y-2">
			<Label for="metadata-url">Metadata URL</Label>
			<Input
				id="metadata-url"
				placeholder="https://example.com/saml/metadata"
				value={metadataUrl}
				oninput={(e) => { metadataUrl = (e.target as HTMLInputElement).value; }}
			/>
		</div>

		<div class="flex items-center gap-3">
			<Separator class="flex-1" />
			<span class="text-xs text-muted-foreground">or</span>
			<Separator class="flex-1" />
		</div>

		<div class="space-y-2">
			<Label for="metadata-xml">Paste metadata XML</Label>
			<textarea
				id="metadata-xml"
				class="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
				placeholder="<EntityDescriptor ...>"
				value={metadataXml}
				oninput={(e) => { metadataXml = (e.target as HTMLTextAreaElement).value; }}
			></textarea>
		</div>

		{#if importError}
			<div class="rounded-md border border-destructive/50 bg-destructive/10 p-3">
				<p class="text-sm text-destructive">{importError}</p>
			</div>
		{/if}

		<Button onclick={handleImport} disabled={importing || (!metadataUrl && !metadataXml)}>
			{#if importing}
				<Loader2 class="mr-2 h-4 w-4 animate-spin" />Importing...
			{:else}
				<Upload class="mr-2 h-4 w-4" />Import & Create SP
			{/if}
		</Button>
	</CardContent>
</Card>

<Separator class="mb-6" />

<SpForm superform={sf} mode="create" />
