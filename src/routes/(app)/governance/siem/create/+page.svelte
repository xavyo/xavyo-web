<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { createSiemDestinationSchema } from '$lib/schemas/siem';
	import { Card, CardHeader, CardContent } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import { addToast } from '$lib/stores/toast.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// svelte-ignore state_referenced_locally
	const { form, errors, enhance, message } = superForm(data.form, {
		validators: zodClient(createSiemDestinationSchema),
		onResult({ result }) {
			if (result.type === 'redirect') {
				addToast('success', 'SIEM destination created successfully');
			}
		}
	});

	const selectClass =
		'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';

	const textareaClass =
		'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

	// Derive destination type for conditional field display
	let destType = $derived($form.destination_type);
	let isSplunk = $derived(destType === 'splunk_hec');
	let isSyslog = $derived(destType === 'syslog_tcp_tls' || destType === 'syslog_udp');
	let isSyslogTls = $derived(destType === 'syslog_tcp_tls');

	const eventCategories = [
		{ value: 'authentication', label: 'Authentication' },
		{ value: 'user_lifecycle', label: 'User Lifecycle' },
		{ value: 'group_changes', label: 'Group Changes' },
		{ value: 'access_requests', label: 'Access Requests' },
		{ value: 'provisioning', label: 'Provisioning' },
		{ value: 'administrative', label: 'Administrative' },
		{ value: 'security', label: 'Security' },
		{ value: 'entitlement', label: 'Entitlement' },
		{ value: 'sod_violation', label: 'SoD Violation' }
	] as const;

	function handleEventTypeToggle(value: string) {
		const current = $form.event_type_filter ?? [];
		if (current.includes(value as (typeof current)[number])) {
			$form.event_type_filter = current.filter((v) => v !== value) as typeof current;
		} else {
			$form.event_type_filter = [...current, value] as typeof current;
		}
	}
</script>

<PageHeader
	title="Create SIEM Destination"
	description="Configure a new SIEM destination for real-time event streaming"
/>

