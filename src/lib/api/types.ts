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

// Security & Self-Service Types (mirror Rust DTOs from xavyo-api-auth)

export type MfaMethod = 'totp' | 'webauthn' | 'recovery';

export interface UserProfile {
	id: string;
	email: string;
	display_name: string | null;
	first_name: string | null;
	last_name: string | null;
	avatar_url: string | null;
	email_verified: boolean;
	created_at: string;
}

export interface UpdateProfileRequest {
	display_name?: string;
	first_name?: string;
	last_name?: string;
	avatar_url?: string;
}

export interface PasswordChangeRequest {
	current_password: string;
	new_password: string;
	revoke_other_sessions: boolean;
}

export interface PasswordChangeResponse {
	message: string;
	sessions_revoked: number;
}

export interface MfaStatus {
	totp_enabled: boolean;
	webauthn_enabled: boolean;
	recovery_codes_remaining: number;
	available_methods: MfaMethod[];
	setup_at: string | null;
	last_used_at: string | null;
}

export interface TotpSetupResponse {
	secret: string;
	otpauth_uri: string;
	qr_code: string;
}

export interface TotpVerifySetupRequest {
	code: string;
}

export interface TotpVerifySetupResponse {
	recovery_codes: string[];
	message: string;
}

export interface TotpDisableRequest {
	password: string;
	code: string;
}

export interface MfaDisableResponse {
	message: string;
}

export interface RecoveryRegenerateRequest {
	password: string;
}

export interface RecoveryCodesResponse {
	recovery_codes: string[];
	message: string;
}

export interface WebAuthnCredential {
	id: string;
	name: string;
	created_at: string;
}

export interface WebAuthnCredentialList {
	credentials: WebAuthnCredential[];
	count: number;
}

export interface StartRegistrationRequest {
	name?: string;
}

export interface RegistrationResponse {
	credential: WebAuthnCredential;
	message: string;
}

export interface UpdateCredentialRequest {
	name: string;
}

export interface SessionInfo {
	id: string;
	device_name: string | null;
	device_type: string | null;
	browser: string | null;
	os: string | null;
	ip_address: string | null;
	is_current: boolean;
	created_at: string;
	last_activity_at: string;
}

export interface SessionList {
	sessions: SessionInfo[];
	total: number;
}

export interface RevokeAllSessionsResponse {
	revoked_count: number;
	message: string;
}

export interface DeviceInfo {
	id: string;
	device_fingerprint: string;
	device_name: string | null;
	device_type: string | null;
	browser: string | null;
	browser_version: string | null;
	os: string | null;
	os_version: string | null;
	is_trusted: boolean;
	trust_expires_at: string | null;
	first_seen_at: string;
	last_seen_at: string;
	login_count: number;
	is_current: boolean | null;
}

export interface DeviceList {
	items: DeviceInfo[];
	total: number;
}

export interface TrustDeviceRequest {
	trust_duration_days?: number;
}

export interface TrustDeviceResponse {
	id: string;
	is_trusted: boolean;
	trust_expires_at: string | null;
}

export interface RenameDeviceRequest {
	device_name: string;
}

export interface RenameDeviceResponse {
	id: string;
	device_name: string;
}

export interface EmailChangeRequest {
	new_email: string;
	current_password: string;
}

export interface EmailChangeInitiatedResponse {
	message: string;
	expires_at: string;
}

export interface EmailVerifyChangeRequest {
	token: string;
}

export interface EmailChangeCompletedResponse {
	message: string;
	new_email: string;
}

export interface SecurityOverview {
	mfa_enabled: boolean;
	mfa_methods: string[];
	trusted_devices_count: number;
	active_sessions_count: number;
	last_password_change: string | null;
	recent_security_alerts_count: number;
	password_expires_at: string | null;
}

// Audit & Compliance Types (mirror Rust DTOs from xavyo-api-auth)

export type AlertType =
	| 'new_device'
	| 'new_location'
	| 'failed_attempts'
	| 'password_change'
	| 'mfa_disabled';

