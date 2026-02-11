// Auth Request Types (mirror Rust DTOs)

export interface SignupRequest {
	email: string;
	password: string;
	display_name?: string;
}

export interface LoginRequest {
	email: string;
	password: string;
}

export interface RefreshRequest {
	refresh_token: string;
}

export interface LogoutRequest {
	refresh_token: string;
}

export interface ForgotPasswordRequest {
	email: string;
}

export interface ResetPasswordRequest {
	token: string;
	new_password: string;
}

export interface VerifyEmailRequest {
	token: string;
}

// Auth Response Types

export interface SignupResponse {
	user_id: string;
	email: string;
	email_verified: boolean;
	access_token: string;
	token_type: string;
	expires_in: number;
}

export interface TokenResponse {
	access_token: string;
	refresh_token: string;
	token_type: string;
	expires_in: number;
}

export interface ForgotPasswordResponse {
	message: string;
}

export interface ResetPasswordResponse {
	message: string;
}

export interface VerifyEmailResponse {
	message: string;
	already_verified: boolean;
}

// Tenant Types

export interface ProvisionTenantRequest {
	organization_name: string;
}

export interface ProvisionTokenInfo {
	access_token: string;
	refresh_token: string;
	token_type: string;
	expires_in: number;
}

export interface ProvisionTenantResponse {
	tenant: TenantInfo;
	admin: AdminInfo;
	oauth_client: OAuthClientInfo;
	endpoints: EndpointInfo;
	tokens: ProvisionTokenInfo;
	next_steps: string[];
}

export interface TenantInfo {
	id: string;
	slug: string;
	name: string;
}

export interface AdminInfo {
	id: string;
	email: string;
	api_key: string;
}

export interface OAuthClientInfo {
	client_id: string;
	client_secret: string;
}

export interface EndpointInfo {
	api: string;
	auth: string;
}

// User Types (mirror Rust DTOs from xavyo-api-users)

export interface UserResponse {
	id: string;
	email: string;
	is_active: boolean;
	email_verified: boolean;
	roles: string[];
	created_at: string;
	updated_at: string;
	custom_attributes: Record<string, unknown>;
}

export interface UserListResponse {
	users: UserResponse[];
	pagination: PaginationMeta;
}

export interface PaginationMeta {
	total_count: number;
	offset: number;
	limit: number;
	has_more: boolean;
}

export interface CreateUserRequest {
	email: string;
	password: string;
	roles: string[];
	username?: string;
}

export interface UpdateUserRequest {
	email?: string;
	roles?: string[];
	is_active?: boolean;
	username?: string;
}

// Persona & Archetype Types (mirror Rust governance DTOs)

export type PersonaStatus = 'draft' | 'active' | 'expiring' | 'expired' | 'suspended' | 'archived';

export interface ArchetypeResponse {
	id: string;
	name: string;
	description: string | null;
	naming_pattern: string;
	attribute_mappings: Record<string, unknown>;
	default_entitlements: Record<string, unknown> | null;
	lifecycle_policy: LifecyclePolicyResponse;
	is_active: boolean;
	personas_count: number | null;
	created_at: string;
	updated_at: string;
}

export interface LifecyclePolicyResponse {
	default_validity_days: number;
	max_validity_days: number;
	notification_before_expiry_days: number;
	auto_extension_allowed: boolean;
	extension_requires_approval: boolean;
	on_physical_user_deactivation: string;
}

export interface ArchetypeListResponse {
	items: ArchetypeResponse[];
	total: number;
	limit: number;
	offset: number;
}

export interface CreateArchetypeRequest {
	name: string;
	description?: string;
	naming_pattern: string;
	lifecycle_policy?: LifecyclePolicyRequest;
}

export interface LifecyclePolicyRequest {
	default_validity_days?: number;
	max_validity_days?: number;
	notification_before_expiry_days?: number;
	auto_extension_allowed?: boolean;
	extension_requires_approval?: boolean;
	on_physical_user_deactivation?: string;
}

export interface UpdateArchetypeRequest {
	name?: string;
	description?: string;
	naming_pattern?: string;
	lifecycle_policy?: LifecyclePolicyRequest;
	is_active?: boolean;
}

export interface PersonaResponse {
	id: string;
	archetype_id: string;
	archetype_name: string | null;
	physical_user_id: string;
	physical_user_name: string | null;
	persona_name: string;
	display_name: string;
	status: PersonaStatus;
	valid_from: string;
	valid_until: string | null;
	created_at: string;
	updated_at: string;
	deactivated_at: string | null;
}

