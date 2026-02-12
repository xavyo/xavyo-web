<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { CheckCircle2, AlertTriangle, Info, ShieldAlert } from 'lucide-svelte';
	import type { SecurityAlert } from '$lib/api/types';

	interface Props {
		alert: SecurityAlert;
		onacknowledge?: (id: string) => void;
	}

	let { alert, onacknowledge }: Props = $props();

	const severityConfig = $derived(
		({
			info: { class: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', icon: Info },
			warning: {
				class: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
				icon: AlertTriangle
			},
			critical: {
				class: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
				icon: ShieldAlert
			}
		})[alert.severity] ?? {
			class: 'bg-muted text-muted-foreground',
			icon: Info
		}
	);

	const typeLabels: Record<string, string> = {
		new_device: 'New Device',
		new_location: 'New Location',
		failed_attempts: 'Failed Attempts',
		password_change: 'Password Change',
		mfa_disabled: 'MFA Disabled'
	};

	const isAcknowledged = $derived(
		!!alert.acknowledged_at && !isNaN(new Date(alert.acknowledged_at).getTime())
	);
	const SeverityIcon = $derived(severityConfig.icon);
</script>

<div
	class="rounded-lg border bg-card p-4 transition-colors {isAcknowledged ? 'opacity-75' : ''}"
>
	<div class="flex items-start justify-between gap-3">
		<div class="flex items-start gap-3">
			<div
				class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full {severityConfig.class}"
			>
				<SeverityIcon class="h-4 w-4" />
			</div>
			<div class="min-w-0 flex-1">
				<div class="flex flex-wrap items-center gap-2">
					<h4 class="text-sm font-medium">{alert.title}</h4>
					<Badge variant="outline" class="text-xs">
						{typeLabels[alert.alert_type] ?? alert.alert_type}
					</Badge>
					<Badge variant="secondary" class="text-xs {severityConfig.class}">
						{alert.severity}
					</Badge>
				</div>
				<p class="mt-1 text-sm text-muted-foreground">{alert.message}</p>
				<p class="mt-1 text-xs text-muted-foreground">
					{new Date(alert.created_at).toLocaleString()}
					{#if isAcknowledged}
						<span class="ml-2 inline-flex items-center gap-1 text-green-600 dark:text-green-400">
							<CheckCircle2 class="h-3 w-3" />
							Acknowledged {new Date(alert.acknowledged_at!).toLocaleString()}
						</span>
					{/if}
				</p>
			</div>
		</div>
		{#if !isAcknowledged}
			<Button
				variant="outline"
				size="sm"
				class="shrink-0"
				onclick={() => onacknowledge?.(alert.id)}
			>
				Acknowledge
			</Button>
		{/if}
	</div>
</div>
