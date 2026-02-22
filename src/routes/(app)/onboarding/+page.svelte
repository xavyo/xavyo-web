<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { Card, CardHeader, CardContent, CardFooter } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import { addToast } from '$lib/stores/toast.svelte';
	import type { PageData, ActionData } from './$types';
	import type { ProvisionTenantResponse } from '$lib/api/types';

	let { data, form: actionData }: { data: PageData; form: ActionData } = $props();

	// svelte-ignore state_referenced_locally
	const { form, errors, enhance, message } = superForm(data.form, {
		invalidateAll: false,
		onResult({ result }) {
			if (result.type === 'success' && result.data?.result) {
				provisionResult = result.data.result as ProvisionTenantResponse;
				addToast('success', 'Organization created successfully');
			}
		}
	});

	let provisionResult: ProvisionTenantResponse | null = $state(null);

	let copiedField: string | null = $state(null);

	async function copyToClipboard(text: string, field: string) {
		try {
			await navigator.clipboard.writeText(text);
			copiedField = field;
			setTimeout(() => {
				copiedField = null;
			}, 2000);
		} catch {
			addToast('error', 'Failed to copy to clipboard');
		}
	}
</script>

<PageHeader title="Create your organization" description="Set up your organization to get started" />

{#if provisionResult}
	<Card>
		<CardHeader>
			<h2 class="text-xl font-semibold">Organization created</h2>
			<p class="text-sm text-muted-foreground">Save these credentials — they will not be shown again.</p>
		</CardHeader>
		<CardContent class="space-y-6">
			<Alert>
				<AlertDescription>
					These credentials are displayed only once. Please copy and store them securely before continuing.
				</AlertDescription>
			</Alert>

			<div class="space-y-4">
				<div>
					<h3 class="mb-2 text-sm font-medium">Tenant Information</h3>
					<div class="space-y-1 rounded-md border p-3 text-sm">
						<div class="flex justify-between">
							<span class="text-muted-foreground">ID</span>
							<span class="font-mono">{provisionResult.tenant.id}</span>
						</div>
						<div class="flex justify-between">
							<span class="text-muted-foreground">Slug</span>
							<span class="font-mono">{provisionResult.tenant.slug}</span>
						</div>
						<div class="flex justify-between">
							<span class="text-muted-foreground">Name</span>
							<span>{provisionResult.tenant.name}</span>
						</div>
					</div>
				</div>

				<div>
					<h3 class="mb-2 text-sm font-medium">Admin API Key</h3>
					<div class="flex items-center gap-2">
						<code class="flex-1 rounded-md border bg-muted px-3 py-2 text-sm font-mono break-all">
							{provisionResult.admin.api_key}
						</code>
						<Button
							variant="outline"
							size="sm"
							onclick={() => copyToClipboard(provisionResult!.admin.api_key, 'api_key')}
						>
							{copiedField === 'api_key' ? 'Copied!' : 'Copy'}
						</Button>
					</div>
				</div>

				<div>
					<h3 class="mb-2 text-sm font-medium">OAuth Client ID</h3>
					<div class="flex items-center gap-2">
						<code class="flex-1 rounded-md border bg-muted px-3 py-2 text-sm font-mono break-all">
							{provisionResult.oauth_client.client_id}
						</code>
						<Button
							variant="outline"
							size="sm"
							onclick={() => copyToClipboard(provisionResult!.oauth_client.client_id, 'client_id')}
						>
							{copiedField === 'client_id' ? 'Copied!' : 'Copy'}
						</Button>
					</div>
				</div>

				<div>
					<h3 class="mb-2 text-sm font-medium">OAuth Client Secret</h3>
					<div class="flex items-center gap-2">
						<code class="flex-1 rounded-md border bg-muted px-3 py-2 text-sm font-mono break-all">
							{provisionResult.oauth_client.client_secret}
						</code>
						<Button
							variant="outline"
							size="sm"
							onclick={() => copyToClipboard(provisionResult!.oauth_client.client_secret, 'client_secret')}
						>
							{copiedField === 'client_secret' ? 'Copied!' : 'Copy'}
						</Button>
					</div>
				</div>
			</div>
		</CardContent>
		<CardFooter>
			<a
				href="/dashboard"
				class="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90"
			>
				Continue to dashboard
			</a>
		</CardFooter>
	</Card>
{:else}
	<Card class="max-w-lg">
		<CardHeader>
			<h2 class="text-xl font-semibold">Name your organization</h2>
			<p class="text-sm text-muted-foreground">This will be the name of your workspace</p>
		</CardHeader>
		<CardContent>
			{#if $message}
				<Alert variant="destructive" class="mb-4">
					<AlertDescription>{$message}</AlertDescription>
				</Alert>
			{/if}

			<form method="POST" use:enhance class="space-y-4">
				<div class="space-y-2">
					<Label for="organizationName">Organization name</Label>
					<Input
						id="organizationName"
						name="organizationName"
						type="text"
						placeholder="Acme Corp"
						value={String($form.organizationName ?? '')}
					/>
					{#if $errors.organizationName}
						<p class="text-sm text-destructive">{$errors.organizationName}</p>
					{/if}
				</div>

				<Button type="submit" class="w-full">Create organization</Button>
			</form>
		</CardContent>
	</Card>
{/if}