export type AlertSeverity = 'info' | 'warning' | 'critical';

export type AuthMethod = 'password' | 'social' | 'sso' | 'mfa' | 'refresh';

export interface LoginAttempt {
	id: string;
	user_id: string | null;
	email: string;
	success: boolean;
	failure_reason: string | null;
	auth_method: string;
	ip_address: string | null;
	user_agent: string | null;
	device_fingerprint: string | null;
	geo_country: string | null;
	geo_city: string | null;
	is_new_device: boolean;
	is_new_location: boolean;
	created_at: string;
}

export interface SecurityAlert {
	id: string;
	user_id: string;
	alert_type: AlertType;
	severity: AlertSeverity;
	title: string;
	message: string;
	metadata: Record<string, unknown>;
	acknowledged_at: string | null;
	created_at: string;
}

export interface CursorPaginatedResponse<T> {
	items: T[];
	total: number;
	next_cursor: string | null;
}

export interface SecurityAlertsResponse extends CursorPaginatedResponse<SecurityAlert> {
	unacknowledged_count: number;
}

export interface FailureReasonCount {
	reason: string;
	count: number;
}

export interface HourlyCount {
	hour: number;
	count: number;
}

export interface LoginAttemptStats {
	total_attempts: number;
	successful_attempts: number;
	failed_attempts: number;
	success_rate: number;
	failure_reasons: FailureReasonCount[];
	hourly_distribution: HourlyCount[];
	unique_users: number;
	new_device_logins: number;
	new_location_logins: number;
}

// Identity Federation Types (mirror Rust DTOs from xavyo-api-oidc-federation, xavyo-api-saml, xavyo-api-social)

// OIDC Identity Provider

export interface ClaimMappingConfig {
	[key: string]: string;
}

export interface IdentityProvider {
	id: string;
	name: string;
	provider_type: string;
	issuer_url: string;
	client_id: string;
	scopes: string;
	claim_mapping: ClaimMappingConfig | null;
	sync_on_login: boolean;
	is_enabled: boolean;
	validation_status: string | null;
	last_validated_at: string | null;
	linked_users_count?: number;
	domains?: IdentityProviderDomain[];
	created_at: string;
	updated_at: string;
}

export interface IdentityProviderDomain {
	id: string;
	domain: string;
	priority: number;
	created_at: string;
}

export interface IdentityProviderListResponse {
	items: IdentityProvider[];
	total: number;
	offset: number;
	limit: number;
}

export interface DomainListResponse {
	items: IdentityProviderDomain[];
}

export interface CreateIdentityProviderRequest {
	name: string;
	provider_type: string;
	issuer_url: string;
	client_id: string;
	client_secret: string;
	scopes?: string;
	claim_mapping?: ClaimMappingConfig;
	sync_on_login?: boolean;
	domains?: string[];
}

export interface UpdateIdentityProviderRequest {
	name?: string;
	provider_type?: string;
	issuer_url?: string;
	client_id?: string;
	client_secret?: string;
	scopes?: string;
	claim_mapping?: ClaimMappingConfig;
	sync_on_login?: boolean;
}

export interface ToggleIdentityProviderRequest {
	is_enabled: boolean;
}

export interface CreateDomainRequest {
	domain: string;
	priority?: number;
}

export interface DiscoveredEndpoints {
	authorization_endpoint: string;
	token_endpoint: string;
	userinfo_endpoint: string;
	jwks_uri: string;
}

export interface ValidationResult {
	is_valid: boolean;
	discovered_endpoints: DiscoveredEndpoints | null;
	error: string | null;
}

// SAML Service Provider

export interface ServiceProvider {
	id: string;
	name: string;
	entity_id: string;
	acs_urls: string[];
	certificate: string | null;
	attribute_mapping: Record<string, unknown> | null;
	name_id_format: string | null;
	sign_assertions: boolean;
	validate_signatures: boolean;
	assertion_validity_seconds: number;
	enabled: boolean;
	metadata_url: string | null;
	created_at: string;
	updated_at: string;
}

