<script lang="ts">
  import { Dialog as DialogPrimitive } from 'bits-ui';
  import { cn } from '$lib/utils/cn';
  import type { Snippet } from 'svelte';

  interface Props {
    class?: string;
    children?: Snippet;
  }

  let { class: className, children, ...restProps }: Props = $props();
</script>

<DialogPrimitive.Title class={cn('text-lg font-semibold leading-none tracking-tight', className)} {...restProps}>
  {#if children}{@render children()}{/if}
</DialogPrimitive.Title>