export interface PersonaDetailResponse extends PersonaResponse {
	attributes: PersonaAttributesResponse;
}

export interface PersonaAttributesResponse {
	inherited: Record<string, unknown>;
	overrides: Record<string, unknown>;
	persona_specific: Record<string, unknown>;
	last_propagation_at: string | null;
}

export interface PersonaListResponse {
	items: PersonaResponse[];
	total: number;
	limit: number;
	offset: number;
}

export interface CreatePersonaRequest {
	archetype_id: string;
	physical_user_id: string;
	attribute_overrides?: Record<string, unknown>;
	valid_from?: string;
	valid_until?: string;
}

export interface UpdatePersonaRequest {
	display_name?: string;
	attribute_overrides?: Record<string, unknown>;
	valid_until?: string;
}

export interface DeactivatePersonaRequest {
	reason: string;
}

export interface ArchivePersonaRequest {
	reason: string;
}

// NHI Types (mirror Rust NHI DTOs)

export type NhiType = 'tool' | 'agent' | 'service_account';
export type NhiLifecycleState = 'active' | 'inactive' | 'suspended' | 'deprecated' | 'archived';

export interface NhiIdentityResponse {
	id: string;
	tenant_id: string;
	nhi_type: NhiType;
	name: string;
	description: string | null;
	owner_id: string | null;
	lifecycle_state: NhiLifecycleState;
	suspension_reason: string | null;
	expires_at: string | null;
	created_at: string;
	updated_at: string;
}

export interface NhiToolExtension {
	category: string | null;
	input_schema: Record<string, unknown>;
	output_schema: Record<string, unknown> | null;
	requires_approval: boolean;
	max_calls_per_hour: number | null;
	provider: string | null;
	provider_verified: boolean;
	checksum: string | null;
}

export interface NhiAgentExtension {
	agent_type: string;
	model_provider: string | null;
	model_name: string | null;
	model_version: string | null;
	max_token_lifetime_secs: number;
	requires_human_approval: boolean;
}

export interface NhiServiceAccountExtension {
	purpose: string;
	environment: string | null;
}

export interface NhiDetailResponse extends NhiIdentityResponse {
	tool?: NhiToolExtension;
	agent?: NhiAgentExtension;
	service_account?: NhiServiceAccountExtension;
}

export interface NhiListResponse {
	data: NhiIdentityResponse[];
	total: number;
	limit: number;
	offset: number;
}

export interface CreateToolRequest {
	name: string;
	description?: string;
	category?: string;
	input_schema: Record<string, unknown>;
	output_schema?: Record<string, unknown>;
	requires_approval?: boolean;
	max_calls_per_hour?: number;
	provider?: string;
}

export interface CreateAgentRequest {
	name: string;
	description?: string;
	agent_type: string;
	model_provider?: string;
	model_name?: string;
	model_version?: string;
	max_token_lifetime_secs?: number;
	requires_human_approval?: boolean;
}

export interface CreateServiceAccountRequest {
	name: string;
	description?: string;
	purpose: string;
	environment?: string;
}

export interface UpdateToolRequest {
	name?: string;
	description?: string;
	category?: string;
	input_schema?: Record<string, unknown>;
	output_schema?: Record<string, unknown>;
	requires_approval?: boolean;
	max_calls_per_hour?: number;
	provider?: string;
}

export interface UpdateAgentRequest {
	name?: string;
	description?: string;
	agent_type?: string;
	model_provider?: string;
	model_name?: string;
	model_version?: string;
	max_token_lifetime_secs?: number;
	requires_human_approval?: boolean;
}

export interface UpdateServiceAccountRequest {
	name?: string;
	description?: string;
	purpose?: string;
	environment?: string;
}

export interface NhiCredentialResponse {
	id: string;
	nhi_id: string;
	credential_type: string;
	valid_from: string;
	valid_until: string;
	is_active: boolean;
	created_at: string;
}

export interface CredentialIssuedResponse {
	credential: NhiCredentialResponse;
	secret: string;
}

export interface IssueCredentialRequest {
	credential_type: string;
	valid_days?: number;
}

export interface RotateCredentialRequest {
	grace_period_hours?: number;
}

export interface SuspendNhiRequest {
	reason?: string;
}

// JWT Claims

export interface JwtClaims {
	sub: string;
	iss: string;
	aud: string[];
	exp: number;
	iat: number;
	jti: string;
	tid?: string;
	roles: string[];
	purpose?: string;
	email?: string;
}
