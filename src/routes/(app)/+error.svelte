<script lang="ts">
	import { page } from '$app/stores';
	import { invalidateAll } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardHeader, CardContent } from '$lib/components/ui/card';

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

<div class="flex flex-1 items-center justify-center p-6">
	<Card class="w-full max-w-md">
		<CardHeader>
			<div class="flex flex-col items-center text-center">
				<span class="mb-2 text-4xl">&#x26A0;</span>
				<h1 class="text-2xl font-semibold">Something went wrong</h1>
				<p class="mt-1 text-sm text-muted-foreground">
					{$page.error?.message ?? 'An unexpected error occurred'}
				</p>
				{#if $page.status}
					<p class="mt-1 text-xs text-muted-foreground">Error {$page.status}</p>
				{/if}
			</div>
		</CardHeader>
		<CardContent>
			<div class="flex flex-col gap-2 sm:flex-row sm:justify-center">
				<Button onclick={retry} disabled={isRetrying}>
					{isRetrying ? 'Retrying...' : 'Retry'}
				</Button>
				<Button variant="outline" onclick={() => window.location.href = '/dashboard'}>
					Go to Dashboard
				</Button>
			</div>
		</CardContent>
	</Card>
</div>
