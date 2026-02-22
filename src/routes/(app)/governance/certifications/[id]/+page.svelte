<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { invalidateAll } from '$app/navigation';
	import { enhance as formEnhance } from '$app/forms';
	import { Card, CardHeader, CardContent } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import { Separator } from '$lib/components/ui/separator';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import CampaignProgress from '$lib/components/governance/campaign-progress.svelte';
	import { addToast } from '$lib/stores/toast.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const isDraft = $derived(data.campaign.status === 'draft');
	const isActive = $derived(data.campaign.status === 'active');

	// svelte-ignore state_referenced_locally
	const { form, errors, enhance, message } = superForm(data.form, {
		onResult({ result }) {
			if (result.type === 'success' && result.data?.updated) {
				addToast('success', 'Campaign updated successfully');
				invalidateAll();
			}
		}
	});

	const scopeType = $derived(String($form.scope_type ?? ''));

	const campaignStatusStyles: Record<string, string> = {
		draft: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
		active: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
		completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
		cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
		overdue: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
	};

	const campaignStatusLabels: Record<string, string> = {
		draft: 'Draft',
		active: 'Active',
		completed: 'Completed',
		cancelled: 'Cancelled',
		overdue: 'Overdue'
	};

	const itemStatusStyles: Record<string, string> = {
		pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
		approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
		revoked: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
		skipped: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
	};

	const itemStatusLabels: Record<string, string> = {
		pending: 'Pending',
		approved: 'Approved',
		revoked: 'Revoked',
		skipped: 'Skipped'
	};

	const scopeTypeLabels: Record<string, string> = {
		all_users: 'All Users',
		department: 'Department',
		application: 'Application',
		entitlement: 'Entitlement'
	};

	const reviewerTypeLabels: Record<string, string> = {
		user_manager: 'User Manager',
		application_owner: 'Application Owner',
		entitlement_owner: 'Entitlement Owner',
		specific_users: 'Specific Users'
	};
</script>

<div class="flex items-center gap-2 mb-2">
	<a href="/governance" class="text-sm text-muted-foreground hover:underline">&larr; Back to Governance</a>
</div>

<PageHeader title={data.campaign.name} description={data.campaign.description ?? undefined} />

