<script lang="ts">
	import type { VersionCompareResponse } from '$lib/api/types';

	let { diff }: { diff: VersionCompareResponse | null } = $props();
</script>

{#if diff}
	<div class="space-y-2">
		<p class="text-sm text-muted-foreground">
			Comparing version {diff.version_a} → {diff.version_b}
		</p>
		<div class="rounded-md border overflow-hidden">
			<div class="overflow-x-auto">
				<table class="w-full text-sm font-mono">
					<tbody>
						{#each diff.diff_lines as line}
							<tr
								class={line.change_type === 'added'
									? 'bg-green-50 dark:bg-green-900/20'
									: line.change_type === 'removed'
										? 'bg-red-50 dark:bg-red-900/20'
										: ''}
							>
								<td class="px-2 py-0.5 text-right text-muted-foreground select-none w-12 border-r">
									{line.line_number}
								</td>
								<td class="px-2 py-0.5 select-none w-6 text-center">
									{#if line.change_type === 'added'}
										<span class="text-green-600 dark:text-green-400">+</span>
									{:else if line.change_type === 'removed'}
										<span class="text-red-600 dark:text-red-400">-</span>
									{:else}
										<span class="text-muted-foreground">&nbsp;</span>
									{/if}
								</td>
								<td class="px-2 py-0.5 whitespace-pre-wrap">{line.content}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</div>
{:else}
	<p class="text-sm text-muted-foreground">Select two versions to compare.</p>
{/if}
