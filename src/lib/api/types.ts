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
	last_activity_at: string | null;
	risk_score: number;
	last_certified_at: string | null;
	last_certified_by: string | null;
	next_certification_at: string | null;
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
	comments?: string;
}

export interface RejectAccessRequestRequest {
	comments: string;
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

// --- NHI Governance Types (Risk, Inactivity, Orphans, SoD, Certifications) ---

// NHI Risk Scoring

export interface NhiRiskFactor {
	name: string;
	score: number;
	weight: number;
	description: string;
}

export interface NhiRiskBreakdown {
	nhi_id: string;
	total_score: number;
	risk_level: string;
	common_factors: NhiRiskFactor[];
	type_specific_factors: NhiRiskFactor[];
}

export interface NhiRiskByType {
	service_account: number;
	ai_agent: number;
}

export interface NhiRiskByLevel {
	critical: number;
	high: number;
	medium: number;
	low: number;
}

export interface NhiRiskSummary {
	total_count: number;
	by_type: NhiRiskByType;
	by_risk_level: NhiRiskByLevel;
	pending_certification: number;
	inactive_30_days: number;
	expiring_7_days: number;
}

// NHI Staleness Report (inactivity detection)

export interface StaleNhiInfo {
	nhi_id: string;
	name: string;
	owner_id: string;
	days_inactive: number;
	last_used_at: string | null;
	inactivity_threshold_days: number;
	in_grace_period: boolean;
	grace_period_ends_at: string | null;
}

export interface StalenessReportResponse {
	generated_at: string;
	min_inactive_days: number;
	total_stale: number;
	critical_count: number;
	warning_count: number;
	stale_nhis: StaleNhiInfo[];
}

// Legacy aliases for backward compatibility
export type InactiveNhiEntity = StaleNhiInfo;

export interface AutoSuspendResult {
	suspended: string[];
	failed: { id: string; error: string }[];
}

// NHI Orphan Detection (via governance/orphan-detections)

export interface OrphanDetectionItem {
	id: string;
	user_id: string;
	run_id: string;
	detection_reason: string;
	status: string;
	detected_at: string;
	last_activity_at: string | null;
	days_inactive: number | null;
}

export interface OrphanDetectionListResponse {
	items: OrphanDetectionItem[];
	total: number;
	limit: number;
	offset: number;
}

// Legacy alias
export type OrphanNhiEntity = OrphanDetectionItem;

// NHI SoD Rules

export type NhiSodEnforcement = 'prevent' | 'warn';

export interface NhiSodRule {
	id: string;
	tenant_id: string;
	tool_id_a: string;
	tool_id_b: string;
	enforcement: NhiSodEnforcement;
	description: string | null;
	created_at: string;
	created_by: string | null;
}

export interface NhiSodRuleListResponse {
	items: NhiSodRule[];
	total: number;
	limit: number;
	offset: number;
}

export interface CreateNhiSodRuleRequest {
	tool_id_a: string;
	tool_id_b: string;
	enforcement: NhiSodEnforcement;
	description?: string;
}

export interface NhiSodViolation {
	rule_id: string;
	conflicting_tool_id: string;
	enforcement: NhiSodEnforcement;
	description: string | null;
}

export interface NhiSodCheckResult {
	violations: NhiSodViolation[];
	is_allowed: boolean;
}

export interface NhiSodCheckRequest {
	agent_id: string;
	tool_id: string;
}

// NHI Certifications

export interface NhiCertificationCampaign {
	id: string;
	tenant_id: string;
	name: string;
	description: string | null;
	scope: string;
	nhi_type_filter: string | null;
	specific_nhi_ids: string[] | null;
	status: string;
	due_date: string | null;
	created_by: string | null;
	created_at: string;
	updated_at: string;
}

export interface CreateNhiCertCampaignRequest {
	name: string;
	description?: string;
	scope?: string;
	nhi_type_filter?: string;
	specific_nhi_ids?: string[];
	due_date?: string;
}

export interface NhiCertificationItem {
	id: string;
	campaign_id: string;
	nhi_id: string;
	nhi_name: string | null;
	nhi_type: string | null;
	reviewer_id: string | null;
	decision: string | null;
	decided_at: string | null;
	decided_by: string | null;
	comment: string | null;
	created_at: string;
}

export interface CertifyNhiResponse {
	nhi_id: string;
	certified_by: string;
	certified_at: string;
	next_certification_at: string | null;
}

export interface RevokeNhiCertResponse {
	nhi_id: string;
	revoked: boolean;
	new_state: string;
}

// --- Approval Workflow Configuration Types ---

export type ApproverType = 'manager' | 'entitlement_owner' | 'specific_users';
export type GroupStatus = 'active' | 'disabled';
export type EscalationAction = 'notify' | 'reassign' | 'auto_approve' | 'auto_reject';
export type ExemptionStatus = 'active' | 'expired' | 'revoked';

export interface ApprovalStep {
	id: string;
	step_order: number;
	approver_type: ApproverType;
	specific_approvers?: string[] | null;
	created_at: string;
}

export interface ApprovalWorkflow {
	id: string;
	name: string;
	description: string | null;
	is_default: boolean;
	is_active: boolean;
	steps: ApprovalStep[];
	created_at: string;
	updated_at: string;
}

/** Summary returned in list views (no full steps, uses step_count). */
export interface ApprovalWorkflowSummary {
	id: string;
	name: string;
	description: string | null;
	is_default: boolean;
	is_active: boolean;
	step_count: number;
	created_at: string;
	updated_at: string;
}

export interface ApprovalWorkflowListResponse {
	items: ApprovalWorkflowSummary[];
	total: number;
	limit: number;
	offset: number;
}

export interface CreateApprovalWorkflowRequest {
	name: string;
	description?: string;
	is_default?: boolean;
	steps?: CreateApprovalStepRequest[];
}

export interface UpdateApprovalWorkflowRequest {
	name?: string;
	description?: string;
	is_default?: boolean;
	is_active?: boolean;
	steps?: CreateApprovalStepRequest[];
}

export interface CreateApprovalStepRequest {
	approver_type: ApproverType;
	specific_approvers?: string[];
}

export interface ApprovalGroup {
	id: string;
	name: string;
	description: string | null;
	member_ids: string[];
	member_count: number;
	is_active: boolean;
	created_at: string;
	updated_at: string;
}

export interface ApprovalGroupSummary {
	id: string;
	name: string;
	description: string | null;
	member_count: number;
	is_active: boolean;
	created_at: string;
	updated_at: string;
}

export interface ApprovalGroupListResponse {
	items: ApprovalGroupSummary[];
	total: number;
	limit: number;
	offset: number;
}

export interface CreateApprovalGroupRequest {
	name: string;
	description?: string;
	member_ids?: string[];
}

export interface UpdateApprovalGroupRequest {
	name?: string;
	description?: string;
	is_active?: boolean;
}

export interface ModifyMembersRequest {
	member_ids: string[];
}

export type EscalationTargetType =
	| 'specific_user'
	| 'approval_group'
	| 'manager'
	| 'manager_chain'
	| 'tenant_admin';

export type FinalFallbackAction =
	| 'escalate_admin'
	| 'auto_approve'
	| 'auto_reject'
	| 'remain_pending';

export interface EscalationLevel {
	id: string;
	level_order: number;
	level_name: string | null;
	timeout_secs: number;
	target_type: EscalationTargetType;
	target_id: string | null;
	manager_chain_depth: number | null;
	created_at: string;
}

export interface EscalationPolicy {
	id: string;
	name: string;
	description: string | null;
	default_timeout_secs: number;
	warning_threshold_secs: number | null;
	final_fallback: FinalFallbackAction;
	is_active: boolean;
	is_default: boolean;
	levels: EscalationLevel[];
	created_at: string;
	updated_at: string;
}

export interface EscalationPolicySummary {
	id: string;
	name: string;
	description: string | null;
	default_timeout_secs: number;
	final_fallback: FinalFallbackAction;
	is_active: boolean;
	level_count: number;
	created_at: string;
	updated_at: string;
}

export interface EscalationPolicyListResponse {
	items: EscalationPolicySummary[];
	total: number;
	limit: number;
	offset: number;
}

export interface CreateEscalationPolicyRequest {
	name: string;
	description?: string;
	default_timeout_secs: number;
	warning_threshold_secs?: number;
	final_fallback: FinalFallbackAction;
}

export interface UpdateEscalationPolicyRequest {
	name?: string;
	description?: string;
	default_timeout_secs?: number;
	warning_threshold_secs?: number;
	final_fallback?: FinalFallbackAction;
	is_active?: boolean;
}

export interface AddEscalationLevelRequest {
	level_order: number;
	level_name?: string;
	timeout_secs: number;
	target_type: EscalationTargetType;
	target_id?: string;
	manager_chain_depth?: number;
}

export interface EscalationEvent {
	id: string;
	request_id: string;
	event_type: string;
	level: number | null;
	action_taken: string | null;
	details: Record<string, unknown> | null;
	created_at: string;
}

export interface EscalationHistoryResponse {
	events: EscalationEvent[];
}

export interface SodExemption {
	id: string;
	rule_id: string;
	user_id: string;
	approver_id: string;
	justification: string;
	status: ExemptionStatus;
	created_at: string;
	expires_at: string;
	revoked_at: string | null;
	revoked_by: string | null;
	updated_at: string;
	is_active: boolean;
}

export interface SodExemptionListResponse {
	items: SodExemption[];
	total: number;
	limit: number;
	offset: number;
}

export interface CreateSodExemptionRequest {
	rule_id: string;
	user_id: string;
	justification: string;
	expires_at: string;
}

// --- Governance Roles & RBAC Types ---

export type ParameterType = 'string' | 'integer' | 'boolean' | 'date' | 'enum';

export interface GovernanceRole {
	id: string;
	name: string;
	description: string | null;
	parent_role_id: string | null;
	is_abstract: boolean;
	hierarchy_depth: number;
	version: number;
	created_by: string;
	created_at: string;
	updated_at: string;
}

export interface GovernanceRoleListResponse {
	items: GovernanceRole[];
	total: number;
	limit: number;
	offset: number;
}

export interface CreateGovernanceRoleRequest {
	name: string;
	description?: string;
	parent_role_id?: string;
}

export interface UpdateGovernanceRoleRequest {
	name?: string;
	description?: string;
	is_abstract?: boolean;
	version: number;
}

export interface RoleTreeNode {
	id: string;
	name: string;
	depth: number;
	is_abstract: boolean;
	direct_entitlement_count: number;
	effective_entitlement_count: number;
	assigned_user_count: number;
	children: RoleTreeNode[];
}

export interface RoleTreeResponse {
	roots: RoleTreeNode[];
}

export interface MoveRoleRequest {
	new_parent_id: string | null;
	version: number;
}

export interface MoveRoleResponse {
	role: GovernanceRole;
	affected_roles_count: number;
	recomputed: boolean;
}

export interface ImpactAnalysisResponse {
	role_id: string;
	role_name: string;
	descendant_count: number;
	total_affected_users: number;
	descendants: GovernanceRole[];
}

export interface RoleEntitlement {
	id: string;
	tenant_id: string;
	entitlement_id: string;
	role_name: string;
	created_at: string;
	created_by: string;
}

export interface AddRoleEntitlementRequest {
	entitlement_id: string;
	role_name: string;
}

export interface EffectiveEntitlementsResponse {
	items: Record<string, unknown>[];
	direct_count: number;
	inherited_count: number;
	total: number;
}

export interface RoleParameter {
	id: string;
	tenant_id: string;
	role_id: string;
	name: string;
	description: string | null;
	parameter_type: ParameterType;
	is_required: boolean;
	default_value: unknown;
	constraints: Record<string, unknown> | null;
	display_name: string | null;
	display_order: number;
	created_at: string;
	updated_at: string;
}

export interface RoleParameterListResponse {
	items: RoleParameter[];
	total: number;
}

export interface CreateRoleParameterRequest {
	name: string;
	parameter_type: ParameterType;
	description?: string;
	is_required?: boolean;
	default_value?: unknown;
	constraints?: Record<string, unknown>;
	display_name?: string;
	display_order?: number;
}

export interface UpdateRoleParameterRequest {
	description?: string;
	is_required?: boolean;
	default_value?: unknown;
	constraints?: Record<string, unknown>;
	display_name?: string;
	display_order?: number;
}

export interface ValidateParametersRequest {
	parameters: { name: string; value: unknown }[];
}

export interface ValidateParametersResponse {
	is_valid: boolean;
	results: Record<string, unknown>[];
	errors: string[];
}

export interface InheritanceBlock {
	id: string;
	entitlement_id: string;
	entitlement_name: string;
	application_name: string | null;
	created_by: string;
	created_at: string;
}

export interface AddInheritanceBlockRequest {
	entitlement_id: string;
}

// --- Governance Reporting Types ---

export type ReportTemplateType =
	| 'access_review'
	| 'sod_violations'
	| 'certification_status'
	| 'user_access'
	| 'audit_trail';

export type ComplianceStandard = 'sox' | 'gdpr' | 'hipaa' | 'custom';

export type ReportStatus = 'pending' | 'generating' | 'completed' | 'failed';

export type ScheduleFrequency = 'daily' | 'weekly' | 'monthly';

export type ScheduleStatus = 'active' | 'paused' | 'disabled';

export type OutputFormat = 'json' | 'csv';

export type TemplateStatus = 'active' | 'archived';

export interface TemplateFilter {
	field: string;
	type: string;
	required: boolean;
	options: Record<string, unknown> | null;
	default: unknown;
}

export interface TemplateColumn {
	field: string;
	label: string;
	sortable: boolean;
}

export interface TemplateDefinition {
	data_sources: string[];
	filters: TemplateFilter[];
	columns: TemplateColumn[];
	grouping: string[];
	default_sort: { field: string; direction: string } | null;
}

export interface ReportTemplate {
	id: string;
	tenant_id: string | null;
	name: string;
	description: string | null;
	template_type: ReportTemplateType;
	compliance_standard: ComplianceStandard | null;
	definition: TemplateDefinition;
	is_system: boolean;
	cloned_from: string | null;
	status: TemplateStatus;
	created_by: string | null;
	created_at: string;
	updated_at: string;
}

export interface ReportTemplateListResponse {
	items: ReportTemplate[];
	total: number;
	page: number;
	page_size: number;
}

export interface CreateReportTemplateRequest {
	name: string;
	description?: string;
	template_type: ReportTemplateType;
	compliance_standard?: ComplianceStandard;
	definition: TemplateDefinition;
}

export interface UpdateReportTemplateRequest {
	name?: string;
	description?: string;
	definition?: TemplateDefinition;
}

export interface CloneReportTemplateRequest {
	name: string;
	description?: string;
}

export interface GeneratedReport {
	id: string;
	tenant_id: string;
	template_id: string;
	name: string;
	status: ReportStatus;
	parameters: Record<string, unknown>;
	output_format: OutputFormat;
	record_count: number | null;
	file_size_bytes: number | null;
	error_message: string | null;
	progress_percent: number;
	started_at: string | null;
	completed_at: string | null;
	generated_by: string;
	schedule_id: string | null;
	retention_until: string;
	created_at: string;
}

export interface GeneratedReportListResponse {
	items: GeneratedReport[];
	total: number;
	page: number;
	page_size: number;
}

export interface GenerateReportRequest {
	template_id: string;
	name?: string;
	parameters?: Record<string, unknown>;
	output_format: OutputFormat;
}

export interface CleanupReportsResponse {
	deleted_count: number;
}

export interface ReportSchedule {
	id: string;
	tenant_id: string;
	template_id: string;
	name: string;
	frequency: ScheduleFrequency;
	schedule_hour: number;
	schedule_day_of_week: number | null;
	schedule_day_of_month: number | null;
	parameters: Record<string, unknown>;
	recipients: string[];
	output_format: OutputFormat;
	status: ScheduleStatus;
	last_run_at: string | null;
	next_run_at: string;
	consecutive_failures: number;
	last_error: string | null;
	created_by: string;
	created_at: string;
	updated_at: string;
}

export interface ReportScheduleListResponse {
	items: ReportSchedule[];
	total: number;
	page: number;
	page_size: number;
}

export interface CreateReportScheduleRequest {
	template_id: string;
	name: string;
	frequency: ScheduleFrequency;
	schedule_hour: number;
	schedule_day_of_week?: number;
	schedule_day_of_month?: number;
	parameters?: Record<string, unknown>;
	recipients: string[];
	output_format: OutputFormat;
}

export interface UpdateReportScheduleRequest {
	name?: string;
	frequency?: ScheduleFrequency;
	schedule_hour?: number;
	schedule_day_of_week?: number | null;
	schedule_day_of_month?: number | null;
	parameters?: Record<string, unknown>;
	recipients?: string[];
	output_format?: OutputFormat;
}

// --- Governance Meta-Roles Types ---

export type MetaRoleStatus = 'active' | 'disabled';
export type CriteriaLogic = 'and' | 'or';
export type MetaRolePermissionType = 'grant' | 'deny';
export type MetaRoleInheritanceStatus = 'active' | 'suspended' | 'removed';
export type MetaRoleResolutionStatus = 'unresolved' | 'resolved_priority' | 'resolved_manual' | 'ignored';
export type MetaRoleConflictType = 'entitlement_conflict' | 'constraint_conflict' | 'policy_conflict';
export type CriteriaOperator = 'eq' | 'neq' | 'in' | 'not_in' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'starts_with';
export type MetaRoleSimulationType = 'create' | 'update' | 'delete' | 'criteria_change' | 'enable' | 'disable';
export type MetaRoleEventType = 'created' | 'updated' | 'deleted' | 'disabled' | 'enabled' | 'inheritance_applied' | 'inheritance_removed' | 'conflict_detected' | 'conflict_resolved' | 'cascade_started' | 'cascade_completed' | 'cascade_failed';
export type MetaRoleConstraintType = 'max_session_duration' | 'require_mfa' | 'ip_whitelist' | 'approval_required';

export interface MetaRole {
	id: string;
	tenant_id: string;
	name: string;
	description: string | null;
	priority: number;
	status: MetaRoleStatus;
	criteria_logic: CriteriaLogic;
	created_by: string;
	created_at: string;
	updated_at: string;
}

export interface MetaRoleCriteria {
	id: string;
	meta_role_id: string;
	field: string;
	operator: CriteriaOperator;
	value: unknown;
	created_at: string;
}

export interface MetaRoleEntitlementInfo {
	id: string;
	name: string;
	application_id: string;
	application_name: string | null;
	risk_level: string | null;
}

export interface MetaRoleEntitlement {
	id: string;
	meta_role_id: string;
	entitlement_id: string;
	permission_type: MetaRolePermissionType;
	created_at: string;
	entitlement: MetaRoleEntitlementInfo | null;
}

export interface MetaRoleConstraint {
	id: string;
	meta_role_id: string;
	constraint_type: MetaRoleConstraintType;
	constraint_value: Record<string, unknown>;
	created_at: string;
}

export interface MetaRoleStats {
	active_inheritances: number;
	unresolved_conflicts: number;
	criteria_count: number;
	entitlements_count: number;
	constraints_count: number;
}

export interface MetaRoleWithDetails extends MetaRole {
	criteria: MetaRoleCriteria[];
	entitlements: MetaRoleEntitlement[];
	constraints: MetaRoleConstraint[];
	stats: MetaRoleStats | null;
}

export interface MetaRoleListResponse {
	items: MetaRole[];
	total: number;
	limit: number;
	offset: number;
}

export interface MetaRoleInheritanceMetaRole {
	id: string;
	name: string;
	priority: number;
	status: MetaRoleStatus;
}

export interface MetaRoleInheritanceChildRole {
	id: string;
	name: string;
	application_id: string | null;
	application_name: string | null;
}

export interface MetaRoleInheritance {
	id: string;
	tenant_id: string;
	meta_role_id: string;
	child_role_id: string;
	match_reason: unknown;
	status: MetaRoleInheritanceStatus;
	matched_at: string;
	updated_at: string;
	meta_role: MetaRoleInheritanceMetaRole | null;
	child_role: MetaRoleInheritanceChildRole | null;
}

export interface MetaRoleInheritanceListResponse {
	items: MetaRoleInheritance[];
	total: number;
	limit: number;
	offset: number;
}

export interface MetaRoleConflictMetaRole {
	id: string;
	name: string;
	priority: number;
	status: MetaRoleStatus;
}

export interface MetaRoleConflictAffectedRole {
	id: string;
	name: string;
	application_id: string | null;
	application_name: string | null;
}

export interface MetaRoleConflict {
	id: string;
	tenant_id: string;
	meta_role_a_id: string;
	meta_role_b_id: string;
	affected_role_id: string;
	conflict_type: MetaRoleConflictType;
	conflicting_items: unknown;
	resolution_status: MetaRoleResolutionStatus;
	resolved_by: string | null;
	resolution_choice: unknown;
	detected_at: string;
	resolved_at: string | null;
	meta_role_a: MetaRoleConflictMetaRole | null;
	meta_role_b: MetaRoleConflictMetaRole | null;
	affected_role: MetaRoleConflictAffectedRole | null;
}

export interface MetaRoleConflictListResponse {
	items: MetaRoleConflict[];
	total: number;
	limit: number;
	offset: number;
}

export interface MetaRoleEvent {
	id: string;
	tenant_id: string;
	meta_role_id: string | null;
	event_type: MetaRoleEventType;
	actor_id: string | null;
	changes: unknown;
	affected_roles: unknown;
	metadata: unknown;
	created_at: string;
}

export interface MetaRoleEventListResponse {
	items: MetaRoleEvent[];
	total: number;
	limit: number;
	offset: number;
}

export interface MetaRoleEventStats {
	total: number;
	created: number;
	updated: number;
	deleted: number;
	disabled: number;
	enabled: number;
	inheritance_applied: number;
	inheritance_removed: number;
	conflict_detected: number;
	conflict_resolved: number;
	cascade_started: number;
	cascade_completed: number;
	cascade_failed: number;
}

export interface SimulationAffectedRole {
	role_id: string;
	role_name: string;
	application_id: string | null;
	reason: unknown;
	entitlements_affected: string[];
	constraints_affected: string[];
}

export interface SimulationPotentialConflict {
	meta_role_a_id: string;
	meta_role_a_name: string;
	meta_role_b_id: string;
	meta_role_b_name: string;
	affected_role_id: string;
	affected_role_name: string;
	conflict_type: MetaRoleConflictType;
	conflicting_items: unknown;
}

export interface SimulationSummary {
	total_roles_affected: number;
	roles_gaining_inheritance: number;
	roles_losing_inheritance: number;
	new_conflicts: number;
	resolved_conflicts: number;
	is_safe: boolean;
	warnings: string[];
}

export interface MetaRoleSimulationResult {
	simulation_type: MetaRoleSimulationType;
	roles_to_add: SimulationAffectedRole[];
	roles_to_remove: SimulationAffectedRole[];
	potential_conflicts: SimulationPotentialConflict[];
	conflicts_to_resolve: SimulationPotentialConflict[];
	summary: SimulationSummary;
}

export interface CascadeFailure {
	role_id: string;
	error: string;
	failed_at: string;
}

export interface MetaRoleCascadeStatus {
	meta_role_id: string;
	in_progress: boolean;
	processed_count: number;
	remaining_count: number;
	success_count: number;
	failure_count: number;
	started_at: string | null;
	completed_at: string | null;
	failures: CascadeFailure[] | null;
}

// Meta-Role Request Types

export interface CreateMetaRoleRequest {
	name: string;
	description?: string;
	priority: number;
	criteria_logic?: CriteriaLogic;
	criteria?: { field: string; operator: CriteriaOperator; value: unknown }[];
	entitlements?: { entitlement_id: string; permission_type?: MetaRolePermissionType }[];
	constraints?: { constraint_type: MetaRoleConstraintType; constraint_value: Record<string, unknown> }[];
}

export interface UpdateMetaRoleRequest {
	name?: string;
	description?: string;
	priority?: number;
	criteria_logic?: CriteriaLogic;
}

export interface AddMetaRoleCriterionRequest {
	field: string;
	operator: CriteriaOperator;
	value: unknown;
}

export interface AddMetaRoleEntitlementRequest {
	entitlement_id: string;
	permission_type?: MetaRolePermissionType;
}

export interface AddMetaRoleConstraintRequest {
	constraint_type: MetaRoleConstraintType;
	constraint_value: Record<string, unknown>;
}

export interface ResolveMetaRoleConflictRequest {
	resolution_status: 'resolved_priority' | 'resolved_manual' | 'ignored';
	resolution_choice?: unknown;
	comment?: string;
}

export interface SimulateMetaRoleRequest {
	simulation_type: MetaRoleSimulationType;
	meta_role_id?: string;
	meta_role_data?: CreateMetaRoleRequest;
	criteria_changes?: { field: string; operator: CriteriaOperator; value: unknown }[];
	limit?: number;
}

export interface CascadeMetaRoleRequest {
	meta_role_id: string;
	dry_run?: boolean;
}

// --- User Invitations ---

export interface Invitation {
	id: string;
	email: string;
	status: 'sent' | 'cancelled' | 'accepted';
	role_template_id: string | null;
	invited_by_user_id: string;
	expires_at: string;
	created_at: string;
	accepted_at: string | null;
}

export interface InvitationListResponse {
	invitations: Invitation[];
	total: number;
	limit: number;
	offset: number;
}

export interface CreateInvitationRequest {
	email: string;
	roles?: string[];
}

// --- Connector Management Types ---

export type ConnectorType = 'ldap' | 'database' | 'rest';
export type ConnectorStatus = 'active' | 'inactive' | 'error';

export interface Connector {
	id: string;
	name: string;
	connector_type: ConnectorType;
	description: string | null;
	config: Record<string, unknown>;
	status: ConnectorStatus;
	last_connection_test?: string | null;
	last_error?: string | null;
	created_at: string;
	updated_at: string;
}

export interface ConnectorListResponse {
	items: Connector[];
	total: number;
	limit: number;
	offset: number;
}

export interface CreateConnectorRequest {
	name: string;
	description?: string;
	connector_type: ConnectorType;
	config: Record<string, unknown>;
	credentials: Record<string, unknown>;
}

export interface UpdateConnectorRequest {
	name?: string;
	description?: string;
	config?: Record<string, unknown>;
	credentials?: Record<string, unknown>;
}

export interface ConnectorHealthStatus {
	connector_id: string;
	is_online: boolean;
	consecutive_failures: number;
	offline_since?: string | null;
	last_success_at?: string | null;
	last_error?: string | null;
	last_check_at: string;
}

export interface ConnectorTestResult {
	success: boolean;
	error?: string;
	tested_at: string;
}

// --- Provisioning Operations & Reconciliation Types ---

// Operations Enums
export type OperationType = 'create' | 'update' | 'delete';
export type OperationStatus =
	| 'pending'
	| 'in_progress'
	| 'completed'
	| 'failed'
	| 'dead_letter'
	| 'awaiting_system'
	| 'resolved'
	| 'cancelled';

export type DiscrepancyType = 'missing' | 'orphan' | 'mismatch' | 'collision' | 'unlinked' | 'deleted';
export type RemediationAction = 'create' | 'update' | 'delete' | 'link' | 'unlink' | 'inactivate_identity';
export type RemediationDirection = 'xavyo_to_target' | 'target_to_xavyo';
export type ResolutionStatus = 'pending' | 'resolved' | 'ignored';
export type ConflictOutcome = 'applied' | 'superseded' | 'merged' | 'rejected';
export type ReconciliationScheduleFrequency = 'hourly' | 'daily' | 'weekly' | 'monthly' | 'cron';
export type ReconciliationMode = 'full' | 'delta';
export type ReconciliationRunStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'paused';

// Provisioning Operation
export interface ProvisioningOperation {
	id: string;
	tenant_id: string;
	connector_id: string;
	connector_name: string;
	user_id: string;
	operation_type: OperationType;
	object_class: string;
	target_uid: string | null;
	status: OperationStatus;
	priority: number;
	retry_count: number;
	max_retries: number;
	error_message: string | null;
	payload: Record<string, unknown>;
	created_at: string;
	updated_at: string;
	completed_at: string | null;
	resolution_notes: string | null;
}

export interface OperationListResponse {
	operations: ProvisioningOperation[];
	total: number;
	limit: number;
	offset: number;
}

export interface TriggerOperationRequest {
	connector_id: string;
	user_id: string;
	operation_type: OperationType;
	object_class: string;
	target_uid?: string;
	payload: Record<string, unknown>;
	priority?: number;
}

export interface ResolveOperationRequest {
	resolution_notes?: string;
}

// Execution Attempts
export interface ExecutionAttempt {
	attempt_number: number;
	started_at: string;
	completed_at: string | null;
	success: boolean;
	error_code: string | null;
	error_message: string | null;
	duration_ms: number;
}

export interface ExecutionAttemptsResponse {
	attempts: ExecutionAttempt[];
	operation_id: string;
}

// Operation Logs
export interface OperationLog {
	id: string;
	operation_id: string;
	timestamp: string;
	level: string;
	message: string;
}

export interface OperationLogsResponse {
	logs: OperationLog[];
	operation_id: string;
}

// Queue Statistics
export interface QueueStatistics {
	pending: number;
	in_progress: number;
	completed: number;
	failed: number;
	dead_letter: number;
	awaiting_system: number;
	avg_processing_time_secs: number | null;
	success_rate: number | null;
}

// DLQ Response (no total field)
export interface DlqResponse {
	operations: ProvisioningOperation[];
	offset: number;
	limit: number;
}

// Provisioning Conflicts
export interface ProvisioningConflict {
	id: string;
	tenant_id: string;
	operation_id_a: string;
	operation_id_b: string;
	conflict_type: string;
	affected_attributes: string[];
	status: string;
	outcome: ConflictOutcome | null;
	notes: string | null;
	created_at: string;
	resolved_at: string | null;
	resolved_by: string | null;
}

export interface ConflictListResponse {
	conflicts: ProvisioningConflict[];
	total: number;
	limit: number;
	offset: number;
}

export interface ResolveConflictRequest {
	outcome: ConflictOutcome;
	notes?: string;
}

// Reconciliation Run
export interface ReconciliationRun {
	id: string;
	connector_id: string;
	mode: ReconciliationMode;
	dry_run: boolean;
	status: ReconciliationRunStatus;
	started_at: string;
	completed_at: string | null;
	accounts_processed: number;
	discrepancies_found: number;
	duration_seconds: number | null;
	created_by: string;
}

export interface ReconciliationRunListResponse {
	runs: ReconciliationRun[];
	total: number;
	limit: number;
	offset: number;
}

export interface TriggerRunRequest {
	mode: ReconciliationMode;
	dry_run: boolean;
}

// Reconciliation Report
export interface DiscrepancySummary {
	total: number;
	by_type: Record<string, number>;
}

export interface ActionSummary {
	total: number;
	by_action: Record<string, number>;
}

export interface MismatchedAttribute {
	attribute_name: string;
	count: number;
}

export interface PerformanceMetrics {
	total_duration_ms: number;
	accounts_per_second: number;
	api_calls_made: number;
}

export interface ReconciliationReport {
	run_id: string;
	discrepancy_summary: DiscrepancySummary;
	action_summary: ActionSummary;
	top_mismatched_attributes: MismatchedAttribute[];
	performance_metrics: PerformanceMetrics;
}

// Discrepancies
export interface Discrepancy {
	id: string;
	connector_id: string;
	run_id: string;
	discrepancy_type: DiscrepancyType;
	identity_id: string | null;
	external_uid: string | null;
	attribute_name: string | null;
	expected_value: string | null;
	actual_value: string | null;
	resolution_status: ResolutionStatus;
	resolved_at: string | null;
	resolved_by: string | null;
	created_at: string;
}

export interface DiscrepancyListResponse {
	discrepancies: Discrepancy[];
	total: number;
	limit: number;
	offset: number;
}

export interface RemediateDiscrepancyRequest {
	action: RemediationAction;
	direction: RemediationDirection;
	identity_id?: string;
	dry_run: boolean;
}

export interface RemediationResult {
	discrepancy_id: string;
	action: RemediationAction;
	direction: RemediationDirection;
	success: boolean;
	error: string | null;
	changes: Record<string, unknown> | null;
}

export interface BulkRemediateRequest {
	items: {
		discrepancy_id: string;
		action: RemediationAction;
		direction: RemediationDirection;
	}[];
	dry_run: boolean;
}

export interface BulkRemediateResponse {
	results: RemediationResult[];
	total: number;
	succeeded: number;
	failed: number;
}

export interface PreviewRemediationRequest {
	discrepancy_ids: string[];
}

export interface RemediationPreview {
	discrepancy_id: string;
	suggested_action: RemediationAction;
	suggested_direction: RemediationDirection;
	changes: Record<string, unknown>;
}

export interface PreviewRemediationResponse {
	previews: RemediationPreview[];
}

// Reconciliation Actions (Audit Log)
export interface ReconciliationActionEntry {
	id: string;
	connector_id: string;
	discrepancy_id: string | null;
	action_type: string;
	result: string;
	dry_run: boolean;
	performed_by: string;
	performed_at: string;
	details: Record<string, unknown> | null;
}

export interface ReconciliationActionListResponse {
	actions: ReconciliationActionEntry[];
	total: number;
	limit: number;
	offset: number;
}

// Reconciliation Schedule
export interface ReconciliationSchedule {
	id: string;
	connector_id: string;
	connector_name: string | null;
	mode: ReconciliationMode;
	frequency: ReconciliationScheduleFrequency;
	day_of_week: number | null;
	day_of_month: number | null;
	hour_of_day: number;
	cron_expression: string | null;
	enabled: boolean;
	last_run_at: string | null;
	next_run_at: string | null;
	created_at: string;
	updated_at: string;
}

export interface ReconciliationScheduleListResponse {
	schedules: ReconciliationSchedule[];
}

export interface UpsertScheduleRequest {
	mode: ReconciliationMode;
	frequency: ReconciliationScheduleFrequency;
	day_of_week?: number;
	day_of_month?: number;
	hour_of_day: number;
	enabled: boolean;
}

// Discrepancy Trend
export interface DiscrepancyTrendPoint {
	date: string;
	total: number;
	by_type: Record<string, number> | null;
}

export interface DiscrepancyTrendResponse {
	data_points: DiscrepancyTrendPoint[];
	connector_id: string | null;
	from: string;
	to: string;
}

// Outlier Detection Types

export type OutlierAnalysisStatus = 'pending' | 'running' | 'completed' | 'failed';
export type OutlierTriggerType = 'scheduled' | 'manual' | 'api';
export type OutlierClassification = 'normal' | 'outlier' | 'unclassifiable';
export type OutlierDispositionStatus = 'new' | 'legitimate' | 'requires_remediation' | 'under_investigation' | 'remediated';
export type OutlierAlertType = 'new_outlier' | 'score_increase' | 'repeated_outlier';
export type OutlierAlertSeverity = 'low' | 'medium' | 'high' | 'critical';
export type PeerGroupType = 'department' | 'role' | 'location' | 'custom';

export interface ScoringWeights {
	role_frequency: number;
	entitlement_count: number;
	assignment_pattern: number;
	peer_group_coverage: number;
	historical_deviation: number;
}

export interface OutlierConfig {
	id: string;
	tenant_id: string;
	confidence_threshold: number;
	frequency_threshold: number;
	min_peer_group_size: number;
	scoring_weights: ScoringWeights;
	schedule_cron: string;
	retention_days: number;
	is_enabled: boolean;
	created_at: string;
	updated_at: string;
}

export interface UpdateOutlierConfigRequest {
	confidence_threshold?: number;
	frequency_threshold?: number;
	min_peer_group_size?: number;
	scoring_weights?: ScoringWeights;
	schedule_cron?: string;
	retention_days?: number;
	is_enabled?: boolean;
}

export interface OutlierAnalysis {
	id: string;
	tenant_id: string;
	status: OutlierAnalysisStatus;
	triggered_by: OutlierTriggerType;
	started_at: string | null;
	completed_at: string | null;
	users_analyzed: number;
	outliers_detected: number;
	progress_percent: number;
	error_message: string | null;
	created_at: string;
}

export interface TriggerAnalysisRequest {
	triggered_by: OutlierTriggerType;
}

export interface PeerScoreItem {
	peer_group_id: string;
	peer_group_name: string;
	z_score: number;
	deviation_factor: number;
	is_outlier: boolean;
}

export interface FactorDetail {
	raw_value: number;
	weight: number;
	contribution: number;
	details: string;
}

export interface FactorBreakdown {
	role_frequency?: FactorDetail;
	entitlement_count?: FactorDetail;
	assignment_pattern?: FactorDetail;
	peer_group_coverage?: FactorDetail;
	historical_deviation?: FactorDetail;
}

export interface OutlierResult {
	id: string;
	analysis_id: string;
	user_id: string;
	overall_score: number;
	classification: OutlierClassification;
	peer_scores: PeerScoreItem[];
	factor_breakdown: FactorBreakdown;
	previous_score: number | null;
	score_change: number | null;
	created_at: string;
}

export interface OutlierSummary {
	total_users: number;
	outlier_count: number;
	normal_count: number;
	unclassifiable_count: number;
	avg_score: number;
	max_score: number;
	analysis_id: string | null;
	analysis_completed_at: string | null;
}

export interface OutlierDisposition {
	id: string;
	result_id: string;
	user_id: string;
	status: OutlierDispositionStatus;
	justification: string | null;
	reviewed_by: string | null;
	reviewed_at: string | null;
	expires_at: string | null;
	created_at: string;
	updated_at: string;
}

export interface CreateDispositionRequest {
	status: OutlierDispositionStatus;
	justification?: string;
	expires_at?: string;
}

export interface DispositionSummary {
	new_count: number;
	legitimate_count: number;
	requires_remediation_count: number;
	under_investigation_count: number;
	remediated_count: number;
}

export interface OutlierAlert {
	id: string;
	analysis_id: string;
	user_id: string;
	alert_type: OutlierAlertType;
	severity: OutlierAlertSeverity;
	score: number;
	classification: OutlierClassification;
	is_read: boolean;
	is_dismissed: boolean;
	created_at: string;
}

export interface AlertSummary {
	total_count: number;
	unread_count: number;
	critical_count: number;
	high_count: number;
	medium_count: number;
	low_count: number;
}

export interface OutlierGenerateReportRequest {
	start_date: string;
	end_date: string;
	include_trends?: boolean;
	include_peer_breakdown?: boolean;
}

export interface OutlierTrendItem {
	date: string;
	analysis_id: string;
	outlier_count: number;
	total_users: number;
	avg_score: number;
}

export interface PeerGroupBreakdownItem {
	peer_group_id: string;
	peer_group_name: string;
	outlier_count: number;
	member_count: number;
	avg_deviation: number;
}

export interface OutlierReport {
	start_date: string;
	end_date: string;
	total_analyses: number;
	total_users_analyzed: number;
	total_outliers_detected: number;
	average_outlier_rate: number;
	trends: OutlierTrendItem[];
	peer_group_breakdown: PeerGroupBreakdownItem[];
	generated_at: string;
}

export interface UserOutlierHistory {
	user_id: string;
	results: OutlierResult[];
	current_disposition: OutlierDisposition | null;
}

// Peer Group Types

export interface PeerGroup {
	id: string;
	name: string;
	group_type: PeerGroupType;
	attribute_key: string;
	attribute_value: string;
	user_count: number;
	avg_entitlements: number | null;
	stddev_entitlements: number | null;
	created_at: string;
	updated_at: string;
}

export interface CreatePeerGroupRequest {
	name: string;
	group_type: PeerGroupType;
	attribute_key: string;
	attribute_value: string;
}

export interface PeerGroupRefreshResult {
	group: PeerGroup;
	member_count: number;
}

export interface RefreshAllPeerGroupsResult {
	groups_refreshed: number;
	groups_created: number;
	users_processed: number;
	duration_ms: number;
}

export interface PeerComparisonItem {
	group_id: string;
	group_name: string;
	group_type: PeerGroupType;
	group_average: number;
	group_stddev: number;
	deviation_from_mean: number;
	is_outlier: boolean;
	outlier_severity: 'moderate' | 'severe' | null;
}

export interface UserPeerComparison {
	user_id: string;
	user_entitlement_count: number;
	comparisons: PeerComparisonItem[];
	is_outlier: boolean;
}

// --- Tenant Branding Types ---

export interface BrandingConfig {
	logo_url: string | null;
	logo_dark_url: string | null;
	favicon_url: string | null;
	email_logo_url: string | null;
	primary_color: string | null;
	secondary_color: string | null;
	accent_color: string | null;
	background_color: string | null;
	text_color: string | null;
	font_family: string | null;
	custom_css: string | null;
	login_page_title: string | null;
	login_page_subtitle: string | null;
	login_page_background_url: string | null;
	footer_text: string | null;
	privacy_policy_url: string | null;
	terms_of_service_url: string | null;
	support_url: string | null;
	updated_at: string;
}

// --- OAuth Client Types ---

export type OAuthClientType = 'confidential' | 'public';

export interface OAuthClient {
	id: string;
	client_id: string;
	name: string;
	client_type: OAuthClientType;
	redirect_uris: string[];
	grant_types: string[];
	scopes: string[];
	is_active: boolean;
	created_at: string;
	updated_at: string;
}

export interface OAuthClientWithSecret extends OAuthClient {
	client_secret: string;
}

export interface OAuthClientListResponse {
	clients: OAuthClient[];
	total: number;
}

export interface CreateOAuthClientRequest {
	name: string;
	client_type: OAuthClientType;
	redirect_uris: string[];
	grant_types: string[];
	scopes: string[];
}

export interface UpdateOAuthClientRequest {
	name?: string;
	redirect_uris?: string[];
	grant_types?: string[];
	scopes?: string[];
	is_active?: boolean;
}

// --- User Group Types ---

export interface GroupMember {
	user_id: string;
	email: string;
	display_name: string | null;
}

export interface UserGroup {
	id: string;
	tenant_id: string;
	display_name: string;
	description: string | null;
	parent_id: string | null;
	group_type: string;
	path: string[];
	created_at: string;
	updated_at: string;
}

export interface UserGroupListResponse {
	groups: UserGroup[];
	pagination: {
		limit: number;
		offset: number;
		has_more: boolean;
	};
}

export interface GroupMembersResponse {
	group_id: string;
	members: GroupMember[];
	pagination: {
		total_count: number;
		limit: number;
		offset: number;
		has_more: boolean;
	};
}

export interface CreateUserGroupRequest {
	display_name: string;
	description?: string;
	group_type?: string;
	parent_id?: string;
}

export interface UpdateUserGroupRequest {
	display_name?: string;
	description?: string;
}

export interface AddGroupMembersRequest {
	member_ids: string[];
}

// --- My Approvals Types ---

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface ApprovalItem {
	id: string;
	request_id: string;
	requester_id: string;
	requester_email: string;
	resource_type: string;
	resource_name: string;
	reason: string | null;
	status: ApprovalStatus;
	decision_comment: string | null;
	submitted_at: string;
	decided_at: string | null;
}

export interface ApprovalItemListResponse {
	items: ApprovalItem[];
	total: number;
	limit: number;
	offset: number;
}

export interface ApproveApprovalRequest {
	comment?: string;
}

export interface RejectApprovalRequest {
	comment: string;
}

// --- My Certifications Types ---

export type MyCertificationStatus = 'pending' | 'certified' | 'revoked';

export interface MyCertificationItem {
	id: string;
	campaign_id: string;
	campaign_name: string;
	user_id: string;
	user_email: string;
	entitlements: string[];
	status: MyCertificationStatus;
	due_date: string | null;
	decided_at: string | null;
}

export interface MyCertificationListResponse {
	items: MyCertificationItem[];
	total: number;
	page: number;
	page_size: number;
}

// ─── Webhook Types ───────────────────────────────────────────────────────────

export interface WebhookEventType {
	event_type: string;
	category: string;
	description: string;
}

export interface WebhookEventTypeListResponse {
	event_types: WebhookEventType[];
}

export interface WebhookSubscription {
	id: string;
	tenant_id: string;
	name: string;
	description: string | null;
	url: string;
	event_types: string[];
	enabled: boolean;
	consecutive_failures: number;
	created_at: string;
	updated_at: string;
}

export interface WebhookSubscriptionListResponse {
	items: WebhookSubscription[];
	total: number;
	limit: number;
	offset: number;
}

export interface CreateWebhookSubscriptionRequest {
	name: string;
	description?: string;
	url: string;
	secret?: string;
	event_types: string[];
}

export interface UpdateWebhookSubscriptionRequest {
	name?: string;
	description?: string;
	url?: string;
	secret?: string;
	event_types?: string[];
	enabled?: boolean;
}

export interface WebhookDelivery {
	id: string;
	subscription_id: string;
	event_id: string;
	event_type: string;
	status: string;
	attempt_number: number;
	response_code: number | null;
	latency_ms: number | null;
	error_message: string | null;
	created_at: string;
	completed_at: string | null;
}

export interface WebhookDeliveryListResponse {
	items: WebhookDelivery[];
	total: number;
	limit: number;
	offset: number;
}

export interface WebhookDlqEntry {
	id: string;
	subscription_id: string;
	event_id: string;
	event_type: string;
	payload: Record<string, unknown>;
	error_message: string;
	original_failure_at: string;
	retry_count: number;
	created_at: string;
}

export interface WebhookDlqListResponse {
	entries: WebhookDlqEntry[];
	total: number;
	has_more: boolean;
}

// ─── Authorization Policy Types ──────────────────────────────────────────────

export type PolicyEffect = 'allow' | 'deny';
export type PolicyStatus = 'active' | 'inactive';
export type ConditionType = 'time_window' | 'user_attribute' | 'entitlement_check';
export type ConditionOperator = 'equals' | 'not_equals' | 'contains' | 'in_list';
export type AuthorizationSource = 'policy' | 'entitlement' | 'default_deny';

export interface PolicyCondition {
	id: string;
	condition_type: ConditionType;
	attribute_path: string | null;
	operator: ConditionOperator | null;
	value: unknown;
}

export interface CreateConditionRequest {
	condition_type: ConditionType;
	attribute_path?: string;
	operator?: ConditionOperator;
	value: unknown;
}

export interface AuthorizationPolicy {
	id: string;
	tenant_id: string;
	name: string;
	description: string | null;
	effect: PolicyEffect;
	priority: number;
	status: PolicyStatus;
	resource_type: string | null;
	action: string | null;
	conditions: PolicyCondition[];
	created_by: string | null;
	created_at: string;
	updated_at: string;
}

export interface PolicyListResponse {
	items: AuthorizationPolicy[];
	total: number;
	limit: number;
	offset: number;
}

export interface CreatePolicyRequest {
	name: string;
	description?: string;
	effect: PolicyEffect;
	priority?: number;
	resource_type?: string;
	action?: string;
	conditions?: CreateConditionRequest[];
}

export interface UpdatePolicyRequest {
	name?: string;
	description?: string;
	effect?: PolicyEffect;
	priority?: number;
	status?: PolicyStatus;
	resource_type?: string;
	action?: string;
}

export interface EntitlementActionMapping {
	id: string;
	tenant_id: string;
	entitlement_id: string;
	action: string;
	resource_type: string;
	created_by: string | null;
	created_at: string;
}

export interface MappingListResponse {
	items: EntitlementActionMapping[];
	total: number;
	limit: number;
	offset: number;
}

export interface CreateMappingRequest {
	entitlement_id: string;
	action: string;
	resource_type: string;
}

export interface AuthorizationDecision {
	allowed: boolean;
	reason: string;
	source: AuthorizationSource;
	policy_id: string | null;
	decision_id: string;
}

// =============================================================================
// Bulk Import Types
// =============================================================================

export type ImportJobStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
export type ImportErrorType = 'validation' | 'duplicate_in_file' | 'duplicate_in_tenant' | 'role_not_found' | 'group_error' | 'attribute_error' | 'system';

export interface ImportJobSummary {
	id: string;
	status: ImportJobStatus;
	file_name: string;
	total_rows: number;
	success_count: number;
	error_count: number;
	skip_count: number;
	send_invitations: boolean;
	created_at: string;
}

export interface ImportJobDetail extends ImportJobSummary {
	tenant_id: string;
	file_hash: string;
	file_size_bytes: number;
	processed_rows: number;
	created_by: string | null;
	started_at: string | null;
	completed_at: string | null;
	error_message: string | null;
	updated_at: string;
}

export interface ImportError {
	id: string;
	line_number: number;
	email: string | null;
	column_name: string | null;
	error_type: ImportErrorType;
	error_message: string;
	created_at: string;
}

export interface ImportJobCreatedResponse {
	job_id: string;
	status: string;
	file_name: string;
	total_rows: number;
	message: string | null;
}

export interface ImportJobListResponse {
	items: ImportJobSummary[];
	total: number;
	limit: number;
	offset: number;
}

export interface ImportErrorListResponse {
	items: ImportError[];
	total: number;
	limit: number;
	offset: number;
}

export interface BulkResendResponse {
	resent_count: number;
	skipped_count: number;
	message: string | null;
}

// =============================================================================
// Invitation Types
// =============================================================================

export interface InvitationValidationResponse {
	valid: boolean;
	email: string | null;
	tenant_name: string | null;
	reason: string | null;
	message: string | null;
}

export interface AcceptInvitationRequest {
	password: string;
}

export interface AcceptInvitationResponse {
	success: boolean;
	message: string | null;
	redirect_url: string | null;
}

// =============================================================================
// SCIM Types
// =============================================================================

export interface ScimTokenInfo {
	id: string;
	name: string;
	token_prefix: string;
	created_at: string;
	last_used_at: string | null;
	revoked_at: string | null;
	created_by: string;
}

export interface ScimTokenCreated {
	id: string;
	name: string;
	token: string;
	created_at: string;
	warning: string;
}

export interface ScimAttributeMapping {
	id: string;
	tenant_id: string;
	scim_path: string;
	xavyo_field: string;
	transform: string | null;
	required: boolean;
	created_at: string;
	updated_at: string;
}

export interface UpdateMappingsRequest {
	mappings: MappingRequest[];
}

export interface MappingRequest {
	scim_path: string;
	xavyo_field: string;
	transform: string | null;
	required: boolean;
}

// ================================
// Identity Deduplication & Merging
// ================================

// Enums

export type DuplicateStatus = 'pending' | 'merged' | 'dismissed';
export type MergeOperationStatus = 'in_progress' | 'completed' | 'failed' | 'cancelled';
export type EntitlementStrategy = 'union' | 'intersection' | 'manual';
export type AttributeResolutionRule = 'newest_wins' | 'oldest_wins' | 'prefer_non_null';
export type BatchMergeStatus = 'queued' | 'running' | 'completed' | 'failed';

// Duplicate Candidates

export interface DuplicateCandidateResponse {
	id: string;
	identity_a_id: string;
	identity_b_id: string;
	confidence_score: number;
	status: DuplicateStatus;
	detected_at: string;
}

export interface IdentitySummary {
	id: string;
	email: string | null;
	display_name: string | null;
	department: string | null;
	attributes: Record<string, unknown>;
}

export interface AttributeComparison {
	attribute: string;
	value_a: unknown;
	value_b: unknown;
	is_different: boolean;
}

export interface RuleMatchResponse {
	rule_id: string;
	rule_name: string;
	attribute: string;
	similarity: number;
	weighted_score: number;
}

export interface DuplicateDetailResponse {
	id: string;
	identity_a_id: string;
	identity_b_id: string;
	confidence_score: number;
	identity_a: IdentitySummary;
	identity_b: IdentitySummary;
	attribute_comparison: AttributeComparison[];
	rule_matches: RuleMatchResponse[];
}

export interface ListDuplicatesQuery {
	status?: DuplicateStatus;
	min_confidence?: number;
	max_confidence?: number;
	identity_id?: string;
	limit?: number;
	offset?: number;
}

export interface DismissDuplicateRequest {
	reason: string;
}

export interface RunDetectionScanRequest {
	min_confidence?: number;
}

export interface DetectionScanResponse {
	scan_id: string;
	users_processed: number;
	duplicates_found: number;
	new_duplicates: number;
	duration_ms: number;
}

// Merge Operations

export interface MergePreviewRequest {
	source_identity_id: string;
	target_identity_id: string;
	entitlement_strategy: EntitlementStrategy;
	attribute_selections?: Record<string, { source: 'source' | 'target' }>;
}

export interface MergeEntitlementSummary {
	id: string;
	name: string;
	application: string | null;
}

export interface EntitlementsPreview {
	source_only: MergeEntitlementSummary[];
	target_only: MergeEntitlementSummary[];
	common: MergeEntitlementSummary[];
	merged: MergeEntitlementSummary[];
}

export interface MergeSodViolationResponse {
	rule_id: string;
	rule_name: string;
	severity: string;
	entitlement_being_added: string;
	conflicting_entitlement_id: string;
	has_exemption: boolean;
}

export interface MergeSodCheckResponse {
	has_violations: boolean;
	can_override: boolean;
	violations: MergeSodViolationResponse[];
}

export interface MergePreviewResponse {
	source_identity: IdentitySummary;
	target_identity: IdentitySummary;
	merged_preview: IdentitySummary;
	entitlements_preview: EntitlementsPreview;
	sod_check: MergeSodCheckResponse;
}

export interface MergeExecuteRequest {
	source_identity_id: string;
	target_identity_id: string;
	entitlement_strategy: EntitlementStrategy;
	attribute_selections?: Record<string, { source: 'source' | 'target' }>;
	entitlement_selections?: string[] | null;
	sod_override_reason?: string | null;
}

export interface MergeOperationResponse {
	id: string;
	source_identity_id: string;
	target_identity_id: string;
	status: MergeOperationStatus;
	entitlement_strategy: EntitlementStrategy;
	operator_id: string;
	started_at: string;
	completed_at: string | null;
}

export interface MergeErrorResponse {
	error: string;
	message: string;
	pending_operation_id?: string;
	violations?: MergeSodViolationResponse[];
}

// Batch Merge

export interface BatchMergeRequest {
	candidate_ids: string[];
	entitlement_strategy: EntitlementStrategy;
	attribute_rule: AttributeResolutionRule;
	min_confidence?: number | null;
	skip_sod_violations: boolean;
}

export interface BatchMergePreviewRequest {
	candidate_ids: string[];
	min_confidence?: number | null;
	entitlement_strategy: EntitlementStrategy;
	attribute_rule: AttributeResolutionRule;
	limit?: number;
	offset?: number;
}

export interface BatchMergeCandidatePreviewResponse {
	candidate_id: string;
	source_identity_id: string;
	target_identity_id: string;
	confidence_score: number;
}

export interface BatchMergePreviewResponse {
	total_candidates: number;
	candidates: BatchMergeCandidatePreviewResponse[];
	entitlement_strategy: EntitlementStrategy;
	attribute_rule: AttributeResolutionRule;
}

export interface BatchMergeResponse {
	job_id: string;
	status: BatchMergeStatus;
	total_pairs: number;
	processed: number;
	successful: number;
	failed: number;
	skipped: number;
}

// Merge Audit

export interface ListMergeAuditsQuery {
	identity_id?: string;
	operator_id?: string;
	from_date?: string;
	to_date?: string;
	limit?: number;
	offset?: number;
}

export interface MergeAuditSummaryResponse {
	id: string;
	operation_id: string;
	source_identity_id: string;
	target_identity_id: string;
	operator_id: string;
	created_at: string;
}

export interface MergeAuditDetailResponse {
	id: string;
	operation_id: string;
	source_snapshot: IdentitySummary & { entitlements: MergeEntitlementSummary[] };
	target_snapshot: IdentitySummary & { entitlements: MergeEntitlementSummary[] };
	merged_snapshot: IdentitySummary & { entitlements: MergeEntitlementSummary[] };
	attribute_decisions: {
		attribute: string;
		source: 'source' | 'target';
		selected_value: unknown;
		source_value: unknown;
		target_value: unknown;
	}[];
	entitlement_decisions: {
		strategy: EntitlementStrategy;
		source_entitlements: MergeEntitlementSummary[];
		target_entitlements: MergeEntitlementSummary[];
		merged_entitlements: MergeEntitlementSummary[];
		excluded_entitlements: MergeEntitlementSummary[];
		added_count?: number;
		removed_count?: number;
	};
	sod_violations: MergeSodViolationResponse[] | null;
	created_at: string;
}

// =====================================================
// License Management Types
// =====================================================

// License Enums

export type LicenseType = 'named' | 'concurrent';
export type LicenseBillingPeriod = 'monthly' | 'annual' | 'perpetual';
export type LicenseExpirationPolicy = 'block_new' | 'revoke_all' | 'warn_only';
export type LicensePoolStatus = 'active' | 'expired' | 'archived';
export type LicenseAssignmentStatus = 'active' | 'reclaimed' | 'expired' | 'released';
export type LicenseAssignmentSource = 'manual' | 'automatic' | 'entitlement';
export type LicenseReclamationTrigger = 'inactivity' | 'lifecycle_state';
export type LicenseRecommendationType = 'underutilized' | 'high_utilization' | 'expiring_soon' | 'reclaim_opportunity';

// License Pool

export interface LicensePool {
	id: string;
	name: string;
	vendor: string;
	description: string | null;
	total_capacity: number;
	allocated_count: number;
	available_count: number;
	utilization_percent: number;
	cost_per_license: number | null;
	currency: string;
	billing_period: LicenseBillingPeriod;
	license_type: LicenseType;
	expiration_date: string | null;
	expiration_policy: LicenseExpirationPolicy;
	warning_days: number;
	status: LicensePoolStatus;
	created_at: string;
	updated_at: string;
	created_by: string;
}

export interface CreateLicensePoolRequest {
	name: string;
	vendor: string;
	description?: string;
	total_capacity: number;
	cost_per_license?: number;
	currency?: string;
	billing_period: LicenseBillingPeriod;
	license_type?: LicenseType;
	expiration_date?: string;
	expiration_policy?: LicenseExpirationPolicy;
	warning_days?: number;
}

export interface UpdateLicensePoolRequest {
	name?: string;
	vendor?: string;
	description?: string;
	total_capacity?: number;
	cost_per_license?: number;
	currency?: string;
	billing_period?: LicenseBillingPeriod;
	expiration_date?: string;
	expiration_policy?: LicenseExpirationPolicy;
	warning_days?: number;
}

export interface LicensePoolListResponse {
	items: LicensePool[];
	total: number;
	limit: number;
	offset: number;
}

// License Assignment

export interface LicenseAssignment {
	id: string;
	license_pool_id: string;
	pool_name: string | null;
	user_id: string;
	user_email: string | null;
	assigned_at: string;
	assigned_by: string;
	source: LicenseAssignmentSource;
	status: LicenseAssignmentStatus;
	reclaimed_at: string | null;
	reclaim_reason: string | null;
	notes: string | null;
	created_at: string;
}

export interface AssignLicenseRequest {
	license_pool_id: string;
	user_id: string;
	source?: LicenseAssignmentSource;
	notes?: string;
}

export interface BulkAssignLicenseRequest {
	license_pool_id: string;
	user_ids: string[];
	source?: LicenseAssignmentSource;
}

export interface BulkReclaimLicenseRequest {
	license_pool_id: string;
	assignment_ids: string[];
	reason: string;
}

export interface BulkOperationResult {
	success_count: number;
	failure_count: number;
	failures: BulkOperationFailure[];
}

export interface BulkOperationFailure {
	item_id: string;
	error: string;
}

export interface LicenseAssignmentListResponse {
	items: LicenseAssignment[];
	total: number;
	limit: number;
	offset: number;
}

// Reclamation Rule

export interface ReclamationRule {
	id: string;
	license_pool_id: string;
	pool_name: string | null;
	pool_vendor: string | null;
	trigger_type: LicenseReclamationTrigger;
	threshold_days: number | null;
	lifecycle_state: string | null;
	notification_days_before: number;
	enabled: boolean;
	created_at: string;
	updated_at: string;
	created_by: string;
}

export interface CreateReclamationRuleRequest {
	license_pool_id: string;
	trigger_type: LicenseReclamationTrigger;
	threshold_days?: number;
	lifecycle_state?: string;
	notification_days_before?: number;
}

export interface UpdateReclamationRuleRequest {
	threshold_days?: number;
	lifecycle_state?: string;
	notification_days_before?: number;
	enabled?: boolean;
}

export interface ReclamationRuleListResponse {
	items: ReclamationRule[];
	total: number;
	limit: number;
	offset: number;
}

// License Incompatibility

export interface LicenseIncompatibility {
	id: string;
	pool_a_id: string;
	pool_a_name: string | null;
	pool_a_vendor: string | null;
	pool_b_id: string;
	pool_b_name: string | null;
	pool_b_vendor: string | null;
	reason: string;
	created_at: string;
	created_by: string;
}

export interface CreateLicenseIncompatibilityRequest {
	pool_a_id: string;
	pool_b_id: string;
	reason: string;
}

export interface LicenseIncompatibilityListResponse {
	items: LicenseIncompatibility[];
	total: number;
	limit: number;
	offset: number;
}

// License-Entitlement Link

export interface LicenseEntitlementLink {
	id: string;
	license_pool_id: string;
	pool_name: string | null;
	pool_vendor: string | null;
	entitlement_id: string;
	entitlement_name: string | null;
	priority: number;
	enabled: boolean;
	created_at: string;
	created_by: string;
}

export interface CreateLicenseEntitlementLinkRequest {
	license_pool_id: string;
	entitlement_id: string;
	priority?: number;
}

export interface LicenseEntitlementLinkListResponse {
	items: LicenseEntitlementLink[];
	total: number;
	limit: number;
	offset: number;
}

// License Analytics

export interface LicenseDashboardResponse {
	summary: LicenseSummary;
	pools: LicensePoolStats[];
	cost_by_vendor: VendorCost[];
	recent_events: LicenseAuditEntry[];
}

export interface LicenseSummary {
	total_pools: number;
	total_capacity: number;
	total_allocated: number;
	total_available: number;
	overall_utilization: number;
	total_monthly_cost: number;
	expiring_soon_count: number;
}

export interface LicensePoolStats {
	id: string;
	name: string;
	vendor: string;
	total_capacity: number;
	allocated_count: number;
	utilization_percent: number;
	monthly_cost: number | null;
	status: LicensePoolStatus;
	expiration_date: string | null;
}

export interface VendorCost {
	vendor: string;
	pool_count: number;
	total_capacity: number;
	allocated_count: number;
	monthly_cost: number;
	currency: string;
}

export interface LicenseRecommendation {
	recommendation_type: LicenseRecommendationType;
	pool_id: string;
	pool_name: string;
	description: string;
	potential_savings: number | null;
	currency: string | null;
}

export interface ExpiringLicensesResponse {
	pools: ExpiringPoolInfo[];
	total_expiring: number;
}

export interface ExpiringPoolInfo {
	id: string;
	name: string;
	vendor: string;
	expiration_date: string;
	days_until_expiration: number;
	allocated_count: number;
	total_capacity: number;
	expiration_policy: LicenseExpirationPolicy;
}

// License Audit / Reports

export interface LicenseAuditEntry {
	id: string;
	pool_id: string | null;
	pool_name: string | null;
	assignment_id: string | null;
	user_id: string | null;
	user_email: string | null;
	action: string;
	actor_id: string;
	actor_email: string | null;
	details: Record<string, unknown>;
	created_at: string;
}

export interface LicenseAuditTrailResponse {
	items: LicenseAuditEntry[];
	total: number;
	limit: number;
	offset: number;
}

export interface ComplianceReportRequest {
	pool_ids?: string[];
	vendor?: string;
	from_date?: string;
	to_date?: string;
}

export interface ComplianceReport {
	generated_at: string;
	pools: CompliancePoolEntry[];
	summary: ComplianceSummary;
}

export interface CompliancePoolEntry {
	pool_id: string;
	pool_name: string;
	vendor: string;
	total_capacity: number;
	allocated_count: number;
	utilization_percent: number;
	status: LicensePoolStatus;
	expiration_date: string | null;
	is_compliant: boolean;
	issues: string[];
}

export interface ComplianceSummary {
	total_pools_reviewed: number;
	compliant_pools: number;
	non_compliant_pools: number;
	total_capacity: number;
	total_allocated: number;
	overall_utilization: number;
}

// Correlation Engine Types

export type CorrelationMatchType = 'exact' | 'fuzzy' | 'expression';
export type CorrelationAlgorithm = 'levenshtein' | 'jaro_winkler';
export type CorrelationJobStatus = 'running' | 'completed' | 'failed';
export type CorrelationCaseStatus = 'pending' | 'confirmed' | 'rejected' | 'identity_created';
export type CorrelationTriggerType = 'import' | 'reconciliation' | 'manual';
export type CorrelationEventType = 'auto_confirm' | 'manual_confirm' | 'reject' | 'create_identity' | 'reassign';
export type CorrelationOutcome = 'success' | 'failure';
export type CorrelationActorType = 'user' | 'system';

export interface CorrelationRule {
	id: string;
	tenant_id: string;
	connector_id: string;
	name: string;
	source_attribute: string;
	target_attribute: string;
	match_type: CorrelationMatchType;
	algorithm: CorrelationAlgorithm | null;
	threshold: number;
	weight: number;
	expression: string | null;
	tier: number;
	is_definitive: boolean;
	normalize: boolean;
	is_active: boolean;
	priority: number;
	created_at: string;
	updated_at: string;
}

export interface CreateCorrelationRuleRequest {
	name: string;
	source_attribute: string;
	target_attribute: string;
	match_type: CorrelationMatchType;
	algorithm?: CorrelationAlgorithm;
	threshold: number;
	weight: number;
	expression?: string;
	tier: number;
	is_definitive: boolean;
	normalize: boolean;
	priority: number;
}

export interface UpdateCorrelationRuleRequest {
	name?: string;
	source_attribute?: string;
	target_attribute?: string;
	match_type?: CorrelationMatchType;
	algorithm?: CorrelationAlgorithm | null;
	threshold?: number;
	weight?: number;
	expression?: string | null;
	tier?: number;
	is_definitive?: boolean;
	normalize?: boolean;
	is_active?: boolean;
	priority?: number;
}

export interface CorrelationRuleListResponse {
	items: CorrelationRule[];
	total: number;
	limit: number;
	offset: number;
}

export interface ValidateExpressionRequest {
	expression: string;
	test_input?: {
		source: Record<string, unknown>;
		target: Record<string, unknown>;
	};
}

export interface ValidateExpressionResponse {
	valid: boolean;
	result: string | null;
	error: string | null;
}

export interface IdentityCorrelationRule {
	id: string;
	name: string;
	attribute: string;
	match_type: CorrelationMatchType;
	algorithm: CorrelationAlgorithm | null;
	threshold: number;
	weight: number;
	is_active: boolean;
	priority: number;
	created_at: string;
	updated_at: string;
}

export interface CreateIdentityCorrelationRuleRequest {
	name: string;
	attribute: string;
	match_type: CorrelationMatchType;
	algorithm?: CorrelationAlgorithm;
	threshold: number;
	weight: number;
	priority: number;
}

export interface UpdateIdentityCorrelationRuleRequest {
	name?: string;
	attribute?: string;
	match_type?: CorrelationMatchType;
	algorithm?: CorrelationAlgorithm | null;
	threshold?: number;
	weight?: number;
	is_active?: boolean;
	priority?: number;
}

export interface IdentityCorrelationRuleListResponse {
	items: IdentityCorrelationRule[];
	total: number;
	limit: number;
	offset: number;
}

export interface CorrelationThreshold {
	id: string;
	connector_id: string;
	auto_confirm_threshold: number;
	manual_review_threshold: number;
	tuning_mode: boolean;
	include_deactivated: boolean;
	batch_size: number;
	created_at: string;
	updated_at: string;
}

export interface UpsertCorrelationThresholdRequest {
	auto_confirm_threshold?: number;
	manual_review_threshold?: number;
	tuning_mode?: boolean;
	include_deactivated?: boolean;
	batch_size?: number;
}

export interface CorrelationJob {
	job_id: string;
	status: CorrelationJobStatus;
	total_accounts: number;
	processed_accounts: number;
	auto_confirmed: number;
	queued_for_review: number;
	no_match: number;
	errors: number;
	started_at: string;
	completed_at: string | null;
}

export interface TriggerCorrelationRequest {
	account_ids?: string[];
}

export interface CorrelationCase {
	id: string;
	connector_id: string;
	connector_name: string;
	account_identifier: string;
	account_id: string | null;
	status: CorrelationCaseStatus;
	trigger_type: CorrelationTriggerType;
	highest_confidence: number;
	candidate_count: number;
	assigned_to: string | null;
	created_at: string;
}

export interface CorrelationCaseListResponse {
	items: CorrelationCase[];
	total: number;
	limit: number;
	offset: number;
}

export interface CorrelationCandidate {
	id: string;
	identity_id: string;
	identity_display_name: string;
	identity_attributes: Record<string, unknown>;
	aggregate_confidence: number;
	per_attribute_scores: Record<string, number>;
	is_deactivated: boolean;
	is_definitive_match: boolean;
}

export interface CorrelationCaseDetail extends CorrelationCase {
	account_attributes: Record<string, unknown>;
	candidates: CorrelationCandidate[];
	resolved_by: string | null;
	resolved_at: string | null;
	resolution_reason: string | null;
	rules_snapshot: Record<string, unknown>;
	updated_at: string;
}

export interface ConfirmCaseRequest {
	candidate_id: string;
	reason?: string;
}

export interface RejectCaseRequest {
	reason: string;
}

export interface CreateIdentityFromCaseRequest {
	reason?: string;
}

export interface ReassignCaseRequest {
	assigned_to: string;
	reason?: string;
}

export interface CorrelationStatistics {
	connector_id: string;
	period_start: string;
	period_end: string;
	total_evaluated: number;
	auto_confirmed_count: number;
	auto_confirmed_percentage: number;
	manual_review_count: number;
	manual_review_percentage: number;
	no_match_count: number;
	no_match_percentage: number;
	average_confidence: number;
	review_queue_depth: number;
	suggestions: string[];
}

export interface DailyTrend {
	date: string;
	total_evaluated: number;
	auto_confirmed: number;
	manual_review: number;
	no_match: number;
	average_confidence: number;
}

export interface CorrelationTrends {
	connector_id: string;
	period_start: string;
	period_end: string;
	daily_trends: DailyTrend[];
	suggestions: string[];
}

export interface CorrelationAuditEvent {
	id: string;
	connector_id: string;
	account_id: string;
	case_id: string;
	identity_id: string;
	event_type: CorrelationEventType;
	outcome: CorrelationOutcome;
	confidence_score: number;
	candidate_count: number;
	candidates_summary: Record<string, unknown>;
	rules_snapshot: Record<string, unknown>;
	thresholds_snapshot: Record<string, unknown>;
	actor_type: CorrelationActorType;
	actor_id: string | null;
	reason: string | null;
	created_at: string;
}

export interface CorrelationAuditListResponse {
	items: CorrelationAuditEvent[];
	total: number;
	limit: number;
	offset: number;
}

// ─── Birthright Policies & Lifecycle Workflows ───

export type BirthrightPolicyStatus = 'active' | 'inactive' | 'archived';
export type EvaluationMode = 'first_match' | 'all_match';
export type BirthrightOperator = 'equals' | 'not_equals' | 'in' | 'not_in' | 'starts_with' | 'contains';
export type LifecycleEventType = 'joiner' | 'mover' | 'leaver';
export type LifecycleActionType = 'provision' | 'revoke' | 'schedule_revoke' | 'cancel_revoke' | 'skip';

export interface BirthrightCondition {
	attribute: string;
	operator: BirthrightOperator;
	value: string | string[];
}

export interface BirthrightPolicy {
	id: string;
	tenant_id: string;
	name: string;
	description: string | null;
	priority: number;
	conditions: BirthrightCondition[];
	entitlement_ids: string[];
	status: BirthrightPolicyStatus;
	evaluation_mode: EvaluationMode;
	grace_period_days: number;
	created_by: string;
	created_at: string;
	updated_at: string;
}

export interface CreateBirthrightPolicyRequest {
	name: string;
	description?: string;
	priority: number;
	conditions: BirthrightCondition[];
	entitlement_ids: string[];
	evaluation_mode?: EvaluationMode;
	grace_period_days?: number;
}

export interface UpdateBirthrightPolicyRequest {
	name?: string;
	description?: string;
	priority?: number;
	conditions?: BirthrightCondition[];
	entitlement_ids?: string[];
	evaluation_mode?: EvaluationMode;
	grace_period_days?: number;
}

export interface BirthrightPolicyListResponse {
	items: BirthrightPolicy[];
	total: number;
	limit: number;
	offset: number;
}

export interface SimulatePolicyRequest {
	attributes: Record<string, unknown>;
}

export interface ConditionEvaluationResult {
	attribute: string;
	operator: string;
	expected: unknown;
	actual: unknown | null;
	matched: boolean;
}

export interface SimulatePolicyResponse {
	matches: boolean;
	condition_results: ConditionEvaluationResult[];
}

export interface SimulateAllPoliciesResponse {
	attributes: Record<string, unknown>;
	matching_policies: {
		policy_id: string;
		policy_name: string;
		priority: number;
		entitlements: string[];
	}[];
	total_entitlements: string[];
}

export interface ImpactSummary {
	total_users_affected: number;
	users_gaining_access: number;
	users_losing_access: number;
	users_unchanged: number;
	total_entitlements_granted: number;
}

export interface DepartmentImpact {
	department: string;
	user_count: number;
	percentage: number;
}

export interface LocationImpact {
	location: string;
	user_count: number;
	percentage: number;
}

export interface EntitlementImpact {
	entitlement_id: string;
	entitlement_name: string | null;
	users_gaining: number;
	users_already_have: number;
}

export interface AffectedUser {
	user_id: string;
	email: string | null;
	department: string | null;
	location: string | null;
	impact_type: 'gaining' | 'losing' | 'unchanged' | 'mixed';
	entitlements_gaining: string[];
	entitlements_losing: string[];
}

export interface ImpactAnalysisResponse {
	policy_id: string;
	policy_name: string;
	summary: ImpactSummary;
	by_department: DepartmentImpact[];
	by_location: LocationImpact[];
	entitlement_impacts: EntitlementImpact[];
	affected_users: AffectedUser[];
	is_truncated: boolean;
}

export interface LifecycleEvent {
	id: string;
	tenant_id: string;
	user_id: string;
	event_type: LifecycleEventType;
	attributes_before: Record<string, unknown> | null;
	attributes_after: Record<string, unknown> | null;
	source: string;
	processed_at: string | null;
	created_at: string;
}

export interface CreateLifecycleEventRequest {
	user_id: string;
	event_type: LifecycleEventType;
	attributes_before?: Record<string, unknown>;
	attributes_after?: Record<string, unknown>;
	source?: string;
}

export interface LifecycleAction {
	id: string;
	tenant_id?: string;
	event_id: string;
	action_type: LifecycleActionType;
	assignment_id: string | null;
	policy_id: string | null;
	entitlement_id: string;
	scheduled_at: string | null;
	executed_at: string | null;
	cancelled_at: string | null;
	error_message: string | null;
	created_at: string;
	is_pending?: boolean;
	is_executed?: boolean;
	is_cancelled?: boolean;
}

export interface AccessSnapshotSummary {
	id: string;
	snapshot_type: string;
	assignment_count: number;
	created_at: string;
}

/** GET /governance/lifecycle-events/{id} — backend flattens event fields to top level */
export interface LifecycleEventDetail extends LifecycleEvent {
	actions: LifecycleAction[];
	snapshot: AccessSnapshotSummary | null;
}

export interface ProcessEventResult {
	event: LifecycleEvent;
	actions: LifecycleAction[];
	snapshot: AccessSnapshotSummary | null;
	summary: {
		provisioned: number;
		revoked: number;
		skipped: number;
		scheduled: number;
	};
}

export interface LifecycleEventListResponse {
	items: LifecycleEvent[];
	total: number;
	limit: number;
	offset: number;
}

// ─── Power of Attorney & Identity Delegation ────────────────────────

export type PoaStatus = 'pending' | 'active' | 'expired' | 'revoked';

export type PoaEventType = 'granted' | 'activated' | 'assumed' | 'dropped' | 'extended' | 'revoked' | 'expired';

export interface PoaScope {
	application_ids: string[];
	workflow_types: string[];
}

export interface PoaGrant {
	id: string;
	donor_id: string;
	attorney_id: string;
	starts_at: string;
	ends_at: string;
	status: PoaStatus;
	is_currently_active: boolean;
	scope_id: string | null;
	reason: string | null;
	created_at: string;
	revoked_at: string | null;
	revoked_by: string | null;
}

export interface GrantPoaRequest {
	attorney_id: string;
	starts_at: string;
	ends_at: string;
	scope?: PoaScope;
	reason?: string;
}

export interface RevokePoaRequest {
	reason?: string;
}

export interface ExtendPoaRequest {
	new_ends_at: string;
}

export interface AssumeIdentityResponse {
	access_token: string;
	session_id: string;
	donor_id: string;
	donor_name: string | null;
	donor_email: string | null;
	scope: PoaScope | null;
}

export interface CurrentAssumptionStatus {
	is_assuming: boolean;
	poa_id?: string | null;
	donor_id?: string | null;
	donor_name?: string | null;
	session_id?: string | null;
	assumed_at?: string | null;
	scope?: PoaScope | null;
}

export interface PoaAuditEvent {
	id: string;
	event_type: PoaEventType;
	actor_id: string;
	actor_name: string | null;
	affected_user_id: string | null;
	affected_user_name: string | null;
	details: Record<string, unknown> | null;
	created_at: string;
}

export interface PoaListResponse {
	items: PoaGrant[];
	total: number;
	limit: number;
	offset: number;
}

export interface PoaAuditListResponse {
	items: PoaAuditEvent[];
	total: number;
	limit: number;
	offset: number;
}

// ===================== Catalog & Birthright Types =====================

// --- Catalog Category ---

export interface CatalogCategory {
	id: string;
	name: string;
	description: string | null;
	parent_id: string | null;
	icon: string | null;
	display_order: number;
	created_at: string;
	updated_at: string;
}

export interface CatalogCategoryListResponse {
	items: CatalogCategory[];
	total: number;
	limit: number;
	offset: number;
}

// --- Catalog Item ---

export type CatalogItemType = 'role' | 'entitlement' | 'resource';

export interface RequestabilityRules {
	self_request?: boolean;
	manager_request?: boolean;
	department_restriction?: string[];
	archetype_restriction?: string[];
	prerequisite_roles?: string[];
	prerequisite_entitlements?: string[];
}

export interface FormField {
	name: string;
	label: string;
	field_type: string;
	required: boolean;
	options?: string[];
	placeholder?: string;
}

export interface CatalogItem {
	id: string;
	category_id: string | null;
	item_type: CatalogItemType;
	name: string;
	description: string | null;
	reference_id: string | null;
	requestability_rules: RequestabilityRules | null;
	form_fields: FormField[];
	tags: string[];
	icon: string | null;
	is_enabled: boolean;
	can_request: boolean;
	cannot_request_reason: string | null;
	created_at: string;
	updated_at: string;
}

export interface CatalogItemListResponse {
	items: CatalogItem[];
	total: number;
	limit: number;
	offset: number;
}

// --- Shopping Cart ---

export interface CartItem {
	id: string;
	catalog_item_id: string;
	catalog_item_name: string;
	catalog_item_type: CatalogItemType;
	parameters: Record<string, unknown>;
	form_values: Record<string, unknown>;
	added_at: string;
}

export interface CartResponse {
	requester_id: string;
	beneficiary_id: string | null;
	items: CartItem[];
	item_count: number;
	created_at: string;
	updated_at: string;
}

export interface CartItemResponse {
	id: string;
	catalog_item_id: string;
	catalog_item_name: string;
	catalog_item_type: CatalogItemType;
	parameters: Record<string, unknown>;
	form_values: Record<string, unknown>;
	added_at: string;
}

export interface ValidationIssue {
	cart_item_id: string | null;
	code: string;
	message: string;
}

export interface CartSodViolation {
	rule_id: string;
	rule_name: string;
	conflicting_item_ids: string[];
	description: string;
}

export interface CartValidationResponse {
	valid: boolean;
	issues: ValidationIssue[];
	sod_violations: CartSodViolation[];
}

export interface SubmissionItem {
	cart_item_id: string;
	access_request_id: string;
}

export interface CartSubmissionResponse {
	submission_id: string;
	items: SubmissionItem[];
	request_count: number;
}

export interface AddToCartRequest {
	catalog_item_id: string;
	beneficiary_id?: string;
	parameters?: Record<string, unknown>;
	form_values?: Record<string, unknown>;
}

export interface UpdateCartItemRequest {
	parameters?: Record<string, unknown>;
	form_values?: Record<string, unknown>;
}

export interface SubmitCartRequest {
	beneficiary_id?: string;
	global_justification?: string;
}

// --- Catalog Admin ---

export interface CreateCategoryRequest {
	name: string;
	description?: string;
	parent_id?: string;
	icon?: string;
	display_order?: number;
}

export interface UpdateCategoryRequest {
	name?: string;
	description?: string;
	parent_id?: string | null;
	icon?: string | null;
	display_order?: number;
}

export interface CreateCatalogItemRequest {
	category_id?: string;
	item_type: CatalogItemType;
	name: string;
	description?: string;
	reference_id?: string;
	requestability_rules?: RequestabilityRules;
	form_fields?: FormField[];
	tags?: string[];
}

export interface UpdateCatalogItemRequest {
	category_id?: string | null;
	item_type?: CatalogItemType;
	name?: string;
	description?: string | null;
	reference_id?: string | null;
	requestability_rules?: RequestabilityRules | null;
	form_fields?: FormField[];
	tags?: string[];
}

// ============================================================================
// Lifecycle Configuration Types
// ============================================================================

export type LifecycleObjectType = 'user' | 'entitlement' | 'role';

export type EntitlementAction = 'none' | 'pause' | 'revoke';

export interface LifecycleConfig {
	id: string;
	tenant_id: string;
	name: string;
	description: string | null;
	object_type: LifecycleObjectType;
	is_active: boolean;
	auto_assign_initial_state: boolean;
	created_at: string;
	updated_at: string;
}

export interface LifecycleState {
	id: string;
	config_id: string;
	name: string;
	description: string | null;
	is_initial: boolean;
	is_terminal: boolean;
	entitlement_action: EntitlementAction;
	position: number;
	created_at: string;
	updated_at: string;
}

export interface LifecycleTransition {
	id: string;
	config_id: string;
	name: string;
	from_state_id: string;
	to_state_id: string;
	requires_approval: boolean;
	grace_period_hours: number | null;
	created_at: string;
}

export interface TransitionCondition {
	condition_type: string;
	attribute_path: string;
	expression: string;
}

export interface LifecycleStateAction {
	action_type: string;
	parameters: Record<string, unknown>;
}

export interface LifecycleConfigDetail extends LifecycleConfig {
	states: LifecycleState[];
	transitions: LifecycleTransition[];
}

export interface UserLifecycleStatus {
	user_id: string;
	config_id: string | null;
	config_name: string | null;
	state_id: string | null;
	state_name: string | null;
	is_initial: boolean;
	is_terminal: boolean;
	entered_at: string | null;
	entitlement_action: string | null;
}

export interface LifecycleConfigListResponse {
	items: LifecycleConfig[];
	total: number;
	limit: number;
	offset: number;
}

export interface CreateLifecycleConfigRequest {
	name: string;
	object_type: LifecycleObjectType;
	description?: string;
	auto_assign_initial_state?: boolean;
}

export interface UpdateLifecycleConfigRequest {
	name?: string;
	description?: string | null;
	is_active?: boolean;
	auto_assign_initial_state?: boolean;
}

export interface CreateLifecycleStateRequest {
	name: string;
	description?: string;
	is_initial: boolean;
	is_terminal: boolean;
	entitlement_action: EntitlementAction;
	position: number;
}

export interface UpdateLifecycleStateRequest {
	name?: string;
	description?: string | null;
	is_initial?: boolean;
	is_terminal?: boolean;
	entitlement_action?: EntitlementAction;
	position?: number;
}

export interface CreateLifecycleTransitionRequest {
	name: string;
	from_state_id: string;
	to_state_id: string;
	requires_approval?: boolean;
	grace_period_hours?: number;
}

export interface TransitionConditionsResponse {
	conditions: TransitionCondition[];
}

export interface UpdateTransitionConditionsRequest {
	conditions: TransitionCondition[];
}

export interface EvaluateConditionsRequest {
	context: Record<string, unknown>;
}

export interface ConditionEvaluationResult {
	condition_type: string;
	passed: boolean;
	message?: string;
}

export interface EvaluateConditionsResponse {
	is_allowed: boolean;
	results: ConditionEvaluationResult[];
}

export interface StateActionsResponse {
	entry_actions: LifecycleStateAction[];
	exit_actions: LifecycleStateAction[];
}

export interface UpdateStateActionsRequest {
	entry_actions?: LifecycleStateAction[];
	exit_actions?: LifecycleStateAction[];
}

// Role Mining Types

export type MiningJobStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
export type CandidatePromotionStatus = 'pending' | 'promoted' | 'dismissed';
export type PrivilegeFlagStatus = 'pending' | 'reviewed' | 'remediated' | 'accepted';
export type PrivilegeReviewAction = 'accept' | 'remediate';
export type ConsolidationStatus = 'pending' | 'merged' | 'dismissed';
export type ScenarioType = 'add_entitlement' | 'remove_entitlement' | 'add_role' | 'remove_role' | 'modify_role';
export type SimulationStatus = 'draft' | 'executed' | 'applied' | 'cancelled';
export type TrendDirection = 'up' | 'stable' | 'down';

export interface MiningJobParameters {
	min_users?: number;
	min_entitlements?: number;
	confidence_threshold?: number;
	include_excessive_privilege?: boolean;
	include_consolidation?: boolean;
	consolidation_threshold?: number;
	deviation_threshold?: number;
	peer_group_attribute?: string | null;
}

export interface MiningJob {
	id: string;
	tenant_id: string;
	name: string;
	status: MiningJobStatus;
	parameters: MiningJobParameters;
	progress_percent: number;
	candidate_count: number;
	excessive_privilege_count: number;
	consolidation_suggestion_count: number;
	started_at: string | null;
	completed_at: string | null;
	error_message: string | null;
	created_by: string;
	created_at: string;
	updated_at: string;
}

export interface MiningJobListResponse {
	items: MiningJob[];
	total: number;
	page: number;
	page_size: number;
}

export interface CreateMiningJobRequest {
	name: string;
	parameters?: MiningJobParameters;
}

export interface RoleCandidate {
	id: string;
	job_id: string;
	proposed_name: string;
	confidence_score: number;
	member_count: number;
	entitlement_ids: string[];
	user_ids: string[];
	promotion_status: CandidatePromotionStatus;
	promoted_role_id: string | null;
	dismissed_reason: string | null;
	created_at: string;
}

export interface RoleCandidateListResponse {
	items: RoleCandidate[];
	total: number;
	page: number;
	page_size: number;
}

export interface PromoteCandidateRequest {
	role_name?: string;
	description?: string;
}

export interface DismissCandidateRequest {
	reason?: string;
}

export interface AccessPattern {
	id: string;
	job_id: string;
	entitlement_ids: string[];
	frequency: number;
	user_count: number;
	sample_user_ids: string[];
	created_at: string;
}

export interface AccessPatternListResponse {
	items: AccessPattern[];
	total: number;
	page: number;
	page_size: number;
}

export interface ExcessivePrivilege {
	id: string;
	job_id: string;
	user_id: string;
	peer_group_id: string | null;
	deviation_percent: number;
	excess_entitlements: string[];
	peer_average: number;
	user_count: number;
	status: PrivilegeFlagStatus;
	notes: string | null;
	reviewed_by: string | null;
	reviewed_at: string | null;
	created_at: string;
}

export interface ExcessivePrivilegeListResponse {
	items: ExcessivePrivilege[];
	total: number;
	page: number;
	page_size: number;
}

export interface ReviewExcessivePrivilegeRequest {
	action: PrivilegeReviewAction;
	notes?: string;
}

export interface ConsolidationSuggestion {
	id: string;
	job_id: string;
	role_a_id: string;
	role_b_id: string;
	overlap_percent: number;
	shared_entitlements: string[];
	unique_to_a: string[];
	unique_to_b: string[];
	status: ConsolidationStatus;
	dismissed_reason: string | null;
	created_at: string;
}

export interface ConsolidationSuggestionListResponse {
	items: ConsolidationSuggestion[];
	total: number;
	page: number;
	page_size: number;
}

export interface DismissConsolidationRequest {
	reason?: string;
}

export interface SimulationChanges {
	change_type?: string;
	role_id?: string;
	entitlement_id?: string;
	entitlement_ids?: string[];
	user_ids?: string[];
	role_name?: string;
	role_description?: string;
}

export interface Simulation {
	id: string;
	tenant_id: string;
	name: string;
	scenario_type: ScenarioType;
	target_role_id: string | null;
	changes: SimulationChanges;
	status: SimulationStatus;
	affected_users: string[];
	access_gained: unknown;
	access_lost: unknown;
	applied_by: string | null;
	applied_at: string | null;
	created_by: string;
	created_at: string;
}

export interface SimulationListResponse {
	items: Simulation[];
	total: number;
	page: number;
	page_size: number;
}

export interface CreateSimulationRequest {
	name: string;
	scenario_type: ScenarioType;
	target_role_id?: string;
	changes: SimulationChanges;
}

export interface EntitlementUsage {
	entitlement_id: string;
	used_by_count: number;
	total_users: number;
	usage_rate: number;
}

export interface RoleMetrics {
	id: string;
	tenant_id: string;
	role_id: string;
	utilization_rate: number;
	coverage_rate: number;
	user_count: number;
	active_user_count: number;
	entitlement_usage: EntitlementUsage[];
	trend_direction: TrendDirection;
	calculated_at: string;
}

export interface RoleMetricsListResponse {
	items: RoleMetrics[];
	total: number;
	page: number;
	page_size: number;
}

export interface CalculateMetricsRequest {
	role_ids?: string[];
}

export interface CalculateMetricsResponse {
	roles_calculated: number;
	calculated_at: string;
}

// --- Micro Certifications ---

export type MicroCertificationStatus = 'pending' | 'approved' | 'revoked' | 'auto_revoked' | 'flagged_for_review' | 'expired' | 'skipped';
export type TriggerType = 'high_risk_assignment' | 'sod_violation' | 'manager_change' | 'periodic_recert' | 'manual';
export type ScopeType = 'tenant' | 'application' | 'entitlement';
export type ReviewerType = 'user_manager' | 'entitlement_owner' | 'application_owner' | 'specific_user';
export type CertDecision = 'approve' | 'revoke' | 'reduce' | 'delegate';
export type CertEventType = 'created' | 'reminder_sent' | 'escalated' | 'approved' | 'rejected' | 'flagged_for_review' | 'delegated' | 'auto_revoked' | 'expired' | 'skipped' | 'assignment_revoked';

export interface MicroCertification {
	id: string;
	tenant_id: string;
	user_id: string;
	assignment_id: string | null;
	entitlement_id: string;
	trigger_rule_id: string | null;
	reviewer_id: string;
	status: MicroCertificationStatus;
	decision: CertDecision | null;
	comment: string | null;
	decided_at: string | null;
	delegated_to: string | null;
	escalated: boolean;
	past_deadline: boolean;
	from_date: string | null;
	to_date: string | null;
	created_at: string;
}

export interface MicroCertificationListResponse {
	items: MicroCertification[];
	total: number;
	limit: number;
	offset: number;
}

export interface TriggerRule {
	id: string;
	tenant_id: string;
	name: string;
	trigger_type: TriggerType;
	scope_type: ScopeType;
	scope_id: string | null;
	reviewer_type: ReviewerType;
	specific_reviewer_id: string | null;
	fallback_reviewer_id: string | null;
	timeout_secs: number | null;
	reminder_threshold_percent: number | null;
	auto_revoke: boolean;
	revoke_triggering_assignment: boolean;
	is_active: boolean;
	is_default: boolean;
	priority: number | null;
	metadata: Record<string, unknown> | null;
	created_at: string;
}

export interface TriggerRuleListResponse {
	items: TriggerRule[];
	total: number;
	limit: number;
	offset: number;
}

export interface CertificationEvent {
	id: string;
	certification_id: string;
	event_type: CertEventType;
	actor_id: string | null;
	details: Record<string, unknown> | null;
	created_at: string;
}

export interface CertificationEventListResponse {
	items: CertificationEvent[];
	total: number;
	limit?: number;
	offset?: number;
}

export interface MicroCertificationStats {
	total: number;
	pending: number;
	approved: number;
	revoked: number;
	auto_revoked: number;
	flagged_for_review: number;
	expired: number;
	skipped: number;
	escalated: number;
	past_deadline: number;
	by_trigger_type?: Array<{ trigger_type: string; count: number }>;
}

export interface DecideMicroCertificationRequest {
	decision: CertDecision;
	comment?: string;
}

export interface DelegateMicroCertificationRequest {
	delegate_to: string;
	comment?: string;
}

export interface SkipMicroCertificationRequest {
	reason: string;
}

export interface BulkDecisionRequest {
	certification_ids: string[];
	decision: CertDecision;
	comment?: string;
}

export interface BulkDecisionResponse {
	success_count: number;
	failure_count: number;
	succeeded: string[];
	failures: Array<{ certification_id: string; error: string }>;
}

export interface ManualTriggerRequest {
	user_id: string;
	entitlement_id: string;
	trigger_rule_id?: string;
	reviewer_id?: string;
	reason: string;
}

export interface CreateTriggerRuleRequest {
	name: string;
	trigger_type: TriggerType;
	scope_type: ScopeType;
	scope_id?: string;
	reviewer_type: ReviewerType;
	specific_reviewer_id?: string;
	fallback_reviewer_id?: string;
	timeout_secs?: number;
	reminder_threshold_percent?: number;
	auto_revoke?: boolean;
	revoke_triggering_assignment?: boolean;
	is_default?: boolean;
	priority?: number;
	metadata?: Record<string, unknown>;
}

export interface UpdateTriggerRuleRequest {
	name?: string;
	trigger_type?: TriggerType;
	scope_type?: ScopeType;
	scope_id?: string;
	reviewer_type?: ReviewerType;
	specific_reviewer_id?: string;
	fallback_reviewer_id?: string;
	timeout_secs?: number;
	reminder_threshold_percent?: number;
	auto_revoke?: boolean;
	revoke_triggering_assignment?: boolean;
	is_default?: boolean;
	priority?: number;
	metadata?: Record<string, unknown>;
}

// ===== SIEM Export & Audit Streaming (Phase 035) =====

export type DestinationType = 'syslog_tcp_tls' | 'syslog_udp' | 'webhook' | 'splunk_hec';
export type ExportFormat = 'cef' | 'syslog_rfc5424' | 'json' | 'csv';
export type CircuitState = 'closed' | 'open' | 'half_open';
export type BatchExportStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type DeliveryStatus = 'pending' | 'delivered' | 'failed' | 'dead_letter' | 'dropped';
export type EventCategory = 'authentication' | 'user_lifecycle' | 'group_changes' | 'access_requests' | 'provisioning' | 'administrative' | 'security' | 'entitlement' | 'sod_violation';

export interface SiemDestination {
	id: string;
	tenant_id: string;
	name: string;
	destination_type: DestinationType;
	endpoint_host: string;
	endpoint_port: number | null;
	export_format: ExportFormat;
	has_auth_config: boolean;
	event_type_filter: EventCategory[];
	rate_limit_per_second: number;
	queue_buffer_size: number;
	circuit_breaker_threshold: number;
	circuit_breaker_cooldown_secs: number;
	circuit_state: CircuitState;
	circuit_last_failure_at: string | null;
	enabled: boolean;
	splunk_source: string | null;
	splunk_sourcetype: string | null;
	splunk_index: string | null;
	splunk_ack_enabled: boolean;
	syslog_facility: number;
	tls_verify_cert: boolean;
	created_at: string;
	updated_at: string;
	created_by: string;
}

export interface SiemDestinationListResponse {
	items: SiemDestination[];
	total: number;
	limit: number;
	offset: number;
}

export interface CreateSiemDestinationRequest {
	name: string;
	destination_type: DestinationType;
	endpoint_host: string;
	endpoint_port?: number;
	export_format: ExportFormat;
	auth_config_b64?: string;
	event_type_filter?: EventCategory[];
	rate_limit_per_second?: number;
	queue_buffer_size?: number;
	circuit_breaker_threshold?: number;
	circuit_breaker_cooldown_secs?: number;
	enabled?: boolean;
	splunk_source?: string;
	splunk_sourcetype?: string;
	splunk_index?: string;
	splunk_ack_enabled?: boolean;
	syslog_facility?: number;
	tls_verify_cert?: boolean;
}

export interface UpdateSiemDestinationRequest {
	name?: string;
	endpoint_host?: string;
	endpoint_port?: number;
	export_format?: ExportFormat;
	auth_config_b64?: string;
	event_type_filter?: EventCategory[];
	rate_limit_per_second?: number;
	queue_buffer_size?: number;
	circuit_breaker_threshold?: number;
	circuit_breaker_cooldown_secs?: number;
	enabled?: boolean;
	splunk_source?: string;
	splunk_sourcetype?: string;
	splunk_index?: string;
	splunk_ack_enabled?: boolean;
	syslog_facility?: number;
	tls_verify_cert?: boolean;
}

export interface SiemBatchExport {
	id: string;
	tenant_id: string;
	requested_by: string;
	date_range_start: string;
	date_range_end: string;
	event_type_filter: EventCategory[];
	output_format: ExportFormat;
	status: BatchExportStatus;
	total_events: number | null;
	file_size_bytes: number | null;
	error_detail: string | null;
	started_at: string | null;
	completed_at: string | null;
	expires_at: string | null;
	created_at: string;
}

export interface SiemBatchExportListResponse {
	items: SiemBatchExport[];
	total: number;
	limit: number;
	offset: number;
}

export interface CreateSiemExportRequest {
	date_range_start: string;
	date_range_end: string;
	event_type_filter?: EventCategory[];
	output_format: ExportFormat;
}

export interface SiemHealthSummary {
	destination_id: string;
	total_events_sent: number;
	total_events_delivered: number;
	total_events_failed: number;
	total_events_dropped: number;
	avg_latency_ms: number | null;
	last_success_at: string | null;
	last_failure_at: string | null;
	success_rate_percent: number;
	circuit_state: CircuitState;
	dead_letter_count: number;
}

export interface SiemDeliveryHealth {
	id: string;
	destination_id: string;
	window_start: string;
	window_end: string;
	events_sent: number;
	events_delivered: number;
	events_failed: number;
	events_dropped: number;
	avg_latency_ms: number | null;
	p95_latency_ms: number | null;
	last_success_at: string | null;
	last_failure_at: string | null;
	created_at: string;
}

export interface SiemDeliveryHealthListResponse {
	items: SiemDeliveryHealth[];
	total: number;
	limit: number;
	offset: number;
}

export interface SiemExportEvent {
	id: string;
	destination_id: string;
	source_event_id: string;
	source_event_type: string;
	event_timestamp: string;
	formatted_payload: string | null;
	delivery_status: DeliveryStatus;
	retry_count: number;
	next_retry_at: string | null;
	last_attempt_at: string | null;
	error_detail: string | null;
	delivered_at: string | null;
	delivery_latency_ms: number | null;
	created_at: string;
}

export interface SiemExportEventListResponse {
	items: SiemExportEvent[];
	total: number;
	limit: number;
	offset: number;
}

export interface TestConnectivityResponse {
	success: boolean;
	latency_ms: number | null;
	error: string | null;
}

export interface RedeliverResponse {
	events_requeued: number;
}

// ===== Provisioning Scripts (Phase 036) =====

export interface ProvisioningScript {
	id: string;
	tenant_id: string;
	name: string;
	description: string | null;
	current_version: number;
	status: string; // draft | active | inactive
	is_system: boolean;
	created_by: string;
	created_at: string;
	updated_at: string;
}

export interface ProvisioningScriptListResponse {
	scripts: ProvisioningScript[];
	total: number;
}

export interface ScriptVersion {
	id: string;
	script_id: string;
	version_number: number;
	script_body: string;
	change_description: string | null;
	created_by: string;
	created_at: string;
}

export interface ScriptVersionListResponse {
	versions: ScriptVersion[];
	total: number;
}

export interface VersionDiffLine {
	line_number: number;
	change_type: string; // added | removed | unchanged
	content: string;
}

export interface VersionCompareResponse {
	version_a: number;
	version_b: number;
	diff_lines: VersionDiffLine[];
}

export interface CreateProvisioningScriptRequest {
	name: string;
	description?: string;
}

export interface UpdateProvisioningScriptRequest {
	name?: string;
	description?: string;
}

export interface CreateScriptVersionRequest {
	script_body: string;
	change_description?: string;
}

export interface RollbackScriptRequest {
	target_version: number;
	reason?: string;
}

export interface HookBinding {
	id: string;
	tenant_id: string;
	script_id: string;
	connector_id: string;
	hook_phase: string; // before | after
	operation_type: string; // create | update | delete | enable | disable
	execution_order: number;
	failure_policy: string; // abort | continue | retry
	max_retries: number | null;
	timeout_seconds: number | null;
	enabled: boolean;
	created_by: string;
	created_at: string;
	updated_at: string;
}

export interface HookBindingListResponse {
	bindings: HookBinding[];
	total: number;
}

export interface CreateHookBindingRequest {
	script_id: string;
	connector_id: string;
	hook_phase: string;
	operation_type: string;
	execution_order: number;
	failure_policy?: string;
	max_retries?: number;
	timeout_seconds?: number;
}

export interface UpdateHookBindingRequest {
	execution_order?: number;
	failure_policy?: string;
	max_retries?: number;
	timeout_seconds?: number;
	enabled?: boolean;
}

export interface ScriptTemplate {
	id: string;
	tenant_id: string;
	name: string;
	description: string | null;
	category: string; // attribute_mapping | value_generation | conditional_logic | data_formatting | custom
	template_body: string;
	placeholder_annotations: unknown;
	is_system: boolean;
	created_by: string;
	created_at: string;
	updated_at: string;
}

export interface ScriptTemplateListResponse {
	templates: ScriptTemplate[];
	total: number;
}

export interface CreateScriptTemplateRequest {
	name: string;
	description?: string;
	category: string;
	template_body: string;
	placeholder_annotations?: unknown;
}

export interface UpdateScriptTemplateRequest {
	name?: string;
	description?: string;
	category?: string;
	template_body?: string;
	placeholder_annotations?: unknown;
}

export interface InstantiateTemplateRequest {
	name: string;
	description?: string;
}

export interface ScriptValidationError {
	line: number | null;
	column: number | null;
	message: string;
}

export interface ScriptValidationResult {
	valid: boolean;
	errors: ScriptValidationError[];
}

export interface ScriptDryRunResult {
	success: boolean;
	output: unknown;
	error: string | null;
	duration_ms: number;
}

export interface ScriptAnalyticsSummaryItem {
	script_id: string;
	name: string;
	total_executions: number;
	success_count: number;
	failure_count: number;
	avg_duration_ms: number;
}

export interface ScriptAnalyticsDashboard {
	total_scripts: number;
	active_scripts: number;
	total_executions: number;
	success_rate: number;
	avg_duration_ms: number;
	scripts: ScriptAnalyticsSummaryItem[];
}

export interface ScriptDailyTrend {
	date: string;
	executions: number;
	successes: number;
	failures: number;
	avg_duration_ms: number;
}

export interface ScriptTopError {
	error_message: string;
	count: number;
	last_occurred: string;
}

export interface ScriptAnalyticsDetail {
	script_id: string;
	name: string;
	total_executions: number;
	success_rate: number;
	avg_duration_ms: number;
	p95_duration_ms: number;
	daily_trends: ScriptDailyTrend[];
	top_errors: ScriptTopError[];
}

export interface ScriptExecutionLog {
	id: string;
	tenant_id: string;
	script_id: string;
	binding_id: string | null;
	connector_id: string | null;
	script_version: number;
	status: string; // success | failure | timeout | skipped
	dry_run: boolean;
	input_context: unknown;
	output: unknown;
	error: string | null;
	duration_ms: number;
	executed_by: string;
	executed_at: string;
}

export interface ScriptExecutionLogListResponse {
	logs: ScriptExecutionLog[];
	total: number;
}

export interface ScriptAuditEvent {
	event_id: string;
	script_id: string;
	action: string;
	actor_id: string;
	details: string | null;
	created_at: string;
}

export interface ScriptAuditEventListResponse {
	events: ScriptAuditEvent[];
	total: number;
}

// ============================================================================
// Governance Operations & SLA Management (Phase 037)
// ============================================================================

// --- SLA Policy ---

export interface CreateSlaPolicyRequest {
	name: string;
	description?: string;
	target_duration_seconds: number;
	warning_threshold_percent: number;
	breach_notification_enabled: boolean;
	escalation_contacts?: unknown;
}

export interface SlaPolicyResponse {
	id: string;
	name: string;
	description?: string;
	target_duration_seconds: number;
	target_duration_human: string;
	warning_threshold_percent: number;
	breach_notification_enabled: boolean;
	is_active: boolean;
	created_at: string;
	updated_at: string;
}

export interface UpdateSlaPolicyRequest {
	name?: string;
	description?: string;
	target_duration_seconds?: number;
	warning_threshold_percent?: number;
	breach_notification_enabled?: boolean;
	escalation_contacts?: unknown;
}

export interface SlaPolicyListResponse {
	items: SlaPolicyResponse[];
	total: number;
	limit: number;
	offset: number;
}

// --- Ticketing Configuration ---

export type TicketingSystemType = 'service_now' | 'jira' | 'webhook';

export interface CreateTicketingConfigurationRequest {
	name: string;
	ticketing_type: TicketingSystemType;
	endpoint_url: string;
	credentials: string;
	field_mappings?: unknown;
	default_assignee?: string;
	default_assignment_group?: string;
	project_key?: string;
	issue_type?: string;
	polling_interval_seconds: number;
}

export interface TicketingConfigurationResponse {
	id: string;
	name: string;
	ticketing_type: TicketingSystemType;
	endpoint_url: string;
	polling_interval_seconds: number;
	default_assignee?: string;
	default_assignment_group?: string;
	project_key?: string;
	issue_type?: string;
	is_active: boolean;
	created_at: string;
	updated_at: string;
}

export interface UpdateTicketingConfigurationRequest {
	name?: string;
	ticketing_type?: TicketingSystemType;
	endpoint_url?: string;
	credentials?: string;
	field_mappings?: unknown;
	default_assignee?: string;
	default_assignment_group?: string;
	project_key?: string;
	issue_type?: string;
	polling_interval_seconds?: number;
}

export interface TicketingConfigurationListResponse {
	items: TicketingConfigurationResponse[];
	total: number;
	limit: number;
	offset: number;
}

// --- Bulk Actions ---

export type BulkActionType = 'assign_role' | 'revoke_role' | 'enable' | 'disable' | 'modify_attribute';
export type BulkActionStatus = 'pending' | 'previewing' | 'approved' | 'executing' | 'completed' | 'failed' | 'cancelled';

export interface CreateBulkActionRequest {
	filter_expression: string;
	action_type: BulkActionType;
	action_params: unknown;
	justification: string;
}

export interface BulkActionResponse {
	id: string;
	tenant_id: string;
	filter_expression: string;
	action_type: BulkActionType;
	action_params: unknown;
	status: BulkActionStatus;
	justification: string;
	total_matched: number;
	processed_count: number;
	success_count: number;
	failure_count: number;
	skipped_count: number;
	created_by: string;
	created_at: string;
	started_at?: string;
	completed_at?: string;
}

export interface BulkActionListResponse {
	items: BulkActionResponse[];
	total: number;
	limit: number;
	offset: number;
}

export interface PreviewUser {
	id: string;
	display_name?: string;
	email: string;
	current_state?: string;
	would_change: boolean;
	change_description?: string;
}

export interface BulkActionPreviewResponse {
	total_matched: number;
	would_change_count: number;
	no_change_count: number;
	users: PreviewUser[];
	limit: number;
	offset: number;
}

export interface ExpressionValidationResponse {
	valid: boolean;
	error?: string;
	parsed_attributes?: string[];
}

// --- Failed Operations ---

export interface FailedOperationResponse {
	id: string;
	operation_type: string;
	related_request_id?: string;
	object_id: string;
	object_type: string;
	error_message: string;
	retry_count: number;
	max_retries: number;
	status: string;
	next_retry_at: string;
	last_attempted_at?: string;
	created_at: string;
	resolved_at?: string;
}

export interface FailedOperationListResponse {
	items: FailedOperationResponse[];
	total: number;
	limit: number;
	offset: number;
}

export interface RetryStatsResponse {
	tenants_processed: number;
	total_processed: number;
	total_succeeded: number;
	total_rescheduled: number;
	total_dead_letter: number;
}

// --- Scheduled Transitions ---

export type ScheduledTransitionStatus = 'pending' | 'executed' | 'cancelled' | 'failed';

export interface ScheduledTransitionResponse {
	id: string;
	transition_request_id: string;
	object_id: string;
	object_type: string;
	transition_name: string;
	from_state: string;
	to_state: string;
	scheduled_for: string;
	status: ScheduledTransitionStatus;
	executed_at?: string;
	cancelled_at?: string;
	cancelled_by?: string;
	error_message?: string;
	created_at: string;
}

export interface ScheduledTransitionListResponse {
	items: ScheduledTransitionResponse[];
	total: number;
	limit: number;
	offset: number;
}

// --- Bulk Operations (state transitions) ---

export interface CreateBulkOperationRequest {
	transition_id: string;
	object_ids: string[];
}

export type BulkOperationStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface BulkOperationResponse {
	id: string;
	transition_id: string;
	status: BulkOperationStatus;
	total_count: number;
	processed_count: number;
	success_count: number;
	failure_count: number;
	progress_percent: number;
	requested_by: string;
	created_at: string;
	started_at?: string;
	completed_at?: string;
}

export interface BulkOperationListResponse {
	items: BulkOperationResponse[];
	total: number;
	limit: number;
	offset: number;
}

// --- Backward-compatible aliases ---
// These aliases map old names to new response types for gradual migration
export type SlaPolicy = SlaPolicyResponse;
export type TicketingConfig = TicketingConfigurationResponse;
export type BulkAction = BulkActionResponse;
export type FailedOperation = FailedOperationResponse;
export type ScheduledTransition = ScheduledTransitionResponse;
export type BulkStateOperation = BulkOperationResponse;
export type CreateTicketingConfigRequest = CreateTicketingConfigurationRequest;
export type UpdateTicketingConfigRequest = UpdateTicketingConfigurationRequest;
export type TicketingConfigListResponse = TicketingConfigurationListResponse;
export type BulkActionPreview = BulkActionPreviewResponse;
export type UpdateBulkActionRequest = Partial<CreateBulkActionRequest>;
export type ExpressionValidationResult = ExpressionValidationResponse;
export type CreateBulkStateOperationRequest = CreateBulkOperationRequest;

// --- Phase 038: NHI Access Requests ---

export type NhiRequestStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface NhiAccessRequest {
	id: string;
	requester_id: string;
	requested_name: string;
	purpose: string;
	requested_permissions: string[];
	requested_expiration: string | null;
	rotation_interval_days: number | null;
	nhi_type: string;
	status: NhiRequestStatus;
	reviewer_id: string | null;
	review_comments: string | null;
	created_at: string;
	reviewed_at: string | null;
	nhi_id: string | null;
}

export interface NhiAccessRequestListResponse {
	items: NhiAccessRequest[];
	total: number;
	limit: number;
	offset: number;
}

export interface SubmitNhiRequestBody {
	name: string;
	purpose: string;
	requested_permissions?: string[];
	requested_expiration?: string;
	rotation_interval_days?: number;
}

export interface NhiRequestSummary {
	pending: number;
	approved: number;
	rejected: number;
	cancelled: number;
}

export interface ApproveNhiRequestBody {
	comments?: string;
}

export interface RejectNhiRequestBody {
	reason: string;
}

// --- Phase 038: NHI Usage Tracking ---

export interface NhiUsageRecord {
	id: string;
	nhi_id: string;
	activity_type: string;
	details: string | null;
	performed_at: string;
	source_ip: string | null;
}

export interface NhiUsageListResponse {
	items: NhiUsageRecord[];
	total: number;
	limit: number;
	offset: number;
}

export interface NhiUsageSummary {
	nhi_id: string;
	total_events: number;
	last_activity_at: string | null;
	first_activity_at: string | null;
	activity_types: Record<string, number>;
	daily_average: number;
}

export interface NhiStalenessEntry {
	id: string;
	name: string;
	nhi_type: string;
	last_activity_at: string | null;
	days_inactive: number;
	state: string;
}

export interface NhiStalenessReportResponse {
	items: NhiStalenessEntry[];
	total: number;
	limit: number;
	offset: number;
}

export interface NhiOverallSummary {
	total: number;
	active: number;
	expired: number;
	suspended: number;
	needs_certification: number;
	needs_rotation: number;
	inactive: number;
}

// --- Phase 038: Enhanced NHI Certifications ---

export interface NhiCertCampaignSummary {
	total_items: number;
	decided: number;
	pending: number;
	certified: number;
	revoked: number;
	flagged: number;
}

export type NhiCertItemDecision = 'certify' | 'revoke' | 'flag';

export interface DecideNhiCertItemBody {
	decision: NhiCertItemDecision;
	notes?: string;
}

export interface BulkDecideNhiCertBody {
	item_ids: string[];
	decision: NhiCertItemDecision;
	notes?: string;
}

export interface BulkDecideResult {
	decided: number;
	failed: number;
}

// --- Phase 038: Persona Context Switching ---

export interface SwitchContextRequest {
	persona_id: string;
	reason?: string;
}

export interface SwitchBackRequest {
	reason?: string;
}

export interface SwitchContextResponse {
	session_id: string;
	access_token: string;
	active_persona_id: string | null;
	active_persona_name: string | null;
	switched_at: string;
}

export interface CurrentContextResponse {
	physical_user_id: string;
	physical_user_name: string | null;
	is_persona_active: boolean;
	active_persona: {
		id: string;
		name: string;
		archetype_name?: string;
	} | null;
	session_started_at: string | null;
	session_expires_at: string | null;
}

export interface ContextSessionSummary {
	id: string;
	switched_at: string;
	from_context: string;
	to_context: string;
	reason: string | null;
}

export interface ContextSessionListResponse {
	items: ContextSessionSummary[];
	total: number;
	limit: number;
	offset: number;
}

// --- Phase 038: Persona Expiry & Propagation ---

export interface ExtendPersonaRequest {
	new_valid_until: string;
	reason?: string;
}

export type ExtendPersonaStatus = 'approved' | 'pending_approval';

export interface ExtendPersonaResponse {
	status: ExtendPersonaStatus;
	persona: Record<string, unknown> | null;
	approval_request_id: string | null;
}

export interface ExpiringPersona {
	id: string;
	name: string;
	archetype_name: string | null;
	valid_until: string;
	days_until_expiry: number;
	assigned_user_name: string | null;
}

export interface ExpiringPersonaListResponse {
	items: ExpiringPersona[];
	total: number;
	limit: number;
	offset: number;
}

export interface PropagateAttributesResponse {
	persona_id: string;
	attributes_updated: number;
}
