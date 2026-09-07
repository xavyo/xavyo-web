<script lang="ts">
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<div class="space-y-6">
	<div>
		<h1 class="text-2xl font-semibold tracking-tight">Verifying magic link</h1>
	</div>

	{#if data.error}
		<Alert variant="destructive">
			<AlertDescription>{data.error}</AlertDescription>
		</Alert>

		<div class="flex flex-col gap-2 text-center text-sm text-muted-foreground">
			<a href="/passwordless/magic-link" class="font-medium text-primary underline-offset-4 hover:underline">Request a new link</a>
			<a href="/login" class="underline-offset-4 hover:underline">Back to login</a>
		</div>
	{:else}
		<p class="text-sm text-muted-foreground">Signing you in...</p>
	{/if}
</div>
