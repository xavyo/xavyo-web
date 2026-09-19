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
		draft: 'bg-info/15 text-info',
		active: 'bg-success/15 text-success',
		disabled: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
	};
</script>

<span
	class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {colors[status] ?? 'bg-zinc-100 text-zinc-600'}"
>
	{labels[status] ?? status}
</span>
