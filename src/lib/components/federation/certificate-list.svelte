<script lang="ts">
	import { Card, CardContent } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import EmptyState from '$lib/components/ui/empty-state/empty-state.svelte';
	import { addToast } from '$lib/stores/toast.svelte';
	import { activateCertificate as activateCertificateClient } from '$lib/api/federation-client';
	import { CheckCircle, Shield, Download, Copy } from 'lucide-svelte';
	import type { IdPCertificate } from '$lib/api/types';

	interface Props {
		certificates: IdPCertificate[];
		onActivate?: () => void;
	}

	let { certificates, onActivate }: Props = $props();

	let activatingId = $state<string | null>(null);
	let exportingId = $state<string | null>(null);

	async function fetchActiveCertPem(): Promise<string | null> {
		try {
			const res = await fetch('/api/federation/saml/metadata');
			if (!res.ok) return null;
			const xml = await res.text();
			// Extract X509Certificate content from metadata XML
			const match = xml.match(/<(?:ds:)?X509Certificate>([\s\S]*?)<\/(?:ds:)?X509Certificate>/);
			if (!match) return null;
			const base64 = match[1].replace(/\s/g, '');
			const lines: string[] = [];
			for (let i = 0; i < base64.length; i += 64) {
				lines.push(base64.substring(i, i + 64));
			}
			return `-----BEGIN CERTIFICATE-----\n${lines.join('\n')}\n-----END CERTIFICATE-----\n`;
		} catch {
			return null;
		}
	}

	async function handleDownloadPem(cert: IdPCertificate) {
		exportingId = cert.id;
		try {
			const pem = await fetchActiveCertPem();
			if (!pem) {
				addToast('error', 'Could not extract certificate from metadata');
				return;
			}
			const blob = new Blob([pem], { type: 'application/x-pem-file' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `${cert.key_id}.pem`;
			a.click();
			URL.revokeObjectURL(url);
		} catch {
			addToast('error', 'Failed to download certificate');
		} finally {
			exportingId = null;
		}
	}

	async function handleCopyPem(cert: IdPCertificate) {
		exportingId = cert.id;
		try {
			const pem = await fetchActiveCertPem();
			if (!pem) {
				addToast('error', 'Could not extract certificate from metadata');
				return;
			}
			await navigator.clipboard.writeText(pem);
			addToast('success', 'Certificate PEM copied to clipboard');
		} catch {
			addToast('error', 'Failed to copy certificate');
		} finally {
			exportingId = null;
		}
	}

	async function handleActivate(cert: IdPCertificate) {
		activatingId = cert.id;
		try {
			await activateCertificateClient(cert.id);
			addToast('success', `Certificate "${cert.key_id}" activated`);
			onActivate?.();
		} catch (e) {
			addToast('error', e instanceof Error ? e.message : 'Failed to activate certificate');
		} finally {
			activatingId = null;
		}
	}

	function formatDate(dateStr: string | null): string {
		if (!dateStr) return '\u2014';
		return new Date(dateStr).toLocaleDateString();
	}
</script>

{#if certificates.length === 0}
	<EmptyState
		title="No certificates"
		description="Upload an IdP signing certificate to enable SAML assertion signing"
	/>
{:else}
	<div class="space-y-3">
		{#each certificates as cert (cert.id)}
			<Card>
				<CardContent class="flex items-center justify-between py-4">
					<div class="min-w-0 flex-1">
						<div class="flex items-center gap-3">
							<Shield class="h-4 w-4 shrink-0 text-muted-foreground" />
							<span class="font-medium text-foreground">{cert.key_id}</span>
							{#if cert.is_active}
								<Badge class="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
									<CheckCircle class="mr-1 h-3 w-3" />Active
								</Badge>
							{:else}
								<Badge variant="secondary">Inactive</Badge>
							{/if}
						</div>
						<div class="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
							{#if cert.subject_dn}
								<span>Subject: {cert.subject_dn}</span>
							{/if}
							{#if cert.issuer_dn}
								<span>Issuer: {cert.issuer_dn}</span>
							{/if}
							<span>Valid: {formatDate(cert.not_before)} &ndash; {formatDate(cert.not_after)}</span>
						</div>
					</div>
					<div class="ml-4 flex shrink-0 gap-2">
						{#if cert.is_active}
							<Button
								variant="ghost"
								size="sm"
								disabled={exportingId === cert.id}
								onclick={() => handleDownloadPem(cert)}
								title="Download PEM"
							>
								<Download class="h-4 w-4" />
							</Button>
							<Button
								variant="ghost"
								size="sm"
								disabled={exportingId === cert.id}
								onclick={() => handleCopyPem(cert)}
								title="Copy PEM"
							>
								<Copy class="h-4 w-4" />
							</Button>
						{:else}
							<Button
								variant="outline"
								size="sm"
								disabled={activatingId === cert.id}
								onclick={() => handleActivate(cert)}
							>
								{activatingId === cert.id ? 'Activating...' : 'Activate'}
							</Button>
						{/if}
					</div>
				</CardContent>
			</Card>
		{/each}
	</div>
{/if}