export interface ServiceProviderListResponse {
	items: ServiceProvider[];
	total: number;
	offset: number;
	limit: number;
}

export interface CreateServiceProviderRequest {
	name: string;
	entity_id: string;
	acs_urls: string[];
	certificate?: string;
	attribute_mapping?: Record<string, unknown>;
	name_id_format?: string;
	sign_assertions?: boolean;
	validate_signatures?: boolean;
	assertion_validity_seconds?: number;
	metadata_url?: string;
}

export interface UpdateServiceProviderRequest {
	name?: string;
	entity_id?: string;
	acs_urls?: string[];
	certificate?: string;
	attribute_mapping?: Record<string, unknown>;
	name_id_format?: string;
	sign_assertions?: boolean;
	validate_signatures?: boolean;
	assertion_validity_seconds?: number;
	enabled?: boolean;
	metadata_url?: string;
}

// SAML Certificates

export interface IdPCertificate {
	id: string;
	key_id: string;
	subject_dn: string | null;
	issuer_dn: string | null;
	not_before: string | null;
	not_after: string | null;
	is_active: boolean;
	created_at: string;
}

export interface CertificateListResponse {
	items: IdPCertificate[];
}

export interface UploadCertificateRequest {
	certificate: string;
	private_key: string;
	key_id: string;
	subject_dn?: string;
	issuer_dn?: string;
	not_before?: string;
	not_after?: string;
}

// Social Login

export interface SocialProviderConfig {
	provider: string;
	enabled: boolean;
	client_id: string | null;
	has_client_secret: boolean;
	scopes: string[];
	additional_config: Record<string, unknown> | null;
	created_at: string | null;
	updated_at: string | null;
}

export interface SocialProviderListResponse {
	providers: SocialProviderConfig[];
}

export interface UpdateSocialProviderRequest {
	enabled?: boolean;
	client_id?: string;
	client_secret?: string;
	scopes?: string[];
	additional_config?: Record<string, unknown>;
}

export interface SocialConnection {
	id: string;
	provider: string;
	email: string | null;
	display_name: string | null;
	is_private_email: boolean;
	created_at: string;
}

export interface SocialConnectionsResponse {
	connections: SocialConnection[];
}

export interface LinkAccountRequest {
	code: string;
	state: string;
}

// Governance Types (mirror Rust DTOs from xavyo-governance)

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type EntitlementStatus = 'active' | 'inactive' | 'suspended';
export type DataProtectionClassification = 'none' | 'personal' | 'sensitive' | 'special_category';
export type LegalBasis =
	| 'consent'
	| 'contract'
	| 'legal_obligation'
	| 'vital_interest'
	| 'public_task'
	| 'legitimate_interest';

export type AccessRequestStatus =
	| 'pending'
	| 'pending_approval'
	| 'approved'
	| 'provisioned'
	| 'rejected'
	| 'cancelled'
	| 'expired'
	| 'failed';

export type SodRuleStatus = 'active' | 'inactive';

export type CampaignStatus = 'draft' | 'active' | 'completed' | 'cancelled' | 'overdue';
export type CampaignScopeType = 'all_users' | 'department' | 'application' | 'entitlement';
export type CampaignReviewerType =
	| 'user_manager'
	| 'application_owner'
	| 'entitlement_owner'
	| 'specific_users';

export type CertificationItemStatus = 'pending' | 'approved' | 'revoked' | 'skipped';
export type CertificationDecision = 'approved' | 'revoked';

export type RiskDirection = 'increasing' | 'stable' | 'decreasing';

// Entitlement

export interface EntitlementResponse {
	id: string;
	tenant_id: string;
	application_id: string;
	name: string;
	description: string | null;
	risk_level: RiskLevel;
	status: EntitlementStatus;
	owner_id: string | null;
	external_id: string | null;
	metadata: Record<string, unknown> | null;
	is_delegable: boolean;
	data_protection_classification: DataProtectionClassification;
	legal_basis: LegalBasis | null;
	retention_period_days: number | null;
	data_controller: string | null;
	data_processor: string | null;
	purposes: string[] | null;
	created_at: string;
	updated_at: string;
}