<!-- Campaign Info -->
<Card class="mb-6">
	<CardContent class="pt-6">
		<div class="flex flex-wrap gap-6 text-sm">
			<div>
				<span class="text-muted-foreground">Status</span>
				<div class="mt-1">
					<span
						class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {campaignStatusStyles[data.campaign.status] ?? 'bg-gray-100 text-gray-800'}"
					>
						{campaignStatusLabels[data.campaign.status] ?? data.campaign.status}
					</span>
				</div>
			</div>
			<div>
				<span class="text-muted-foreground">Scope</span>
				<p class="mt-1 font-medium">{scopeTypeLabels[data.campaign.scope_type] ?? data.campaign.scope_type}</p>
			</div>
			{#if data.campaign.scope_config}
				{#if data.campaign.scope_config.department}
					<div>
						<span class="text-muted-foreground">Department</span>
						<p class="mt-1 font-medium">{data.campaign.scope_config.department}</p>
					</div>
				{/if}
				{#if data.campaign.scope_config.application_id}
					<div>
						<span class="text-muted-foreground">Application ID</span>
						<p class="mt-1 font-medium font-mono text-xs">{data.campaign.scope_config.application_id}</p>
					</div>
				{/if}
				{#if data.campaign.scope_config.entitlement_id}
					<div>
						<span class="text-muted-foreground">Entitlement ID</span>
						<p class="mt-1 font-medium font-mono text-xs">{data.campaign.scope_config.entitlement_id}</p>
					</div>
				{/if}
			{/if}
			<div>
				<span class="text-muted-foreground">Reviewer</span>
				<p class="mt-1 font-medium">{reviewerTypeLabels[data.campaign.reviewer_type] ?? data.campaign.reviewer_type}</p>
			</div>
			<div>
				<span class="text-muted-foreground">Deadline</span>
				<p class="mt-1 font-medium">{new Date(data.campaign.deadline).toLocaleDateString()}</p>
			</div>
		</div>
	</CardContent>
</Card>

<!-- Progress -->
<Card class="mb-6">
	<CardHeader>
		<h2 class="text-lg font-semibold">Campaign Progress</h2>
	</CardHeader>
	<CardContent>
		<CampaignProgress progress={data.progress} />
	</CardContent>
</Card>

<!-- Actions -->
<Card class="mb-6">
	<CardHeader>
		<h2 class="text-lg font-semibold">Actions</h2>
	</CardHeader>
	<CardContent>
		<div class="flex flex-wrap gap-2">
			{#if isDraft}
				<form
					method="POST"
					action="?/launch"
					use:formEnhance={() => {
						return async ({ result, update }) => {
							if (result.type === 'success') {
								addToast('success', 'Campaign launched successfully');
								await invalidateAll();
							} else if (result.type === 'failure') {
								const errMsg = (result.data as Record<string, unknown>)?.error;
								addToast('error', String(errMsg ?? 'Failed to launch campaign'));
							}
							await update();
						};
					}}
				>
					<Button type="submit" variant="default">Launch Campaign</Button>
				</form>

				<form
					method="POST"
					action="?/delete"
					use:formEnhance={() => {
						return async ({ result, update }) => {
							if (result.type === 'redirect') {
								addToast('success', 'Campaign deleted');
							} else if (result.type === 'failure') {
								const errMsg = (result.data as Record<string, unknown>)?.error;
								addToast('error', String(errMsg ?? 'Failed to delete campaign'));
							}
							await update();
						};
					}}
				>
					<Button type="submit" variant="destructive">Delete Campaign</Button>
				</form>
			{/if}

			{#if isActive}
				<form
					method="POST"
					action="?/cancel"
					use:formEnhance={() => {
						return async ({ result, update }) => {
							if (result.type === 'success') {
								addToast('success', 'Campaign cancelled');
								await invalidateAll();
							} else if (result.type === 'failure') {
								const errMsg = (result.data as Record<string, unknown>)?.error;
								addToast('error', String(errMsg ?? 'Failed to cancel campaign'));
							}
							await update();
						};
					}}
				>
					<Button type="submit" variant="destructive">Cancel Campaign</Button>
				</form>
			{/if}
		</div>
	</CardContent>
</Card>

<!-- Edit form (draft only) -->
{#if isDraft}
	<Card class="mb-6">
		<CardHeader>
			<h2 class="text-lg font-semibold">Edit Campaign</h2>
		</CardHeader>
		<CardContent>
			{#if $message}
				<Alert variant="destructive" class="mb-4">
					<AlertDescription>{$message}</AlertDescription>
				</Alert>
			{/if}

			<form method="POST" action="?/update" use:enhance class="space-y-4">
				<div class="space-y-2">
					<Label for="name">Name</Label>
					<Input
						id="name"
						name="name"
						type="text"
						placeholder="Campaign name"
						value={String($form.name ?? '')}
					/>
					{#if $errors.name}
						<p class="text-sm text-destructive">{$errors.name}</p>
					{/if}
				</div>

				<div class="space-y-2">
					<Label for="description">Description (optional)</Label>
					<textarea
						id="description"
						name="description"
						class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
						placeholder="Brief description"
						value={String($form.description ?? '')}
					></textarea>
					{#if $errors.description}
						<p class="text-sm text-destructive">{$errors.description}</p>
					{/if}
				</div>

				<Separator class="my-4" />

				<div class="space-y-2">
					<Label for="scope_type">Scope type</Label>
					<select
						id="scope_type"
						name="scope_type"
						class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
						value={String($form.scope_type ?? '')}
					>
						<option value="">Select scope type</option>
						<option value="all_users">All Users</option>
						<option value="department">Department</option>
						<option value="application">Application</option>
						<option value="entitlement">Entitlement</option>
					</select>
					{#if $errors.scope_type}
						<p class="text-sm text-destructive">{$errors.scope_type}</p>
					{/if}
				</div>

				{#if scopeType === 'department'}
					<div class="space-y-2">
						<Label for="scope_config_department">Department</Label>
						<Input
							id="scope_config_department"
							name="scope_config_department"
							type="text"
							placeholder="e.g. Engineering"
							value={String($form.scope_config_department ?? '')}
						/>
						{#if $errors.scope_config_department}
							<p class="text-sm text-destructive">{$errors.scope_config_department}</p>
						{/if}
					</div>
				{/if}

				{#if scopeType === 'application'}
					<div class="space-y-2">
						<Label for="scope_config_application_id">Application ID</Label>
						<Input
							id="scope_config_application_id"
							name="scope_config_application_id"
							type="text"
							placeholder="UUID of the application"
							value={String($form.scope_config_application_id ?? '')}
						/>
						{#if $errors.scope_config_application_id}
							<p class="text-sm text-destructive">{$errors.scope_config_application_id}</p>
						{/if}
					</div>
				{/if}

				{#if scopeType === 'entitlement'}
					<div class="space-y-2">
						<Label for="scope_config_entitlement_id">Entitlement ID</Label>
						<Input
							id="scope_config_entitlement_id"
							name="scope_config_entitlement_id"
							type="text"
							placeholder="UUID of the entitlement"
							value={String($form.scope_config_entitlement_id ?? '')}
						/>
						{#if $errors.scope_config_entitlement_id}
							<p class="text-sm text-destructive">{$errors.scope_config_entitlement_id}</p>
						{/if}
					</div>
				{/if}

				<Separator class="my-4" />

				<div class="space-y-2">
					<Label for="reviewer_type">Reviewer type</Label>
					<select
						id="reviewer_type"
						name="reviewer_type"
						class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
						value={String($form.reviewer_type ?? '')}
					>
						<option value="">Select reviewer type</option>
						<option value="user_manager">User Manager</option>
						<option value="application_owner">Application Owner</option>
						<option value="entitlement_owner">Entitlement Owner</option>
						<option value="specific_users">Specific Users</option>
					</select>
					{#if $errors.reviewer_type}
						<p class="text-sm text-destructive">{$errors.reviewer_type}</p>
					{/if}
				</div>

				<Separator class="my-4" />

				<div class="space-y-2">
					<Label for="deadline">Deadline</Label>
					<Input
						id="deadline"
						name="deadline"
						type="date"
						value={String($form.deadline ?? '')}
					/>
					{#if $errors.deadline}
						<p class="text-sm text-destructive">{$errors.deadline}</p>
					{/if}
				</div>

				<div class="flex gap-2 pt-2">
					<Button type="submit">Save changes</Button>
				</div>
			</form>
		</CardContent>
	</Card>
{/if}

<!-- Certification Items -->
<Card>
	<CardHeader>
		<h2 class="text-lg font-semibold">Certification Items</h2>
	</CardHeader>
	<CardContent>
		{#if data.items.length === 0}
			<p class="text-sm text-muted-foreground">
				{#if isDraft}
					Items will be generated when the campaign is launched.
				{:else}
					No certification items found.
				{/if}
			</p>
		{:else}
			<div class="overflow-x-auto">
				<table class="w-full text-sm">
					<thead>
						<tr class="border-b text-left">
							<th class="pb-2 pr-4 font-medium text-muted-foreground">User ID</th>
							<th class="pb-2 pr-4 font-medium text-muted-foreground">Entitlement ID</th>
							<th class="pb-2 pr-4 font-medium text-muted-foreground">Status</th>
							<th class="pb-2 pr-4 font-medium text-muted-foreground">Decided at</th>
							{#if isActive}
								<th class="pb-2 font-medium text-muted-foreground">Actions</th>
							{/if}
						</tr>
					</thead>
					<tbody>
						{#each data.items as item (item.id)}
							<tr class="border-b last:border-0">
								<td class="py-3 pr-4 font-mono text-xs">{item.user_id}</td>
								<td class="py-3 pr-4 font-mono text-xs">{item.entitlement_id}</td>
								<td class="py-3 pr-4">
									<span
										class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {itemStatusStyles[item.status] ?? 'bg-gray-100 text-gray-800'}"
									>
										{itemStatusLabels[item.status] ?? item.status}
									</span>
								</td>
								<td class="py-3 pr-4 text-muted-foreground">
									{item.decided_at ? new Date(item.decided_at).toLocaleString() : '-'}
								</td>
								{#if isActive}
									<td class="py-3">
										{#if item.status === 'pending'}
											<div class="flex gap-1">
												<form
													method="POST"
													action="?/decide"
													use:formEnhance={() => {
														return async ({ result, update }) => {
															if (result.type === 'success') {
																addToast('success', 'Decision recorded');
																await invalidateAll();
															} else if (result.type === 'failure') {
																const errMsg = (result.data as Record<string, unknown>)?.error;
																addToast('error', String(errMsg ?? 'Failed to record decision'));
															}
															await update();
														};
													}}
												>
													<input type="hidden" name="item_id" value={item.id} />
													<input type="hidden" name="decision" value="approved" />
													<Button type="submit" variant="default" size="sm">Approve</Button>
												</form>
												<form
													method="POST"
													action="?/decide"
													use:formEnhance={() => {
														return async ({ result, update }) => {
															if (result.type === 'success') {
																addToast('success', 'Decision recorded');
																await invalidateAll();
															} else if (result.type === 'failure') {
																const errMsg = (result.data as Record<string, unknown>)?.error;
																addToast('error', String(errMsg ?? 'Failed to record decision'));
															}
															await update();
														};
													}}
												>
													<input type="hidden" name="item_id" value={item.id} />
													<input type="hidden" name="decision" value="revoked" />
													<Button type="submit" variant="destructive" size="sm">Revoke</Button>
												</form>
											</div>
										{:else}
											<span class="text-xs text-muted-foreground">--</span>
										{/if}
									</td>
								{/if}
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</CardContent>
</Card>
