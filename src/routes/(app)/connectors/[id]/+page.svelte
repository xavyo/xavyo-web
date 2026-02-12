<script lang="ts">
	import { Card, CardHeader, CardContent } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Separator } from '$lib/components/ui/separator';
	import { Tabs, TabsList, TabsTrigger, TabsContent } from '$lib/components/ui/tabs';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import { enhance as formEnhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { addToast } from '$lib/stores/toast.svelte';
	import { testConnectionClient } from '$lib/api/connectors-client';
	import type { ConnectorTestResult } from '$lib/api/types';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let isTesting = $state(false);
	let testResult = $state<ConnectorTestResult | null>(null);
	let showDeleteDialog = $state(false);

	async function handleTestConnection() {
		isTesting = true;
		testResult = null;
		try {
			testResult = await testConnectionClient(data.connector.id);
		} catch (e) {
			testResult = {
				success: false,
				error: e instanceof Error ? e.message : 'Test failed',
				tested_at: new Date().toISOString()
			};
		} finally {
			isTesting = false;
		}
	}

	const SENSITIVE_KEYS = ['password', 'secret', 'token', 'key'];

	function isSensitive(key: string): boolean {
		const lower = key.toLowerCase();
		return SENSITIVE_KEYS.some((s) => lower.includes(s));
	}

	function formatDate(dateStr: string): string {
		return new Date(dateStr).toLocaleString();
	}

	function formatConfigValue(value: unknown): string {
		if (value === null || value === undefined) return '—';
		if (typeof value === 'object') {
			try {
				return JSON.stringify(value, null, 2);
			} catch {
				return String(value);
			}
		}
		return String(value);
	}

	function statusVariant(status: string): 'default' | 'secondary' | 'destructive' {
		switch (status) {
			case 'active':
				return 'default';
			case 'inactive':
				return 'secondary';
			case 'error':
				return 'destructive';
			default:
				return 'secondary';
		}
	}

	function statusClass(status: string): string {
		switch (status) {
			case 'active':
				return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
			case 'inactive':
				return '';
			case 'error':
				return '';
			default:
				return '';
		}
	}

	function typeVariant(type: string): 'default' | 'secondary' | 'outline' {
		switch (type) {
			case 'ldap':
				return 'secondary';
			case 'database':
				return 'outline';
			case 'rest':
				return 'default';
			default:
				return 'secondary';
		}
	}

	function healthDotColor(isOnline: boolean): string {
		return isOnline ? 'bg-green-500' : 'bg-red-500';
	}
</script>

<!-- Header -->
<div class="flex items-center justify-between">
	<div class="flex items-center gap-3">
		<PageHeader title={data.connector.name} description="Connector details" />
		<Badge
			variant={statusVariant(data.connector.status)}
			class={statusClass(data.connector.status)}
		>
			{data.connector.status}
		</Badge>
	</div>
	<div class="flex items-center gap-2">
		<a
			href="/connectors/{data.connector.id}/edit"
			class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
		>
			Edit
		</a>
		<Button variant="outline" onclick={handleTestConnection} disabled={isTesting}>
			{#if isTesting}
				Testing...
			{:else}
				Test Connection
			{/if}
		</Button>
		{#if data.connector.status === 'active'}
			<form method="POST" action="?/deactivate" use:formEnhance={() => {
				return async ({ result }) => {
					if (result.type === 'success') {
						addToast('success', 'Connector deactivated');
						await invalidateAll();
					} else if (result.type === 'failure') {
						addToast('error', (result.data?.error as string) || 'Failed to deactivate');
					}
				};
			}}>
				<Button type="submit" variant="outline">Deactivate</Button>
			</form>
		{:else}
			<form method="POST" action="?/activate" use:formEnhance={() => {
				return async ({ result }) => {
					if (result.type === 'success') {
						addToast('success', 'Connector activated');
						await invalidateAll();
					} else if (result.type === 'failure') {
						addToast('error', (result.data?.error as string) || 'Failed to activate');
					}
				};
			}}>
				<Button type="submit" variant="outline">Activate</Button>
			</form>
		{/if}
		<Button
			variant="destructive"
			onclick={() => { showDeleteDialog = true; }}
			disabled={data.connector.status === 'active'}
		>
			Delete
		</Button>
		<a
			href="/connectors"
			class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
		>
			Back to Connectors
		</a>
	</div>
</div>

{#if testResult}
	<div class="mt-4 max-w-lg rounded-md border p-4 {testResult.success ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950' : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950'}">
		<div class="flex items-center gap-2">
			<span class="font-medium {testResult.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}">
				{testResult.success ? 'Connection Successful' : 'Connection Failed'}
			</span>
		</div>
		{#if testResult.error}
			<p class="mt-1 text-sm text-muted-foreground">{testResult.error}</p>
		{/if}
		<p class="mt-1 text-xs text-muted-foreground">Tested at: {testResult.tested_at ? new Date(testResult.tested_at).toLocaleString() : 'Unknown'}</p>
	</div>
{/if}

<!-- Tabs -->
<Tabs value="overview" class="mt-4">
	<TabsList>
		<TabsTrigger value="overview">Overview</TabsTrigger>
		<TabsTrigger value="configuration">Configuration</TabsTrigger>
		<TabsTrigger value="health">Health</TabsTrigger>
	</TabsList>

	<!-- Overview Tab -->
	<TabsContent value="overview">
		<Card class="max-w-lg">
			<CardHeader>
				<h2 class="text-xl font-semibold">Connector information</h2>
			</CardHeader>
			<CardContent class="space-y-4">
				<div class="grid gap-3">
					<div class="flex justify-between">
						<span class="text-sm text-muted-foreground">Name</span>
						<span class="text-sm font-medium">{data.connector.name}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-sm text-muted-foreground">Description</span>
						<span class="text-sm">{data.connector.description ?? 'No description'}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-sm text-muted-foreground">Type</span>
						<Badge variant={typeVariant(data.connector.connector_type)}>
							{data.connector.connector_type}
						</Badge>
					</div>
					<div class="flex justify-between">
						<span class="text-sm text-muted-foreground">Status</span>
						<Badge
							variant={statusVariant(data.connector.status)}
							class={statusClass(data.connector.status)}
						>
							{data.connector.status}
						</Badge>
					</div>

					<Separator />

					<div class="flex justify-between">
						<span class="text-sm text-muted-foreground">Created</span>
						<span class="text-sm">{formatDate(data.connector.created_at)}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-sm text-muted-foreground">Updated</span>
						<span class="text-sm">{formatDate(data.connector.updated_at)}</span>
					</div>
				</div>
			</CardContent>
		</Card>
	</TabsContent>

	<!-- Configuration Tab -->
	<TabsContent value="configuration">
		<Card class="max-w-lg">
			<CardHeader>
				<h2 class="text-xl font-semibold">Configuration</h2>
			</CardHeader>
			<CardContent class="space-y-4">
				{#if Object.keys(data.connector.config).length === 0}
					<p class="text-sm text-muted-foreground">No configuration entries</p>
				{:else}
					<div class="grid gap-3">
						{#each Object.entries(data.connector.config) as [key, value]}
							<div class="flex justify-between">
								<span class="text-sm text-muted-foreground">{key}</span>
								{#if isSensitive(key)}
									<span class="text-sm font-mono">••••••••</span>
								{:else if typeof value === 'object' && value !== null}
									<pre class="max-h-32 overflow-auto rounded-md bg-muted p-2 font-mono text-xs">{formatConfigValue(value)}</pre>
								{:else}
									<span class="text-sm font-mono">{formatConfigValue(value)}</span>
								{/if}
							</div>
						{/each}
					</div>
				{/if}
			</CardContent>
		</Card>
	</TabsContent>

	<!-- Health Tab -->
	<TabsContent value="health">
		<Card class="max-w-lg">
			<CardHeader>
				<h2 class="text-xl font-semibold">Health status</h2>
			</CardHeader>
			<CardContent class="space-y-4">
				{#if data.health === null}
					<p class="text-sm text-muted-foreground">Health data not available yet</p>
				{:else}
					<div class="grid gap-3">
						<div class="flex items-center justify-between">
							<span class="text-sm text-muted-foreground">Status</span>
							<div class="flex items-center gap-2">
								<span
									class="inline-block h-2.5 w-2.5 rounded-full {healthDotColor(data.health.is_online)}"
									data-testid="health-dot"
								></span>
								<span class="text-sm font-medium">{data.health.is_online ? 'Online' : 'Offline'}</span>
							</div>
						</div>
						<div class="flex justify-between">
							<span class="text-sm text-muted-foreground">Last Check</span>
							<span class="text-sm">
								{data.health.last_check_at ? formatDate(data.health.last_check_at) : 'Never'}
							</span>
						</div>
						<div class="flex justify-between">
							<span class="text-sm text-muted-foreground">Consecutive Failures</span>
							<span class="text-sm">{data.health.consecutive_failures}</span>
						</div>
						{#if data.health.last_success_at}
							<div class="flex justify-between">
								<span class="text-sm text-muted-foreground">Last Success</span>
								<span class="text-sm">{formatDate(data.health.last_success_at)}</span>
							</div>
						{/if}
						{#if data.health.offline_since}
							<div class="flex justify-between">
								<span class="text-sm text-muted-foreground">Offline Since</span>
								<span class="text-sm">{formatDate(data.health.offline_since)}</span>
							</div>
						{/if}
						{#if data.health.last_error}
							<Separator />
							<div>
								<span class="text-sm text-muted-foreground">Last Error</span>
								<p class="mt-1 text-sm text-destructive">{data.health.last_error}</p>
							</div>
						{/if}
					</div>
				{/if}
			</CardContent>
		</Card>
	</TabsContent>
</Tabs>

<Dialog.Root bind:open={showDeleteDialog}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Delete Connector</Dialog.Title>
			<Dialog.Description>
				Are you sure you want to delete "{data.connector.name}"? This action cannot be undone.
			</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer>
			<Button variant="outline" onclick={() => { showDeleteDialog = false; }}>Cancel</Button>
			<form method="POST" action="?/delete" use:formEnhance={() => {
				return async ({ result, update }) => {
					if (result.type === 'redirect') {
						addToast('success', 'Connector deleted');
						await update();
					} else if (result.type === 'failure') {
						addToast('error', (result.data?.error as string) || 'Failed to delete');
						showDeleteDialog = false;
					}
				};
			}}>
				<Button type="submit" variant="destructive">Delete</Button>
			</form>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
