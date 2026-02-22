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
	import { CONNECTOR_TYPES, DATABASE_DRIVERS, AUTH_TYPES } from '$lib/schemas/connectors';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let selectedType = $state('');

	// svelte-ignore state_referenced_locally
	const { form, errors, enhance, message } = superForm(data.form, {
		onResult({ result }) {
			if (result.type === 'redirect') {
				addToast('success', 'Connector created successfully');
			}
		}
	});

	const connectorTypeLabels: Record<string, string> = {
		ldap: 'LDAP',
		database: 'Database',
		rest: 'REST API'
	};

	const authTypePlaceholders: Record<string, string> = {
		bearer: '{"token": "your-bearer-token"}',
		basic: '{"username": "user", "password": "pass"}',
		api_key: '{"key": "X-API-Key", "value": "your-api-key"}',
		none: '{}'
	};

	let selectedAuthType = $state('bearer');
</script>

<PageHeader title="Create Connector" description="Configure a new connector for identity synchronization" />

<Card class="max-w-2xl">
	<CardHeader>
		<h2 class="text-xl font-semibold">Connector details</h2>
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
					placeholder="e.g. Corporate LDAP"
					value={String($form.name ?? '')}
				/>
				{#if $errors.name}
					<p class="text-sm text-destructive">{$errors.name}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="description">Description (optional)</Label>
				<textarea
					id="description"
					name="description"
					class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
					placeholder="Brief description of this connector"
					value={String($form.description ?? '')}
				></textarea>
				{#if $errors.description}
					<p class="text-sm text-destructive">{$errors.description}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="connector_type">Connector Type</Label>
				<select
					id="connector_type"
					name="connector_type"
					class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
					value={selectedType}
					onchange={(e) => {
						selectedType = (e.target as HTMLSelectElement).value;
					}}
				>
					<option value="" disabled>Select connector type</option>
					{#each CONNECTOR_TYPES as type}
						<option value={type}>{connectorTypeLabels[type] ?? type}</option>
					{/each}
				</select>
				{#if $errors.connector_type}
					<p class="text-sm text-destructive">{$errors.connector_type}</p>
				{/if}
			</div>

			{#if selectedType}
				<Separator class="my-4" />
				<h3 class="text-sm font-medium text-muted-foreground">
					{connectorTypeLabels[selectedType]} Configuration
				</h3>
			{/if}

			{#if selectedType === 'ldap'}
				<div class="space-y-2">
					<Label for="host">Host</Label>
					<Input id="host" name="host" type="text" placeholder="e.g. ldap.example.com" required />
				</div>

				<div class="space-y-2">
					<Label for="port">Port</Label>
					<Input id="port" name="port" type="number" value="636" required />
				</div>

				<div class="space-y-2">
					<Label for="bind_dn">Bind DN</Label>
					<Input
						id="bind_dn"
						name="bind_dn"
						type="text"
						placeholder="e.g. cn=admin,dc=example,dc=com"
						required
					/>
				</div>

				<div class="space-y-2">
					<Label for="bind_password">Bind Password</Label>
					<Input id="bind_password" name="bind_password" type="password" required />
				</div>

				<div class="space-y-2">
					<Label for="base_dn">Base DN</Label>
					<Input
						id="base_dn"
						name="base_dn"
						type="text"
						placeholder="e.g. dc=example,dc=com"
						required
					/>
				</div>

				<div class="flex items-center gap-2">
					<input
						id="use_ssl"
						name="use_ssl"
						type="checkbox"
						class="h-4 w-4 rounded border-input"
						checked
					/>
					<Label for="use_ssl">Use SSL</Label>
				</div>

				<div class="space-y-2">
					<Label for="search_filter">Search Filter (optional)</Label>
					<Input
						id="search_filter"
						name="search_filter"
						type="text"
						placeholder="e.g. (objectClass=person)"
					/>
				</div>
			{/if}

			{#if selectedType === 'database'}
				<div class="space-y-2">
					<Label for="host">Host</Label>
					<Input id="host" name="host" type="text" placeholder="e.g. db.example.com" required />
				</div>

				<div class="space-y-2">
					<Label for="port">Port</Label>
					<Input id="port" name="port" type="number" value="5432" required />
				</div>

				<div class="space-y-2">
					<Label for="database">Database Name</Label>
					<Input
						id="database"
						name="database"
						type="text"
						placeholder="e.g. identity_db"
						required
					/>
				</div>

				<div class="space-y-2">
					<Label for="username">Username</Label>
					<Input id="username" name="username" type="text" placeholder="e.g. db_user" required />
				</div>

				<div class="space-y-2">
					<Label for="password">Password</Label>
					<Input id="password" name="password" type="password" required />
				</div>

				<div class="space-y-2">
					<Label for="driver">Driver</Label>
					<select
						id="driver"
						name="driver"
						class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
						required
					>
						<option value="" disabled selected>Select database driver</option>
						{#each DATABASE_DRIVERS as d}
							<option value={d}>{d}</option>
						{/each}
					</select>
				</div>

				<div class="space-y-2">
					<Label for="query">Custom Query (optional)</Label>
					<textarea
						id="query"
						name="query"
						class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
						placeholder="SELECT * FROM users WHERE active = true"
					></textarea>
				</div>
			{/if}

			{#if selectedType === 'rest'}
				<div class="space-y-2">
					<Label for="base_url">Base URL</Label>
					<Input
						id="base_url"
						name="base_url"
						type="url"
						placeholder="e.g. https://api.example.com/v1"
						required
					/>
				</div>

				<div class="space-y-2">
					<Label for="auth_type">Auth Type</Label>
					<select
						id="auth_type"
						name="auth_type"
						class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
						value={selectedAuthType}
						onchange={(e) => {
							selectedAuthType = (e.target as HTMLSelectElement).value;
						}}
						required
					>
						{#each AUTH_TYPES as at}
							<option value={at}>{at}</option>
						{/each}
					</select>
				</div>

				<div class="space-y-2">
					<Label for="auth_config">Auth Config (JSON)</Label>
					<textarea
						id="auth_config"
						name="auth_config"
						class="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
						placeholder={authTypePlaceholders[selectedAuthType] ?? '{}'}
						required
					></textarea>
				</div>

				<div class="space-y-2">
					<Label for="headers">Additional Headers (JSON, optional)</Label>
					<textarea
						id="headers"
						name="headers"
						class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
						placeholder={'{"Content-Type": "application/json"}'}
					></textarea>
				</div>
			{/if}

			<div class="flex gap-2 pt-2">
				<Button type="submit">Create Connector</Button>
				<a
					href="/connectors"
					class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
				>
					Cancel
				</a>
			</div>
		</form>
	</CardContent>
</Card>
