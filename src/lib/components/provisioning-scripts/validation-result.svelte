<script lang="ts">
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import type { ScriptValidationResult } from '$lib/api/types';

	let { result }: { result: ScriptValidationResult | null } = $props();
</script>

{#if result}
	{#if result.valid}
		<Alert class="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
			<AlertDescription class="text-green-800 dark:text-green-400">
				Script is valid. No errors found.
			</AlertDescription>
		</Alert>
	{:else}
		<Alert variant="destructive">
			<AlertDescription>
				<p class="font-medium mb-2">Validation failed with {result.errors.length} error{result.errors.length !== 1 ? 's' : ''}:</p>
				<ul class="list-disc pl-4 space-y-1">
					{#each result.errors as error}
						<li class="text-sm">
							{#if error.line !== null}
								<span class="font-mono text-xs">Line {error.line}{error.column !== null ? `:${error.column}` : ''}</span>
								{' — '}
							{/if}
							{error.message}
						</li>
					{/each}
				</ul>
			</AlertDescription>
		</Alert>
	{/if}
{/if}
