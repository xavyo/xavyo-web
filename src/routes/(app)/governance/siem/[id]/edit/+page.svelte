<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { updateSiemDestinationSchema } from '$lib/schemas/siem';
	import { Card, CardHeader, CardContent } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import { Separator } from '$lib/components/ui/separator';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import { addToast } from '$lib/stores/toast.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const destination = $derived(data.destination);

	const { form, errors, enhance, message } = superForm(data.form, {
		validators: zodClient(updateSiemDestinationSchema),
		onResult({ result }) {
			if (result.type === 'redirect') {
				addToast('success', 'Destination updated successfully');
			}
		}
	});

	// --- Event filter categories ---
	const eventCategories = [
		'authentication',
		'user_lifecycle',
		'group_changes',
		'access_requests',
		'provisioning',
		'administrative',
		'security',
		'entitlement',
		'sod_violation'
	] as const;

	const categoryLabels: Record<string, string> = {
		authentication: 'Authentication',
		user_lifecycle: 'User Lifecycle',
		group_changes: 'Group Changes',
		access_requests: 'Access Requests',
		provisioning: 'Provisioning',
		administrative: 'Administrative',
		security: 'Security',
		entitlement: 'Entitlement',
		sod_violation: 'SoD Violation'
	};

	let selectedCategories = $state<Set<string>>(
		new Set(data.form.data.event_type_filter ?? [])
	);

	function toggleCategory(cat: string) {
		const next = new Set(selectedCategories);
		if (next.has(cat)) {
			next.delete(cat);
		} else {
			next.add(cat);
		}
		selectedCategories = next;
	}

	// Sync selectedCategories into hidden inputs
	const selectedCategoriesArray = $derived(Array.from(selectedCategories));

	// --- Display helpers ---
	const typeLabels: Record<string, string> = {
		syslog_tcp_tls: 'Syslog TLS',
		syslog_udp: 'Syslog UDP',
		webhook: 'Webhook',
		splunk_hec: 'Splunk HEC'
	};

	const formatOptions = [
		{ value: 'cef', label: 'CEF' },
		{ value: 'syslog_rfc5424', label: 'Syslog RFC5424' },
		{ value: 'json', label: 'JSON' },
		{ value: 'csv', label: 'CSV' }
	];
</script>

<div class="flex items-center justify-between">
	<div class="flex items-center gap-3">
		<PageHeader title="Edit Destination" description="Update SIEM destination configuration" />
		<Badge variant="outline">{typeLabels[destination.destination_type] ?? destination.destination_type}</Badge>
	</div>
	<a
		href="/governance/siem/{destination.id}"
		class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
	>
		Back to Details
	</a>
</div>

