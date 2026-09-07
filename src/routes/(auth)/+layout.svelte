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

	function isLightColor(hex: string): boolean {
		const h = hex.replace('#', '');
		const full = h.length === 3 ? h[0] + h[0] + h[1] + h[1] + h[2] + h[2] : h;
		const r = parseInt(full.slice(0, 2), 16);
		const g = parseInt(full.slice(2, 4), 16);
		const bl = parseInt(full.slice(4, 6), 16);
		return (0.299 * r + 0.587 * g + 0.114 * bl) / 255 > 0.5;
	}

	const primaryFg = $derived(
		b?.primary_color
			? isLightColor(b.primary_color)
				? 'oklch(0.22 0.02 240)'
				: 'oklch(0.99 0.002 205)'
			: undefined
	);

	const primaryDark = $derived(
		b?.primary_color ? `color-mix(in oklch, ${b.primary_color} 80%, white)` : undefined
	);

	const hasCustomBg = $derived(
		Boolean(b?.login_page_background_url && /^https?:\/\//i.test(b.login_page_background_url))
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
	class="auth-layout relative min-h-screen bg-background text-foreground"
	style:--brand-primary={b?.primary_color ?? undefined}
	style:--brand-primary-dark={primaryDark}
	style:--brand-primary-fg={primaryFg}
	style:--brand-bg={b?.background_color ?? undefined}
	style:--brand-text={b?.text_color ?? undefined}
	style:--brand-font={b?.font_family ?? undefined}
>
	<div class="absolute right-4 top-4 z-20">
		<ThemeToggle />
	</div>

	<div class="grid min-h-screen lg:grid-cols-2">
		<section class="relative z-10 flex flex-col justify-center px-6 py-12 sm:px-10 lg:px-16 xl:px-24">
			<div class="mx-auto w-full max-w-md [animation:fade-up_0.4s_ease-out]">
				<div class="mb-8">
					{#if b?.logo_url}
						<div class="mb-6">
							<img
								src={b.logo_url}
								alt="Logo"
								class="h-9 object-contain {b.logo_dark_url ? 'dark:hidden' : ''}"
							/>
							{#if b.logo_dark_url}
								<img
									src={b.logo_dark_url}
									alt="Logo"
									class="hidden h-9 object-contain dark:block"
								/>
							{/if}
						</div>
					{:else}
						<div class="mb-6 flex items-center gap-2.5">
							<span
								class="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground"
								aria-hidden="true"
							>
								xy
							</span>
							<span class="text-xl font-semibold tracking-tight">xavyo</span>
						</div>
					{/if}
					<p class="text-sm text-muted-foreground">
						{b?.login_page_subtitle ?? 'Identity Governance Platform'}
					</p>
				</div>

				{@render children()}

				{#if b?.footer_text || b?.privacy_policy_url || b?.terms_of_service_url || b?.support_url}
					<footer class="mt-8 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
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
		</section>

		<aside class="relative hidden overflow-hidden border-l border-border/60 lg:block" aria-hidden="true">
			{#if hasCustomBg}
				<div
					class="absolute inset-0 bg-cover bg-center"
					style:background-image="url({b?.login_page_background_url})"
				></div>
				<div class="absolute inset-0 bg-sidebar/75 backdrop-blur-[2px]"></div>
			{:else}
				<div class="auth-atmosphere absolute inset-0"></div>
			{/if}

			<div class="relative z-10 flex h-full flex-col justify-between p-10 text-sidebar-foreground">
				<div class="[animation:fade-in_0.55s_ease-out]">
					<p class="text-xs font-semibold uppercase tracking-[0.14em] text-sidebar-muted">
						Secure access
					</p>
					<h2 class="mt-4 max-w-sm text-3xl font-semibold tracking-tight xl:text-4xl">
						Govern every identity — human, machine, and agent.
					</h2>
					<p class="mt-4 max-w-sm text-sm leading-relaxed text-sidebar-muted">
						Request, certify, and revoke access from one focused workspace.
					</p>
				</div>

				<ul class="space-y-3 text-sm text-sidebar-muted [animation:fade-in_0.75s_ease-out]">
					<li class="flex items-center gap-2">
						<span class="h-1.5 w-1.5 rounded-full bg-sidebar-ring"></span>
						Least-privilege workflows
					</li>
					<li class="flex items-center gap-2">
						<span class="h-1.5 w-1.5 rounded-full bg-sidebar-ring"></span>
						Audit-ready certifications
					</li>
					<li class="flex items-center gap-2">
						<span class="h-1.5 w-1.5 rounded-full bg-sidebar-ring"></span>
						Non-human identity control
					</li>
				</ul>
			</div>
		</aside>
	</div>
</div>

<style>
	.auth-layout {
		--color-primary: var(--brand-primary, oklch(0.42 0.09 205));
		--color-primary-foreground: var(--brand-primary-fg, oklch(0.99 0.002 205));
		--color-ring: var(--brand-primary, oklch(0.42 0.09 205));
		--color-background: var(--brand-bg, oklch(0.985 0.006 230));
		--color-foreground: var(--brand-text, oklch(0.22 0.02 240));
		font-family: var(--brand-font, var(--font-sans));
	}

	:global(.dark) .auth-layout {
		--color-primary: var(--brand-primary-dark, oklch(0.68 0.11 205));
		--color-primary-foreground: var(--brand-primary-fg, oklch(0.18 0.03 220));
		--color-ring: var(--brand-primary-dark, oklch(0.68 0.11 205));
		--color-background: var(--brand-bg, oklch(0.16 0.015 240));
		--color-foreground: var(--brand-text, oklch(0.93 0.01 230));
	}

	.auth-atmosphere {
		background:
			radial-gradient(ellipse 80% 60% at 20% 10%, oklch(0.45 0.1 205 / 0.45), transparent 55%),
			radial-gradient(ellipse 70% 50% at 90% 80%, oklch(0.35 0.06 240 / 0.5), transparent 50%),
			linear-gradient(160deg, oklch(0.2 0.025 240), oklch(0.16 0.02 230) 55%, oklch(0.18 0.03 210));
	}

	.auth-atmosphere::after {
		content: '';
		position: absolute;
		inset: 0;
		background-image:
			linear-gradient(oklch(0.95 0.01 230 / 0.04) 1px, transparent 1px),
			linear-gradient(90deg, oklch(0.95 0.01 230 / 0.04) 1px, transparent 1px);
		background-size: 32px 32px;
		mask-image: radial-gradient(ellipse 70% 70% at 50% 40%, black, transparent);
	}
</style>
