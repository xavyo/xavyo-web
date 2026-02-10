<script lang="ts">
  import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui';
  import { cn } from '$lib/utils/cn';
  import type { Snippet } from 'svelte';

  interface Props {
    class?: string;
    disabled?: boolean;
    children?: Snippet;
  }

  let { class: className, disabled = false, children, ...restProps }: Props = $props();
</script>

<DropdownMenuPrimitive.Item
  {disabled}
  class={cn(
    'relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0',
    className
  )}
  {...restProps}
>
  {#if children}{@render children()}{/if}
</DropdownMenuPrimitive.Item>
