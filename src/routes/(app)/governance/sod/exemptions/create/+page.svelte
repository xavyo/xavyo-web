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

	const { form, errors, enhance, message } = superForm(data.form, {
		onResult({ result }) {
			if (result.type === 'redirect') addToast('success', 'Exemption created successfully');
		}
	});
</script>

<PageHeader title="Create SoD Exemption" description="Grant a temporary exception to a Separation of Duties rule" />

<Card class="max-w-lg">
	<CardHeader><h2 class="text-xl font-semibold">Exemption details</h2></CardHeader>
	<CardContent>
		{#if $message}
			<Alert variant="destructive" class="mb-4"><AlertDescription>{$message}</AlertDescription></Alert>
		{/if}
		<form method="POST" use:enhance class="space-y-4">
			<div class="space-y-2">
				<Label for="rule_id">SoD Rule</Label>
				<select id="rule_id" name="rule_id" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" value={String($form.rule_id ?? '')}>
					<option value="">Select rule</option>
					{#each data.rules as rule}
						<option value={rule.id}>{rule.name}</option>
					{/each}
				</select>
				{#if $errors.rule_id}<p class="text-sm text-destructive">{$errors.rule_id}</p>{/if}
			</div>

			<div class="space-y-2">
				<Label for="user_id">User ID</Label>
				<Input id="user_id" name="user_id" type="text" placeholder="UUID of user" value={String($form.user_id ?? '')} />
				{#if $errors.user_id}<p class="text-sm text-destructive">{$errors.user_id}</p>{/if}
			</div>

			<Separator class="my-4" />

			<div class="space-y-2">
				<Label for="justification">Justification</Label>
				<textarea id="justification" name="justification" class="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" placeholder="Explain why this exemption is needed (min 10 characters)" value={String($form.justification ?? '')}></textarea>
				{#if $errors.justification}<p class="text-sm text-destructive">{$errors.justification}</p>{/if}
			</div>

			<div class="space-y-2">
				<Label for="expires_at">Expiry Date (optional)</Label>
				<Input id="expires_at" name="expires_at" type="date" value={String($form.expires_at ?? '')} />
				{#if $errors.expires_at}<p class="text-sm text-destructive">{$errors.expires_at}</p>{/if}
			</div>

			<div class="flex gap-2 pt-2">
				<Button type="submit">Create exemption</Button>
				<a href="/governance" class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground">Cancel</a>
			</div>
		</form>
	</CardContent>
</Card>
