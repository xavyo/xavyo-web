<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { Card, CardHeader, CardContent } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import { Separator } from '$lib/components/ui/separator';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import { addToast } from '$lib/stores/toast.svelte';
	import { AUTH_METHODS, DEPROVISIONING_STRATEGIES } from '$lib/schemas/scim-targets';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let selectedAuthMethod = $state('bearer');
	let showAdvanced = $state(false);

	// svelte-ignore state_referenced_locally
	const { form, errors, enhance, message } = superForm(data.form, {
		onResult({ result }) {
			if (result.type === 'redirect') {
				addToast('success', 'SCIM target created successfully');
			}
		}
	});

	const authMethodLabels: Record<string, string> = {
		bearer: 'Bearer Token',
		oauth2: 'OAuth 2.0'
	};

	const deprovisioningLabels: Record<string, string> = {
		deactivate: 'Deactivate',
		delete: 'Delete'
	};
</script>

<PageHeader title="Create SCIM Target" description="Configure a new outbound SCIM provisioning target" />

<Card class="max-w-2xl">
	<CardHeader>
		<h2 class="text-xl font-semibold">Target details</h2>
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
					placeholder="e.g. Azure AD SCIM"
					value={String($form.name ?? '')}
				/>
				{#if $errors.name}
					<p class="text-sm text-destructive">{$errors.name}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="base_url">Base URL</Label>
				<Input
					id="base_url"
					name="base_url"
					type="url"
					placeholder="e.g. https://scim.example.com/v2"
					value={String($form.base_url ?? '')}
				/>
				{#if $errors.base_url}
					<p class="text-sm text-destructive">{$errors.base_url}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="auth_method">Authentication Method</Label>
				<select
					id="auth_method"
					name="auth_method"
					class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
					value={selectedAuthMethod}
					onchange={(e) => {
						selectedAuthMethod = (e.target as HTMLSelectElement).value;
					}}
				>
					{#each AUTH_METHODS as method}
						<option value={method}>{authMethodLabels[method] ?? method}</option>
					{/each}
				</select>
				{#if $errors.auth_method}
					<p class="text-sm text-destructive">{$errors.auth_method}</p>
				{/if}
			</div>

			<Separator class="my-4" />
			<h3 class="text-sm font-medium text-muted-foreground">Credentials</h3>

			{#if selectedAuthMethod === 'bearer'}
				<div class="space-y-2">
					<Label for="bearer_token">Bearer Token</Label>
					<Input
						id="bearer_token"
						name="bearer_token"
						type="password"
						placeholder="Enter bearer token"
					/>
					{#if $errors.bearer_token}
						<p class="text-sm text-destructive">{$errors.bearer_token}</p>
					{/if}
				</div>
			{/if}

			{#if selectedAuthMethod === 'oauth2'}
				<div class="space-y-2">
					<Label for="client_id">Client ID</Label>
					<Input
						id="client_id"
						name="client_id"
						type="text"
						placeholder="Enter OAuth2 client ID"
					/>
					{#if $errors.client_id}
						<p class="text-sm text-destructive">{$errors.client_id}</p>
					{/if}
				</div>

				<div class="space-y-2">
					<Label for="client_secret">Client Secret</Label>
					<Input
						id="client_secret"
						name="client_secret"
						type="password"
						placeholder="Enter OAuth2 client secret"
					/>
					{#if $errors.client_secret}
						<p class="text-sm text-destructive">{$errors.client_secret}</p>
					{/if}
				</div>

				<div class="space-y-2">
					<Label for="token_endpoint">Token Endpoint</Label>
					<Input
						id="token_endpoint"
						name="token_endpoint"
						type="url"
						placeholder="e.g. https://auth.example.com/oauth/token"
					/>
					{#if $errors.token_endpoint}
						<p class="text-sm text-destructive">{$errors.token_endpoint}</p>
					{/if}
				</div>

				<div class="space-y-2">
					<Label for="scopes">Scopes (comma-separated, optional)</Label>
					<Input
						id="scopes"
						name="scopes"
						type="text"
						placeholder="e.g. scim.read,scim.write"
					/>
					{#if $errors.scopes}
						<p class="text-sm text-destructive">{$errors.scopes}</p>
					{/if}
				</div>
			{/if}

			<Separator class="my-4" />

			<button
				type="button"
				class="text-sm font-medium text-primary hover:underline"
				onclick={() => { showAdvanced = !showAdvanced; }}
			>
				{showAdvanced ? 'Hide' : 'Show'} Advanced Settings
			</button>

			{#if showAdvanced}
				<div class="space-y-4 rounded-md border border-input p-4">
					<div class="space-y-2">
						<Label for="deprovisioning_strategy">Deprovisioning Strategy</Label>
						<select
							id="deprovisioning_strategy"
							name="deprovisioning_strategy"
							class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
						>
							{#each DEPROVISIONING_STRATEGIES as strategy}
								<option value={strategy} selected={strategy === 'deactivate'}>{deprovisioningLabels[strategy] ?? strategy}</option>
							{/each}
						</select>
					</div>

					<div class="space-y-2">
						<Label for="tls_verify">Verify TLS Certificate</Label>
						<select
							id="tls_verify"
							name="tls_verify"
							class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
						>
							<option value="on" selected>Yes</option>
							<option value="off">No</option>
						</select>
					</div>

					<div class="space-y-2">
						<Label for="rate_limit_per_minute">Rate Limit (per minute)</Label>
						<Input
							id="rate_limit_per_minute"
							name="rate_limit_per_minute"
							type="number"
							placeholder="60"
							value=""
						/>
					</div>

					<div class="space-y-2">
						<Label for="request_timeout_secs">Request Timeout (seconds)</Label>
						<Input
							id="request_timeout_secs"
							name="request_timeout_secs"
							type="number"
							placeholder="30"
							value=""
						/>
					</div>

					<div class="space-y-2">
						<Label for="max_retries">Max Retries</Label>
						<Input
							id="max_retries"
							name="max_retries"
							type="number"
							placeholder="5"
							value=""
						/>
					</div>
				</div>
			{/if}

			<div class="flex gap-2 pt-2">
				<Button type="submit">Create Target</Button>
				<a
					href="/settings/scim-targets"
					class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
				>
					Cancel
				</a>
			</div>
		</form>
	</CardContent>
</Card>
