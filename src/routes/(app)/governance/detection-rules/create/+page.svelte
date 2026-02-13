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

	const { form, errors, enhance, message } = superForm(data.form, {
		onResult({ result }) {
			if (result.type === 'redirect') {
				addToast('success', 'Detection rule created successfully');
			}
		}
	});

	let selectedType: 'no_manager' | 'terminated' | 'inactive' | 'custom' = $state('no_manager');
</script>

<PageHeader title="Create Detection Rule" description="Define a new orphan detection rule" />

<Card class="max-w-lg">
	<CardHeader>
		<h2 class="text-xl font-semibold">Rule details</h2>
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
				<Input id="name" name="name" type="text" placeholder="e.g. Inactive 60 Days" value={String($form.name ?? '')} />
				{#if $errors.name}<p class="text-sm text-destructive">{$errors.name}</p>{/if}
			</div>

			<div class="space-y-2">
				<Label for="rule_type">Rule Type</Label>
				<select
					id="rule_type"
					name="rule_type"
					class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
					bind:value={selectedType}
				>
					<option value="no_manager">No Manager</option>
					<option value="terminated">Terminated</option>
					<option value="inactive">Inactive</option>
					<option value="custom">Custom</option>
				</select>
				{#if $errors.rule_type}<p class="text-sm text-destructive">{$errors.rule_type}</p>{/if}
			</div>

			<div class="space-y-2">
				<Label for="priority">Priority</Label>
				<Input id="priority" name="priority" type="number" min="1" value={String($form.priority ?? '1')} />
				{#if $errors.priority}<p class="text-sm text-destructive">{$errors.priority}</p>{/if}
			</div>

			<div class="flex items-center gap-2">
				<input type="checkbox" id="is_enabled" name="is_enabled" checked class="h-4 w-4 rounded border-input" />
				<Label for="is_enabled">Enabled</Label>
			</div>

			<Separator class="my-4" />

			<h3 class="text-sm font-medium text-muted-foreground">Parameters</h3>

			<RuleParamsEditor
				ruleType={selectedType}
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
					placeholder="Brief description of this rule"
					value={String($form.description ?? '')}
				></textarea>
				{#if $errors.description}<p class="text-sm text-destructive">{$errors.description}</p>{/if}
			</div>

			<div class="flex gap-2 pt-2">
				<Button type="submit">Create Rule</Button>
				<a href="/governance/detection-rules" class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground">Cancel</a>
			</div>
		</form>
	</CardContent>
</Card>
