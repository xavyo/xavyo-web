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

export interface TypeRiskSummary {
	nhi_type: string;
	count: number;
	avg_score: number;
}

export interface LevelRiskSummary {
	level: string;
	count: number;
}

export interface NhiRiskSummary {
	total_entities: number;
	by_type: TypeRiskSummary[];
	by_level: LevelRiskSummary[];
}

// NHI Inactivity Detection

export interface InactiveNhiEntity {
	id: string;
	name: string;
	nhi_type: string;
	days_inactive: number;
	threshold_days: number;
	last_activity_at: string | null;
	grace_period_ends_at: string | null;
}

export interface AutoSuspendFailure {
	id: string;
	error: string;
}

export interface AutoSuspendResult {
	suspended: string[];
	failed: AutoSuspendFailure[];
}

// NHI Orphan Detection

export interface OrphanNhiEntity {
	id: string;
	name: string;
	nhi_type: string;
	owner_id: string | null;
	reason: string;
}

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
	data: NhiSodRule[];
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
	avg_processing_time_secs: number;
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

export interface GenerateReportRequest {
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
