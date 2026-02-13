<script lang="ts">
	interface Props {
		status: 'draft' | 'active' | 'disabled';
	}

	let { status }: Props = $props();

	const labels: Record<string, string> = {
		draft: 'Draft',
		active: 'Active',
		disabled: 'Disabled'
	};

	const colors: Record<string, string> = {
		draft: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
		active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
		disabled: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
	};
</script>

<span
	class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {colors[status] ?? 'bg-zinc-100 text-zinc-600'}"
>
	{labels[status] ?? status}
</span>
