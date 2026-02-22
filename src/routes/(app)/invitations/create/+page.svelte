<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { Card, CardHeader, CardContent } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import { addToast } from '$lib/stores/toast.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// svelte-ignore state_referenced_locally
	const { form, errors, enhance, message } = superForm(data.form, {
		onResult({ result }) {
			if (result.type === 'redirect') {
				addToast('success', 'Invitation sent successfully');
			}
		}
	});
</script>

<PageHeader title="Invite User" description="Send an invitation to join the tenant" />

<Card class="max-w-lg">
	<CardHeader>
		<h2 class="text-xl font-semibold">Invitation details</h2>
	</CardHeader>
	<CardContent>
		{#if $message}
			<Alert variant="destructive" class="mb-4">
				<AlertDescription>{$message}</AlertDescription>
			</Alert>
		{/if}

		<form method="POST" use:enhance class="space-y-4">
			<div class="space-y-2">
				<Label for="email">Email address</Label>
				<Input
					id="email"
					name="email"
					type="email"
					placeholder="user@example.com"
					value={String($form.email ?? '')}
				/>
				{#if $errors.email}
					<p class="text-sm text-destructive">{$errors.email}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="role">Role</Label>
				<select
					id="role"
					name="role"
					class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
					value={String($form.role ?? 'member')}
					onchange={(e) => { $form.role = e.currentTarget.value as 'member' | 'admin'; }}
				>
					<option value="member">Member</option>
					<option value="admin">Administrator</option>
				</select>
				{#if $errors.role}
					<p class="text-sm text-destructive">{$errors.role}</p>
				{/if}
			</div>

			<div class="flex gap-2 pt-2">
				<Button type="submit">Send Invitation</Button>
				<a
					href="/invitations"
					class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
				>
					Cancel
				</a>
			</div>
		</form>
	</CardContent>
</Card>
