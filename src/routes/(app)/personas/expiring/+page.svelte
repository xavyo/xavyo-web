<script lang="ts">
	import type { ExpiringPersona, ExtendPersonaResponse } from '$lib/api/types';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import { Card, CardContent } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { EmptyState } from '$lib/components/ui/empty-state';
	import { extendPersonaClient } from '$lib/api/persona-expiry-client';
	import { addToast } from '$lib/stores/toast.svelte';
	import { invalidateAll } from '$app/navigation';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let personas = $derived((data.personas ?? []) as ExpiringPersona[]);

	let showExtendDialog = $state(false);
	let extendingPersona: ExpiringPersona | null = $state(null);
	let newValidUntil = $state('');
	let extendReason = $state('');
	let extending = $state(false);

	function openExtend(persona: ExpiringPersona) {
		extendingPersona = persona;
		newValidUntil = '';
		extendReason = '';
		showExtendDialog = true;
	}

	async function handleExtend() {
		if (!extendingPersona || !newValidUntil) return;
		extending = true;
		try {
			const result: ExtendPersonaResponse = await extendPersonaClient(extendingPersona.id, {
				new_valid_until: new Date(newValidUntil).toISOString(),
				reason: extendReason || undefined
			});
			if (result.status === 'approved') {
				addToast('success', 'Persona extended successfully');
			} else {
				addToast('success', 'Extension request submitted for approval');
			}
			showExtendDialog = false;
			await invalidateAll();
		} catch {
			addToast('error', 'Failed to extend persona');
		} finally {
			extending = false;
		}
	}
</script>

<PageHeader title="Expiring Personas" description="Personas approaching their expiration date (next 30 days)">
	<a href="/personas" class="text-sm text-muted-foreground hover:text-foreground">&larr; Back to Personas</a>
</PageHeader>

{#if personas.length === 0}
	<EmptyState title="No expiring personas" description="No personas are expiring within the next 30 days." />
{:else}
	<div class="rounded-md border">
		<table class="w-full text-sm">
			<thead>
				<tr class="border-b bg-muted/50">
					<th class="px-4 py-3 text-left font-medium">Name</th>
					<th class="px-4 py-3 text-left font-medium">Archetype</th>
					<th class="px-4 py-3 text-left font-medium">Assigned To</th>
					<th class="px-4 py-3 text-left font-medium">Expires</th>
					<th class="px-4 py-3 text-left font-medium">Days Left</th>
					<th class="px-4 py-3 text-left font-medium">Actions</th>
				</tr>
			</thead>
			<tbody>
				{#each personas as persona}
					<tr class="border-b">
						<td class="px-4 py-3 font-medium">
							<a href="/personas/{persona.id}" class="text-primary hover:underline">{persona.name}</a>
						</td>
						<td class="px-4 py-3 text-muted-foreground">{persona.archetype_name ?? '—'}</td>
						<td class="px-4 py-3 text-muted-foreground">{persona.assigned_user_name ?? '—'}</td>
						<td class="px-4 py-3">{new Date(persona.valid_until).toLocaleDateString()}</td>
						<td class="px-4 py-3">
							<Badge class={persona.days_until_expiry <= 7 ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'}>
								{persona.days_until_expiry} days
							</Badge>
						</td>
						<td class="px-4 py-3">
							<Button size="sm" variant="outline" onclick={() => openExtend(persona)}>Extend</Button>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}

{#if showExtendDialog}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
		<Card class="w-full max-w-md">
			<CardContent class="space-y-4 pt-6">
				<h3 class="text-lg font-semibold">Extend Persona: {extendingPersona?.name}</h3>
				<div class="space-y-2">
					<label for="new-valid-until" class="text-sm font-medium">New Expiration Date</label>
					<input id="new-valid-until" type="datetime-local" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" bind:value={newValidUntil} />
				</div>
				<div class="space-y-2">
					<label for="extend-reason" class="text-sm font-medium">Reason (optional)</label>
					<textarea id="extend-reason" class="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" bind:value={extendReason}></textarea>
				</div>
				<div class="flex gap-2">
					<Button disabled={extending || !newValidUntil} onclick={handleExtend}>
						{extending ? 'Extending...' : 'Extend'}
					</Button>
					<Button variant="ghost" onclick={() => (showExtendDialog = false)}>Cancel</Button>
				</div>
			</CardContent>
		</Card>
	</div>
{/if}