<Card class="mt-6 max-w-2xl">
	<CardHeader>
		<h2 class="text-xl font-semibold">Destination Configuration</h2>
		<p class="text-sm text-muted-foreground">
			Type: <span class="font-medium">{typeLabels[destination.destination_type] ?? destination.destination_type}</span>
			(cannot be changed after creation)
		</p>
	</CardHeader>
	<CardContent>
		{#if $message}
			<Alert variant="destructive" class="mb-4">
				<AlertDescription>{$message}</AlertDescription>
			</Alert>
		{/if}

		<form method="POST" use:enhance class="space-y-4">
			<!-- Name -->
			<div class="space-y-2">
				<Label for="name">Name</Label>
				<Input
					id="name"
					name="name"
					type="text"
					placeholder="e.g. Production SIEM"
					value={String($form.name ?? '')}
				/>
				{#if $errors.name}
					<p class="text-sm text-destructive">{$errors.name}</p>
				{/if}
			</div>

			<!-- Endpoint -->
			<div class="grid gap-4 sm:grid-cols-3">
				<div class="space-y-2 sm:col-span-2">
					<Label for="endpoint_host">Host</Label>
					<Input
						id="endpoint_host"
						name="endpoint_host"
						type="text"
						placeholder="siem.example.com"
						value={String($form.endpoint_host ?? '')}
					/>
					{#if $errors.endpoint_host}
						<p class="text-sm text-destructive">{$errors.endpoint_host}</p>
					{/if}
				</div>
				<div class="space-y-2">
					<Label for="endpoint_port">Port</Label>
					<Input
						id="endpoint_port"
						name="endpoint_port"
						type="number"
						placeholder="514"
						value={String($form.endpoint_port ?? '')}
					/>
					{#if $errors.endpoint_port}
						<p class="text-sm text-destructive">{$errors.endpoint_port}</p>
					{/if}
				</div>
			</div>

			<!-- Export Format -->
			<div class="space-y-2">
				<Label for="export_format">Export Format</Label>
				<select
					id="export_format"
					name="export_format"
					class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
					value={$form.export_format ?? ''}
					onchange={(e) => {
						$form.export_format = (e.target as HTMLSelectElement).value as typeof $form.export_format;
					}}
				>
					{#each formatOptions as opt}
						<option value={opt.value} selected={$form.export_format === opt.value}>{opt.label}</option>
					{/each}
				</select>
				{#if $errors.export_format}
					<p class="text-sm text-destructive">{$errors.export_format}</p>
				{/if}
			</div>

			<Separator class="my-4" />

			<!-- Event Filter Categories -->
			<div class="space-y-3">
				<Label>Event Filter Categories</Label>
				<p class="text-sm text-muted-foreground">
					Select which event categories to stream. Leave all unchecked to stream all events.
				</p>

				<!-- Hidden inputs for selected categories -->
				{#each selectedCategoriesArray as cat}
					<input type="hidden" name="event_type_filter" value={cat} />
				{/each}

				<div class="grid gap-2 sm:grid-cols-2">
					{#each eventCategories as cat}
						<label class="flex items-center gap-2 text-sm">
							<input
								type="checkbox"
								class="h-4 w-4 rounded border-input"
								checked={selectedCategories.has(cat)}
								onchange={() => toggleCategory(cat)}
							/>
							<span>{categoryLabels[cat] ?? cat}</span>
						</label>
					{/each}
				</div>
			</div>

			<Separator class="my-4" />

			<!-- Rate Limit & Queue -->
			<div class="grid gap-4 sm:grid-cols-2">
				<div class="space-y-2">
					<Label for="rate_limit_per_second">Rate Limit (events/sec)</Label>
					<Input
						id="rate_limit_per_second"
						name="rate_limit_per_second"
						type="number"
						min="1"
						value={String($form.rate_limit_per_second ?? '')}
					/>
					{#if $errors.rate_limit_per_second}
						<p class="text-sm text-destructive">{$errors.rate_limit_per_second}</p>
					{/if}
				</div>
				<div class="space-y-2">
					<Label for="queue_buffer_size">Queue Buffer Size</Label>
					<Input
						id="queue_buffer_size"
						name="queue_buffer_size"
						type="number"
						min="100"
						value={String($form.queue_buffer_size ?? '')}
					/>
					{#if $errors.queue_buffer_size}
						<p class="text-sm text-destructive">{$errors.queue_buffer_size}</p>
					{/if}
				</div>
			</div>

			<!-- Circuit Breaker -->
			<div class="grid gap-4 sm:grid-cols-2">
				<div class="space-y-2">
					<Label for="circuit_breaker_threshold">Circuit Breaker Threshold</Label>
					<Input
						id="circuit_breaker_threshold"
						name="circuit_breaker_threshold"
						type="number"
						min="1"
						value={String($form.circuit_breaker_threshold ?? '')}
					/>
					{#if $errors.circuit_breaker_threshold}
						<p class="text-sm text-destructive">{$errors.circuit_breaker_threshold}</p>
					{/if}
				</div>
				<div class="space-y-2">
					<Label for="circuit_breaker_cooldown_secs">Cooldown (seconds)</Label>
					<Input
						id="circuit_breaker_cooldown_secs"
						name="circuit_breaker_cooldown_secs"
						type="number"
						min="1"
						value={String($form.circuit_breaker_cooldown_secs ?? '')}
					/>
					{#if $errors.circuit_breaker_cooldown_secs}
						<p class="text-sm text-destructive">{$errors.circuit_breaker_cooldown_secs}</p>
					{/if}
				</div>
			</div>

			<!-- Enabled -->
			<div class="flex items-center gap-2">
				<input
					type="checkbox"
					id="enabled"
					name="enabled"
					class="h-4 w-4 rounded border-input"
					checked={$form.enabled ?? false}
					value="true"
				/>
				<Label for="enabled">Enabled</Label>
			</div>

			<!-- Splunk-specific fields -->
			{#if destination.destination_type === 'splunk_hec'}
				<Separator class="my-4" />
				<h3 class="text-sm font-semibold">Splunk Configuration</h3>

				<div class="grid gap-4 sm:grid-cols-2">
					<div class="space-y-2">
						<Label for="splunk_source">Source</Label>
						<Input
							id="splunk_source"
							name="splunk_source"
							type="text"
							placeholder="xavyo-idp"
							value={String($form.splunk_source ?? '')}
						/>
					</div>
					<div class="space-y-2">
						<Label for="splunk_sourcetype">Source Type</Label>
						<Input
							id="splunk_sourcetype"
							name="splunk_sourcetype"
							type="text"
							placeholder="_json"
							value={String($form.splunk_sourcetype ?? '')}
						/>
					</div>
				</div>

				<div class="space-y-2">
					<Label for="splunk_index">Index</Label>
					<Input
						id="splunk_index"
						name="splunk_index"
						type="text"
						placeholder="main"
						value={String($form.splunk_index ?? '')}
					/>
				</div>

				<div class="flex items-center gap-2">
					<input
						type="checkbox"
						id="splunk_ack_enabled"
						name="splunk_ack_enabled"
						class="h-4 w-4 rounded border-input"
						checked={$form.splunk_ack_enabled ?? false}
						value="true"
					/>
					<Label for="splunk_ack_enabled">ACK Enabled</Label>
				</div>
			{/if}

			<!-- Syslog-specific fields -->
			{#if destination.destination_type === 'syslog_tcp_tls' || destination.destination_type === 'syslog_udp'}
				<Separator class="my-4" />
				<h3 class="text-sm font-semibold">Syslog Configuration</h3>

				<div class="space-y-2">
					<Label for="syslog_facility">Facility (0-23)</Label>
					<Input
						id="syslog_facility"
						name="syslog_facility"
						type="number"
						min="0"
						max="23"
						value={String($form.syslog_facility ?? '')}
					/>
					{#if $errors.syslog_facility}
						<p class="text-sm text-destructive">{$errors.syslog_facility}</p>
					{/if}
				</div>

				<div class="flex items-center gap-2">
					<input
						type="checkbox"
						id="tls_verify_cert"
						name="tls_verify_cert"
						class="h-4 w-4 rounded border-input"
						checked={$form.tls_verify_cert ?? true}
						value="true"
					/>
					<Label for="tls_verify_cert">Verify TLS Certificate</Label>
				</div>
			{/if}

			<Separator class="my-4" />

			<!-- Auth Config -->
			<div class="space-y-2">
				<Label for="auth_config_b64">Auth Configuration (Base64)</Label>
				{#if destination.has_auth_config}
					<p class="text-xs text-muted-foreground">
						Credentials are currently configured. Leave blank to keep existing credentials, or provide new base64-encoded config to replace.
					</p>
				{:else}
					<p class="text-xs text-muted-foreground">
						No credentials currently configured. Provide a base64-encoded auth config to set credentials.
					</p>
				{/if}
				<Input
					id="auth_config_b64"
					name="auth_config_b64"
					type="password"
					placeholder={destination.has_auth_config ? 'Leave blank to keep current' : 'Base64-encoded auth config'}
					value={String($form.auth_config_b64 ?? '')}
				/>
			</div>

			<!-- Submit -->
			<div class="flex gap-2 pt-2">
				<Button type="submit">Save Changes</Button>
				<a
					href="/governance/siem/{destination.id}"
					class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
				>
					Cancel
				</a>
			</div>
		</form>
	</CardContent>
</Card>
