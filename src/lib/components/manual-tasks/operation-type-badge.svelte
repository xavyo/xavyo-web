<script lang="ts">
	interface Props {
		operationType: 'grant' | 'revoke' | 'modify';
	}

	let { operationType }: Props = $props();

	const config: Record<string, { label: string; class: string }> = {
		grant: { label: 'Grant', class: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' },
		revoke: { label: 'Revoke', class: 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200' },
		modify: { label: 'Modify', class: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' }
	};

	const current = $derived(config[operationType] ?? { label: operationType, class: 'bg-gray-100 text-gray-800' });
</script>

<span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {current.class}">
	{current.label}
</span>
