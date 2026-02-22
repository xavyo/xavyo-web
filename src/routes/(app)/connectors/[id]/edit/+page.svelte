<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { Card, CardHeader, CardContent } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import { Separator } from '$lib/components/ui/separator';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import { addToast } from '$lib/stores/toast.svelte';
	import { DATABASE_DRIVERS, AUTH_TYPES } from '$lib/schemas/connectors';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// svelte-ignore state_referenced_locally
	const { form, errors, enhance, message } = superForm(data.form, {
		onResult({ result }) {
			if (result.type === 'redirect') {
				addToast('success', 'Connector updated successfully');
			}
		}
	});

	// svelte-ignore state_referenced_locally
	const config = data.connector.config as Record<string, unknown>;

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

	let selectedAuthType = $state(String((config.auth_type as string) ?? 'bearer'));
</script>

<PageHeader title="Edit Connector" description="Update connector configuration" />

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
				<Label>Connector Type</Label>
				<div class="flex items-center gap-2">
					<Badge variant="secondary">
						{connectorTypeLabels[data.connector.connector_type] ?? data.connector.connector_type}
					</Badge>
					<span class="text-sm text-muted-foreground">Type cannot be changed</span>
				</div>
				<input type="hidden" name="connector_type" value={data.connector.connector_type} />
			</div>

			<Separator class="my-4" />
			<h3 class="text-sm font-medium text-muted-foreground">
				{connectorTypeLabels[data.connector.connector_type] ?? data.connector.connector_type} Configuration
			</h3>

			{#if data.connector.connector_type === 'ldap'}
				<div class="space-y-2">
					<Label for="host">Host</Label>
					<Input
						id="host"
						name="host"
						type="text"
						placeholder="e.g. ldap.example.com"
						value={String(config.host ?? '')}
						required
					/>
				</div>

				<div class="space-y-2">
					<Label for="port">Port</Label>
					<Input
						id="port"
						name="port"
						type="number"
						value={String(config.port ?? 636)}
						required
					/>
				</div>

				<div class="space-y-2">
					<Label for="bind_dn">Bind DN</Label>
					<Input
						id="bind_dn"
						name="bind_dn"
						type="text"
						placeholder="e.g. cn=admin,dc=example,dc=com"
						value={String(config.bind_dn ?? '')}
						required
					/>
				</div>

				<div class="space-y-2">
					<Label for="bind_password">Bind Password</Label>
					<Input
						id="bind_password"
						name="bind_password"
						type="password"
						value={String(config.bind_password ?? '')}
						required
					/>
				</div>

				<div class="space-y-2">
					<Label for="base_dn">Base DN</Label>
					<Input
						id="base_dn"
						name="base_dn"
						type="text"
						placeholder="e.g. dc=example,dc=com"
						value={String(config.base_dn ?? '')}
						required
					/>
				</div>

				<div class="flex items-center gap-2">
					<input
						id="use_ssl"
						name="use_ssl"
						type="checkbox"
						class="h-4 w-4 rounded border-input"
						checked={config.use_ssl === true}
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
						value={String(config.search_filter ?? '')}
					/>
				</div>
			{/if}

			{#if data.connector.connector_type === 'database'}
				<div class="space-y-2">
					<Label for="host">Host</Label>
					<Input
						id="host"
						name="host"
						type="text"
						placeholder="e.g. db.example.com"
						value={String(config.host ?? '')}
						required
					/>
				</div>

				<div class="space-y-2">
					<Label for="port">Port</Label>
					<Input
						id="port"
						name="port"
						type="number"
						value={String(config.port ?? 5432)}
						required
					/>
				</div>

				<div class="space-y-2">
					<Label for="database">Database Name</Label>
					<Input
						id="database"
						name="database"
						type="text"
						placeholder="e.g. identity_db"
						value={String(config.database ?? '')}
						required
					/>
				</div>

				<div class="space-y-2">
					<Label for="username">Username</Label>
					<Input
						id="username"
						name="username"
						type="text"
						placeholder="e.g. db_user"
						value={String(config.username ?? '')}
						required
					/>
				</div>

				<div class="space-y-2">
					<Label for="password">Password</Label>
					<Input
						id="password"
						name="password"
						type="password"
						value={String(config.password ?? '')}
						required
					/>
				</div>

				<div class="space-y-2">
					<Label for="driver">Driver</Label>
					<select
						id="driver"
						name="driver"
						class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
						value={String(config.driver ?? '')}
						required
					>
						<option value="" disabled>Select database driver</option>
						{#each DATABASE_DRIVERS as d}
							<option value={d} selected={config.driver === d}>{d}</option>
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
						value={String(config.query ?? '')}
					></textarea>
				</div>
			{/if}

			{#if data.connector.connector_type === 'rest'}
				<div class="space-y-2">
					<Label for="base_url">Base URL</Label>
					<Input
						id="base_url"
						name="base_url"
						type="url"
						placeholder="e.g. https://api.example.com/v1"
						value={String(config.base_url ?? '')}
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
							<option value={at} selected={String(config.auth_type ?? '') === at}>{at}</option>
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
					>{config.auth_config ? JSON.stringify(config.auth_config, null, 2) : '{}'}</textarea>
				</div>

				<div class="space-y-2">
					<Label for="headers">Additional Headers (JSON, optional)</Label>
					<textarea
						id="headers"
						name="headers"
						class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
						placeholder={'{"Content-Type": "application/json"}'}
					>{config.headers ? JSON.stringify(config.headers, null, 2) : ''}</textarea>
				</div>
			{/if}

			<div class="flex gap-2 pt-2">
				<Button type="submit">Save Changes</Button>
				<a
					href="/connectors/{data.connector.id}"
					class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
				>
					Cancel
				</a>
			</div>
		</form>
	</CardContent>
</Card>