<Card class="max-w-2xl">
	<CardHeader>
		<h2 class="text-xl font-semibold">Destination details</h2>
	</CardHeader>
	<CardContent>
		{#if $message}
			<Alert variant="destructive" class="mb-4">
				<AlertDescription>{$message}</AlertDescription>
			</Alert>
		{/if}

		<form method="POST" use:enhance class="space-y-6">
			<!-- Basic Settings -->
			<div class="space-y-4">
				<div class="space-y-2">
					<Label for="name">Name</Label>
					<Input
						id="name"
						name="name"
						type="text"
						placeholder="e.g. Splunk Production"
						value={String($form.name ?? '')}
					/>
					{#if $errors.name}
						<p class="text-sm text-destructive">{$errors.name}</p>
					{/if}
				</div>

				<div class="space-y-2">
					<Label for="destination_type">Destination Type</Label>
					<select
						id="destination_type"
						name="destination_type"
						class={selectClass}
						value={String($form.destination_type ?? '')}
						onchange={(e) => {
							$form.destination_type = (e.target as HTMLSelectElement).value as typeof $form.destination_type;
						}}
					>
						<option value="" disabled>Select destination type</option>
						<option value="syslog_tcp_tls">Syslog TLS</option>
						<option value="syslog_udp">Syslog UDP</option>
						<option value="webhook">Webhook</option>
						<option value="splunk_hec">Splunk HEC</option>
					</select>
					{#if $errors.destination_type}
						<p class="text-sm text-destructive">{$errors.destination_type}</p>
					{/if}
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div class="space-y-2">
						<Label for="endpoint_host">Endpoint Host</Label>
						<Input
							id="endpoint_host"
							name="endpoint_host"
							type="text"
							placeholder="e.g. siem.example.com"
							value={String($form.endpoint_host ?? '')}
						/>
						{#if $errors.endpoint_host}
							<p class="text-sm text-destructive">{$errors.endpoint_host}</p>
						{/if}
					</div>
					<div class="space-y-2">
						<Label for="endpoint_port">Port (optional)</Label>
						<Input
							id="endpoint_port"
							name="endpoint_port"
							type="number"
							min="1"
							max="65535"
							placeholder="e.g. 514"
							value={String($form.endpoint_port ?? '')}
						/>
						{#if $errors.endpoint_port}
							<p class="text-sm text-destructive">{$errors.endpoint_port}</p>
						{/if}
					</div>
				</div>

				<div class="space-y-2">
					<Label for="export_format">Export Format</Label>
					<select
						id="export_format"
						name="export_format"
						class={selectClass}
						value={String($form.export_format ?? '')}
						onchange={(e) => {
							$form.export_format = (e.target as HTMLSelectElement).value as typeof $form.export_format;
						}}
					>
						<option value="" disabled>Select format</option>
						<option value="cef">CEF</option>
						<option value="syslog_rfc5424">Syslog RFC5424</option>
						<option value="json">JSON</option>
						<option value="csv">CSV</option>
					</select>
					{#if $errors.export_format}
						<p class="text-sm text-destructive">{$errors.export_format}</p>
					{/if}
				</div>
			</div>

			<!-- Event Type Filter -->
			<div class="space-y-2">
				<Label>Event Type Filter</Label>
				<p class="text-xs text-muted-foreground">
					Select which event categories to stream to this destination. Leave empty to stream all
					events.
				</p>
				<div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
					{#each eventCategories as cat}
						<label class="flex items-center gap-2 text-sm">
							<input
								type="checkbox"
								name="event_type_filter"
								value={cat.value}
								checked={($form.event_type_filter ?? []).includes(cat.value)}
								onchange={() => handleEventTypeToggle(cat.value)}
								class="h-4 w-4 rounded border-input"
							/>
							{cat.label}
						</label>
					{/each}
				</div>
				{#if $errors.event_type_filter}
					<p class="text-sm text-destructive">{$errors.event_type_filter}</p>
				{/if}
			</div>

			<!-- Rate Limiting & Circuit Breaker -->
			<div class="space-y-4">
				<h3 class="text-sm font-medium text-foreground">Rate Limiting & Circuit Breaker</h3>
				<div class="grid grid-cols-2 gap-4">
					<div class="space-y-2">
						<Label for="rate_limit_per_second">Rate Limit (events/sec)</Label>
						<Input
							id="rate_limit_per_second"
							name="rate_limit_per_second"
							type="number"
							min="1"
							placeholder="1000"
							value={String($form.rate_limit_per_second ?? '1000')}
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
							placeholder="10000"
							value={String($form.queue_buffer_size ?? '10000')}
						/>
						{#if $errors.queue_buffer_size}
							<p class="text-sm text-destructive">{$errors.queue_buffer_size}</p>
						{/if}
					</div>
					<div class="space-y-2">
						<Label for="circuit_breaker_threshold">Circuit Breaker Threshold</Label>
						<Input
							id="circuit_breaker_threshold"
							name="circuit_breaker_threshold"
							type="number"
							min="1"
							placeholder="5"
							value={String($form.circuit_breaker_threshold ?? '5')}
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
							placeholder="60"
							value={String($form.circuit_breaker_cooldown_secs ?? '60')}
						/>
						{#if $errors.circuit_breaker_cooldown_secs}
							<p class="text-sm text-destructive">{$errors.circuit_breaker_cooldown_secs}</p>
						{/if}
					</div>
				</div>
			</div>

			<!-- Enabled Toggle -->
			<div class="space-y-2">
				<label class="flex items-center gap-2 text-sm">
					<input
						type="checkbox"
						name="enabled"
						checked={$form.enabled}
						onchange={(e) => {
							$form.enabled = (e.target as HTMLInputElement).checked;
						}}
						class="h-4 w-4 rounded border-input"
					/>
					Enabled
				</label>
				<p class="text-xs text-muted-foreground">
					Enable this destination to start streaming events immediately after creation.
				</p>
			</div>

			<!-- Splunk-specific fields -->
			{#if isSplunk}
				<div class="space-y-4 rounded-md border border-border p-4">
					<h3 class="text-sm font-medium text-foreground">Splunk HEC Settings</h3>
					<div class="grid grid-cols-2 gap-4">
						<div class="space-y-2">
							<Label for="splunk_source">Source (optional)</Label>
							<Input
								id="splunk_source"
								name="splunk_source"
								type="text"
								placeholder="e.g. xavyo-idp"
								value={String($form.splunk_source ?? '')}
							/>
							{#if $errors.splunk_source}
								<p class="text-sm text-destructive">{$errors.splunk_source}</p>
							{/if}
						</div>
						<div class="space-y-2">
							<Label for="splunk_sourcetype">Sourcetype (optional)</Label>
							<Input
								id="splunk_sourcetype"
								name="splunk_sourcetype"
								type="text"
								placeholder="e.g. _json"
								value={String($form.splunk_sourcetype ?? '')}
							/>
							{#if $errors.splunk_sourcetype}
								<p class="text-sm text-destructive">{$errors.splunk_sourcetype}</p>
							{/if}
						</div>
					</div>
					<div class="space-y-2">
						<Label for="splunk_index">Index (optional)</Label>
						<Input
							id="splunk_index"
							name="splunk_index"
							type="text"
							placeholder="e.g. main"
							value={String($form.splunk_index ?? '')}
						/>
						{#if $errors.splunk_index}
							<p class="text-sm text-destructive">{$errors.splunk_index}</p>
						{/if}
					</div>
					<label class="flex items-center gap-2 text-sm">
						<input
							type="checkbox"
							name="splunk_ack_enabled"
							checked={$form.splunk_ack_enabled}
							onchange={(e) => {
								$form.splunk_ack_enabled = (e.target as HTMLInputElement).checked;
							}}
							class="h-4 w-4 rounded border-input"
						/>
						Enable indexer acknowledgment
					</label>
				</div>
			{/if}

			<!-- Syslog-specific fields -->
			{#if isSyslog}
				<div class="space-y-4 rounded-md border border-border p-4">
					<h3 class="text-sm font-medium text-foreground">Syslog Settings</h3>
					<div class="space-y-2">
						<Label for="syslog_facility">Facility (0-23)</Label>
						<Input
							id="syslog_facility"
							name="syslog_facility"
							type="number"
							min="0"
							max="23"
							placeholder="10"
							value={String($form.syslog_facility ?? '10')}
						/>
						{#if $errors.syslog_facility}
							<p class="text-sm text-destructive">{$errors.syslog_facility}</p>
						{/if}
					</div>
					{#if isSyslogTls}
						<label class="flex items-center gap-2 text-sm">
							<input
								type="checkbox"
								name="tls_verify_cert"
								checked={$form.tls_verify_cert}
								onchange={(e) => {
									$form.tls_verify_cert = (e.target as HTMLInputElement).checked;
								}}
								class="h-4 w-4 rounded border-input"
							/>
							Verify TLS certificate
						</label>
					{/if}
				</div>
			{/if}

			<!-- Auth Config -->
			<div class="space-y-2">
				<Label for="auth_config_b64">Auth Config (Base64, optional)</Label>
				<textarea
					id="auth_config_b64"
					name="auth_config_b64"
					class={textareaClass}
					placeholder="Base64-encoded authentication configuration"
					value={String($form.auth_config_b64 ?? '')}
				></textarea>
				<p class="text-xs text-muted-foreground">
					Provide a base64-encoded authentication credential (e.g., Splunk HEC token, webhook bearer
					token, or TLS client certificate).
				</p>
				{#if $errors.auth_config_b64}
					<p class="text-sm text-destructive">{$errors.auth_config_b64}</p>
				{/if}
			</div>

			<!-- Submit -->
			<div class="flex gap-2 pt-2">
				<Button type="submit">Create destination</Button>
				<a
					href="/governance/siem"
					class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
				>
					Cancel
				</a>
			</div>
		</form>
	</CardContent>
</Card>
