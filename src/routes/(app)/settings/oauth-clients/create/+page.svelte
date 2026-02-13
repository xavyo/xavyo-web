<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { page } from '$app/stores';
	import { Card, CardHeader, CardContent } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import { addToast } from '$lib/stores/toast.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const { form, errors, enhance, message } = superForm(data.form, {
		onResult({ result }) {
			if (result.type === 'success' && result.data?.created) {
				addToast('success', 'OAuth client created successfully');
			}
		}
	});

	let clientSecret = $derived(
		($page.form as Record<string, unknown> | undefined)?.secret as string | undefined
	);
	let createdClient = $derived(
		($page.form as Record<string, unknown> | undefined)?.created as boolean | undefined
	);
</script>

<div class="flex items-center justify-between">
	<PageHeader
		title="Create OAuth Client"
		description="Register a new OAuth/OIDC client application"
	/>
	<a
		href="/settings/oauth-clients"
		class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
	>
		Back to Clients
	</a>
</div>

{#if createdClient}
	{#if clientSecret}
		<div
			class="mb-6 rounded-lg border border-yellow-300 bg-yellow-50 p-4 dark:border-yellow-600 dark:bg-yellow-950"
		>
			<h3 class="font-semibold text-yellow-800 dark:text-yellow-200">
				Client Secret (shown once only!)
			</h3>
			<p class="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
				Copy this secret now. It will not be shown again.
			</p>
			<div class="mt-2 flex items-center gap-2">
				<code class="flex-1 rounded bg-yellow-100 p-2 text-sm break-all dark:bg-yellow-900">
					{clientSecret}
				</code>
				<button
					onclick={() => {
						navigator.clipboard.writeText(clientSecret!);
						addToast('success', 'Secret copied to clipboard');
					}}
					class="inline-flex items-center justify-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90"
				>
					Copy
				</button>
			</div>
			<div class="mt-3">
				<a
					href="/settings/oauth-clients"
					class="text-sm font-medium text-primary hover:underline"
				>
					Go to OAuth Clients list
				</a>
			</div>
		</div>
	{:else}
		<div
			class="mb-6 rounded-lg border border-green-300 bg-green-50 p-4 dark:border-green-600 dark:bg-green-950"
		>
			<h3 class="font-semibold text-green-800 dark:text-green-200">
				Client Created Successfully
			</h3>
			<p class="mt-1 text-sm text-green-700 dark:text-green-300">
				Public clients do not have a client secret.
			</p>
			<div class="mt-3">
				<a
					href="/settings/oauth-clients"
					class="text-sm font-medium text-primary hover:underline"
				>
					Go to OAuth Clients list
				</a>
			</div>
		</div>
	{/if}
{/if}

{#if !createdClient}
	<Card class="max-w-lg">
		<CardHeader>
			<h2 class="text-xl font-semibold">Client details</h2>
		</CardHeader>
		<CardContent>
			{#if $message}
				<Alert variant="destructive" class="mb-4">
					<AlertDescription>{$message}</AlertDescription>
				</Alert>
			{/if}

			<form method="POST" use:enhance class="space-y-4">
				<div class="space-y-2">
					<Label for="name">Name</Label>
					<Input
						id="name"
						name="name"
						type="text"
						placeholder="My Application"
						value={String($form.name ?? '')}
					/>
					{#if $errors.name}
						<p class="text-sm text-destructive">{$errors.name}</p>
					{/if}
				</div>

				<div class="space-y-2">
					<Label for="client_type">Client Type</Label>
					<select
						id="client_type"
						name="client_type"
						class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
						value={String($form.client_type ?? '')}
					>
						<option value="">Select client type</option>
						<option value="confidential">Confidential</option>
						<option value="public">Public</option>
					</select>
					{#if $errors.client_type}
						<p class="text-sm text-destructive">{$errors.client_type}</p>
					{/if}
				</div>

				<div class="space-y-2">
					<Label for="redirect_uris">Redirect URIs (comma-separated)</Label>
					<textarea
						id="redirect_uris"
						name="redirect_uris"
						class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
						placeholder="https://app.example.com/callback, https://app.example.com/auth"
						value={String($form.redirect_uris ?? '')}
					></textarea>
					{#if $errors.redirect_uris}
						<p class="text-sm text-destructive">{$errors.redirect_uris}</p>
					{/if}
				</div>

				<div class="space-y-2">
					<Label for="grant_types">Grant Types (comma-separated)</Label>
					<textarea
						id="grant_types"
						name="grant_types"
						class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
						placeholder="authorization_code, refresh_token"
						value={String($form.grant_types ?? '')}
					></textarea>
					{#if $errors.grant_types}
						<p class="text-sm text-destructive">{$errors.grant_types}</p>
					{/if}
				</div>

				<div class="space-y-2">
					<Label for="scopes">Scopes (comma-separated)</Label>
					<textarea
						id="scopes"
						name="scopes"
						class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
						placeholder="openid, profile, email"
						value={String($form.scopes ?? '')}
					></textarea>
					{#if $errors.scopes}
						<p class="text-sm text-destructive">{$errors.scopes}</p>
					{/if}
				</div>

				<div class="flex gap-2 pt-2">
					<Button type="submit">Create Client</Button>
					<a
						href="/settings/oauth-clients"
						class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
					>
						Cancel
					</a>
				</div>
			</form>
		</CardContent>
	</Card>
{/if}
