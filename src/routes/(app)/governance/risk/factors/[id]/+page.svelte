<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { enhance as formEnhance } from '$app/forms';
	import { superForm } from 'sveltekit-superforms';
	import { Card, CardHeader, CardContent } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import { Separator } from '$lib/components/ui/separator';
	import * as Dialog from '$lib/components/ui/dialog';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import { addToast } from '$lib/stores/toast.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let factor = $derived(data.factor);
	let isEditing = $state(false);
	let deleteOpen = $state(false);

	const { form, errors, enhance, message } = superForm(data.form, {
		invalidateAll: 'force',
		onResult({ result }) {
			if (result.type === 'success') {
				addToast('success', 'Risk factor updated successfully');
				isEditing = false;
			}
		}
	});
</script>

<PageHeader title={factor.name} description="Risk factor details">
	<div class="flex gap-2">
		{#if !isEditing}
			<Button variant="outline" onclick={() => (isEditing = true)}>Edit</Button>
		{/if}
		<Button variant="destructive" onclick={() => (deleteOpen = true)}>Delete</Button>
	</div>
</PageHeader>

{#if isEditing}
	<!-- Edit Mode -->
	<Card class="max-w-lg">
		<CardHeader>
			<h2 class="text-lg font-semibold text-foreground">Edit Risk Factor</h2>
		</CardHeader>
		<CardContent>
			{#if $message}
				<Alert
					variant={String($message).includes('updated') ? 'default' : 'destructive'}
					class="mb-4"
				>
					<AlertDescription>{$message}</AlertDescription>
				</Alert>
			{/if}

			<form method="POST" action="?/update" use:enhance class="space-y-4">
				<div class="space-y-2">
					<Label for="name">Name</Label>
					<Input id="name" name="name" type="text" bind:value={$form.name} />
					{#if $errors.name}<p class="text-sm text-destructive">{$errors.name}</p>{/if}
				</div>

				<div class="space-y-2">
					<Label for="category">Category</Label>
					<select
						id="category"
						name="category"
						class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
						value={String($form.category ?? 'static')}
						onchange={(e) => {
							$form.category = (e.target as HTMLSelectElement).value as 'static' | 'dynamic';
						}}
					>
						<option value="static">Static</option>
						<option value="dynamic">Dynamic</option>
					</select>
					{#if $errors.category}<p class="text-sm text-destructive">{$errors.category}</p>{/if}
				</div>

				<div class="space-y-2">
					<Label for="factor_type">Factor Type</Label>
					<Input
						id="factor_type"
						name="factor_type"
						type="text"
						bind:value={$form.factor_type}
					/>
					{#if $errors.factor_type}
						<p class="text-sm text-destructive">{$errors.factor_type}</p>
					{/if}
				</div>

				<div class="space-y-2">
					<Label for="weight">Weight (0-10)</Label>
					<Input
						id="weight"
						name="weight"
						type="number"
						min="0"
						max="10"
						step="0.1"
						bind:value={$form.weight}
					/>
					{#if $errors.weight}<p class="text-sm text-destructive">{$errors.weight}</p>{/if}
				</div>

				<div class="space-y-2">
					<Label for="description">Description</Label>
					<textarea
						id="description"
						name="description"
						class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
						bind:value={$form.description}
					></textarea>
					{#if $errors.description}
						<p class="text-sm text-destructive">{$errors.description}</p>
					{/if}
				</div>

				<div class="flex items-center gap-2">
					<input
						id="is_enabled"
						name="is_enabled"
						type="checkbox"
						class="h-4 w-4 rounded border-input"
						bind:checked={$form.is_enabled}
					/>
					<Label for="is_enabled">Enabled</Label>
				</div>

				<div class="flex gap-2 pt-2">
					<Button type="submit">Save Changes</Button>
					<Button variant="outline" type="button" onclick={() => (isEditing = false)}>
						Cancel
					</Button>
				</div>
			</form>
		</CardContent>
	</Card>
{:else}
	<!-- View Mode -->
	<div class="grid gap-6 lg:grid-cols-2">
		<Card>
			<CardHeader>
				<h2 class="text-lg font-semibold text-foreground">Factor Information</h2>
			</CardHeader>
			<CardContent>
				<div class="grid gap-4 sm:grid-cols-2">
					<div>
						<p class="text-sm text-muted-foreground">Name</p>
						<p class="font-medium text-foreground">{factor.name}</p>
					</div>
					<div>
						<p class="text-sm text-muted-foreground">Category</p>
						<span
							class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {factor.category ===
							'static'
								? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
								: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'}"
						>
							{factor.category}
						</span>
					</div>
					<div>
						<p class="text-sm text-muted-foreground">Factor Type</p>
						<p class="font-medium text-foreground">{factor.factor_type}</p>
					</div>
					<div>
						<p class="text-sm text-muted-foreground">Weight</p>
						<p class="font-medium text-foreground">{factor.weight}</p>
					</div>
					<div>
						<p class="text-sm text-muted-foreground">Status</p>
						<span
							class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {factor.is_enabled
								? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
								: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'}"
						>
							{factor.is_enabled ? 'Enabled' : 'Disabled'}
						</span>
					</div>
					{#if factor.description}
						<div class="sm:col-span-2">
							<p class="text-sm text-muted-foreground">Description</p>
							<p class="text-sm text-foreground">{factor.description}</p>
						</div>
					{/if}
				</div>

				<Separator class="my-4" />

				<div class="grid gap-4 sm:grid-cols-2">
					<div>
						<p class="text-sm text-muted-foreground">Created</p>
						<p class="text-sm text-foreground">
							{new Date(factor.created_at).toLocaleDateString()}
						</p>
					</div>
					<div>
						<p class="text-sm text-muted-foreground">Updated</p>
						<p class="text-sm text-foreground">
							{new Date(factor.updated_at).toLocaleDateString()}
						</p>
					</div>
				</div>
			</CardContent>
		</Card>

		<!-- Danger Zone -->
		<Card>
			<CardHeader>
				<h2 class="text-lg font-semibold text-destructive">Danger Zone</h2>
			</CardHeader>
			<CardContent>
				<p class="text-sm text-muted-foreground">
					Deleting a risk factor is permanent and may affect existing risk score calculations.
				</p>
				<Button variant="destructive" size="sm" class="mt-4" onclick={() => (deleteOpen = true)}>
					Delete Factor
				</Button>
			</CardContent>
		</Card>
	</div>
{/if}

<div class="mt-4">
	<a
		href="/governance/risk/factors"
		class="text-sm text-muted-foreground hover:text-foreground hover:underline"
	>
		&larr; Back to Risk Factors
	</a>
</div>

<!-- Delete Dialog -->
<Dialog.Root bind:open={deleteOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Delete Risk Factor</Dialog.Title>
			<Dialog.Description>Delete "{factor.name}"? This cannot be undone.</Dialog.Description>
		</Dialog.Header>
		<form
			method="POST"
			action="?/delete"
			use:formEnhance={() => {
				deleteOpen = false;
				return async ({ result, update }) => {
					if (result.type === 'redirect') {
						addToast('success', 'Risk factor deleted');
					}
					await update();
				};
			}}
		>
			<Dialog.Footer>
				<Button variant="outline" type="button" onclick={() => (deleteOpen = false)}>
					Cancel
				</Button>
				<Button variant="destructive" type="submit">Delete</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