export interface EntitlementListResponse {
	items: EntitlementResponse[];
	total: number;
	limit: number;
	offset: number;
}

export interface CreateEntitlementRequest {
	application_id: string;
	name: string;
	description?: string;
	risk_level: RiskLevel;
	owner_id?: string;
	external_id?: string;
	metadata?: Record<string, unknown>;
	is_delegable?: boolean;
	data_protection_classification: DataProtectionClassification;
	legal_basis?: LegalBasis;
	retention_period_days?: number;
	data_controller?: string;
	data_processor?: string;
	purposes?: string[];
}

export interface UpdateEntitlementRequest {
	application_id?: string;
	name?: string;
	description?: string;
	risk_level?: RiskLevel;
	status?: EntitlementStatus;
	owner_id?: string;
	external_id?: string;
	metadata?: Record<string, unknown>;
	is_delegable?: boolean;
	data_protection_classification?: DataProtectionClassification;
	legal_basis?: LegalBasis;
	retention_period_days?: number;
	data_controller?: string;
	data_processor?: string;
	purposes?: string[];
}

export interface SetEntitlementOwnerRequest {
	owner_id: string;
}

// Access Requests

export interface SodViolationInfo {
	rule_id: string;
	rule_name: string;
	severity: RiskLevel;
	first_entitlement_id: string;
	second_entitlement_id: string;
	user_already_has: string;
}

export interface AccessRequestResponse {
	id: string;
	requester_id: string;
	entitlement_id: string;
	workflow_id: string | null;
	current_step: number;
	status: AccessRequestStatus;
	justification: string;
	requested_expires_at: string | null;
	has_sod_warning: boolean;
	sod_violations: SodViolationInfo[];
	provisioned_assignment_id: string | null;
	created_at: string;
	updated_at: string;
	expires_at: string | null;
}

export interface AccessRequestListResponse {
	items: AccessRequestResponse[];
	total: number;
	limit: number;
	offset: number;
}

export interface CreateAccessRequestRequest {
	entitlement_id: string;
	justification: string;
	requested_expires_at?: string;
}

export interface CreateAccessRequestResponse {
	request: AccessRequestResponse;
	sod_warning_message?: string;
}

export interface ApproveAccessRequestRequest {
	notes?: string;
}

export interface RejectAccessRequestRequest {
	reason: string;
}

// SoD Rules

export interface SodRuleResponse {
	id: string;
	name: string;
	description: string | null;
	first_entitlement_id: string;
	second_entitlement_id: string;
	severity: RiskLevel;
	status: SodRuleStatus;
	business_rationale: string | null;
	created_by: string;
	created_at: string;
	updated_at: string;
}

export interface SodRuleListResponse {
	items: SodRuleResponse[];
	total: number;
	limit: number;
	offset: number;
}

export interface CreateSodRuleRequest {
	name: string;
	description?: string;
	first_entitlement_id: string;
	second_entitlement_id: string;
	severity: RiskLevel;
	business_rationale?: string;
}

export interface UpdateSodRuleRequest {
	name?: string;
	description?: string;
	first_entitlement_id?: string;
	second_entitlement_id?: string;
	severity?: RiskLevel;
	business_rationale?: string;
}

export interface SodViolationResponse {
	rule_id: string;
	rule_name: string;
	severity: RiskLevel;
	first_entitlement_id: string;
	second_entitlement_id: string;
	user_id: string;
	user_already_has: string;
}

export interface SodViolationListResponse {
	items: SodViolationResponse[];
	total: number;
	limit: number;
	offset: number;
}

export interface SodCheckRequest {
	entitlement_id: string;
	user_id: string;
}

export interface SodCheckResponse {
	has_violations: boolean;
	violations: SodViolationInfo[];
}

// Certification Campaigns

export interface CampaignScopeConfig {
	application_id?: string;
	entitlement_id?: string;
	department?: string;
}

