<script lang="ts">
	import { Card, CardContent } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import EmptyState from '$lib/components/ui/empty-state/empty-state.svelte';
	import { addToast } from '$lib/stores/toast.svelte';
	import { activateCertificate as activateCertificateClient } from '$lib/api/federation-client';
	import { CheckCircle, Shield } from 'lucide-svelte';
	import type { IdPCertificate } from '$lib/api/types';

	interface Props {
		certificates: IdPCertificate[];
		onActivate?: () => void;
	}

	let { certificates, onActivate }: Props = $props();

	let activatingId = $state<string | null>(null);

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
					<div class="ml-4 shrink-0">
						{#if !cert.is_active}
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
