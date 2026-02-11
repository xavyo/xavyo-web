<script lang="ts">
	import type { ValidationResult } from '$lib/api/types';
	import { Card, CardContent, CardHeader } from '$lib/components/ui/card';
	import { CheckCircle, XCircle } from 'lucide-svelte';

	interface Props {
		result: ValidationResult | null;
	}

	let { result }: Props = $props();

	const endpointLabels: Record<string, string> = {
		authorization_endpoint: 'Authorization Endpoint',
		token_endpoint: 'Token Endpoint',
		userinfo_endpoint: 'UserInfo Endpoint',
		jwks_uri: 'JWKS URI'
	};
</script>

{#if result}
	<Card
		class={result.is_valid
			? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950'
			: 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950'}
	>
		<CardHeader>
			<div class="flex items-center gap-2">
				{#if result.is_valid}
					<CheckCircle class="h-5 w-5 text-green-600 dark:text-green-400" />
					<h3 class="text-lg font-semibold text-green-800 dark:text-green-200">
						Configuration Valid
					</h3>
				{:else}
					<XCircle class="h-5 w-5 text-red-600 dark:text-red-400" />
					<h3 class="text-lg font-semibold text-red-800 dark:text-red-200">
						Validation Failed
					</h3>
				{/if}
			</div>
		</CardHeader>
		<CardContent>
			{#if !result.is_valid && result.error}
				<p class="mb-4 text-sm text-red-700 dark:text-red-300">{result.error}</p>
			{/if}

			{#if result.discovered_endpoints}
				<div class="space-y-2">
					<h4 class="text-sm font-medium">Discovered Endpoints</h4>
					{#each Object.entries(endpointLabels) as [key, label]}
						{@const url = result.discovered_endpoints?.[key as keyof typeof result.discovered_endpoints]}
						{#if url}
							<div class="flex items-start justify-between gap-4">
								<span class="shrink-0 text-sm text-muted-foreground">{label}</span>
								<span class="truncate text-sm font-mono" title={url}>
									{url}
								</span>
							</div>
						{/if}
					{/each}
				</div>
			{/if}
		</CardContent>
	</Card>
{/if}
