<script lang="ts">
  import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui';
  import { cn } from '$lib/utils/cn';
  import type { Snippet } from 'svelte';

  interface Props {
    class?: string;
    children?: Snippet;
  }

  let { class: className, children, ...restProps }: Props = $props();
</script>

<DropdownMenuPrimitive.GroupHeading class={cn('px-2 py-1.5 text-sm font-semibold', className)} {...restProps}>
  {#if children}{@render children()}{/if}
</DropdownMenuPrimitive.GroupHeading>
