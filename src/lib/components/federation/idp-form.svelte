<script lang="ts">
	import type { SuperForm } from 'sveltekit-superforms';
	import { Card, CardHeader, CardContent } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import { Separator } from '$lib/components/ui/separator';

	interface Props {
		superform: SuperForm<any>;
		mode: 'create' | 'edit';
		onCancel?: () => void;
	}

	let { superform, mode, onCancel }: Props = $props();

	const { form, errors, enhance, message } = superform;
</script>

<Card class="max-w-lg">
	<CardHeader>
		<h2 class="text-xl font-semibold">
			{mode === 'create' ? 'Identity provider details' : 'Edit identity provider'}
		</h2>
	</CardHeader>
	<CardContent>
		{#if $message}
			<Alert variant="destructive" class="mb-4">
				<AlertDescription>{$message}</AlertDescription>
			</Alert>
		{/if}

		<form
			method="POST"
			action={mode === 'edit' ? '?/update' : undefined}
			use:enhance
			class="space-y-4"
		>
			<div class="space-y-2">
				<Label for="name">Name</Label>
				<Input
					id="name"
					name="name"
					type="text"
					placeholder="e.g. Corporate Okta"
					value={String($form.name ?? '')}
				/>
				{#if $errors.name}
					<p class="text-sm text-destructive">{$errors.name}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="provider_type">Provider type</Label>
				<select
					id="provider_type"
					name="provider_type"
					class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
					value={String($form.provider_type ?? 'generic_oidc')}
				>
					<option value="generic_oidc">Generic OIDC</option>
					<option value="azure_ad">Azure AD</option>
					<option value="okta">Okta</option>
					<option value="google_workspace">Google Workspace</option>
				</select>
				{#if $errors.provider_type}
					<p class="text-sm text-destructive">{$errors.provider_type}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="issuer_url">Issuer URL</Label>
				<Input
					id="issuer_url"
					name="issuer_url"
					type="url"
					placeholder="https://corp.okta.com"
					value={String($form.issuer_url ?? '')}
				/>
				{#if $errors.issuer_url}
					<p class="text-sm text-destructive">{$errors.issuer_url}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="client_id">Client ID</Label>
				<Input
					id="client_id"
					name="client_id"
					type="text"
					placeholder="Client ID from provider"
					value={String($form.client_id ?? '')}
				/>
				{#if $errors.client_id}
					<p class="text-sm text-destructive">{$errors.client_id}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="client_secret">Client secret</Label>
				<Input
					id="client_secret"
					name="client_secret"
					type="password"
					placeholder="Client secret"
					value={String($form.client_secret ?? '')}
				/>
				{#if $errors.client_secret}
					<p class="text-sm text-destructive">{$errors.client_secret}</p>
				{/if}
			</div>

			<Separator class="my-6" />

			<h3 class="text-base font-medium">Advanced settings</h3>

			<div class="space-y-2">
				<Label for="scopes">Scopes</Label>
				<Input
					id="scopes"
					name="scopes"
					type="text"
					placeholder="openid profile email"
					value={String($form.scopes ?? '')}
				/>
				{#if $errors.scopes}
					<p class="text-sm text-destructive">{$errors.scopes}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="claim_mapping">Claim mapping (JSON)</Label>
				<textarea
					id="claim_mapping"
					name="claim_mapping"
					placeholder={'{"sub": "id", "email": "email"}'}
					rows="3"
					class="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
					value={String($form.claim_mapping ?? '')}
				></textarea>
				{#if $errors.claim_mapping}
					<p class="text-sm text-destructive">{$errors.claim_mapping}</p>
				{/if}
			</div>

			<div class="flex items-center gap-2">
				<input
					id="sync_on_login"
					name="sync_on_login"
					type="checkbox"
					checked={$form.sync_on_login ?? false}
					class="h-4 w-4 rounded border-input"
				/>
				<Label for="sync_on_login">Sync user attributes on login</Label>
			</div>
			{#if $errors.sync_on_login}
				<p class="text-sm text-destructive">{$errors.sync_on_login}</p>
			{/if}

			<div class="flex gap-2 pt-2">
				<Button type="submit">
					{mode === 'create' ? 'Create identity provider' : 'Save changes'}
				</Button>
				{#if mode === 'create'}
					<a
						href="/federation?tab=oidc"
						class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
					>
						Cancel
					</a>
				{:else if onCancel}
					<Button type="button" variant="outline" onclick={onCancel}>
						Cancel
					</Button>
				{/if}
			</div>
		</form>
	</CardContent>
</Card>
