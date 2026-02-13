<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import type { ScriptDryRunResult } from '$lib/api/types';

	let { onDryRun, loading = false, result = null }: { onDryRun: (context: string) => void; loading?: boolean; result?: ScriptDryRunResult | null } = $props();

	let contextInput = $state('{}');
	const jsonPlaceholder = '{"key": "value"}';
</script>

<div class="space-y-4">
	<div class="space-y-2">
		<Label for="dry-run-context">Input Context (JSON)</Label>
		<textarea
			id="dry-run-context"
			class="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
			bind:value={contextInput}
			placeholder={jsonPlaceholder}
		></textarea>
	</div>
	<Button onclick={() => onDryRun(contextInput)} disabled={loading}>
		{loading ? 'Running...' : 'Run Dry Run'}
	</Button>

	{#if result}
		<div class="mt-4 space-y-2">
			{#if result.success}
				<Alert class="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
					<AlertDescription class="text-green-800 dark:text-green-400">
						<p class="font-medium">Success ({result.duration_ms}ms)</p>
					</AlertDescription>
				</Alert>
			{:else}
				<Alert variant="destructive">
					<AlertDescription>
						<p class="font-medium">Failed ({result.duration_ms}ms)</p>
						{#if result.error}
							<p class="text-sm mt-1">{result.error}</p>
						{/if}
					</AlertDescription>
				</Alert>
			{/if}
			{#if result.output}
				<div class="rounded-md border p-3 bg-muted/50">
					<p class="text-xs font-medium text-muted-foreground mb-1">Output:</p>
					<pre class="text-sm font-mono whitespace-pre-wrap">{typeof result.output === 'string' ? result.output : JSON.stringify(result.output, null, 2)}</pre>
				</div>
			{/if}
		</div>
	{/if}
</div>
