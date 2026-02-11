<script lang="ts">
	import { fetchAgentCard } from '$lib/api/a2a-client';
	import type { AgentCard } from '$lib/api/types';
	import { Card, CardHeader, CardContent } from '$lib/components/ui/card';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import Button from '$lib/components/ui/button/button.svelte';

	interface Props {
		agentId: string;
	}

	let { agentId }: Props = $props();

	let card = $state<AgentCard | null>(null);
	let isLoading = $state(true);
	let error = $state<string | null>(null);

	$effect(() => {
		loadCard();
	});

	async function loadCard() {
		isLoading = true;
		error = null;
		try {
			card = await fetchAgentCard(agentId);
		} catch (err: unknown) {
			error = err instanceof Error ? err.message : 'Failed to load agent card';
		} finally {
			isLoading = false;
		}
	}
</script>

<div>
	{#if isLoading}
		<Card>
			<CardContent class="pt-6">
				<div class="animate-pulse space-y-3">
					<div class="h-5 w-1/3 rounded bg-muted"></div>
					<div class="h-4 w-2/3 rounded bg-muted"></div>
					<div class="h-4 w-1/2 rounded bg-muted"></div>
					<div class="h-4 w-1/4 rounded bg-muted"></div>
				</div>
			</CardContent>
		</Card>
	{:else if error}
		<Card>
			<CardContent class="pt-6">
				<div class="flex flex-col items-center gap-3 py-4 text-center">
					<p class="text-sm text-muted-foreground">Agent card unavailable</p>
					<p class="text-xs text-muted-foreground">{error}</p>
					<Button variant="outline" size="sm" onclick={loadCard}>Retry</Button>
				</div>
			</CardContent>
		</Card>
	{:else if card}
		<Card>
			<CardHeader>
				<h3 class="text-lg font-semibold text-foreground">{card.name}</h3>
				{#if card.description}
					<p class="text-sm text-muted-foreground">{card.description}</p>
				{/if}
			</CardHeader>
			<CardContent>
				<div class="space-y-4">
					<!-- Metadata -->
					<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
						<div>
							<p class="text-xs font-medium text-muted-foreground">URL</p>
							<p class="break-all text-sm text-foreground">{card.url}</p>
						</div>
						<div>
							<p class="text-xs font-medium text-muted-foreground">Version</p>
							<p class="text-sm text-foreground">{card.version}</p>
						</div>
						<div>
							<p class="text-xs font-medium text-muted-foreground">Protocol Version</p>
							<p class="text-sm text-foreground">{card.protocol_version}</p>
						</div>
					</div>

					<!-- Capabilities -->
					<div>
						<p class="mb-2 text-xs font-medium text-muted-foreground">Capabilities</p>
						<div class="flex gap-2">
							<Badge
								class={card.capabilities.streaming
									? 'bg-green-600 text-white hover:bg-green-600/80'
									: ''}
								variant={card.capabilities.streaming ? 'default' : 'outline'}
							>
								Streaming: {card.capabilities.streaming ? 'Yes' : 'No'}
							</Badge>
							<Badge
								class={card.capabilities.push_notifications
									? 'bg-green-600 text-white hover:bg-green-600/80'
									: ''}
								variant={card.capabilities.push_notifications ? 'default' : 'outline'}
							>
								Push Notifications: {card.capabilities.push_notifications ? 'Yes' : 'No'}
							</Badge>
						</div>
					</div>

					<!-- Authentication -->
					<div>
						<p class="mb-2 text-xs font-medium text-muted-foreground">Authentication Schemes</p>
						{#if card.authentication.schemes.length === 0}
							<p class="text-sm text-muted-foreground">None configured</p>
						{:else}
							<div class="flex flex-wrap gap-1">
								{#each card.authentication.schemes as scheme}
									<Badge variant="secondary">{scheme}</Badge>
								{/each}
							</div>
						{/if}
					</div>

					<!-- Skills -->
					<div>
						<p class="mb-2 text-xs font-medium text-muted-foreground">Skills</p>
						{#if card.skills.length === 0}
							<p class="text-sm text-muted-foreground">No skills registered</p>
						{:else}
							<div class="overflow-x-auto">
								<table class="w-full text-sm">
									<thead>
										<tr class="border-b border-border">
											<th class="pb-2 pr-4 text-left text-xs font-medium text-muted-foreground">
												ID
											</th>
											<th class="pb-2 pr-4 text-left text-xs font-medium text-muted-foreground">
												Name
											</th>
											<th class="pb-2 text-left text-xs font-medium text-muted-foreground">
												Description
											</th>
										</tr>
									</thead>
									<tbody>
										{#each card.skills as skill (skill.id)}
											<tr class="border-b border-border last:border-0">
												<td class="py-2 pr-4 font-mono text-xs text-foreground">{skill.id}</td>
												<td class="py-2 pr-4 text-foreground">{skill.name}</td>
												<td class="py-2 text-muted-foreground">
													{skill.description ?? '\u2014'}
												</td>
											</tr>
										{/each}
									</tbody>
								</table>
							</div>
						{/if}
					</div>
				</div>
			</CardContent>
		</Card>
	{/if}
</div>
