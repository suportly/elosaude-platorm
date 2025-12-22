// API Types for Admin Panel

// Base types
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiError {
  error: string;
  detail?: string;
  field_errors?: Record<string, string[]>;
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: AdminUser;
}

export interface AdminUser {
  id: number;
  email: string;
  name: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'VIEWER';
  is_super_admin: boolean;
  permissions: string[];
  last_login: string | null;
}

export interface TokenRefreshRequest {
  refresh: string;
}

export interface TokenRefreshResponse {
  access: string;
}

// Dashboard types
export interface DashboardMetrics {
  total_users: number;
  active_users: number;
  total_providers: number;
  active_providers: number;
  pending_reimbursements: number;
  total_reimbursement_value: number;
  users_growth: number;
  providers_growth: number;
  recent_users: UserSummary[];
  recent_providers: ProviderSummary[];
}

export interface UserSummary {
  id: number;
  full_name: string;
  email: string;
  status: string;
  created_at: string;
}

export interface ProviderSummary {
  id: number;
  name: string;
  provider_type: string;
  is_active: boolean;
  created_at: string;
}

export interface AuditLogEntry {
  id: number;
  user_email: string;
  user_name: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'APPROVE' | 'REJECT' | 'EXPORT' | 'LOGIN' | 'LOGOUT';
  entity_type: string;
  entity_id: number | null;
  entity_description: string;
  changes: Record<string, { old: unknown; new: unknown }>;
  ip_address: string;
  user_agent: string;
  timestamp: string;
}

// User (Beneficiary) types
export interface Beneficiary {
  id: number;
  registration_number: string;
  full_name: string;
  cpf: string;
  email: string;
  phone: string;
  birth_date: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'CANCELLED' | 'PENDING';
  beneficiary_type: 'TITULAR' | 'DEPENDENT';
  company_name: string | null;
  health_plan_name: string | null;
  titular_name: string | null;
  dependents_count: number;
  created_at: string;
  updated_at: string;
}

export interface BeneficiaryDetail extends Beneficiary {
  address: {
    street: string;
    number: string;
    complement: string | null;
    neighborhood: string;
    city: string;
    state: string;
    zip_code: string;
  } | null;
  dependents: Beneficiary[];
}

export interface BeneficiaryCreateRequest {
  full_name: string;
  cpf: string;
  email: string;
  phone: string;
  birth_date: string;
  beneficiary_type: 'TITULAR' | 'DEPENDENT';
  company_id?: number;
  health_plan_id?: number;
  titular_id?: number;
}

export interface BeneficiaryUpdateRequest {
  full_name?: string;
  email?: string;
  phone?: string;
  status?: 'ACTIVE' | 'SUSPENDED' | 'CANCELLED' | 'PENDING';
}

// Provider types
export interface Provider {
  id: number;
  name: string;
  provider_type: 'CLINIC' | 'HOSPITAL' | 'LABORATORY' | 'DOCTOR' | 'PHARMACY';
  cnpj: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  is_active: boolean;
  rating: number | null;
  specialties: Specialty[];
  created_at: string;
  updated_at: string;
}

export interface ProviderDetail extends Provider {
  address: {
    street: string;
    number: string;
    complement: string | null;
    neighborhood: string;
    city: string;
    state: string;
    zip_code: string;
  };
  business_hours: string | null;
  website: string | null;
  description: string | null;
}

export interface Specialty {
  id: number;
  name: string;
  code: string;
}

export interface ProviderUpdateRequest {
  name?: string;
  email?: string;
  phone?: string;
  is_active?: boolean;
  specialty_ids?: number[];
}

// Reimbursement types
export interface Reimbursement {
  id: number;
  protocol_number: string;
  beneficiary_id: number;
  beneficiary_name: string;
  beneficiary_cpf: string;
  expense_type: 'MEDICAL_CONSULTATION' | 'EXAM' | 'HOSPITALIZATION' | 'MEDICATION' | 'THERAPY' | 'OTHER';
  service_date: string;
  requested_amount: string;
  approved_amount: string | null;
  status: 'PENDING' | 'IN_ANALYSIS' | 'APPROVED' | 'PARTIALLY_APPROVED' | 'DENIED';
  request_date: string;
  analysis_date: string | null;
}

export interface ReimbursementDetail extends Reimbursement {
  provider_name: string | null;
  description: string | null;
  notes: string | null;
  denial_reason: string | null;
  documents: ReimbursementDocument[];
}

export interface ReimbursementDocument {
  id: number;
  document_type: string;
  file_name: string;
  file_url: string;
  uploaded_at: string;
}

export interface ReimbursementApproveRequest {
  approved_amount: number;
  notes?: string;
}

export interface ReimbursementRejectRequest {
  denial_reason: string;
}

// Report types
export interface ReportRequest {
  report_type: 'users' | 'providers' | 'reimbursements';
  date_from?: string;
  date_to?: string;
  filters?: Record<string, unknown>;
}

export interface ReportResponse {
  report_type: string;
  generated_at: string;
  total_records: number;
  data: Record<string, unknown>[];
}

// Settings types
export interface SystemConfiguration {
  id: number;
  key: string;
  value: string;
  category: 'GENERAL' | 'SECURITY' | 'NOTIFICATIONS' | 'INTEGRATION';
  description: string;
  is_sensitive: boolean;
  last_modified_by: string | null;
  last_modified_at: string;
}

export interface SettingUpdateRequest {
  value: string;
}

// Query params types
export interface PaginationParams {
  page?: number;
  page_size?: number;
}

export interface UserListParams extends PaginationParams {
  search?: string;
  status?: string;
  beneficiary_type?: string;
}

export interface ProviderListParams extends PaginationParams {
  search?: string;
  provider_type?: string;
  is_active?: boolean;
  specialty?: number;
}

export interface ReimbursementListParams extends PaginationParams {
  search?: string;
  status?: string;
  expense_type?: string;
  date_from?: string;
  date_to?: string;
}
