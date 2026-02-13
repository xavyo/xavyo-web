<script lang="ts">
	import { Shield, Smartphone, Monitor, Key, Clock, AlertTriangle } from 'lucide-svelte';
	import { Badge } from '$lib/components/ui/badge';
	import type { SecurityOverview } from '$lib/api/types';

	interface Props {
		securityOverview: SecurityOverview | null;
	}

	let { securityOverview }: Props = $props();

	function formatDate(dateStr: string | null): string {
		if (!dateStr) return 'Never';
		try {
			const date = new Date(dateStr);
			const now = new Date();
			const diffMs = now.getTime() - date.getTime();
			const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
			if (diffDays === 0) return 'Today';
			if (diffDays === 1) return 'Yesterday';
			if (diffDays < 30) return `${diffDays} days ago`;
			return date.toLocaleDateString();
		} catch {
			return 'Unknown';
		}
	}

	function formatExpiry(dateStr: string | null): string {
		if (!dateStr) return 'No expiry';
		try {
			const date = new Date(dateStr);
			return date.toLocaleDateString();
		} catch {
			return 'Unknown';
		}
	}
</script>

{#if securityOverview}
	<div class="grid grid-cols-2 gap-4 sm:grid-cols-3">
		<!-- MFA Status -->
		<div class="rounded-lg border bg-card p-4">
			<div class="flex items-center gap-3">
				<div class="rounded-full bg-muted p-2">
					<Shield class="h-4 w-4 text-muted-foreground" />
				</div>
				<div class="flex-1">
					<p class="text-sm text-muted-foreground">MFA Status</p>
					{#if securityOverview.mfa_enabled}
						<p class="text-lg font-semibold text-green-600 dark:text-green-400">Enabled</p>
						{#if securityOverview.mfa_methods.length > 0}
							<p class="text-xs text-muted-foreground">{securityOverview.mfa_methods.join(', ')}</p>
						{/if}
					{:else}
						<p class="text-lg font-semibold text-destructive">Disabled</p>
						<p class="text-xs text-muted-foreground">Enable MFA for better security</p>
					{/if}
				</div>
			</div>
		</div>

		<!-- Trusted Devices -->
		<div class="rounded-lg border bg-card p-4">
			<div class="flex items-center gap-3">
				<div class="rounded-full bg-muted p-2">
					<Smartphone class="h-4 w-4 text-muted-foreground" />
				</div>
				<div class="flex-1">
					<p class="text-sm text-muted-foreground">Trusted Devices</p>
					<p class="text-lg font-semibold">{securityOverview.trusted_devices_count}</p>
				</div>
			</div>
		</div>

		<!-- Active Sessions -->
		<div class="rounded-lg border bg-card p-4">
			<div class="flex items-center gap-3">
				<div class="rounded-full bg-muted p-2">
					<Monitor class="h-4 w-4 text-muted-foreground" />
				</div>
				<div class="flex-1">
					<p class="text-sm text-muted-foreground">Active Sessions</p>
					<p class="text-lg font-semibold">{securityOverview.active_sessions_count}</p>
				</div>
			</div>
		</div>

		<!-- Last Password Change -->
		<div class="rounded-lg border bg-card p-4">
			<div class="flex items-center gap-3">
				<div class="rounded-full bg-muted p-2">
					<Key class="h-4 w-4 text-muted-foreground" />
				</div>
				<div class="flex-1">
					<p class="text-sm text-muted-foreground">Last Password Change</p>
					<p class="text-lg font-semibold">{formatDate(securityOverview.last_password_change)}</p>
				</div>
			</div>
		</div>

		<!-- Password Expiry -->
		<div class="rounded-lg border bg-card p-4">
			<div class="flex items-center gap-3">
				<div class="rounded-full bg-muted p-2">
					<Clock class="h-4 w-4 text-muted-foreground" />
				</div>
				<div class="flex-1">
					<p class="text-sm text-muted-foreground">Password Expiry</p>
					<p class="text-lg font-semibold">{formatExpiry(securityOverview.password_expires_at)}</p>
				</div>
			</div>
		</div>

		<!-- Security Alerts -->
		<div class="rounded-lg border bg-card p-4">
			<div class="flex items-center gap-3">
				<div class="rounded-full bg-muted p-2">
					<AlertTriangle class="h-4 w-4 text-muted-foreground" />
				</div>
				<div class="flex-1">
					<p class="text-sm text-muted-foreground">Security Alerts</p>
					<div class="flex items-center gap-2">
						<p class="text-lg font-semibold">{securityOverview.recent_security_alerts_count}</p>
						{#if securityOverview.recent_security_alerts_count > 0}
							<Badge variant="destructive">{securityOverview.recent_security_alerts_count} alert{securityOverview.recent_security_alerts_count === 1 ? '' : 's'}</Badge>
						{:else}
							<Badge variant="secondary">None</Badge>
						{/if}
					</div>
				</div>
			</div>
		</div>
	</div>
{:else}
	<!-- Skeleton/placeholder state when securityOverview is null -->
	<div class="grid grid-cols-2 gap-4 sm:grid-cols-3">
		{#each Array(6) as _}
			<div class="rounded-lg border bg-card p-4">
				<div class="flex items-center gap-3">
					<div class="h-8 w-8 animate-pulse rounded-full bg-muted"></div>
					<div class="flex-1 space-y-2">
						<div class="h-3 w-20 animate-pulse rounded bg-muted"></div>
						<div class="h-5 w-16 animate-pulse rounded bg-muted"></div>
					</div>
				</div>
			</div>
		{/each}
	</div>
{/if}
