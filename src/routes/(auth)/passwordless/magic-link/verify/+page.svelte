<script lang="ts">
	import { Card, CardHeader, CardContent, CardFooter } from '$lib/components/ui/card';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<Card>
	<CardHeader>
		<h1 class="text-2xl font-semibold tracking-tight">Verifying magic link</h1>
	</CardHeader>
	<CardContent>
		{#if data.error}
			<Alert variant="destructive">
				<AlertDescription>{data.error}</AlertDescription>
			</Alert>
		{:else}
			<p class="text-sm text-muted-foreground">Signing you in...</p>
		{/if}
	</CardContent>
	{#if data.error}
		<CardFooter>
			<div class="flex w-full flex-col gap-2 text-center text-sm text-muted-foreground">
				<a href="/passwordless/magic-link" class="text-primary underline-offset-4 hover:underline">Request a new link</a>
				<a href="/login" class="underline-offset-4 hover:underline">Back to login</a>
			</div>
		</CardFooter>
	{/if}
</Card>
