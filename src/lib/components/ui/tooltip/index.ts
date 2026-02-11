import { Tooltip as TooltipPrimitive } from 'bits-ui';

export { default as TooltipContent } from './tooltip-content.svelte';

export const Tooltip = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;
export const TooltipProvider = TooltipPrimitive.Provider;
