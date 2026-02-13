<script lang="ts">
	import { X } from 'lucide-svelte';
	import { toasts, removeToast } from '$lib/stores/toast.svelte';
</script>

{#if toasts.length > 0}
	<div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
		{#each toasts as toast (toast.id)}
			<div
				class="flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg transition-colors
					{toast.type === 'success' ? 'border-success/30 bg-success/10 text-success dark:border-success/20 dark:bg-success/10 dark:text-success' : ''}
					{toast.type === 'error' ? 'border-destructive/30 bg-destructive/10 text-destructive dark:border-destructive/20 dark:bg-destructive/10 dark:text-destructive' : ''}
					{toast.type === 'info' ? 'border-info/30 bg-info/10 text-info dark:border-info/20 dark:bg-info/10 dark:text-info' : ''}"
				role="alert"
			>
				<span class="text-sm">{toast.message}</span>
				<button
					onclick={() => removeToast(toast.id)}
					class="ml-2 flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-md opacity-70 transition-opacity hover:opacity-100"
					aria-label="Dismiss"
				>
					<X class="h-4 w-4" />
				</button>
			</div>
		{/each}
	</div>
{/if}
