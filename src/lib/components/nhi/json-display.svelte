<script lang="ts">
	interface Props {
		data: unknown;
		label?: string;
		collapsible?: boolean;
		maxHeight?: string;
	}

	let { data, label, collapsible = false, maxHeight = '16rem' }: Props = $props();

	let copied = $state(false);

	const formatted = $derived(data != null ? JSON.stringify(data, null, 2) : null);

	async function copyToClipboard() {
		if (!formatted) return;
		await navigator.clipboard.writeText(formatted);
		copied = true;
		setTimeout(() => {
			copied = false;
		}, 2000);
	}
</script>

{#if formatted === null}
	<span class="text-sm text-muted-foreground">&mdash;</span>
{:else if collapsible}
	<details class="group">
		<summary
			class="cursor-pointer text-sm font-medium text-foreground select-none hover:text-foreground/80"
		>
			{label ?? 'JSON'}
		</summary>
		<div class="relative mt-2">
			<button
				type="button"
				onclick={copyToClipboard}
				class="absolute right-2 top-2 rounded-md border border-border bg-background px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
			>
				{copied ? 'Copied!' : 'Copy'}
			</button>
			<pre
				class="overflow-auto rounded-md bg-muted p-4 font-mono text-xs text-foreground"
				style:max-height={maxHeight}>{formatted}</pre>
		</div>
	</details>
{:else}
	{#if label}
		<p class="mb-1 text-sm font-medium text-foreground">{label}</p>
	{/if}
	<div class="relative">
		<button
			type="button"
			onclick={copyToClipboard}
			class="absolute right-2 top-2 rounded-md border border-border bg-background px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
		>
			{copied ? 'Copied!' : 'Copy'}
		</button>
		<pre
			class="overflow-auto rounded-md bg-muted p-4 font-mono text-xs text-foreground"
			style:max-height={maxHeight}>{formatted}</pre>
	</div>
{/if}
