<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Search } from 'lucide-svelte';

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

<div class="mb-4 flex items-center gap-3">
	<div class="relative max-w-md flex-1">
		<Search
			class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
		/>
		<Input
			{placeholder}
			value={String(value ?? '')}
			oninput={handleInput}
			class="pl-9"
		/>
	</div>
</div>
