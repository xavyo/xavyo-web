<script lang="ts">
	import { onMount } from 'svelte';
	import type { Snippet } from 'svelte';
	import { ThemeToggle } from '$lib/components/ui/theme-toggle';
	import { initThemeListener } from '$lib/stores/theme.svelte';
	import type { LayoutData } from './$types';

	interface Props {
		data: LayoutData;
		children: Snippet;
	}

	let { data, children }: Props = $props();

	const b = $derived(data.branding);

	/**
	 * Returns true if the hex color is light (luminance > 0.5),
	 * meaning it needs dark foreground text for contrast.
	 */
	function isLightColor(hex: string): boolean {
		const h = hex.replace('#', '');
		const full = h.length === 3
			? h[0] + h[0] + h[1] + h[1] + h[2] + h[2]
			: h;
		const r = parseInt(full.slice(0, 2), 16);
		const g = parseInt(full.slice(2, 4), 16);
		const b = parseInt(full.slice(4, 6), 16);
		return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.5;
	}

	const primaryFg = $derived(
		b?.primary_color
			? isLightColor(b.primary_color)
				? 'oklch(0.145 0.005 270)'
				: 'oklch(0.985 0 0)'
			: undefined
	);

	const primaryDark = $derived(
		b?.primary_color
			? `color-mix(in oklch, ${b.primary_color} 80%, white)`
			: undefined
	);

	onMount(() => {
		const cleanup = initThemeListener();
		return cleanup;
	});
</script>

<svelte:head>
	{#if b?.favicon_url}
		<link rel="icon" href={b.favicon_url} />
	{/if}
</svelte:head>

<div
	class="auth-layout relative flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4 dark:from-background dark:via-background dark:to-primary/10"
	style:--brand-primary={b?.primary_color ?? undefined}
	style:--brand-primary-dark={primaryDark}
	style:--brand-primary-fg={primaryFg}
	style:--brand-bg={b?.background_color ?? undefined}
	style:--brand-text={b?.text_color ?? undefined}
	style:--brand-font={b?.font_family ?? undefined}
>
	{#if b?.login_page_background_url}
		<div
			class="absolute inset-0 bg-cover bg-center"
			style="background-image: url({b.login_page_background_url})"
		>
			<div class="absolute inset-0 bg-background/80 backdrop-blur-sm"></div>
		</div>
	{/if}

	<div class="absolute right-4 top-4 z-10">
		<ThemeToggle />
	</div>

	<div class="relative z-10 w-full max-w-md">
		<div class="mb-8 text-center">
			{#if b?.logo_url}
				<div class="flex justify-center">
					<img
						src={b.logo_url}
						alt="Logo"
						class="h-10 object-contain {b.logo_dark_url ? 'dark:hidden' : ''}"
					/>
					{#if b.logo_dark_url}
						<img
							src={b.logo_dark_url}
							alt="Logo"
							class="hidden h-10 object-contain dark:block"
						/>
					{/if}
				</div>
			{:else}
				<h1 class="text-3xl font-bold tracking-tight text-foreground">xavyo</h1>
			{/if}
			<p class="mt-1 text-sm text-muted-foreground">
				{b?.login_page_subtitle ?? 'Identity Governance Platform'}
			</p>
		</div>
		{@render children()}

		{#if b?.footer_text || b?.privacy_policy_url || b?.terms_of_service_url || b?.support_url}
			<footer class="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
				{#if b?.footer_text}
					<span>{b.footer_text}</span>
				{/if}
				{#if b?.privacy_policy_url}
					<a href={b.privacy_policy_url} class="underline-offset-4 hover:underline" target="_blank" rel="noopener noreferrer">Privacy</a>
				{/if}
				{#if b?.terms_of_service_url}
					<a href={b.terms_of_service_url} class="underline-offset-4 hover:underline" target="_blank" rel="noopener noreferrer">Terms</a>
				{/if}
				{#if b?.support_url}
					<a href={b.support_url} class="underline-offset-4 hover:underline" target="_blank" rel="noopener noreferrer">Support</a>
				{/if}
			</footer>
		{/if}
	</div>
</div>

<style>
	.auth-layout {
		--color-primary: var(--brand-primary, oklch(0.35 0.08 280));
		--color-primary-foreground: var(--brand-primary-fg, oklch(0.985 0 0));
		--color-ring: var(--brand-primary, oklch(0.35 0.08 280));
		--color-background: var(--brand-bg, oklch(0.995 0.002 270));
		--color-foreground: var(--brand-text, oklch(0.145 0.005 270));
		font-family: var(--brand-font, var(--font-sans));
	}

	:global(.dark) .auth-layout {
		--color-primary: var(--brand-primary-dark, oklch(0.55 0.12 280));
		--color-primary-foreground: var(--brand-primary-fg, oklch(0.985 0 0));
		--color-ring: var(--brand-primary-dark, oklch(0.55 0.12 280));
		--color-background: var(--brand-bg, oklch(0.13 0.005 270));
		--color-foreground: var(--brand-text, oklch(0.93 0.005 270));
	}
</style>
