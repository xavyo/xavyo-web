<script lang="ts">
	import { Card, CardHeader, CardContent } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<Card>
	<CardHeader>
		<h1 class="text-2xl font-semibold tracking-tight">Sign out</h1>
		<p class="text-sm text-muted-foreground">Confirm to end this session.</p>
	</CardHeader>
	<CardContent>
		<form method="POST" class="flex gap-3">
			{#if data.full}
				<input type="hidden" name="full" value="true" />
			{/if}
			<Button type="submit">Log out</Button>
			<a
				href="/dashboard"
				class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
			>
				Cancel
			</a>
		</form>
	</CardContent>
</Card>
