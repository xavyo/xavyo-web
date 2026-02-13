<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { Card, CardHeader, CardContent } from '$lib/components/ui/card';
	import StateBadge from './state-badge.svelte';
	import type { UserLifecycleStatus } from '$lib/api/types';

	let { status }: { status: UserLifecycleStatus | null } = $props();
</script>

<Card>
	<CardHeader>
		<h3 class="text-lg font-semibold">Lifecycle Status</h3>
	</CardHeader>
	<CardContent>
		{#if !status || !status.config_id}
			<p class="text-sm text-muted-foreground">No lifecycle configuration assigned to this user.</p>
		{:else}
			<div class="space-y-3">
				<div class="flex items-center justify-between">
					<span class="text-sm text-muted-foreground">Configuration</span>
					<span class="font-medium">{status.config_name ?? 'Unknown'}</span>
				</div>
				<div class="flex items-center justify-between">
					<span class="text-sm text-muted-foreground">Current State</span>
					<div class="flex items-center gap-2">
						<span class="font-medium">{status.state_name ?? 'Unknown'}</span>
						{#if status.is_initial}
							<StateBadge isInitial={true} />
						{:else if status.is_terminal}
							<StateBadge isTerminal={true} />
						{:else}
							<StateBadge />
						{/if}
					</div>
				</div>
				{#if status.entered_at}
					<div class="flex items-center justify-between">
						<span class="text-sm text-muted-foreground">Entered State</span>
						<span class="text-sm">{new Date(status.entered_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
					</div>
				{/if}
				{#if status.entitlement_action}
					<div class="flex items-center justify-between">
						<span class="text-sm text-muted-foreground">Entitlement Action</span>
						<Badge variant="outline">{status.entitlement_action}</Badge>
					</div>
				{/if}
			</div>
		{/if}
	</CardContent>
</Card>
