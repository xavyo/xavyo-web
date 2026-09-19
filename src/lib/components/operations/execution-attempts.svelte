<script lang="ts">
	interface Attempt {
		attempt_number: number;
		started_at: string;
		completed_at: string | null;
		success: boolean;
		error_code: string | null;
		error_message: string | null;
		duration_ms: number;
	}

	interface Props {
		attempts: Attempt[];
	}

	let { attempts }: Props = $props();

	function formatDate(value: string | null): string {
		if (!value) return '—';
		return new Date(value).toLocaleString();
	}
</script>

{#if attempts.length === 0}
	<p class="text-sm text-muted-foreground ">No execution attempts recorded.</p>
{:else}
	<div class="overflow-x-auto">
		<table class="w-full text-sm">
			<thead>
				<tr class="border-b border-gray-200 dark:border-gray-700">
					<th class="px-3 py-2 text-left font-medium text-muted-foreground ">#</th>
					<th class="px-3 py-2 text-left font-medium text-muted-foreground ">Started</th>
					<th class="px-3 py-2 text-left font-medium text-muted-foreground ">Completed</th>
					<th class="px-3 py-2 text-left font-medium text-muted-foreground ">Status</th>
					<th class="px-3 py-2 text-left font-medium text-muted-foreground ">Error Code</th>
					<th class="px-3 py-2 text-left font-medium text-muted-foreground ">Error</th>
					<th class="px-3 py-2 text-right font-medium text-muted-foreground ">Duration</th>
				</tr>
			</thead>
			<tbody>
				{#each attempts as attempt}
					<tr class="border-b border-gray-200 dark:border-gray-700">
						<td class="px-3 py-2 text-gray-900 dark:text-gray-100">{attempt.attempt_number}</td>
						<td class="px-3 py-2 text-gray-900 dark:text-gray-100">{formatDate(attempt.started_at)}</td>
						<td class="px-3 py-2 text-gray-900 dark:text-gray-100">{formatDate(attempt.completed_at)}</td>
						<td class="px-3 py-2">
							{#if attempt.success}
								<span class="inline-flex items-center rounded-full bg-success/15 px-2.5 py-0.5 text-xs font-medium text-success ">
									Success
								</span>
							{:else}
								<span class="inline-flex items-center rounded-full bg-destructive/15 px-2.5 py-0.5 text-xs font-medium text-destructive ">
									Failed
								</span>
							{/if}
						</td>
						<td class="px-3 py-2 font-mono text-xs text-gray-600 dark:text-gray-400">
							{attempt.error_code ?? '—'}
						</td>
						<td class="px-3 py-2 text-muted-foreground ">
							{attempt.error_message ?? '—'}
						</td>
						<td class="px-3 py-2 text-right font-mono text-gray-900 dark:text-gray-100">
							{attempt.duration_ms}ms
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}
