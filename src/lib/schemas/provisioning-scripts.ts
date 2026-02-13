import { z } from 'zod/v3';

// Create provisioning script (name + description only, body goes via version)
export const createProvisioningScriptSchema = z.object({
	name: z.string().min(1, 'Name is required').max(200),
	description: z.string().max(2000).optional().default('')
});

// Update provisioning script metadata
export const updateProvisioningScriptSchema = z.object({
	name: z.string().min(1, 'Name is required').max(200),
	description: z.string().max(2000).optional().default('')
});

// Create a new script version
export const createScriptVersionSchema = z.object({
	script_body: z.string().min(1, 'Script body is required'),
	change_description: z.string().max(500).optional().default('')
});

// Rollback a script
export const rollbackScriptSchema = z.object({
	target_version: z.coerce.number().int().min(1, 'Target version is required'),
	reason: z.string().max(500).optional().default('')
});

// Create a hook binding
export const createHookBindingSchema = z.object({
	script_id: z.string().uuid('Invalid script ID'),
	connector_id: z.string().uuid('Invalid connector ID'),
	hook_phase: z.enum(['before', 'after']),
	operation_type: z.enum(['create', 'update', 'delete', 'enable', 'disable']),
	execution_order: z.coerce.number().int().min(0).default(0),
	failure_policy: z.enum(['abort', 'continue', 'retry']).default('abort'),
	max_retries: z.coerce.number().int().min(0).max(10).optional(),
	timeout_seconds: z.coerce.number().int().min(1).max(3600).optional()
});

// Update a hook binding
export const updateHookBindingSchema = z.object({
	execution_order: z.coerce.number().int().min(0).optional(),
	failure_policy: z.enum(['abort', 'continue', 'retry']).optional(),
	max_retries: z.coerce.number().int().min(0).max(10).optional(),
	timeout_seconds: z.coerce.number().int().min(1).max(3600).optional(),
	enabled: z.boolean().optional()
});

// Create a script template
export const createScriptTemplateSchema = z.object({
	name: z.string().min(1, 'Name is required').max(200),
	description: z.string().max(2000).optional().default(''),
	category: z.enum([
		'attribute_mapping',
		'value_generation',
		'conditional_logic',
		'data_formatting',
		'custom'
	]),
	template_body: z.string().min(1, 'Template body is required'),
	placeholder_annotations: z.string().optional().default('')
});

// Update a script template
export const updateScriptTemplateSchema = z.object({
	name: z.string().min(1, 'Name is required').max(200),
	description: z.string().max(2000).optional().default(''),
	category: z.enum([
		'attribute_mapping',
		'value_generation',
		'conditional_logic',
		'data_formatting',
		'custom'
	]),
	template_body: z.string().min(1, 'Template body is required'),
	placeholder_annotations: z.string().optional().default('')
});

// Instantiate a template into a new script
export const instantiateTemplateSchema = z.object({
	name: z.string().min(1, 'Script name is required').max(200),
	description: z.string().max(2000).optional().default('')
});

// Validate script syntax
export const validateScriptSchema = z.object({
	script_body: z.string().min(1, 'Script body is required')
});

// Dry-run script
export const dryRunScriptSchema = z.object({
	context: z.string().min(1, 'Context JSON is required')
});
