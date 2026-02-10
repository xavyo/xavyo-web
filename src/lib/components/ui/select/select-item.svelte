<script lang="ts">
  import { Select as SelectPrimitive } from 'bits-ui';
  import { cn } from '$lib/utils/cn';
  import type { Snippet } from 'svelte';

  interface Props {
    value: string;
    label?: string;
    disabled?: boolean;
    class?: string;
    children?: Snippet;
  }

  let { value, label, disabled = false, class: className, children, ...restProps }: Props = $props();
</script>

<SelectPrimitive.Item
  {value}
  {label}
  {disabled}
  class={cn(
    'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
    className
  )}
  {...restProps}
>
  {#if children}{@render children()}{:else}{label ?? value}{/if}
</SelectPrimitive.Item>
