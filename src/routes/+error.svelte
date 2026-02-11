<script lang="ts">
	import { page } from '$app/stores';
	import { invalidateAll } from '$app/navigation';

	let isRetrying = $state(false);

	async function retry() {
		isRetrying = true;
		try {
			await invalidateAll();
		} finally {
			isRetrying = false;
		}
	}
</script>

<div class="flex min-h-screen items-center justify-center bg-background p-6">
	<div class="w-full max-w-md text-center">
		<span class="mb-4 block text-5xl">&#x26A0;</span>
		<h1 class="text-2xl font-semibold text-foreground">Something went wrong</h1>
		<p class="mt-2 text-sm text-muted-foreground">
			{$page.error?.message ?? 'An unexpected error occurred'}
		</p>
		{#if $page.status}
			<p class="mt-1 text-xs text-muted-foreground">Error {$page.status}</p>
		{/if}
		<div class="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
			<button
				onclick={retry}
				disabled={isRetrying}
				class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
			>
				{isRetrying ? 'Retrying…' : 'Retry'}
			</button>
			<a
				href="/login"
				class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90"
			>
				Go to Login
			</a>
		</div>
	</div>
</div>
