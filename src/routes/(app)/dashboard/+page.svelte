<script lang="ts">
	import { Users, Drama, Bot, Activity, ArrowUpRight } from 'lucide-svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const stats = $derived([
		{ label: 'Users', value: data.totalUsers, icon: Users, href: '/users' },
		{ label: 'Personas', value: data.activePersonas, icon: Drama, href: '/personas' },
		{ label: 'NHI', value: data.nhiIdentities, icon: Bot, href: '/nhi' },
		{ label: 'Activity', value: data.recentActivity, icon: Activity, href: '/audit' }
	]);
</script>

<section class="overflow-hidden rounded-xl border border-border/80 bg-card [animation:fade-up_0.35s_ease-out]">
	<div class="border-b border-border/70 px-5 py-5 sm:px-6">
		<p class="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">Workspace</p>
		<h1 class="mt-1 text-2xl font-semibold tracking-tight sm:text-[1.75rem]">
			Welcome back{#if data.user?.email}<span class="text-muted-foreground">,</span>
				<span class="font-medium">{data.user.email.split('@')[0]}</span>{/if}
		</h1>
		<p class="mt-1 text-sm text-muted-foreground">Jump into the work that needs attention.</p>
	</div>

	<div class="grid sm:grid-cols-2 lg:grid-cols-4">
		{#each stats as stat, i (stat.href)}
			{@const Icon = stat.icon}
			<a
				href={stat.href}
				class="group flex flex-col gap-3 border-border/70 px-5 py-5 transition-colors hover:bg-accent/40 sm:px-6
					{i > 0 ? 'border-t sm:border-t-0' : ''}
					{i % 2 === 1 ? 'sm:border-l' : ''}
					{i > 1 ? 'lg:border-t-0' : ''}
					{i > 0 ? 'lg:border-l' : ''}"
				style="animation: fade-up 0.4s ease-out {0.04 * (i + 1)}s both"
			>
				<div class="flex items-center justify-between">
					<p class="text-sm font-medium text-muted-foreground">{stat.label}</p>
					<Icon class="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
				</div>
				<div class="flex items-end justify-between gap-2">
					<p class="text-2xl font-semibold tracking-tight tabular-nums">{stat.value}</p>
					<span
						class="inline-flex items-center gap-0.5 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100"
					>
						Open
						<ArrowUpRight class="h-3.5 w-3.5" />
					</span>
				</div>
			</a>
		{/each}
	</div>
</section>
