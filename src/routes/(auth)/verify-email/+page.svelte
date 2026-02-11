<script lang="ts">
	import { Card, CardHeader, CardContent, CardFooter } from '$lib/components/ui/card';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<Card>
	<CardHeader>
		<h1 class="text-2xl font-semibold tracking-tight">Email Verification</h1>
	</CardHeader>
	<CardContent>
		{#if data.error}
			<Alert variant="destructive">
				<AlertDescription>{data.error}</AlertDescription>
			</Alert>
		{:else if data.alreadyVerified}
			<Alert>
				<AlertDescription>Your email has already been verified.</AlertDescription>
			</Alert>
		{:else if data.message}
			<Alert>
				<AlertDescription>{data.message}</AlertDescription>
			</Alert>
		{/if}
	</CardContent>
	<CardFooter>
		<a href="/login" class="text-sm text-primary underline-offset-4 hover:underline">Go to login</a>
	</CardFooter>
</Card>
