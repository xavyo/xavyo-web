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
				addToast('success', 'User created successfully');
			}
		}
	});

	const availableRoles = ['admin', 'user'];

	function toggleRole(role: string) {
		const current = $form.roles ?? [];
		if (current.includes(role)) {
			$form.roles = current.filter((r: string) => r !== role);
		} else {
			$form.roles = [...current, role];
		}
	}
</script>

<PageHeader title="Create user" description="Add a new user to your organization" />

<Card class="max-w-lg">
	<CardHeader>
		<h2 class="text-xl font-semibold">User details</h2>
	</CardHeader>
	<CardContent>
		{#if $message}
			<Alert variant="destructive" class="mb-4">
				<AlertDescription>{$message}</AlertDescription>
			</Alert>
		{/if}

		<form method="POST" use:enhance class="space-y-4">
			<div class="space-y-2">
				<Label for="email">Email</Label>
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
				<Label for="password">Password</Label>
				<Input
					id="password"
					name="password"
					type="password"
					placeholder="Minimum 8 characters"
					value={String($form.password ?? '')}
				/>
				{#if $errors.password}
					<p class="text-sm text-destructive">{$errors.password}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="username">Username (optional)</Label>
				<Input
					id="username"
					name="username"
					type="text"
					placeholder="Optional username"
					value={String($form.username ?? '')}
				/>
				{#if $errors.username}
					<p class="text-sm text-destructive">{$errors.username}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label>Roles</Label>
				<div class="flex gap-4">
					{#each availableRoles as role}
						<label class="flex items-center gap-2 text-sm">
							<input
								type="checkbox"
								name="roles"
								value={role}
								checked={($form.roles ?? []).includes(role)}
								onchange={() => toggleRole(role)}
								class="h-4 w-4 rounded border-input"
							/>
							{role}
						</label>
					{/each}
				</div>
				{#if $errors.roles?._errors}
					<p class="text-sm text-destructive">{$errors.roles._errors}</p>
				{/if}
			</div>

			<div class="flex gap-2 pt-2">
				<Button type="submit">Create user</Button>
				<a
					href="/users"
					class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
				>
					Cancel
				</a>
			</div>
		</form>
	</CardContent>
</Card>
