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
	import type { ExplainNhiResponse, ExplainStep } from '$lib/api/types';

	let { data }: { data: PageData } = $props();

	let result = $derived(($page.form?.result as ExplainNhiResponse | null) ?? data.result);

	const { form, errors, enhance, message } = superForm(data.form, {
		onResult({ result: formResult }) {
			if (formResult.type === 'success') {
				addToast('success', 'NHI authorization explain completed');
			}
		}
	});

	const decisiveSteps: ExplainStep[] = [
		'nhi_identity',
		'lifecycle_state',
		'risk_score',
		'pdp_evaluation'
	];

	function isDecisive(step: ExplainStep): boolean {
		return decisiveSteps.includes(step);
	}

	function stepBadgeClasses(pass: boolean, step: ExplainStep): string {
		if (pass) {
			return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
		}
		if (isDecisive(step)) {
			return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
		}
		return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
	}

	function formatStepName(step: ExplainStep): string {
		return step
			.split('_')
			.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
			.join(' ');
	}
</script>

<PageHeader
	title="Explain NHI Authorization"
	description="Explain authorization decisions for non-human identities step by step"
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
		class="border-b-2 border-transparent px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
		>Test</a
	>
	<a
		href="/governance/authorization/explain"
		class="border-b-2 border-primary px-3 py-2 text-sm font-medium text-foreground"
		>Explain NHI</a
	>
</div>

<div class="grid gap-6 lg:grid-cols-2">
	<!-- Explain Form -->
	<Card>
		<CardHeader>
			<h2 class="text-xl font-semibold">Explain NHI Authorization</h2>
		</CardHeader>
		<CardContent>
			{#if $message}
				<Alert variant="destructive" class="mb-4">
					<AlertDescription>{$message}</AlertDescription>
				</Alert>
			{/if}

			<form method="POST" use:enhance class="space-y-4">
				<div class="space-y-2">
					<Label for="nhi_id">NHI ID</Label>
					<Input
						id="nhi_id"
						name="nhi_id"
						type="text"
						placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
						value={String($form.nhi_id ?? '')}
					/>
					{#if $errors.nhi_id}
						<p class="text-sm text-destructive">{$errors.nhi_id}</p>
					{/if}
				</div>

				<div class="space-y-2">
					<Label for="action">Action</Label>
					<Input
						id="action"
						name="action"
						type="text"
						placeholder="e.g. create, read, write, delete"
						value={String($form.action ?? 'create')}
					/>
					{#if $errors.action}
						<p class="text-sm text-destructive">{$errors.action}</p>
					{/if}
				</div>

				<div class="space-y-2">
					<Label for="resource_type">Resource Type</Label>
					<Input
						id="resource_type"
						name="resource_type"
						type="text"
						placeholder="e.g. mcp, api, service"
						value={String($form.resource_type ?? 'mcp')}
					/>
					{#if $errors.resource_type}
						<p class="text-sm text-destructive">{$errors.resource_type}</p>
					{/if}
				</div>

				<div class="pt-2">
					<Button type="submit">Explain Authorization</Button>
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
						{#if result.would_allow}
							<Badge class="bg-green-600 text-white hover:bg-green-600/80">Allowed</Badge>
						{:else}
							<Badge variant="destructive">Denied</Badge>
						{/if}
					</div>

					<Separator />

					<!-- NHI ID -->
					<div class="space-y-1">
						<span class="text-sm font-medium text-muted-foreground">NHI ID</span>
						<p class="font-mono text-sm">{result.nhi_id}</p>
					</div>

					<Separator />

					<!-- Check Steps Table -->
					<div class="space-y-2">
						<span class="text-sm font-medium text-muted-foreground">Check Steps</span>
						<div class="rounded-md border">
							<table class="w-full text-sm">
								<thead>
									<tr class="border-b bg-muted/50">
										<th class="px-4 py-2 text-left font-medium text-muted-foreground"
											>Step</th
										>
										<th class="px-4 py-2 text-left font-medium text-muted-foreground"
											>Status</th
										>
										<th class="px-4 py-2 text-left font-medium text-muted-foreground"
											>Detail</th
										>
										<th class="px-4 py-2 text-left font-medium text-muted-foreground"
											>Type</th
										>
									</tr>
								</thead>
								<tbody>
									{#each result.checks as check}
										<tr class="border-b transition-colors hover:bg-muted/50">
											<td class="px-4 py-2 font-medium">
												{formatStepName(check.step)}
											</td>
											<td class="px-4 py-2">
												<span
													class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {stepBadgeClasses(check.pass, check.step)}"
												>
													{check.pass ? 'Pass' : 'Fail'}
												</span>
											</td>
											<td class="px-4 py-2 text-muted-foreground">
												{check.detail}
											</td>
											<td class="px-4 py-2">
												{#if isDecisive(check.step)}
													<Badge variant="default">Decisive</Badge>
												{:else}
													<Badge variant="outline">Informational</Badge>
												{/if}
											</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					</div>
				</div>
			{:else}
				<div class="flex min-h-[200px] flex-col items-center justify-center text-center">
					<p class="text-sm text-muted-foreground">
						Fill in the form and click "Explain Authorization" to see step-by-step authorization
						analysis for a non-human identity.
					</p>
				</div>
			{/if}
		</CardContent>
	</Card>
</div>
