<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { enhance } from '$app/forms';
	import { superForm } from 'sveltekit-superforms';
	import { Card, CardHeader, CardContent } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Separator } from '$lib/components/ui/separator';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import { EmptyState } from '$lib/components/ui/empty-state';
	import { addToast } from '$lib/stores/toast.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let configureOpen = $state(false);
	let removeOpen = $state(false);
	let removeAppId = $state('');
	let removeAppName = $state('');

	const { form, errors, enhance: formEnhance, message } = superForm(data.form, {
		onResult({ result }) {
			if (result.type === 'success') {
				addToast('success', 'Application configured successfully');
				configureOpen = false;
				invalidateAll();
			}
		}
	});

	function openRemoveDialog(id: string, name: string) {
		removeAppId = id;
		removeAppName = name;
		removeOpen = true;
	}

	function handleRemoveResult(result: any) {
		if (result.type === 'success' && result.data?.success) {
			addToast('success', 'Configuration removed');
			removeOpen = false;
			invalidateAll();
		} else if (result.type === 'failure') {
			addToast('error', result.data?.error ?? 'Failed to remove');
		}
	}
</script>

<PageHeader title="Semi-Manual Applications" description="Configure which applications require manual provisioning">
	<Button onclick={() => (configureOpen = true)}>Configure Application</Button>
</PageHeader>

{#if data.applications.items.length === 0}
	<EmptyState
		title="No semi-manual applications"
		description="No applications are configured for semi-manual provisioning."
	/>
{:else}
	<div class="overflow-x-auto rounded-lg border border-border">
		<table class="w-full text-sm">
			<thead class="border-b border-border bg-muted/50">
				<tr>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Application</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Requires Approval</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Updated</th>
					<th class="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
				</tr>
			</thead>
			<tbody>
				{#each data.applications.items as app}
					<tr class="border-b border-border hover:bg-muted/30">
						<td class="px-4 py-3">
							<div>
								<p class="font-medium text-foreground">{app.name}</p>
								{#if app.description}
									<p class="text-xs text-muted-foreground">{app.description}</p>
								{/if}
							</div>
						</td>
						<td class="px-4 py-3">
							<span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {app.is_semi_manual ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'}">
								{app.is_semi_manual ? 'Semi-Manual' : 'Automatic'}
							</span>
						</td>
						<td class="px-4 py-3 text-foreground">{app.requires_approval_before_ticket ? 'Yes' : 'No'}</td>
						<td class="px-4 py-3 text-muted-foreground">{new Date(app.updated_at).toLocaleDateString()}</td>
						<td class="px-4 py-3 text-right">
							<Button variant="destructive" size="sm" onclick={() => openRemoveDialog(app.id, app.name)}>
								Remove
							</Button>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}

<!-- Configure Dialog -->
<Dialog.Root bind:open={configureOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Configure Semi-Manual Application</Dialog.Title>
			<Dialog.Description>Set up an application for semi-manual provisioning.</Dialog.Description>
		</Dialog.Header>
		<form method="POST" action="?/configure" use:formEnhance class="space-y-4 py-4">
			<div class="space-y-2">
				<Label for="application_id">Application ID</Label>
				<Input id="application_id" name="application_id" type="text" placeholder="UUID of the application" />
			</div>

			<div class="flex items-center gap-2">
				<input
					type="checkbox"
					id="is_semi_manual"
					name="is_semi_manual"
					checked={$form.is_semi_manual}
					class="h-4 w-4 rounded border-input"
				/>
				<Label for="is_semi_manual">Enable semi-manual provisioning</Label>
			</div>

			<div class="space-y-2">
				<Label for="ticketing_config_id">Ticketing Config ID (optional)</Label>
				<Input
					id="ticketing_config_id"
					name="ticketing_config_id"
					type="text"
					placeholder="UUID (optional)"
					value={String($form.ticketing_config_id ?? '')}
				/>
			</div>

			<div class="space-y-2">
				<Label for="sla_policy_id">SLA Policy ID (optional)</Label>
				<Input
					id="sla_policy_id"
					name="sla_policy_id"
					type="text"
					placeholder="UUID (optional)"
					value={String($form.sla_policy_id ?? '')}
				/>
			</div>

			<div class="flex items-center gap-2">
				<input
					type="checkbox"
					id="requires_approval_before_ticket"
					name="requires_approval_before_ticket"
					checked={$form.requires_approval_before_ticket}
					class="h-4 w-4 rounded border-input"
				/>
				<Label for="requires_approval_before_ticket">Require approval before creating ticket</Label>
			</div>

			{#if $message}
				<p class="text-sm text-destructive">{$message}</p>
			{/if}

			<Dialog.Footer>
				<Button variant="outline" type="button" onclick={() => (configureOpen = false)}>Cancel</Button>
				<Button type="submit">Save Configuration</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

<!-- Remove Confirmation Dialog -->
<Dialog.Root bind:open={removeOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Remove Configuration</Dialog.Title>
			<Dialog.Description>Remove semi-manual configuration for "{removeAppName}"?</Dialog.Description>
		</Dialog.Header>
		<form method="POST" action="?/remove" use:enhance={() => {
			removeOpen = false;
			return ({ result }) => handleRemoveResult(result);
		}}>
			<input type="hidden" name="application_id" value={removeAppId} />
			<Dialog.Footer>
				<Button variant="outline" type="button" onclick={() => (removeOpen = false)}>Cancel</Button>
				<Button variant="destructive" type="submit">Remove</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
