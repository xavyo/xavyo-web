<script lang="ts">
	import type { CurrentContextResponse } from '$lib/api/types';
	import { Card, CardContent, CardHeader } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';

	let {
		context,
		personas = [],
		onSwitch,
		onSwitchBack,
		switching = false
	}: {
		context: CurrentContextResponse;
		personas?: { id: string; name: string; status: string }[];
		onSwitch?: (personaId: string, reason?: string) => void;
		onSwitchBack?: (reason?: string) => void;
		switching?: boolean;
	} = $props();

	let switchReason = $state('');
	let selectedPersonaId = $state('');
</script>

<Card>
	<CardHeader>
		<h3 class="text-lg font-semibold">Current Identity Context</h3>
	</CardHeader>
	<CardContent class="space-y-4">
		<div class="grid gap-3 sm:grid-cols-2">
			<div>
				<p class="text-sm text-muted-foreground">Physical User</p>
				<p class="font-medium">{context.physical_user_name ?? context.physical_user_id}</p>
			</div>
			<div>
				<p class="text-sm text-muted-foreground">Status</p>
				{#if context.is_persona_active}
					<Badge class="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400">Persona Active</Badge>
				{:else}
					<Badge class="bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400">Physical Identity</Badge>
				{/if}
			</div>
			{#if context.active_persona}
				<div>
					<p class="text-sm text-muted-foreground">Active Persona</p>
					<p class="font-medium">{context.active_persona.name}</p>
				</div>
			{/if}
			{#if context.session_started_at}
				<div>
					<p class="text-sm text-muted-foreground">Session Started</p>
					<p class="text-sm">{new Date(context.session_started_at).toLocaleString()}</p>
				</div>
			{/if}
			{#if context.session_expires_at}
				<div>
					<p class="text-sm text-muted-foreground">Session Expires</p>
					<p class="text-sm">{new Date(context.session_expires_at).toLocaleString()}</p>
				</div>
			{/if}
		</div>

		<div class="border-t pt-4">
			{#if context.is_persona_active}
				<div class="space-y-2">
					<label for="switch-back-reason" class="text-sm font-medium">Reason (optional)</label>
					<input id="switch-back-reason" type="text" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="Why are you switching back?" bind:value={switchReason} />
					<Button disabled={switching} onclick={() => onSwitchBack?.(switchReason || undefined)}>
						{switching ? 'Switching...' : 'Switch Back to Physical Identity'}
					</Button>
				</div>
			{:else if personas.length > 0}
				<div class="space-y-2">
					<label for="persona-select" class="text-sm font-medium">Switch to Persona</label>
					<select id="persona-select" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" bind:value={selectedPersonaId}>
						<option value="" disabled>Select a persona</option>
						{#each personas.filter((p) => p.status === 'active') as p}
							<option value={p.id}>{p.name}</option>
						{/each}
					</select>
					<input type="text" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="Reason (optional)" bind:value={switchReason} />
					<Button disabled={switching || !selectedPersonaId} onclick={() => onSwitch?.(selectedPersonaId, switchReason || undefined)}>
						{switching ? 'Switching...' : 'Switch to Persona'}
					</Button>
				</div>
			{:else}
				<p class="text-sm text-muted-foreground">No active personas available for switching.</p>
			{/if}
		</div>
	</CardContent>
</Card>