export interface CertificationCampaignResponse {
	id: string;
	tenant_id: string;
	name: string;
	description: string | null;
	scope_type: CampaignScopeType;
	scope_config: CampaignScopeConfig;
	reviewer_type: CampaignReviewerType;
	status: CampaignStatus;
	deadline: string;
	launched_at: string | null;
	completed_at: string | null;
	created_by: string;
	created_at: string;
	updated_at: string;
}

export interface CertificationCampaignListResponse {
	items: CertificationCampaignResponse[];
	total: number;
	limit: number;
	offset: number;
}

export interface CreateCampaignRequest {
	name: string;
	description?: string;
	scope_type: CampaignScopeType;
	scope_config?: CampaignScopeConfig;
	reviewer_type: CampaignReviewerType;
	specific_reviewers?: string[];
	deadline: string;
}

export interface UpdateCampaignRequest {
	name?: string;
	description?: string;
	scope_type?: CampaignScopeType;
	scope_config?: CampaignScopeConfig;
	reviewer_type?: CampaignReviewerType;
	specific_reviewers?: string[];
	deadline?: string;
}

export interface CampaignProgressResponse {
	total_items: number;
	pending_items: number;
	approved_items: number;
	revoked_items: number;
	completion_percentage: number;
}

export interface CertificationItemResponse {
	id: string;
	campaign_id: string;
	user_id: string;
	entitlement_id: string;
	reviewer_id: string;
	status: CertificationItemStatus;
	assignment_snapshot: Record<string, unknown> | null;
	decided_at: string | null;
	created_at: string;
	updated_at: string;
}

export interface CertificationItemListResponse {
	items: CertificationItemResponse[];
	total: number;
	limit: number;
	offset: number;
}

export interface CertificationDecisionRequest {
	decision: CertificationDecision;
	notes?: string;
}

// Risk Scoring

export interface FactorContribution {
	factor_name: string;
	score: number;
	weight: number;
	description: string | null;
}

export interface PeerComparison {
	percentile: number;
	peer_group_average: number;
	peer_group_size: number;
}

export interface RiskScoreResponse {
	id: string;
	user_id: string;
	total_score: number;
	risk_level: RiskLevel;
	static_score: number;
	dynamic_score: number;
	factor_breakdown: FactorContribution[];
	peer_comparison: PeerComparison | null;
	calculated_at: string;
	created_at: string;
	updated_at: string;
}

export interface RiskScoreListResponse {
	items: RiskScoreResponse[];
	total: number;
	limit: number;
	offset: number;
}

export interface RiskLevelCount {
	level: RiskLevel;
	count: number;
}

export interface RiskScoreSummary {
	by_level: RiskLevelCount[];
	total_users: number;
	average_score: number;
}

export interface RiskHistoryEntry {
	snapshot_date: string;
	score: number;
	risk_level: RiskLevel;
}

export interface RiskTrendResponse {
	score_30d_ago?: number;
	score_60d_ago?: number;
	score_90d_ago?: number;
	change_30d?: number;
	change_60d?: number;
	change_90d?: number;
	direction: RiskDirection;
}

export interface RiskScoreHistoryResponse {
	user_id: string;
	current_score: number;
	trend: RiskTrendResponse;
	history: RiskHistoryEntry[];
}

export interface RiskAlertsSummary {
	total_alerts: number;
	unread_count: number;
	by_severity: {
		low: number;
		medium: number;
		high: number;
		critical: number;
	};
}

export interface RiskAlertResponse {
	id: string;
	user_id: string;
	alert_type: string;
	severity: RiskLevel;
	title: string;
	message: string;
	metadata: Record<string, unknown>;
	acknowledged_at: string | null;
	created_at: string;
}

export interface RiskAlertListResponse {
	items: RiskAlertResponse[];
	total: number;
	limit: number;
	offset: number;
}

// --- Governance Applications ---

export type AppType = 'internal' | 'external';
export type AppStatus = 'active' | 'inactive';

