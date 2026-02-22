<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { Card, CardHeader, CardContent } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import { Separator } from '$lib/components/ui/separator';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import RuleParamsEditor from '$lib/components/detection-rules/rule-params-editor.svelte';
	import { addToast } from '$lib/stores/toast.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// svelte-ignore state_referenced_locally
	const { form, errors, enhance, message } = superForm(data.form, {
		onResult({ result }) {
			if (result.type === 'redirect') {
				addToast('success', 'Detection rule updated successfully');
			}
		}
	});
</script>

<PageHeader title="Edit Detection Rule" description="Update detection rule settings" />

<Card class="max-w-lg">
	<CardHeader>
		<h2 class="text-xl font-semibold">Edit: {data.rule.name}</h2>
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
				<Input id="name" name="name" type="text" value={String($form.name ?? '')} />
				{#if $errors.name}<p class="text-sm text-destructive">{$errors.name}</p>{/if}
			</div>

			<div class="space-y-2">
				<Label for="priority">Priority</Label>
				<Input id="priority" name="priority" type="number" min="1" value={String($form.priority ?? '')} />
				{#if $errors.priority}<p class="text-sm text-destructive">{$errors.priority}</p>{/if}
			</div>

			<div class="flex items-center gap-2">
				<input type="checkbox" id="is_enabled" name="is_enabled" checked={$form.is_enabled} class="h-4 w-4 rounded border-input" />
				<Label for="is_enabled">Enabled</Label>
			</div>

			<Separator class="my-4" />

			<h3 class="text-sm font-medium text-muted-foreground">Parameters ({data.rule.rule_type})</h3>

			<RuleParamsEditor
				ruleType={data.rule.rule_type}
				daysThreshold={$form.days_threshold ?? 90}
				expression={$form.expression ?? ''}
				nameAttr={true}
			/>

			<Separator class="my-4" />

			<div class="space-y-2">
				<Label for="description">Description (optional)</Label>
				<textarea
					id="description"
					name="description"
					class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
					value={String($form.description ?? '')}
				></textarea>
				{#if $errors.description}<p class="text-sm text-destructive">{$errors.description}</p>{/if}
			</div>

			<div class="flex gap-2 pt-2">
				<Button type="submit">Save Changes</Button>
				<a href="/governance/detection-rules/{data.rule.id}" class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground">Cancel</a>
			</div>
		</form>
	</CardContent>
</Card>
