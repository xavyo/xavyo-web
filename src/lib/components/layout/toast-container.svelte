<script lang="ts">
	import { toasts, removeToast } from '$lib/stores/toast.svelte';
</script>

{#if toasts.length > 0}
	<div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
		{#each toasts as toast (toast.id)}
			<div
				class="flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg
					{toast.type === 'success' ? 'border-green-200 bg-green-50 text-green-900' : ''}
					{toast.type === 'error' ? 'border-red-200 bg-red-50 text-red-900' : ''}
					{toast.type === 'info' ? 'border-blue-200 bg-blue-50 text-blue-900' : ''}"
				role="alert"
			>
				<span class="text-sm">{toast.message}</span>
				<button
					onclick={() => removeToast(toast.id)}
					class="ml-2 flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-md opacity-70 hover:opacity-100"
					aria-label="Dismiss"
				>
					<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>
		{/each}
	</div>
{/if}
