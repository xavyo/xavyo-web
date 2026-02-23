<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { updateProfileSchema } from '$lib/schemas/settings';
	import { addToast } from '$lib/stores/toast.svelte';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import type { UserProfile } from '$lib/api/types';
	import type { SuperValidated, Infer } from 'sveltekit-superforms';
	import { Mail } from 'lucide-svelte';
	import { invalidateAll } from '$app/navigation';
	import EmailChangeDialog from './email-change-dialog.svelte';

	interface Props {
		profile: UserProfile | null;
		form: SuperValidated<Infer<typeof updateProfileSchema>>;
	}

	let { profile, form: formData }: Props = $props();

	// svelte-ignore state_referenced_locally
	const { form, errors, enhance, delayed, message } = superForm(formData, {
		validators: zodClient(updateProfileSchema),
		resetForm: false,
		onUpdated({ form }) {
			if (form.valid && form.message) {
				addToast('success', form.message);
			}
		}
	});

	let showEmailChange = $state(false);

	let avatarPreviewUrl = $derived(String($form.avatar_url ?? ''));
	let avatarError = $state(false);

	function handleAvatarError() {
		avatarError = true;
	}

	function handleAvatarLoad() {
		avatarError = false;
	}
</script>

<div class="mt-4 max-w-2xl space-y-6">
	<!-- Email (read-only) -->
	<div class="rounded-lg border bg-card p-6">
		<h3 class="mb-4 text-lg font-medium">Email Address</h3>
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-3">
				<Mail class="h-5 w-5 text-muted-foreground" />
				<div>
					<p class="text-sm font-medium">{profile?.email ?? 'Unknown'}</p>
					<p class="text-xs text-muted-foreground">
						{profile?.email_verified ? 'Verified' : 'Not verified'}
					</p>
				</div>
			</div>
			<Button variant="outline" size="sm" onclick={() => (showEmailChange = true)}>Change email</Button>
		</div>
	</div>

	<!-- Profile Form -->
	<div class="rounded-lg border bg-card p-6">
		<h3 class="mb-4 text-lg font-medium">Profile Information</h3>

		{#if $message && !($message === 'Profile updated successfully')}
			<Alert variant="destructive" class="mb-4">
				<AlertDescription>{$message}</AlertDescription>
			</Alert>
		{/if}

		<form method="POST" action="?/updateProfile" use:enhance class="space-y-6">
			<div class="space-y-2">
				<Label for="display_name">Display name</Label>
				<Input
					id="display_name"
					name="display_name"
					type="text"
					placeholder="Your display name"
					bind:value={$form.display_name}
				/>
				{#if $errors.display_name}
					<p class="text-sm text-destructive">{$errors.display_name}</p>
				{/if}
			</div>

			<div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
				<div class="space-y-2">
					<Label for="first_name">First name</Label>
					<Input
						id="first_name"
						name="first_name"
						type="text"
						placeholder="First name"
						bind:value={$form.first_name}
					/>
					{#if $errors.first_name}
						<p class="text-sm text-destructive">{$errors.first_name}</p>
					{/if}
				</div>

				<div class="space-y-2">
					<Label for="last_name">Last name</Label>
					<Input
						id="last_name"
						name="last_name"
						type="text"
						placeholder="Last name"
						bind:value={$form.last_name}
					/>
					{#if $errors.last_name}
						<p class="text-sm text-destructive">{$errors.last_name}</p>
					{/if}
				</div>
			</div>

			<div class="space-y-2">
				<Label for="avatar_url">Avatar URL</Label>
				<Input
					id="avatar_url"
					name="avatar_url"
					type="url"
					placeholder="https://example.com/avatar.jpg"
					bind:value={$form.avatar_url}
				/>
				{#if $errors.avatar_url}
					<p class="text-sm text-destructive">{$errors.avatar_url}</p>
				{/if}

				{#if avatarPreviewUrl && !avatarError}
					<div class="mt-3 flex items-center gap-3">
						<img
							src={avatarPreviewUrl}
							alt="Avatar preview"
							class="h-16 w-16 rounded-full border object-cover"
							onerror={handleAvatarError}
							onload={handleAvatarLoad}
						/>
						<p class="text-xs text-muted-foreground">Avatar preview</p>
					</div>
				{/if}
			</div>

			<div class="flex items-center gap-3 pt-2">
				<Button type="submit" disabled={$delayed}>
					{#if $delayed}
						Saving...
					{:else}
						Save changes
					{/if}
				</Button>
			</div>
		</form>
	</div>

	<!-- Account Info -->
	<div class="rounded-lg border bg-card p-6">
		<h3 class="mb-4 text-lg font-medium">Account Information</h3>
		<div class="grid gap-3">
			<div class="flex justify-between">
				<span class="text-sm text-muted-foreground">User ID</span>
				<span class="text-sm font-mono">{profile?.id ?? 'N/A'}</span>
			</div>
			<div class="flex justify-between">
				<span class="text-sm text-muted-foreground">Member since</span>
				<span class="text-sm">{profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}</span>
			</div>
		</div>
	</div>
</div>

<EmailChangeDialog
	bind:open={showEmailChange}
	onOpenChange={(v) => (showEmailChange = v)}
	onEmailChanged={() => {
		invalidateAll();
	}}
/>
