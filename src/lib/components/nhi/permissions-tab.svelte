<script lang="ts">
	import type {
		NhiToolPermission,
		NhiNhiPermission,
		NhiUserPermission
	} from '$lib/api/types';
	import {
		fetchAgentTools,
		fetchToolAgents,
		fetchCallers,
		fetchCallees,
		fetchNhiUsers,
		grantToolPermissionClient,
		revokeToolPermissionClient,
		grantNhiPermissionClient,
		revokeNhiPermissionClient,
		grantUserPermissionClient,
		revokeUserPermissionClient
	} from '$lib/api/nhi-permissions-client';
	import { Card, CardHeader, CardContent } from '$lib/components/ui/card';
	import Button from '$lib/components/ui/button/button.svelte';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import GrantToolPermissionDialog from './grant-tool-permission-dialog.svelte';
	import GrantNhiPermissionDialog from './grant-nhi-permission-dialog.svelte';
	import GrantUserPermissionDialog from './grant-user-permission-dialog.svelte';

	interface Props {
		nhiId: string;
		entityType: 'agent' | 'tool' | 'service_account';
	}

	let { nhiId, entityType }: Props = $props();

	// --- Tool Access State (agents only) / Agents with Access (tools only) ---
	let toolPermissions = $state<NhiToolPermission[]>([]);
	let toolPermissionsLoading = $state(true);
	let toolPermissionsError = $state<string | null>(null);
	let showGrantToolDialog = $state(false);

	// --- Calling Permissions State (agents + service_accounts) ---
	let callees = $state<NhiNhiPermission[]>([]);
	let calleesLoading = $state(true);
	let calleesError = $state<string | null>(null);

	let callers = $state<NhiNhiPermission[]>([]);
	let callersLoading = $state(true);
	let callersError = $state<string | null>(null);
	let showGrantNhiDialog = $state(false);

	// --- Users State (all entity types) ---
	let users = $state<NhiUserPermission[]>([]);
	let usersLoading = $state(true);
	let usersError = $state<string | null>(null);
	let showGrantUserDialog = $state(false);

	// --- Revoke Confirmation ---
	let revokeDialogOpen = $state(false);
	let revokeTarget = $state<{
		type: 'tool' | 'nhi' | 'user';
		id: string;
		label: string;
		permissionType?: string;
	} | null>(null);
	let isRevoking = $state(false);

	// --- Load data on mount ---
	$effect(() => {
		if (entityType === 'agent' || entityType === 'tool') {
			loadToolPermissions();
		}
	});

	$effect(() => {
		if (entityType === 'agent' || entityType === 'service_account') {
			loadCallees();
			loadCallers();
		}
	});

	$effect(() => {
		loadUsers();
	});

	// --- Load Functions ---

	async function loadToolPermissions() {
		toolPermissionsLoading = true;
		toolPermissionsError = null;
		try {
			if (entityType === 'agent') {
				const res = await fetchAgentTools(nhiId);
				toolPermissions = res.data;
			} else if (entityType === 'tool') {
				const res = await fetchToolAgents(nhiId);
				toolPermissions = res.data;
			}
		} catch (err: unknown) {
			toolPermissionsError = err instanceof Error ? err.message : 'Failed to load';
		} finally {
			toolPermissionsLoading = false;
		}
	}

	async function loadCallees() {
		calleesLoading = true;
		calleesError = null;
		try {
			const res = await fetchCallees(nhiId);
			callees = res.data;
		} catch (err: unknown) {
			calleesError = err instanceof Error ? err.message : 'Failed to load callees';
		} finally {
			calleesLoading = false;
		}
	}

	async function loadCallers() {
		callersLoading = true;
		callersError = null;
		try {
			const res = await fetchCallers(nhiId);
			callers = res.data;
		} catch (err: unknown) {
			callersError = err instanceof Error ? err.message : 'Failed to load callers';
		} finally {
			callersLoading = false;
		}
	}

	async function loadUsers() {
		usersLoading = true;
		usersError = null;
		try {
			const res = await fetchNhiUsers(nhiId);
			users = res.data;
		} catch (err: unknown) {
			usersError = err instanceof Error ? err.message : 'Failed to load users';
		} finally {
			usersLoading = false;
		}
	}

	// --- Grant Handlers ---

	async function handleGrantTool(toolId: string, expiresAt?: string) {
		await grantToolPermissionClient(nhiId, toolId, {
			expires_at: expiresAt
		});
		await loadToolPermissions();
	}

	async function handleGrantNhi(
		targetId: string,
		body: {
			permission_type: string;
			allowed_actions?: Record<string, unknown>;
			max_calls_per_hour?: number;
			expires_at?: string;
		}
	) {
		await grantNhiPermissionClient(nhiId, targetId, body);
		await loadCallees();
	}

	async function handleGrantUser(userId: string) {
		await grantUserPermissionClient(nhiId, userId, { permission_type: 'use' });
		await loadUsers();
	}

	// --- Revoke Handlers ---

	function confirmRevoke(type: 'tool' | 'nhi' | 'user', id: string, label: string, permissionType?: string) {
		revokeTarget = { type, id, label, permissionType };
		revokeDialogOpen = true;
	}

	async function handleRevoke() {
		if (!revokeTarget) return;
		isRevoking = true;
		try {
			if (revokeTarget.type === 'tool') {
				if (entityType === 'agent') {
					await revokeToolPermissionClient(nhiId, revokeTarget.id);
				} else {
					// For tools, revokeTarget.id is the agent_id
					await revokeToolPermissionClient(revokeTarget.id, nhiId);
				}
				await loadToolPermissions();
			} else if (revokeTarget.type === 'nhi') {
				await revokeNhiPermissionClient(nhiId, revokeTarget.id);
				await loadCallees();
				await loadCallers();
			} else if (revokeTarget.type === 'user') {
				await revokeUserPermissionClient(nhiId, revokeTarget.id, { permission_type: revokeTarget.permissionType || 'use' });
				await loadUsers();
			}
			revokeDialogOpen = false;
			revokeTarget = null;
		} catch {
			// Error silently handled; dialog stays open
		} finally {
			isRevoking = false;
		}
	}

	function formatDate(dateStr: string): string {
		return new Date(dateStr).toLocaleDateString(undefined, {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}
</script>

<div class="space-y-6">
	<!-- Section 1: Tool Access (agents) / Agents with Access (tools) -->
	{#if entityType === 'agent' || entityType === 'tool'}
		<Card>
			<CardHeader>
				<div class="flex items-center justify-between">
					<h3 class="text-base font-semibold text-foreground">
						{entityType === 'agent' ? 'Tool Access' : 'Agents with Access'}
					</h3>
					{#if entityType === 'agent'}
						<Button variant="outline" size="sm" onclick={() => (showGrantToolDialog = true)}>
							Grant
						</Button>
					{/if}
				</div>
			</CardHeader>
			<CardContent>
				{#if toolPermissionsLoading}
					<div class="animate-pulse space-y-2">
						<div class="h-8 rounded bg-muted"></div>
						<div class="h-8 rounded bg-muted"></div>
					</div>
				{:else if toolPermissionsError}
					<p class="text-sm text-destructive">{toolPermissionsError}</p>
				{:else if toolPermissions.length === 0}
					<p class="text-sm text-muted-foreground">
						{entityType === 'agent' ? 'No tool access granted' : 'No agents have access'}
					</p>
				{:else}
					<div class="space-y-2">
						{#each toolPermissions as perm}
							<div
								class="flex items-center justify-between rounded-md border border-border px-3 py-2"
							>
								<div class="min-w-0">
									<p class="truncate text-sm font-medium text-foreground">
										{entityType === 'agent' ? perm.tool_nhi_id : perm.agent_nhi_id}
									</p>
									<p class="text-xs text-muted-foreground">
										Granted: {formatDate(perm.granted_at)}
										{#if perm.expires_at}
											&middot; Expires: {formatDate(perm.expires_at)}
										{/if}
									</p>
								</div>
								<Button
									variant="ghost"
									size="sm"
									class="text-destructive hover:text-destructive"
									onclick={() =>
										confirmRevoke(
											'tool',
											entityType === 'agent' ? perm.tool_nhi_id : perm.agent_nhi_id,
											entityType === 'agent' ? perm.tool_nhi_id : perm.agent_nhi_id
										)}
								>
									Revoke
								</Button>
							</div>
						{/each}
					</div>
				{/if}
			</CardContent>
		</Card>
	{/if}

	<!-- Section 2: Calling Permissions (agents + service_accounts) -->
	{#if entityType === 'agent' || entityType === 'service_account'}
		<Card>
			<CardHeader>
				<div class="flex items-center justify-between">
					<h3 class="text-base font-semibold text-foreground">Calling Permissions</h3>
					<Button variant="outline" size="sm" onclick={() => (showGrantNhiDialog = true)}>
						Grant
					</Button>
				</div>
			</CardHeader>
			<CardContent>
				<div class="space-y-4">
					<!-- Callees -->
					<div>
						<h4 class="mb-2 text-sm font-medium text-foreground">Callees (can call)</h4>
						{#if calleesLoading}
							<div class="animate-pulse space-y-2">
								<div class="h-8 rounded bg-muted"></div>
							</div>
						{:else if calleesError}
							<p class="text-sm text-destructive">{calleesError}</p>
						{:else if callees.length === 0}
							<p class="text-sm text-muted-foreground">No outbound permissions</p>
						{:else}
							<div class="space-y-2">
								{#each callees as perm}
									<div
										class="flex items-center justify-between rounded-md border border-border px-3 py-2"
									>
										<div class="min-w-0">
											<p class="truncate text-sm font-medium text-foreground">
												{perm.target_nhi_id}
											</p>
											<p class="text-xs text-muted-foreground">
												Type: {perm.permission_type} &middot; Granted: {formatDate(
													perm.granted_at
												)}
												{#if perm.expires_at}
													&middot; Expires: {formatDate(perm.expires_at)}
												{/if}
											</p>
										</div>
										<Button
											variant="ghost"
											size="sm"
											class="text-destructive hover:text-destructive"
											onclick={() => confirmRevoke('nhi', perm.target_nhi_id, perm.target_nhi_id)}
										>
											Revoke
										</Button>
									</div>
								{/each}
							</div>
						{/if}
					</div>

					<Separator />

					<!-- Callers -->
					<div>
						<h4 class="mb-2 text-sm font-medium text-foreground">Callers (called by)</h4>
						{#if callersLoading}
							<div class="animate-pulse space-y-2">
								<div class="h-8 rounded bg-muted"></div>
							</div>
						{:else if callersError}
							<p class="text-sm text-destructive">{callersError}</p>
						{:else if callers.length === 0}
							<p class="text-sm text-muted-foreground">No inbound permissions</p>
						{:else}
							<div class="space-y-2">
								{#each callers as perm}
									<div class="rounded-md border border-border px-3 py-2">
										<p class="truncate text-sm font-medium text-foreground">
											{perm.source_nhi_id}
										</p>
										<p class="text-xs text-muted-foreground">
											Type: {perm.permission_type} &middot; Granted: {formatDate(
												perm.granted_at
											)}
											{#if perm.expires_at}
												&middot; Expires: {formatDate(perm.expires_at)}
											{/if}
										</p>
									</div>
								{/each}
							</div>
						{/if}
					</div>
				</div>
			</CardContent>
		</Card>
	{/if}

	<!-- Section 3: Users (all entity types) -->
	<Card>
		<CardHeader>
			<div class="flex items-center justify-between">
				<h3 class="text-base font-semibold text-foreground">Users</h3>
				<Button variant="outline" size="sm" onclick={() => (showGrantUserDialog = true)}>
					Grant
				</Button>
			</div>
		</CardHeader>
		<CardContent>
			{#if usersLoading}
				<div class="animate-pulse space-y-2">
					<div class="h-8 rounded bg-muted"></div>
					<div class="h-8 rounded bg-muted"></div>
				</div>
			{:else if usersError}
				<p class="text-sm text-destructive">{usersError}</p>
			{:else if users.length === 0}
				<p class="text-sm text-muted-foreground">No users have access</p>
			{:else}
				<div class="space-y-2">
					{#each users as perm}
						<div
							class="flex items-center justify-between rounded-md border border-border px-3 py-2"
						>
							<div class="min-w-0">
								<p class="truncate text-sm font-medium text-foreground">{perm.user_id}</p>
								<p class="text-xs text-muted-foreground">
									Granted: {formatDate(perm.granted_at)}
								</p>
							</div>
							<Button
								variant="ghost"
								size="sm"
								class="text-destructive hover:text-destructive"
								onclick={() => confirmRevoke('user', perm.user_id, perm.user_id, perm.permission_type)}
							>
								Revoke
							</Button>
						</div>
					{/each}
				</div>
			{/if}
		</CardContent>
	</Card>
</div>

<!-- Grant Dialogs -->
{#if entityType === 'agent'}
	<GrantToolPermissionDialog bind:open={showGrantToolDialog} agentId={nhiId} onGrant={handleGrantTool} />
{/if}

{#if entityType === 'agent' || entityType === 'service_account'}
	<GrantNhiPermissionDialog bind:open={showGrantNhiDialog} sourceId={nhiId} onGrant={handleGrantNhi} />
{/if}

<GrantUserPermissionDialog bind:open={showGrantUserDialog} {nhiId} onGrant={handleGrantUser} />

<!-- Revoke Confirmation Dialog -->
<Dialog.Root bind:open={revokeDialogOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Confirm Revoke</Dialog.Title>
			<Dialog.Description>
				{#if revokeTarget}
					Are you sure you want to revoke access for
					<code class="rounded bg-muted px-1 text-xs">{revokeTarget.label}</code>?
					This action cannot be undone.
				{/if}
			</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer>
			<Button
				variant="outline"
				onclick={() => {
					revokeDialogOpen = false;
					revokeTarget = null;
				}}
				disabled={isRevoking}
			>
				Cancel
			</Button>
			<Button variant="destructive" onclick={handleRevoke} disabled={isRevoking}>
				{isRevoking ? 'Revoking...' : 'Revoke'}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
