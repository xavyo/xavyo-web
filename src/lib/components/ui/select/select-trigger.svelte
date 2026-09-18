<script lang="ts">
  import { Select as SelectPrimitive } from 'bits-ui';
  import { cn } from '$lib/utils/cn';
  import type { Snippet } from 'svelte';

  interface Props {
    class?: string;
    children?: Snippet;
  }

  let { class: className, children, ...restProps }: Props = $props();
</script>

<SelectPrimitive.Trigger
  class={cn(
    'flex h-10 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-card px-3 py-2 text-sm shadow-xs ring-offset-background placeholder:text-muted-foreground transition-[color,box-shadow,border-color] focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1',
    className
  )}
  {...restProps}
>
  {#if children}{@render children()}{/if}
</SelectPrimitive.Trigger>
