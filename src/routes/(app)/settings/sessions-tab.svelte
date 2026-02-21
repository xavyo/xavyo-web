<script lang="ts">
	import { Monitor, Smartphone, Tablet, Globe, Trash2, Shield, Clock, MapPin } from 'lucide-svelte';
	import { Card, CardContent } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import * as Dialog from '$lib/components/ui/dialog';
	import { addToast } from '$lib/stores/toast.svelte';
	import { relativeTime } from '$lib/utils/relative-time';
	import type { SessionInfo, SessionList, RevokeAllSessionsResponse } from '$lib/api/types';

	let sessions = $state<SessionInfo[]>([]);
	let loading = $state(true);
	let error = $state('');
	let revokingId = $state<string | null>(null);
	let revokingAll = $state(false);

	let showRevokeDialog = $state(false);
	let revokeTargetSession = $state<SessionInfo | null>(null);
	let showRevokeAllDialog = $state(false);

	const otherSessions = $derived(sessions.filter((s) => !s.is_current));
	const hasOtherSessions = $derived(otherSessions.length > 0);

	function getDeviceIcon(deviceType: string | null) {
		switch (deviceType?.toLowerCase()) {
			case 'desktop':
				return Monitor;
			case 'mobile':
				return Smartphone;
			case 'tablet':
				return Tablet;
			default:
				return Globe;
		}
	}

	async function fetchSessions() {
		loading = true;
		error = '';

		try {
			const response = await fetch('/api/sessions');

			if (!response.ok) {
				const data = await response.json().catch(() => null);
				error =
					(data as Record<string, unknown> | null)?.message?.toString() ??
					'Failed to load sessions. Please try again.';
				return;
			}

			const data = (await response.json()) as SessionList;
			sessions = data.sessions;
		} catch {
			error = 'An unexpected error occurred. Please try again.';
		} finally {
			loading = false;
		}
	}

	function confirmRevoke(session: SessionInfo) {
		revokeTargetSession = session;
		showRevokeDialog = true;
	}

	async function revokeSession() {
		if (!revokeTargetSession) return;

		const sessionId = revokeTargetSession.id;
		revokingId = sessionId;
		showRevokeDialog = false;

		try {
			const response = await fetch(`/api/sessions/${sessionId}`, {
				method: 'DELETE'
			});

			if (!response.ok) {
				addToast('error', 'Failed to revoke session. Please try again.');
				return;
			}

			sessions = sessions.filter((s) => s.id !== sessionId);
			addToast('success', 'Session revoked');
		} catch {
			addToast('error', 'An unexpected error occurred. Please try again.');
		} finally {
			revokingId = null;
			revokeTargetSession = null;
		}
	}

	function confirmRevokeAll() {
		showRevokeAllDialog = true;
	}

	async function revokeAllOtherSessions() {
		revokingAll = true;
		showRevokeAllDialog = false;

		try {
			const response = await fetch('/api/sessions', {
				method: 'DELETE'
			});

			if (!response.ok) {
				addToast('error', 'Failed to revoke sessions. Please try again.');
				return;
			}

			const data = (await response.json()) as RevokeAllSessionsResponse;
			addToast(
				'success',
				`${data.revoked_count} session${data.revoked_count === 1 ? '' : 's'} revoked`
			);
			await fetchSessions();
		} catch {
			addToast('error', 'An unexpected error occurred. Please try again.');
		} finally {
			revokingAll = false;
		}
	}

	$effect(() => {
		fetchSessions();
	});
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div>
			<h2 class="text-xl font-semibold">Active sessions</h2>
			<p class="text-sm text-muted-foreground">
				Manage your active sessions across devices.
			</p>
		</div>
		{#if !loading && !error && hasOtherSessions}
			<Button
				variant="destructive"
				size="sm"
				disabled={revokingAll}
				onclick={confirmRevokeAll}
			>
				<Shield class="mr-2 h-4 w-4" />
				{#if revokingAll}
					Revoking...
				{:else}
					Revoke all other sessions
				{/if}
			</Button>
		{/if}
	</div>

	{#if loading}
		<div class="space-y-4">
			{#each [1, 2, 3] as _}
				<Card>
					<CardContent class="p-4">
						<div class="flex items-start gap-4">
							<div class="h-10 w-10 animate-pulse rounded-lg bg-muted"></div>
							<div class="flex-1 space-y-2">
								<div class="h-4 w-48 animate-pulse rounded bg-muted"></div>
								<div class="h-3 w-32 animate-pulse rounded bg-muted"></div>
								<div class="h-3 w-24 animate-pulse rounded bg-muted"></div>
							</div>
						</div>
					</CardContent>
				</Card>
			{/each}
		</div>
	{:else if error}
		<Alert variant="destructive">
			<AlertDescription>{error}</AlertDescription>
		</Alert>
		<div class="flex justify-center">
			<Button variant="outline" onclick={fetchSessions}>Retry</Button>
		</div>
	{:else}
		<div class="space-y-4">
			{#each sessions as session (session.id)}
				{@const DeviceIcon = getDeviceIcon(session.device_type)}
				<Card class={session.is_current ? 'border-primary/50' : ''}>
					<CardContent class="p-4">
						<div class="flex items-start gap-4">
							<div
								class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted"
							>
								<DeviceIcon class="h-5 w-5 text-muted-foreground" />
							</div>
							<div class="min-w-0 flex-1">
								<div class="flex items-center gap-2">
									<span class="font-medium">
										{session.device_name || 'Unknown device'}
									</span>
									{#if session.is_current}
										<Badge
											class="border-transparent bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
										>
											This device
										</Badge>
									{/if}
								</div>
								{#if session.browser || session.os}
									<p class="text-sm text-muted-foreground">
										{[session.browser, session.os].filter(Boolean).join(' on ')}
									</p>
								{/if}
								<div class="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
									{#if session.ip_address}
										<span class="inline-flex items-center gap-1">
											<MapPin class="h-3 w-3" />
											{session.ip_address}
										</span>
									{/if}
									<span class="inline-flex items-center gap-1">
										<Clock class="h-3 w-3" />
										{relativeTime(session.last_activity_at)}
									</span>
								</div>
								<p class="mt-1 text-xs text-muted-foreground">
									Active since: {new Date(session.created_at).toLocaleDateString()}
								</p>
							</div>
							{#if !session.is_current}
								<Button
									variant="ghost"
									size="icon"
									disabled={revokingId === session.id}
									onclick={() => confirmRevoke(session)}
									aria-label="Revoke session"
								>
									<Trash2 class="h-4 w-4 text-destructive" />
								</Button>
							{/if}
						</div>
					</CardContent>
				</Card>
			{/each}

			{#if !hasOtherSessions}
				<div class="rounded-lg border border-dashed p-8 text-center">
					<Shield class="mx-auto h-8 w-8 text-muted-foreground" />
					<p class="mt-2 text-sm font-medium text-muted-foreground">
						No other sessions
					</p>
					<p class="mt-1 text-xs text-muted-foreground">
						You are only signed in on this device.
					</p>
				</div>
			{/if}
		</div>
	{/if}
</div>

<!-- Revoke single session dialog -->
<Dialog.Root bind:open={showRevokeDialog}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Revoke session</Dialog.Title>
			<Dialog.Description>
				Are you sure you want to revoke this session? The user will be signed out on that device.
			</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer>
			<Button variant="outline" onclick={() => (showRevokeDialog = false)}>Cancel</Button>
			<Button variant="destructive" onclick={revokeSession}>Revoke session</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<!-- Revoke all sessions dialog -->
<Dialog.Root bind:open={showRevokeAllDialog}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Revoke all other sessions</Dialog.Title>
			<Dialog.Description>
				This will sign you out of all other devices. Continue?
			</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer>
			<Button variant="outline" onclick={() => (showRevokeAllDialog = false)}>Cancel</Button>
			<Button variant="destructive" onclick={revokeAllOtherSessions}>
				Revoke all sessions
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
