import { z } from 'zod/v3';

export const CONNECTOR_TYPES = ['ldap', 'database', 'rest'] as const;
export const DATABASE_DRIVERS = ['postgres', 'mysql', 'mssql', 'oracle'] as const;
export const AUTH_TYPES = ['bearer', 'basic', 'api_key', 'none'] as const;

export const createConnectorSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	description: z.string().optional(),
	connector_type: z.enum(CONNECTOR_TYPES, { required_error: 'Connector type is required' }),
	// LDAP config fields
	host: z.string().optional(),
	port: z.coerce.number().optional(),
	bind_dn: z.string().optional(),
	bind_password: z.string().optional(),
	base_dn: z.string().optional(),
	use_ssl: z.string().optional(),
	search_filter: z.string().optional(),
	// Database config fields
	database: z.string().optional(),
	username: z.string().optional(),
	password: z.string().optional(),
	driver: z.string().optional(),
	query: z.string().optional(),
	// REST API config fields
	base_url: z.string().optional(),
	auth_type: z.string().optional(),
	auth_config: z.string().optional(),
	headers: z.string().optional()
});

export const editConnectorSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	description: z.string().optional()
});
