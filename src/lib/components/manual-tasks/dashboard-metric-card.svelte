<script lang="ts">
	interface Props {
		label: string;
		value: number | string;
		variant?: 'default' | 'warning' | 'danger' | 'success';
	}

	let { label, value, variant = 'default' }: Props = $props();

	const variantClasses: Record<string, string> = {
		default: 'text-foreground',
		warning: 'text-orange-600 dark:text-orange-400',
		danger: 'text-red-600 dark:text-red-400',
		success: 'text-green-600 dark:text-green-400'
	};

	const valueClass = $derived(variantClasses[variant] ?? variantClasses.default);
</script>

<div class="rounded-lg border border-border bg-card p-4">
	<p class="text-sm text-muted-foreground">{label}</p>
	<p class="mt-1 text-2xl font-bold {valueClass}">{value}</p>
</div>
