<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { Card, CardHeader, CardContent } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import { Separator } from '$lib/components/ui/separator';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import { addToast } from '$lib/stores/toast.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let selectedEventTypes = $state<Set<string>>(new Set());

	const { form, errors, enhance, message } = superForm(data.form, {
		onResult({ result }) {
			if (result.type === 'redirect') {
				addToast('success', 'Webhook subscription created successfully');
			}
		}
	});

	// Group event types by category
	const eventTypesByCategory = $derived(
		data.eventTypes.reduce(
			(acc, et) => {
				const cat = et.category || 'Other';
				if (!acc[cat]) acc[cat] = [];
				acc[cat].push(et);
				return acc;
			},
			{} as Record<string, typeof data.eventTypes>
		)
	);

	function toggleEventType(eventType: string) {
		const next = new Set(selectedEventTypes);
		if (next.has(eventType)) {
			next.delete(eventType);
		} else {
			next.add(eventType);
		}
		selectedEventTypes = next;
	}

	const eventTypesValue = $derived(Array.from(selectedEventTypes).join(','));
</script>

<div class="flex items-center justify-between">
	<PageHeader
		title="Create Webhook Subscription"
		description="Subscribe to events with a webhook endpoint"
	/>
	<a
		href="/settings/webhooks"
		class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
	>
		Back to Webhooks
	</a>
</div>

<Card class="max-w-2xl">
	<CardHeader>
		<h2 class="text-xl font-semibold">Subscription details</h2>
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
					placeholder="e.g. User Events Webhook"
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
					placeholder="Brief description of this webhook subscription"
					value={String($form.description ?? '')}
				></textarea>
				{#if $errors.description}
					<p class="text-sm text-destructive">{$errors.description}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="url">Endpoint URL</Label>
				<Input
					id="url"
					name="url"
					type="url"
					placeholder="https://example.com/webhooks"
					value={String($form.url ?? '')}
				/>
				{#if $errors.url}
					<p class="text-sm text-destructive">{$errors.url}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="secret">Signing Secret (optional)</Label>
				<Input
					id="secret"
					name="secret"
					type="password"
					placeholder="Used to verify webhook signatures"
					value={String($form.secret ?? '')}
				/>
				{#if $errors.secret}
					<p class="text-sm text-destructive">{$errors.secret}</p>
				{/if}
			</div>

			<Separator class="my-4" />

			<div class="space-y-3">
				<Label>Event Types</Label>
				<p class="text-sm text-muted-foreground">
					Select the events you want to receive notifications for.
				</p>

				<!-- Hidden input to hold the comma-separated event_types value -->
				<input type="hidden" name="event_types" value={eventTypesValue} />

				{#if Object.keys(eventTypesByCategory).length === 0}
					<p class="text-sm text-muted-foreground">No event types available.</p>
				{:else}
					{#each Object.entries(eventTypesByCategory) as [category, events]}
						<div class="space-y-2">
							<h4 class="text-sm font-medium capitalize">{category}</h4>
							<div class="grid gap-2 pl-2">
								{#each events as et}
									<label class="flex items-start gap-2 text-sm">
										<input
											type="checkbox"
											class="mt-0.5 h-4 w-4 rounded border-input"
											checked={selectedEventTypes.has(et.event_type)}
											onchange={() => toggleEventType(et.event_type)}
										/>
										<div>
											<span class="font-medium">{et.event_type}</span>
											{#if et.description}
												<p class="text-xs text-muted-foreground">{et.description}</p>
											{/if}
										</div>
									</label>
								{/each}
							</div>
						</div>
					{/each}
				{/if}

				{#if $errors.event_types}
					<p class="text-sm text-destructive">{$errors.event_types}</p>
				{/if}
			</div>

			<div class="flex gap-2 pt-2">
				<Button type="submit">Create Subscription</Button>
				<a
					href="/settings/webhooks"
					class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
				>
					Cancel
				</a>
			</div>
		</form>
	</CardContent>
</Card>