export interface ApplicationResponse {
	id: string;
	tenant_id: string;
	name: string;
	app_type: AppType;
	status: AppStatus;
	description: string | null;
	owner_id: string | null;
	external_id: string | null;
	metadata: Record<string, unknown> | null;
	is_delegable: boolean;
	created_at: string;
	updated_at: string;
}

export interface ApplicationListResponse {
	items: ApplicationResponse[];
	total: number;
	limit: number;
	offset: number;
}

// --- NHI Protocol Types (MCP, A2A, Permissions, Agent Card) ---

// MCP Types

export interface McpTool {
	name: string;
	description: string | null;
	input_schema: Record<string, unknown>;
	status: string;
	deprecated: boolean | null;
}

export interface McpToolsResponse {
	tools: McpTool[];
}

export interface McpContext {
	conversation_id?: string;
	session_id?: string;
	user_instruction?: string;
}

export interface McpCallRequest {
	parameters: Record<string, unknown>;
	context?: McpContext;
}

export interface McpCallResponse {
	call_id: string;
	result: Record<string, unknown>;
	latency_ms: number;
}

export type McpErrorCode =
	| 'InvalidParameters'
	| 'Unauthorized'
	| 'NotFound'
	| 'RateLimitExceeded'
	| 'ExecutionFailed'
	| 'Timeout'
	| 'InternalError';

export interface McpErrorResponse {
	error_code: McpErrorCode;
	message: string;
	details: Record<string, unknown> | null;
}

// A2A Types

export type A2aTaskState = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface A2aTaskResponse {
	id: string;
	source_agent_id: string | null;
	target_agent_id: string | null;
	task_type: string;
	state: A2aTaskState;
	result: Record<string, unknown> | null;
	error_code: string | null;
	error_message: string | null;
	created_at: string;
	started_at: string | null;
	completed_at: string | null;
}

export interface A2aTaskListResponse {
	tasks: A2aTaskResponse[];
	total: number;
	limit: number;
	offset: number;
}

export interface CreateA2aTaskRequest {
	target_agent_id: string;
	task_type: string;
	input: Record<string, unknown>;
	callback_url?: string;
	source_agent_id?: string;
}

export interface CreateA2aTaskResponse {
	task_id: string;
	status: string;
	created_at: string;
}

export interface CancelA2aTaskResponse {
	task_id: string;
	state: string;
	cancelled_at: string;
}

// NHI Permission Types

export interface NhiToolPermission {
	id: string;
	agent_nhi_id: string;
	tool_nhi_id: string;
	expires_at: string | null;
	granted_at: string;
	granted_by: string;
}

export interface GrantToolPermissionRequest {
	expires_at?: string;
}

export interface NhiNhiPermission {
	id: string;
	source_nhi_id: string;
	target_nhi_id: string;
	permission_type: string;
	allowed_actions: Record<string, unknown> | null;
	max_calls_per_hour: number | null;
	expires_at: string | null;
	granted_at: string;
	granted_by: string | null;
}

export interface GrantNhiPermissionRequest {
	permission_type: string;
	allowed_actions?: Record<string, unknown>;
	max_calls_per_hour?: number;
	expires_at?: string;
}

export interface NhiUserPermission {
	id: string;
	nhi_id: string;
	user_id: string;
	permission_type: string;
	granted_at: string;
	granted_by: string | null;
	expires_at: string | null;
}

export interface RevokeResponse {
	revoked: boolean;
}

export interface PaginatedPermissionResponse<T> {
	data: T[];
	limit: number;
	offset: number;
}

// Agent Card Types

export interface AgentCapabilities {
	streaming: boolean;
	push_notifications: boolean;
}

export interface AgentAuthentication {
	schemes: string[];
}

export interface AgentSkill {
	id: string;
	name: string;
	description: string | null;
}

export interface AgentCard {
	name: string;
	description: string | null;
	url: string;
	version: string;
	protocol_version: string;
	capabilities: AgentCapabilities;
	authentication: AgentAuthentication;
	skills: AgentSkill[];
}
