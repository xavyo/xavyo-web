<script lang="ts">
	import { Card, CardHeader, CardContent } from '$lib/components/ui/card';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import { Users, Drama, Bot, Activity } from 'lucide-svelte';
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
			<div class="flex items-center justify-between">
				<p class="text-sm font-medium text-muted-foreground">Total Users</p>
				<Users class="h-4 w-4 text-muted-foreground" />
			</div>
		</CardHeader>
		<CardContent>
			<p class="text-2xl font-bold">{data.totalUsers}</p>
		</CardContent>
	</Card>

	<Card>
		<CardHeader>
			<div class="flex items-center justify-between">
				<p class="text-sm font-medium text-muted-foreground">Active Personas</p>
				<Drama class="h-4 w-4 text-muted-foreground" />
			</div>
		</CardHeader>
		<CardContent>
			<p class="text-2xl font-bold">{data.activePersonas}</p>
		</CardContent>
	</Card>

	<Card>
		<CardHeader>
			<div class="flex items-center justify-between">
				<p class="text-sm font-medium text-muted-foreground">NHI Identities</p>
				<Bot class="h-4 w-4 text-muted-foreground" />
			</div>
		</CardHeader>
		<CardContent>
			<p class="text-2xl font-bold">{data.nhiIdentities}</p>
		</CardContent>
	</Card>

	<Card>
		<CardHeader>
			<div class="flex items-center justify-between">
				<p class="text-sm font-medium text-muted-foreground">Recent Activity</p>
				<Activity class="h-4 w-4 text-muted-foreground" />
			</div>
		</CardHeader>
		<CardContent>
			<p class="text-2xl font-bold">{data.recentActivity}</p>
		</CardContent>
	</Card>
</div>
