<script lang="ts">
	import { User } from 'lucide-svelte';
	import { cn } from '$lib/utils/cn';

	interface Props {
		name?: string;
		email?: string;
		size?: 'sm' | 'default' | 'lg';
		class?: string;
	}

	let { name, email, size = 'default', class: className = '' }: Props = $props();

	const sizeClasses = {
		sm: 'h-8 w-8 text-xs',
		default: 'h-9 w-9 text-sm',
		lg: 'h-10 w-10 text-base'
	};

	const iconSizes = {
		sm: 'h-4 w-4',
		default: 'h-4 w-4',
		lg: 'h-5 w-5'
	};

	const avatarColors = [
		'bg-blue-600',
		'bg-emerald-600',
		'bg-violet-600',
		'bg-amber-600',
		'bg-rose-600',
		'bg-cyan-600',
		'bg-pink-600',
		'bg-indigo-600'
	];

	function getInitials(): string {
		if (name && name.trim()) {
			return name.trim()[0].toUpperCase();
		}
		if (email && email.trim()) {
			return email.trim()[0].toUpperCase();
		}
		return '';
	}

	function getColorIndex(): number {
		const str = email || name || '';
		let hash = 0;
		for (let i = 0; i < str.length; i++) {
			hash = str.charCodeAt(i) + ((hash << 5) - hash);
		}
		return Math.abs(hash) % avatarColors.length;
	}

	const initials = $derived(getInitials());
	const colorClass = $derived(avatarColors[getColorIndex()]);
</script>

<div
	class={cn(
		'inline-flex items-center justify-center rounded-full font-medium text-white',
		sizeClasses[size],
		initials ? colorClass : 'bg-muted text-muted-foreground',
		className
	)}
	aria-hidden="true"
>
	{#if initials}
		{initials}
	{:else}
		<User class={iconSizes[size]} />
	{/if}
</div>
