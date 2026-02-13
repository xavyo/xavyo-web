<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { ArrowRight, Clock, ShieldCheck, Trash2 } from 'lucide-svelte';

	let {
		name,
		fromStateName,
		toStateName,
		requiresApproval = false,
		gracePeriodHours,
		ondelete
	}: {
		name: string;
		fromStateName: string;
		toStateName: string;
		requiresApproval?: boolean;
		gracePeriodHours?: number | null;
		ondelete?: () => void;
	} = $props();
</script>

<div class="flex items-center justify-between rounded-md border p-3">
	<div class="flex items-center gap-3">
		<div class="font-medium">{name}</div>
		<div class="flex items-center gap-1 text-sm text-muted-foreground">
			<span>{fromStateName}</span>
			<ArrowRight class="h-3 w-3" />
			<span>{toStateName}</span>
		</div>
		{#if requiresApproval}
			<Badge variant="default" class="bg-amber-600">
				<ShieldCheck class="mr-1 h-3 w-3" />
				Approval Required
			</Badge>
		{/if}
		{#if gracePeriodHours}
			<Badge variant="outline">
				<Clock class="mr-1 h-3 w-3" />
				{gracePeriodHours}h grace
			</Badge>
		{/if}
	</div>
	{#if ondelete}
		<Button variant="ghost" size="sm" onclick={ondelete}>
			<Trash2 class="h-4 w-4 text-destructive" />
		</Button>
	{/if}
</div>
