<script lang="ts">
	import { Card, CardHeader, CardContent } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import type { UploadCertificateRequest } from '$lib/api/types';

	interface Props {
		onSubmit: (data: UploadCertificateRequest) => Promise<void>;
	}

	let { onSubmit }: Props = $props();

	let certificate = $state('');
	let privateKey = $state('');
	let keyId = $state('');
	let subjectDn = $state('');
	let issuerDn = $state('');
	let notBefore = $state('');
	let notAfter = $state('');
	let errorMessage = $state<string | null>(null);
	let submitting = $state(false);

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		errorMessage = null;

		if (!certificate.includes('BEGIN CERTIFICATE')) {
			errorMessage = 'Certificate must be in PEM format (BEGIN CERTIFICATE)';
			return;
		}
		if (!privateKey.includes('BEGIN')) {
			errorMessage = 'Private key must be in PEM format';
			return;
		}
		if (!keyId.trim()) {
			errorMessage = 'Key ID is required';
			return;
		}

		submitting = true;
		try {
			const data: UploadCertificateRequest = {
				certificate,
				private_key: privateKey,
				key_id: keyId.trim(),
				subject_dn: subjectDn.trim() || undefined,
				issuer_dn: issuerDn.trim() || undefined,
				not_before: notBefore || undefined,
				not_after: notAfter || undefined
			};
			await onSubmit(data);
			// Reset form on success
			certificate = '';
			privateKey = '';
			keyId = '';
			subjectDn = '';
			issuerDn = '';
			notBefore = '';
			notAfter = '';
		} catch (e) {
			errorMessage = e instanceof Error ? e.message : 'Failed to upload certificate';
		} finally {
			submitting = false;
		}
	}
</script>

<Card class="max-w-lg">
	<CardHeader>
		<h3 class="text-lg font-semibold">Upload certificate</h3>
	</CardHeader>
	<CardContent>
		{#if errorMessage}
			<Alert variant="destructive" class="mb-4">
				<AlertDescription>{errorMessage}</AlertDescription>
			</Alert>
		{/if}

		<form onsubmit={handleSubmit} class="space-y-4">
			<div class="space-y-2">
				<Label for="cert-certificate">Certificate (PEM)</Label>
				<textarea
					id="cert-certificate"
					placeholder="-----BEGIN CERTIFICATE-----&#10;...&#10;-----END CERTIFICATE-----"
					rows="4"
					class="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 font-mono"
					value={certificate}
					oninput={(e) => (certificate = (e.target as HTMLTextAreaElement).value)}
				></textarea>
			</div>

			<div class="space-y-2">
				<Label for="cert-private-key">Private key (PEM)</Label>
				<textarea
					id="cert-private-key"
					placeholder="-----BEGIN PRIVATE KEY-----&#10;...&#10;-----END PRIVATE KEY-----"
					rows="4"
					class="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 font-mono"
					value={privateKey}
					oninput={(e) => (privateKey = (e.target as HTMLTextAreaElement).value)}
				></textarea>
			</div>

			<div class="space-y-2">
				<Label for="cert-key-id">Key ID</Label>
				<Input
					id="cert-key-id"
					type="text"
					placeholder="e.g. signing-key-2024"
					value={keyId}
					oninput={(e) => (keyId = (e.target as HTMLInputElement).value)}
				/>
			</div>

			<div class="space-y-2">
				<Label for="cert-subject-dn">Subject DN (optional)</Label>
				<Input
					id="cert-subject-dn"
					type="text"
					placeholder="e.g. CN=My IdP"
					value={subjectDn}
					oninput={(e) => (subjectDn = (e.target as HTMLInputElement).value)}
				/>
			</div>

			<div class="space-y-2">
				<Label for="cert-issuer-dn">Issuer DN (optional)</Label>
				<Input
					id="cert-issuer-dn"
					type="text"
					placeholder="e.g. CN=My CA"
					value={issuerDn}
					oninput={(e) => (issuerDn = (e.target as HTMLInputElement).value)}
				/>
			</div>

			<div class="grid grid-cols-2 gap-4">
				<div class="space-y-2">
					<Label for="cert-not-before">Not before (optional)</Label>
					<Input
						id="cert-not-before"
						type="date"
						value={notBefore}
						oninput={(e) => (notBefore = (e.target as HTMLInputElement).value)}
					/>
				</div>
				<div class="space-y-2">
					<Label for="cert-not-after">Not after (optional)</Label>
					<Input
						id="cert-not-after"
						type="date"
						value={notAfter}
						oninput={(e) => (notAfter = (e.target as HTMLInputElement).value)}
					/>
				</div>
			</div>

			<div class="flex gap-2 pt-2">
				<Button type="submit" disabled={submitting}>
					{submitting ? 'Uploading...' : 'Upload certificate'}
				</Button>
			</div>
		</form>
	</CardContent>
</Card>
