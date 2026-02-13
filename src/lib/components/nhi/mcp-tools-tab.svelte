<script lang="ts">
	import { fetchMcpTools } from '$lib/api/mcp-client';
	import type { McpTool } from '$lib/api/types';
	import Button from '$lib/components/ui/button/button.svelte';
	import McpToolCard from './mcp-tool-card.svelte';

	interface Props {
		nhiId: string;
	}

	let { nhiId }: Props = $props();

	let tools = $state<McpTool[]>([]);
	let isLoading = $state(true);
	let error = $state<string | null>(null);

	$effect(() => {
		loadTools();
	});

	async function loadTools() {
		isLoading = true;
		error = null;
		try {
			const response = await fetchMcpTools(nhiId);
			tools = response.tools;
		} catch (err: unknown) {
			error = err instanceof Error ? err.message : 'Failed to load MCP tools';
		} finally {
			isLoading = false;
		}
	}
</script>

<div class="space-y-4">
	{#if isLoading}
		<div class="space-y-4">
			{#each [1, 2, 3] as _}
				<div class="animate-pulse rounded-xl border bg-card p-6">
					<div class="h-4 w-1/3 rounded bg-muted"></div>
					<div class="mt-2 h-3 w-2/3 rounded bg-muted"></div>
				</div>
			{/each}
		</div>
	{:else if error}
		<div class="flex flex-col items-center gap-3 py-8 text-center">
			<p class="text-sm text-destructive">{error}</p>
			<Button variant="outline" size="sm" onclick={loadTools}>
				Retry
			</Button>
		</div>
	{:else if tools.length === 0}
		<div class="py-8 text-center">
			<p class="text-sm text-muted-foreground">No MCP tools registered</p>
		</div>
	{:else}
		{#each tools as tool (tool.name)}
			<McpToolCard {tool} {nhiId} />
		{/each}
	{/if}
</div>
