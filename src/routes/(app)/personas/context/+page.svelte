<script lang="ts">
	import type { CurrentContextResponse, ContextSessionSummary } from '$lib/api/types';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import ContextSwitchCard from '$lib/components/persona/context-switch-card.svelte';
	import SessionHistoryTable from '$lib/components/persona/session-history-table.svelte';
	import { switchContextClient, switchBackClient } from '$lib/api/persona-context-client';
	import { addToast } from '$lib/stores/toast.svelte';
	import { invalidateAll } from '$app/navigation';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let context = $derived(data.context as CurrentContextResponse | null);
	let sessions = $derived(data.sessions as ContextSessionSummary[]);
	let sessionsTotal = $derived((data.sessionsTotal as number) ?? 0);
	let personas = $derived((data.personas as { id: string; name: string; status: string }[]) ?? []);

	let switching = $state(false);

	async function handleSwitch(personaId: string, reason?: string) {
		switching = true;
		try {
			await switchContextClient({ persona_id: personaId, reason });
			addToast('success', 'Switched to persona successfully');
			await invalidateAll();
		} catch {
			addToast('error', 'Failed to switch context');
		} finally {
			switching = false;
		}
	}

	async function handleSwitchBack(reason?: string) {
		switching = true;
		try {
			await switchBackClient({ reason });
			addToast('success', 'Switched back to physical identity');
			await invalidateAll();
		} catch {
			addToast('error', 'Failed to switch back');
		} finally {
			switching = false;
		}
	}
</script>

<PageHeader title="Persona Context" description="Switch between your physical identity and assigned personas" />

<div class="space-y-6">
	{#if context}
		<ContextSwitchCard
			{context}
			{personas}
			onSwitch={handleSwitch}
			onSwitchBack={handleSwitchBack}
			{switching}
		/>
	{:else}
		<p class="text-muted-foreground">Unable to load current context.</p>
	{/if}

	<div>
		<h3 class="mb-4 text-lg font-semibold">Session History</h3>
		<SessionHistoryTable {sessions} total={sessionsTotal} />
	</div>
</div>
