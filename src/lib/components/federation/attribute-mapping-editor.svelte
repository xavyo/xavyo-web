<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label';
	import { Plus, Trash2 } from 'lucide-svelte';
	import {
		type AttributeMapping,
		AVAILABLE_SOURCES,
		NAME_ID_SOURCES,
		parseMapping,
		toMappingJson,
		createDefaultRow,
		createEmptyMapping
	} from '$lib/utils/attribute-mapping';

	interface Props {
		value: string;
		onchange: (value: string) => void;
	}

	let { value, onchange }: Props = $props();

	let showAdvanced = $state(false);
	let parseError = $state<string | null>(null);

	// svelte-ignore state_referenced_locally
	let mapping = $state<AttributeMapping>(
		parseMapping(value) ?? createEmptyMapping()
	);

	// svelte-ignore state_referenced_locally
	let advancedJson = $state(value || '');

	function serializeMapping(m: AttributeMapping): string {
		// Always emit if name_id_source has been set, even with 0 attribute rows
		if (m.attributes.length > 0 || m.name_id_source !== 'email') {
			return toMappingJson(m);
		}
		return '';
	}

	function emitChange() {
		const json = serializeMapping(mapping);
		advancedJson = json;
		parseError = null;
		onchange(json);
	}

	function handleNameIdSourceChange(e: Event) {
		mapping.name_id_source = (e.target as HTMLSelectElement).value;
		emitChange();
	}

	function addRow() {
		mapping.attributes = [...mapping.attributes, createDefaultRow()];
		emitChange();
	}

	function removeRow(index: number) {
		mapping.attributes = mapping.attributes.filter((_, i) => i !== index);
		emitChange();
	}

	function updateRowSource(index: number, newSource: string) {
		mapping.attributes[index].source = newSource;
		mapping.attributes[index].multi_value = newSource === 'groups';
		emitChange();
	}

	function updateRowTargetName(index: number, val: string) {
		mapping.attributes[index].target_name = val;
		emitChange();
	}

	function updateRowFriendlyName(index: number, val: string) {
		mapping.attributes[index].target_friendly_name = val;
		emitChange();
	}

	function handleAdvancedJsonChange(e: Event) {
		const raw = (e.target as HTMLTextAreaElement).value;
		advancedJson = raw;
		if (!raw.trim()) {
			mapping = createEmptyMapping();
			parseError = null;
			onchange('');
			return;
		}
		try {
			const parsed = JSON.parse(raw);
			if (parsed && typeof parsed === 'object' && 'name_id_source' in parsed) {
				mapping = {
					name_id_source: parsed.name_id_source ?? 'email',
					attributes: Array.isArray(parsed.attributes) ? parsed.attributes : []
				};
				parseError = null;
				onchange(raw);
			} else {
				parseError = 'JSON must have "name_id_source" and "attributes" fields';
				onchange(raw);
			}
		} catch {
			parseError = 'Invalid JSON';
			onchange(raw);
		}
	}
</script>

<div class="space-y-3">
	<div class="flex items-center justify-between">
		<Label>Attribute mapping</Label>
		<Button
			type="button"
			variant="ghost"
			size="sm"
			onclick={() => { showAdvanced = !showAdvanced; }}
		>
			{showAdvanced ? 'Visual editor' : 'Advanced (JSON)'}
		</Button>
	</div>

	{#if showAdvanced}
		<textarea
			name="attribute_mapping"
			rows="6"
			class="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 font-mono"
			placeholder={'{\n  "name_id_source": "email",\n  "attributes": []\n}'}
			value={advancedJson}
			oninput={handleAdvancedJsonChange}
		></textarea>
		{#if parseError}
			<p class="text-sm text-destructive">{parseError}</p>
		{/if}
	{:else}
		<p class="text-xs text-muted-foreground">Configure which user attributes are included in the SAML assertion sent to the SP.</p>

		<!-- NameID source -->
		<div class="space-y-1">
			<Label class="text-xs text-muted-foreground">NameID source</Label>
			<select
				class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
				value={mapping.name_id_source}
				onchange={handleNameIdSourceChange}
			>
				{#each NAME_ID_SOURCES as src}
					<option value={src}>{src}</option>
				{/each}
			</select>
		</div>

		<!-- Attribute rows -->
		{#if mapping.attributes.length > 0}
			<div class="space-y-2">
				<Label class="text-xs text-muted-foreground">Attributes</Label>
				{#each mapping.attributes as row, i}
					<div class="space-y-2 rounded-md border border-input p-3">
						<div class="flex items-center gap-2">
							<select
								class="h-8 rounded-md border border-input bg-transparent px-2 text-sm"
								value={row.source}
								onchange={(e) => updateRowSource(i, (e.target as HTMLSelectElement).value)}
							>
								{#each AVAILABLE_SOURCES as src}
									<option value={src}>{src}</option>
								{/each}
							</select>
							{#if row.multi_value}
								<span class="text-xs text-muted-foreground whitespace-nowrap" title="Multi-value attribute">multi</span>
							{/if}
							<div class="flex-1"></div>
							<Button type="button" variant="ghost" size="sm" onclick={() => removeRow(i)}>
								<Trash2 class="h-3.5 w-3.5 text-destructive" />
							</Button>
						</div>
						<div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
							<input
								type="text"
								placeholder="Target name (e.g. User.Email)"
								class="h-8 w-full rounded-md border border-input bg-transparent px-2 text-sm placeholder:text-muted-foreground"
								value={row.target_name}
								oninput={(e) => updateRowTargetName(i, (e.target as HTMLInputElement).value)}
							/>
							<input
								type="text"
								placeholder="Friendly name (e.g. Email)"
								class="h-8 w-full rounded-md border border-input bg-transparent px-2 text-sm placeholder:text-muted-foreground"
								value={row.target_friendly_name}
								oninput={(e) => updateRowFriendlyName(i, (e.target as HTMLInputElement).value)}
							/>
						</div>
					</div>
				{/each}
			</div>
		{/if}

		<Button type="button" variant="outline" size="sm" onclick={addRow}>
			<Plus class="mr-1.5 h-3.5 w-3.5" />Add attribute
		</Button>

		<!-- Hidden input so the form still submits the JSON value -->
		<input type="hidden" name="attribute_mapping" value={serializeMapping(mapping)} />
	{/if}
</div>
