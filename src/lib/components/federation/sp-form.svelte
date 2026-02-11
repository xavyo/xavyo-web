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
			{mode === 'create' ? 'Service provider details' : 'Edit service provider'}
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
				<Label for="sp-name">Name</Label>
				<Input
					id="sp-name"
					name="name"
					type="text"
					placeholder="e.g. My Application"
					value={String($form.name ?? '')}
				/>
				{#if $errors.name}
					<p class="text-sm text-destructive">{$errors.name}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="sp-entity-id">Entity ID</Label>
				<Input
					id="sp-entity-id"
					name="entity_id"
					type="text"
					placeholder="e.g. urn:myapp:saml"
					value={String($form.entity_id ?? '')}
				/>
				{#if $errors.entity_id}
					<p class="text-sm text-destructive">{$errors.entity_id}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="sp-acs-urls">ACS URLs (one per line or comma-separated)</Label>
				<textarea
					id="sp-acs-urls"
					name="acs_urls"
					placeholder="https://myapp.example.com/saml/acs"
					rows="3"
					class="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
					value={String($form.acs_urls ?? '')}
				></textarea>
				{#if $errors.acs_urls}
					<p class="text-sm text-destructive">{$errors.acs_urls}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="sp-name-id-format">Name ID format</Label>
				<select
					id="sp-name-id-format"
					name="name_id_format"
					class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
					value={String($form.name_id_format ?? '')}
				>
					<option value="">-- Select --</option>
					<option value="emailAddress">emailAddress</option>
					<option value="persistent">persistent</option>
					<option value="transient">transient</option>
					<option value="unspecified">unspecified</option>
				</select>
				{#if $errors.name_id_format}
					<p class="text-sm text-destructive">{$errors.name_id_format}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="sp-certificate">Certificate (PEM, optional)</Label>
				<textarea
					id="sp-certificate"
					name="certificate"
					placeholder="-----BEGIN CERTIFICATE-----"
					rows="3"
					class="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 font-mono"
					value={String($form.certificate ?? '')}
				></textarea>
				{#if $errors.certificate}
					<p class="text-sm text-destructive">{$errors.certificate}</p>
				{/if}
			</div>

			<Separator class="my-6" />

			<h3 class="text-base font-medium">Advanced settings</h3>

			<div class="space-y-2">
				<Label for="sp-attribute-mapping">Attribute mapping (JSON, optional)</Label>
				<textarea
					id="sp-attribute-mapping"
					name="attribute_mapping"
					placeholder={'{"email": "user.email", "name": "user.name"}'}
					rows="3"
					class="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
					value={String($form.attribute_mapping ?? '')}
				></textarea>
				{#if $errors.attribute_mapping}
					<p class="text-sm text-destructive">{$errors.attribute_mapping}</p>
				{/if}
			</div>

			<div class="flex items-center gap-2">
				<input
					id="sp-sign-assertions"
					name="sign_assertions"
					type="checkbox"
					checked={$form.sign_assertions ?? true}
					class="h-4 w-4 rounded border-input"
				/>
				<Label for="sp-sign-assertions">Sign assertions</Label>
			</div>
			{#if $errors.sign_assertions}
				<p class="text-sm text-destructive">{$errors.sign_assertions}</p>
			{/if}

			<div class="flex items-center gap-2">
				<input
					id="sp-validate-signatures"
					name="validate_signatures"
					type="checkbox"
					checked={$form.validate_signatures ?? false}
					class="h-4 w-4 rounded border-input"
				/>
				<Label for="sp-validate-signatures">Validate signatures</Label>
			</div>
			{#if $errors.validate_signatures}
				<p class="text-sm text-destructive">{$errors.validate_signatures}</p>
			{/if}

			<div class="space-y-2">
				<Label for="sp-assertion-validity">Assertion validity (seconds)</Label>
				<Input
					id="sp-assertion-validity"
					name="assertion_validity_seconds"
					type="number"
					min="60"
					max="86400"
					placeholder="300"
					value={String($form.assertion_validity_seconds ?? '300')}
				/>
				{#if $errors.assertion_validity_seconds}
					<p class="text-sm text-destructive">{$errors.assertion_validity_seconds}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="sp-metadata-url">Metadata URL (optional)</Label>
				<Input
					id="sp-metadata-url"
					name="metadata_url"
					type="url"
					placeholder="https://myapp.example.com/saml/metadata"
					value={String($form.metadata_url ?? '')}
				/>
				{#if $errors.metadata_url}
					<p class="text-sm text-destructive">{$errors.metadata_url}</p>
				{/if}
			</div>

			{#if mode === 'edit'}
				<div class="flex items-center gap-2">
					<input
						id="sp-enabled"
						name="enabled"
						type="checkbox"
						checked={$form.enabled ?? false}
						class="h-4 w-4 rounded border-input"
					/>
					<Label for="sp-enabled">Enabled</Label>
				</div>
				{#if $errors.enabled}
					<p class="text-sm text-destructive">{$errors.enabled}</p>
				{/if}
			{/if}

			<div class="flex gap-2 pt-2">
				<Button type="submit">
					{mode === 'create' ? 'Create service provider' : 'Save changes'}
				</Button>
				{#if mode === 'create'}
					<a
						href="/federation?tab=saml"
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
