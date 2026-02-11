<script lang="ts">
	import { Input } from '$lib/components/ui/input';

	let {
		value = '',
		onchange,
		placeholder = 'Search...'
	}: {
		value?: string;
		onchange: (value: string) => void;
		placeholder?: string;
	} = $props();

	let timeout: ReturnType<typeof setTimeout> | null = null;

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		if (timeout) clearTimeout(timeout);
		timeout = setTimeout(() => {
			onchange(target.value);
		}, 300);
	}

	$effect(() => {
		return () => {
			if (timeout) clearTimeout(timeout);
		};
	});
</script>

<div class="flex items-center py-4">
	<Input
		{placeholder}
		value={String(value ?? '')}
		oninput={handleInput}
		class="max-w-sm"
	/>
</div>
