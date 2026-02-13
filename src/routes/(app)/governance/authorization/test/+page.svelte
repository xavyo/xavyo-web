<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { Card, CardHeader, CardContent } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import { Badge } from '$lib/components/ui/badge';
	import { Separator } from '$lib/components/ui/separator';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import { addToast } from '$lib/stores/toast.svelte';
	import { page } from '$app/stores';
	import type { PageData } from './$types';
	import type { AuthorizationDecision } from '$lib/api/types';

	let { data }: { data: PageData } = $props();

	let result = $derived(($page.form?.result as AuthorizationDecision | null) ?? data.result);

	const { form, errors, enhance, message } = superForm(data.form, {
		onResult({ result: formResult }) {
			if (formResult.type === 'success') {
				addToast('success', 'Authorization check completed');
			}
		}
	});
</script>

<PageHeader
	title="Authorization Test Tool"
	description="Test authorization decisions for users against resources and actions"
/>

<!-- Navigation Tabs -->
<div class="mb-6 flex gap-4 border-b">
	<a
		href="/governance/authorization"
		class="border-b-2 border-transparent px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
		>Policies</a
	>
	<a
		href="/governance/authorization/mappings"
		class="border-b-2 border-transparent px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
		>Mappings</a
	>
	<a
		href="/governance/authorization/test"
		class="border-b-2 border-primary px-3 py-2 text-sm font-medium text-foreground">Test</a
	>
</div>

<div class="grid gap-6 lg:grid-cols-2">
	<!-- Check Form -->
	<Card>
		<CardHeader>
			<h2 class="text-xl font-semibold">Check Authorization</h2>
		</CardHeader>
		<CardContent>
			{#if $message}
				<Alert variant="destructive" class="mb-4">
					<AlertDescription>{$message}</AlertDescription>
				</Alert>
			{/if}

			<form method="POST" use:enhance class="space-y-4">
				<div class="space-y-2">
					<Label for="user_id">User ID</Label>
					<Input
						id="user_id"
						name="user_id"
						type="text"
						placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
						value={String($form.user_id ?? '')}
					/>
					{#if $errors.user_id}
						<p class="text-sm text-destructive">{$errors.user_id}</p>
					{/if}
				</div>

				<div class="space-y-2">
					<Label for="resource_type">Resource Type</Label>
					<Input
						id="resource_type"
						name="resource_type"
						type="text"
						placeholder="e.g. document, project, report"
						value={String($form.resource_type ?? '')}
					/>
					{#if $errors.resource_type}
						<p class="text-sm text-destructive">{$errors.resource_type}</p>
					{/if}
				</div>

				<div class="space-y-2">
					<Label for="action">Action</Label>
					<Input
						id="action"
						name="action"
						type="text"
						placeholder="e.g. read, write, delete"
						value={String($form.action ?? '')}
					/>
					{#if $errors.action}
						<p class="text-sm text-destructive">{$errors.action}</p>
					{/if}
				</div>

				<div class="space-y-2">
					<Label for="resource_id">Resource ID (optional)</Label>
					<Input
						id="resource_id"
						name="resource_id"
						type="text"
						placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
						value={String($form.resource_id ?? '')}
					/>
					{#if $errors.resource_id}
						<p class="text-sm text-destructive">{$errors.resource_id}</p>
					{/if}
				</div>

				<div class="pt-2">
					<Button type="submit">Check Authorization</Button>
				</div>
			</form>
		</CardContent>
	</Card>

	<!-- Result Card -->
	<Card>
		<CardHeader>
			<h2 class="text-xl font-semibold">Result</h2>
		</CardHeader>
		<CardContent>
			{#if result}
				<div class="space-y-4">
					<!-- Decision -->
					<div class="flex items-center gap-3">
						<span class="text-sm font-medium text-muted-foreground">Decision:</span>
						{#if result.allowed}
							<Badge class="bg-green-600 text-white hover:bg-green-600/80">Allowed</Badge>
						{:else}
							<Badge variant="destructive">Denied</Badge>
						{/if}
					</div>

					<Separator />

					<!-- Reason -->
					<div class="space-y-1">
						<span class="text-sm font-medium text-muted-foreground">Reason</span>
						<p class="text-sm">{result.reason}</p>
					</div>

					<Separator />

					<!-- Source -->
					<div class="flex items-center gap-3">
						<span class="text-sm font-medium text-muted-foreground">Source:</span>
						{#if result.source === 'policy'}
							<Badge variant="default">Policy</Badge>
						{:else if result.source === 'entitlement'}
							<Badge variant="secondary">Entitlement</Badge>
						{:else}
							<Badge variant="outline">Default Deny</Badge>
						{/if}
					</div>

					<Separator />

					<!-- Policy ID -->
					<div class="space-y-1">
						<span class="text-sm font-medium text-muted-foreground">Policy ID</span>
						{#if result.policy_id}
							<p>
								<a
									href="/governance/authorization/{result.policy_id}"
									class="text-sm text-primary underline underline-offset-4 hover:text-primary/80"
								>
									{result.policy_id}
								</a>
							</p>
						{:else}
							<p class="text-sm text-muted-foreground">N/A</p>
						{/if}
					</div>

					<Separator />

					<!-- Decision ID -->
					<div class="space-y-1">
						<span class="text-sm font-medium text-muted-foreground">Decision ID</span>
						<p class="font-mono text-sm">{result.decision_id}</p>
					</div>
				</div>
			{:else}
				<div class="flex min-h-[200px] flex-col items-center justify-center text-center">
					<p class="text-sm text-muted-foreground">
						Fill in the form and click "Check Authorization" to test an authorization decision.
					</p>
				</div>
			{/if}
		</CardContent>
	</Card>
</div>
