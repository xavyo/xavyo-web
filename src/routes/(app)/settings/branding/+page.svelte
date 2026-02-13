<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { updateBrandingSchema } from '$lib/schemas/branding';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import { addToast } from '$lib/stores/toast.svelte';
	import { ArrowLeft } from 'lucide-svelte';

	let { data } = $props();

	const { form, errors, enhance, message, delayed } = superForm(data.form, {
		validators: zodClient(updateBrandingSchema),
		onUpdated({ form }) {
			if (form.valid && form.message) {
				addToast('success', form.message);
			}
		}
	});

	const inputClass =
		'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

	function handleInput(field: keyof typeof $form) {
		return (e: Event) => {
			const target = e.target as HTMLInputElement | HTMLTextAreaElement;
			($form as Record<string, unknown>)[field] = target.value;
		};
	}
</script>

<div class="mb-4">
	<a href="/settings" class="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
		<ArrowLeft class="h-4 w-4" />
		Back to Settings
	</a>
</div>

<PageHeader title="Tenant Branding" description="Customize the look and feel of your tenant's login pages, emails, and UI." />

<div class="max-w-3xl">
	{#if $message && !($message === 'Branding updated successfully')}
		<Alert variant="destructive" class="mb-6">
			<AlertDescription>{$message}</AlertDescription>
		</Alert>
	{/if}

	<form method="POST" use:enhance class="space-y-8">
		<!-- Logos -->
		<div class="rounded-lg border bg-card p-6">
			<h3 class="mb-4 text-lg font-medium">Logos</h3>
			<div class="space-y-4">
				<div class="space-y-2">
					<Label for="logo_url">Logo URL</Label>
					<input
						id="logo_url"
						name="logo_url"
						type="text"
						placeholder="https://example.com/logo.png"
						value={String($form.logo_url ?? '')}
						oninput={handleInput('logo_url')}
						class={inputClass}
					/>
					{#if $errors.logo_url}
						<p class="text-sm text-destructive">{$errors.logo_url}</p>
					{/if}
				</div>

				<div class="space-y-2">
					<Label for="logo_dark_url">Logo URL (Dark Mode)</Label>
					<input
						id="logo_dark_url"
						name="logo_dark_url"
						type="text"
						placeholder="https://example.com/logo-dark.png"
						value={String($form.logo_dark_url ?? '')}
						oninput={handleInput('logo_dark_url')}
						class={inputClass}
					/>
					{#if $errors.logo_dark_url}
						<p class="text-sm text-destructive">{$errors.logo_dark_url}</p>
					{/if}
				</div>

				<div class="space-y-2">
					<Label for="favicon_url">Favicon URL</Label>
					<input
						id="favicon_url"
						name="favicon_url"
						type="text"
						placeholder="https://example.com/favicon.ico"
						value={String($form.favicon_url ?? '')}
						oninput={handleInput('favicon_url')}
						class={inputClass}
					/>
					{#if $errors.favicon_url}
						<p class="text-sm text-destructive">{$errors.favicon_url}</p>
					{/if}
				</div>

				<div class="space-y-2">
					<Label for="email_logo_url">Email Logo URL</Label>
					<input
						id="email_logo_url"
						name="email_logo_url"
						type="text"
						placeholder="https://example.com/email-logo.png"
						value={String($form.email_logo_url ?? '')}
						oninput={handleInput('email_logo_url')}
						class={inputClass}
					/>
					{#if $errors.email_logo_url}
						<p class="text-sm text-destructive">{$errors.email_logo_url}</p>
					{/if}
				</div>
			</div>
		</div>

		<!-- Colors -->
		<div class="rounded-lg border bg-card p-6">
			<h3 class="mb-4 text-lg font-medium">Colors</h3>
			<p class="mb-4 text-sm text-muted-foreground">Use hex color format (e.g., #FF0000)</p>
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<div class="space-y-2">
					<Label for="primary_color">Primary Color</Label>
					<input
						id="primary_color"
						name="primary_color"
						type="text"
						placeholder="#3B82F6"
						value={String($form.primary_color ?? '')}
						oninput={handleInput('primary_color')}
						class={inputClass}
					/>
					{#if $errors.primary_color}
						<p class="text-sm text-destructive">{$errors.primary_color}</p>
					{/if}
				</div>

				<div class="space-y-2">
					<Label for="secondary_color">Secondary Color</Label>
					<input
						id="secondary_color"
						name="secondary_color"
						type="text"
						placeholder="#6B7280"
						value={String($form.secondary_color ?? '')}
						oninput={handleInput('secondary_color')}
						class={inputClass}
					/>
					{#if $errors.secondary_color}
						<p class="text-sm text-destructive">{$errors.secondary_color}</p>
					{/if}
				</div>

				<div class="space-y-2">
					<Label for="accent_color">Accent Color</Label>
					<input
						id="accent_color"
						name="accent_color"
						type="text"
						placeholder="#8B5CF6"
						value={String($form.accent_color ?? '')}
						oninput={handleInput('accent_color')}
						class={inputClass}
					/>
					{#if $errors.accent_color}
						<p class="text-sm text-destructive">{$errors.accent_color}</p>
					{/if}
				</div>

				<div class="space-y-2">
					<Label for="background_color">Background Color</Label>
					<input
						id="background_color"
						name="background_color"
						type="text"
						placeholder="#FFFFFF"
						value={String($form.background_color ?? '')}
						oninput={handleInput('background_color')}
						class={inputClass}
					/>
					{#if $errors.background_color}
						<p class="text-sm text-destructive">{$errors.background_color}</p>
					{/if}
				</div>

				<div class="space-y-2">
					<Label for="text_color">Text Color</Label>
					<input
						id="text_color"
						name="text_color"
						type="text"
						placeholder="#111827"
						value={String($form.text_color ?? '')}
						oninput={handleInput('text_color')}
						class={inputClass}
					/>
					{#if $errors.text_color}
						<p class="text-sm text-destructive">{$errors.text_color}</p>
					{/if}
				</div>
			</div>
		</div>

		<!-- Typography -->
		<div class="rounded-lg border bg-card p-6">
			<h3 class="mb-4 text-lg font-medium">Typography</h3>
			<div class="space-y-2">
				<Label for="font_family">Font Family</Label>
				<input
					id="font_family"
					name="font_family"
					type="text"
					placeholder="Inter, system-ui, sans-serif"
					value={String($form.font_family ?? '')}
					oninput={handleInput('font_family')}
					class={inputClass}
				/>
				{#if $errors.font_family}
					<p class="text-sm text-destructive">{$errors.font_family}</p>
				{/if}
			</div>
		</div>

		<!-- Login Page -->
		<div class="rounded-lg border bg-card p-6">
			<h3 class="mb-4 text-lg font-medium">Login Page</h3>
			<div class="space-y-4">
				<div class="space-y-2">
					<Label for="login_page_title">Login Page Title</Label>
					<input
						id="login_page_title"
						name="login_page_title"
						type="text"
						placeholder="Welcome back"
						value={String($form.login_page_title ?? '')}
						oninput={handleInput('login_page_title')}
						class={inputClass}
					/>
					{#if $errors.login_page_title}
						<p class="text-sm text-destructive">{$errors.login_page_title}</p>
					{/if}
				</div>

				<div class="space-y-2">
					<Label for="login_page_subtitle">Login Page Subtitle</Label>
					<input
						id="login_page_subtitle"
						name="login_page_subtitle"
						type="text"
						placeholder="Sign in to your account"
						value={String($form.login_page_subtitle ?? '')}
						oninput={handleInput('login_page_subtitle')}
						class={inputClass}
					/>
					{#if $errors.login_page_subtitle}
						<p class="text-sm text-destructive">{$errors.login_page_subtitle}</p>
					{/if}
				</div>

				<div class="space-y-2">
					<Label for="login_page_background_url">Login Page Background URL</Label>
					<input
						id="login_page_background_url"
						name="login_page_background_url"
						type="text"
						placeholder="https://example.com/background.jpg"
						value={String($form.login_page_background_url ?? '')}
						oninput={handleInput('login_page_background_url')}
						class={inputClass}
					/>
					{#if $errors.login_page_background_url}
						<p class="text-sm text-destructive">{$errors.login_page_background_url}</p>
					{/if}
				</div>
			</div>
		</div>

		<!-- Legal -->
		<div class="rounded-lg border bg-card p-6">
			<h3 class="mb-4 text-lg font-medium">Legal</h3>
			<div class="space-y-4">
				<div class="space-y-2">
					<Label for="privacy_policy_url">Privacy Policy URL</Label>
					<input
						id="privacy_policy_url"
						name="privacy_policy_url"
						type="text"
						placeholder="https://example.com/privacy"
						value={String($form.privacy_policy_url ?? '')}
						oninput={handleInput('privacy_policy_url')}
						class={inputClass}
					/>
					{#if $errors.privacy_policy_url}
						<p class="text-sm text-destructive">{$errors.privacy_policy_url}</p>
					{/if}
				</div>

				<div class="space-y-2">
					<Label for="terms_of_service_url">Terms of Service URL</Label>
					<input
						id="terms_of_service_url"
						name="terms_of_service_url"
						type="text"
						placeholder="https://example.com/terms"
						value={String($form.terms_of_service_url ?? '')}
						oninput={handleInput('terms_of_service_url')}
						class={inputClass}
					/>
					{#if $errors.terms_of_service_url}
						<p class="text-sm text-destructive">{$errors.terms_of_service_url}</p>
					{/if}
				</div>

				<div class="space-y-2">
					<Label for="support_url">Support URL</Label>
					<input
						id="support_url"
						name="support_url"
						type="text"
						placeholder="https://example.com/support"
						value={String($form.support_url ?? '')}
						oninput={handleInput('support_url')}
						class={inputClass}
					/>
					{#if $errors.support_url}
						<p class="text-sm text-destructive">{$errors.support_url}</p>
					{/if}
				</div>
			</div>
		</div>

		<!-- Advanced -->
		<div class="rounded-lg border bg-card p-6">
			<h3 class="mb-4 text-lg font-medium">Advanced</h3>
			<div class="space-y-4">
				<div class="space-y-2">
					<Label for="custom_css">Custom CSS</Label>
					<textarea
						id="custom_css"
						name="custom_css"
						placeholder="/* Add custom CSS rules here */"
						rows="6"
						value={String($form.custom_css ?? '')}
						oninput={handleInput('custom_css')}
						class="{inputClass} h-auto resize-y"
					></textarea>
					{#if $errors.custom_css}
						<p class="text-sm text-destructive">{$errors.custom_css}</p>
					{/if}
					<p class="text-xs text-muted-foreground">Maximum 10,240 characters. Applied to login and public pages.</p>
				</div>

				<div class="space-y-2">
					<Label for="footer_text">Footer Text</Label>
					<input
						id="footer_text"
						name="footer_text"
						type="text"
						placeholder="© 2026 Your Company. All rights reserved."
						value={String($form.footer_text ?? '')}
						oninput={handleInput('footer_text')}
						class={inputClass}
					/>
					{#if $errors.footer_text}
						<p class="text-sm text-destructive">{$errors.footer_text}</p>
					{/if}
				</div>
			</div>
		</div>

		<!-- Submit -->
		<div class="flex items-center gap-3 pb-8">
			<Button type="submit" disabled={$delayed}>
				{#if $delayed}
					Saving...
				{:else}
					Save Branding
				{/if}
			</Button>
		</div>
	</form>
</div>
