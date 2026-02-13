<script lang="ts">
	import type { CampaignProgressResponse } from '$lib/api/types';
	let { progress }: { progress: CampaignProgressResponse } = $props();
	const pct = $derived(Math.round(progress.completion_percentage));
</script>

<div class="space-y-2">
	<div class="flex justify-between text-sm">
		<span class="text-muted-foreground">Progress</span>
		<span class="font-medium">{pct}%</span>
	</div>
	<div class="h-2 w-full rounded-full bg-muted">
		<div class="h-2 rounded-full bg-primary transition-all" style="width: {pct}%"></div>
	</div>
	<div class="flex gap-4 text-xs text-muted-foreground">
		<span>Pending: {progress.pending_items}</span>
		<span>Approved: {progress.approved_items}</span>
		<span>Revoked: {progress.revoked_items}</span>
		<span>Total: {progress.total_items}</span>
	</div>
</div>
