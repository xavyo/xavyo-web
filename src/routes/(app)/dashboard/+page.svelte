<script lang="ts">
	import { Card, CardHeader, CardContent } from '$lib/components/ui/card';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<PageHeader title="Dashboard" description="Welcome to your organization workspace" />

<div class="mb-6">
	<p class="text-lg">
		Welcome back, <span class="font-medium">{data.user?.email}</span>
	</p>
</div>

<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
	<Card>
		<CardHeader>
			<p class="text-sm font-medium text-muted-foreground">Total Users</p>
		</CardHeader>
		<CardContent>
			<Skeleton class="h-8 w-16" />
		</CardContent>
	</Card>

	<Card>
		<CardHeader>
			<p class="text-sm font-medium text-muted-foreground">Active Personas</p>
		</CardHeader>
		<CardContent>
			<Skeleton class="h-8 w-16" />
		</CardContent>
	</Card>

	<Card>
		<CardHeader>
			<p class="text-sm font-medium text-muted-foreground">NHI Identities</p>
		</CardHeader>
		<CardContent>
			<Skeleton class="h-8 w-16" />
		</CardContent>
	</Card>

	<Card>
		<CardHeader>
			<p class="text-sm font-medium text-muted-foreground">Recent Activity</p>
		</CardHeader>
		<CardContent>
			<Skeleton class="h-8 w-24" />
		</CardContent>
	</Card>
</div>
