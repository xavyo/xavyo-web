<script lang="ts">
	import type { SecurityOverview, MfaStatus, WebAuthnCredential } from '$lib/api/types';
	import SecurityOverviewComponent from './security-overview.svelte';
	import MfaStatusSection from './mfa-status-section.svelte';
	import WebAuthnSection from './webauthn-section.svelte';
	import PasswordChangeForm from './password-change-form.svelte';

	interface Props {
		securityOverview: SecurityOverview | null;
		mfaStatus: MfaStatus | null;
	}

	let { securityOverview: initialSecurityOverview, mfaStatus: initialMfaStatus }: Props = $props();

	// svelte-ignore state_referenced_locally
	let securityOverview = $state<SecurityOverview | null>(initialSecurityOverview);
	// svelte-ignore state_referenced_locally
	let mfaStatus = $state<MfaStatus | null>(initialMfaStatus);
	let webauthnCredentials = $state<WebAuthnCredential[]>([]);
	let isLoadingCredentials = $state(true);

	// Fetch WebAuthn credentials on mount
	$effect(() => {
		loadWebauthnCredentials();
	});

	async function loadWebauthnCredentials() {
		isLoadingCredentials = true;
		try {
			const response = await fetch('/api/mfa/webauthn/credentials');
			if (response.ok) {
				const data = (await response.json()) as { credentials: WebAuthnCredential[] };
				webauthnCredentials = data.credentials;
			}
		} catch {
			// Non-critical — credentials will show as empty
		} finally {
			isLoadingCredentials = false;
		}
	}

	async function refreshMfaStatus() {
		try {
			const response = await fetch('/api/mfa/status');
			if (response.ok) {
				mfaStatus = (await response.json()) as MfaStatus;
			}
		} catch {
			// Non-critical
		}
	}

	async function refreshSecurityOverview() {
		try {
			const response = await fetch('/api/me/security');
			if (response.ok) {
				securityOverview = (await response.json()) as SecurityOverview;
			}
		} catch {
			// Non-critical
		}
	}

	function handleMfaUpdated() {
		refreshMfaStatus();
		refreshSecurityOverview();
		loadWebauthnCredentials();
	}

	function handleCredentialsChanged() {
		loadWebauthnCredentials();
		refreshMfaStatus();
		refreshSecurityOverview();
	}
</script>

<div class="mt-4 space-y-8">
	<SecurityOverviewComponent {securityOverview} />

	<div class="space-y-4">
		<h2 class="text-lg font-semibold">Two-Factor Authentication</h2>
		<MfaStatusSection {mfaStatus} onMfaUpdated={handleMfaUpdated} />
	</div>

	<div class="space-y-4">
		<h2 class="text-lg font-semibold">Security Keys</h2>
		{#if isLoadingCredentials}
			<div class="flex items-center justify-center py-8">
				<p class="text-sm text-muted-foreground">Loading security keys...</p>
			</div>
		{:else}
			<WebAuthnSection credentials={webauthnCredentials} onCredentialsChanged={handleCredentialsChanged} />
		{/if}
	</div>

	<div class="space-y-4">
		<h2 class="text-lg font-semibold">Password</h2>
		<PasswordChangeForm />
	</div>
</div>
