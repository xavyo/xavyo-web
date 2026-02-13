<script lang="ts">
	import type { McpTool, McpCallResponse, McpErrorResponse } from '$lib/api/types';
	import { invokeMcpTool } from '$lib/api/mcp-client';
	import { Card, CardHeader, CardContent } from '$lib/components/ui/card';
	import Button from '$lib/components/ui/button/button.svelte';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import JsonDisplay from './json-display.svelte';

	interface Props {
		tool: McpTool;
		nhiId: string;
	}

	let { tool, nhiId }: Props = $props();

	let expanded = $state(false);
	let parametersJson = $state('{}');
	let isInvoking = $state(false);
	let invokeResult = $state<McpCallResponse | null>(null);
	let invokeError = $state<string | null>(null);

	const statusVariant = $derived(
		tool.status === 'active'
			? 'default'
			: tool.status === 'deprecated'
				? 'secondary'
				: 'outline'
	);

	const statusClass = $derived(
		tool.status === 'active'
			? 'bg-green-600 text-white hover:bg-green-600/80'
			: tool.status === 'deprecated'
				? 'bg-yellow-500 text-white hover:bg-yellow-500/80'
				: ''
	);

	function toggleExpanded() {
		expanded = !expanded;
	}

	async function handleInvoke() {
		isInvoking = true;
		invokeResult = null;
		invokeError = null;

		try {
			const params = JSON.parse(parametersJson) as Record<string, unknown>;
			invokeResult = await invokeMcpTool(tool.name, nhiId, params);
		} catch (err: unknown) {
			if (err instanceof SyntaxError) {
				invokeError = 'Invalid JSON parameters';
			} else if (
				err &&
				typeof err === 'object' &&
				'message' in err &&
				typeof (err as McpErrorResponse).message === 'string'
			) {
				const mcpErr = err as McpErrorResponse;
				invokeError = `${mcpErr.error_code ?? 'Error'}: ${mcpErr.message}`;
			} else {
				invokeError = err instanceof Error ? err.message : 'Invocation failed';
			}
		} finally {
			isInvoking = false;
		}
	}
</script>

<Card>
	<CardHeader>
		<button
			type="button"
			class="flex w-full items-center justify-between text-left"
			onclick={toggleExpanded}
		>
			<div class="min-w-0 flex-1">
				<div class="flex items-center gap-2">
					<span class="font-semibold text-foreground">{tool.name}</span>
					<Badge class={statusClass} variant={statusVariant}>
						{tool.status}
					</Badge>
					{#if tool.deprecated}
						<Badge variant="outline" class="text-yellow-600">deprecated</Badge>
					{/if}
				</div>
				{#if tool.description && !expanded}
					<p class="mt-1 truncate text-sm text-muted-foreground">
						{tool.description}
					</p>
				{/if}
			</div>
			<span class="ml-2 text-muted-foreground transition-transform" class:rotate-180={expanded}>
				&#9660;
			</span>
		</button>
	</CardHeader>

	{#if expanded}
		<CardContent>
			{#if tool.description}
				<p class="mb-4 text-sm text-muted-foreground">{tool.description}</p>
			{/if}

			<JsonDisplay data={tool.input_schema} label="Input Schema" collapsible maxHeight="12rem" />

			<div class="mt-4 space-y-3">
				<label class="text-sm font-medium text-foreground" for="params-{tool.name}">
					Parameters (JSON)
				</label>
				<textarea
					id="params-{tool.name}"
					bind:value={parametersJson}
					rows={4}
					class="w-full rounded-md border border-input bg-transparent px-3 py-2 font-mono text-xs text-foreground shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
					placeholder={'{\u007D'}
				></textarea>
				<Button onclick={handleInvoke} disabled={isInvoking} size="sm">
					{isInvoking ? 'Invoking...' : 'Test Invoke'}
				</Button>
			</div>

			{#if invokeError}
				<Alert variant="destructive" class="mt-4">
					<AlertDescription>{invokeError}</AlertDescription>
				</Alert>
			{/if}

			{#if invokeResult}
				<div class="mt-4 space-y-2">
					<div class="flex items-center gap-2">
						<Badge variant="outline">call_id: {invokeResult.call_id}</Badge>
						<Badge variant="secondary">{invokeResult.latency_ms}ms</Badge>
					</div>
					<JsonDisplay data={invokeResult.result} label="Result" maxHeight="12rem" />
				</div>
			{/if}
		</CardContent>
	{/if}
</Card>
