import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../index';
import { API_URL } from '../../config/api';

// Define types for API responses
export interface LoginResponse {
  access: string;
  refresh: string;
  user: {
    id: number;
    username: string;
    email: string;
  };
  beneficiary: {
    id: number;
    registration_number: string;
    cpf: string;
    full_name: string;
    beneficiary_type: string;
    status: string;
    company: string;
    health_plan: string;
  };
}

export interface DigitalCard {
  id: number;
  card_number: string;
  beneficiary: number;
  issue_date: string;
  expiry_date: string;
  qr_code: string;
  qr_code_data: string;
  version: number;
  is_active: boolean;
}

export interface Provider {
  id: number;
  name: string;
  trade_name: string;
  provider_type: string;
  provider_type_display: string;
  phone: string;
  city: string;
  state: string;
  latitude: number | null;
  longitude: number | null;
  specialties: Array<{
    id: number;
    name: string;
  }>;
  rating: number;
  total_reviews: number;
  accepts_telemedicine: boolean;
  accepts_emergency: boolean;
  is_active: boolean;
}

export interface Guide {
  id: number;
  guide_number: string;
  protocol_number: string;
  guide_type: string;
  guide_type_display: string;
  status: string;
  status_display: string;
  beneficiary_name: string;
  provider_name: string;
  request_date: string;
  authorization_date: string | null;
  expiry_date: string | null;
  diagnosis: string;
  observations: string;
}

export interface Reimbursement {
  id: number;
  protocol_number: string;
  beneficiary_name: string;
  expense_type: string;
  expense_type_display: string;
  service_date: string;
  provider_name: string;
  requested_amount: string;
  approved_amount: string | null;
  status: string;
  status_display: string;
  created_at: string;
}

export interface ReimbursementSummary {
  total_requested: number;
  total_approved: number;
  pending_count: number;
  approved_count: number;
}

export interface Beneficiary {
  id: number;
  registration_number: string;
  cpf: string;
  full_name: string;
  birth_date: string;
  gender: string;
  beneficiary_type: string;
  status: string;
  phone: string;
  mobile_phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  company_name: string;
  health_plan_name: string;
}

export interface Invoice {
  id: number;
  beneficiary_name: string;
  reference_month: string;
  amount: string;
  due_date: string;
  payment_date: string | null;
  barcode: string;
  digitable_line: string;
  status: string;
  status_display: string;
  invoice_pdf: string | null;
  created_at: string;
}

export interface TaxStatement {
  id: number;
  beneficiary_name: string;
  year: number;
  total_paid: string;
  deductible_amount: string;
  monthly_breakdown: { [key: string]: number };
  statement_pdf: string | null;
  created_at: string;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  notification_type: string;
  notification_type_display: string;
  priority: string;
  priority_display: string;
  is_read: boolean;
  data: any;
  created_at: string;
}

// Create the API service
export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.accessToken;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Beneficiary', 'Beneficiaries', 'DigitalCard', 'Providers', 'Guides', 'Reimbursements', 'Invoices', 'TaxStatements', 'Notifications', 'HealthRecords', 'Vaccinations'],
  endpoints: (builder) => ({
    // Auth
    login: builder.mutation<LoginResponse, { cpf: string; password: string }>({
      query: (credentials) => ({
        url: '/auth/login/',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['Beneficiary', 'DigitalCard'],
    }),

    // Test Login (mantido para compatibilidade)
    testLogin: builder.mutation<LoginResponse, { cpf: string; password: string }>({
      query: (credentials) => ({
        url: '/accounts/test-login/',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['Beneficiary', 'DigitalCard'],
    }),

    // Beneficiary
    getBeneficiary: builder.query<Beneficiary, void>({
      query: () => '/beneficiaries/beneficiaries/me/',
      providesTags: ['Beneficiary'],
    }),

    updateBeneficiary: builder.mutation<Beneficiary, Partial<Beneficiary> & { id: number }>({
      query: ({ id, ...patch }) => ({
        url: `/beneficiaries/beneficiaries/${id}/`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: ['Beneficiary'],
    }),

    updateProfile: builder.mutation<Beneficiary, Partial<{
      phone: string;
      email: string;
      address: string;
      city: string;
      state: string;
      zip_code: string;
      emergency_contact: string;
      emergency_phone: string;
    }>>({
      query: (data) => ({
        url: '/beneficiaries/beneficiaries/update_profile/',
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Beneficiary'],
    }),

    // Digital Card
    getDigitalCard: builder.query<DigitalCard[], void>({
      query: () => '/beneficiaries/digital-cards/my_cards/',
      providesTags: ['DigitalCard'],
    }),

    // Providers
    getProviders: builder.query<
      Provider[],
      { search?: string; specialty?: string | null; provider_type?: string }
    >({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params.search) searchParams.append('search', params.search);
        if (params.specialty) searchParams.append('specialties__name', params.specialty);
        if (params.provider_type) searchParams.append('provider_type', params.provider_type);
        searchParams.append('is_active', 'true');

        return `/providers/providers/?${searchParams.toString()}`;
      },
      providesTags: ['Providers'],
    }),

    getProvider: builder.query<Provider, number>({
      query: (id) => `/providers/providers/${id}/`,
      providesTags: ['Providers'],
    }),

    // Guides
    getGuides: builder.query<Guide[], { status?: string }>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params.status && params.status !== 'Todas') {
          searchParams.append('status', params.status);
        }
        return `/guides/guides/my_guides/?${searchParams.toString()}`;
      },
      providesTags: ['Guides'],
    }),

    getGuide: builder.query<Guide, number>({
      query: (id) => `/guides/guides/${id}/`,
      providesTags: ['Guides'],
    }),

    createGuide: builder.mutation<Guide, any>({
      query: (data) => ({
        url: '/guides/guides/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Guides'],
    }),

    // Reimbursements
    getReimbursements: builder.query<Reimbursement[], { status?: string }>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params.status && params.status !== 'Todos') {
          searchParams.append('status', params.status);
        }
        return `/reimbursements/requests/my_reimbursements/?${searchParams.toString()}`;
      },
      providesTags: ['Reimbursements'],
    }),

    getReimbursement: builder.query<Reimbursement, number>({
      query: (id) => `/reimbursements/requests/${id}/`,
      providesTags: ['Reimbursements'],
    }),

    getReimbursementSummary: builder.query<ReimbursementSummary, void>({
      query: () => '/reimbursements/requests/summary/',
      providesTags: ['Reimbursements'],
    }),

    createReimbursement: builder.mutation<Reimbursement, any>({
      query: (data) => ({
        url: '/reimbursements/requests/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Reimbursements'],
    }),

    // Invoices
    getInvoices: builder.query<Invoice[], { status?: string }>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params.status && params.status !== 'Todas') {
          searchParams.append('status', params.status);
        }
        return `/financial/invoices/my_invoices/?${searchParams.toString()}`;
      },
      providesTags: ['Invoices'],
    }),

    getInvoice: builder.query<Invoice, number>({
      query: (id) => `/financial/invoices/${id}/`,
      providesTags: ['Invoices'],
    }),

    // Tax Statements
    getTaxStatements: builder.query<TaxStatement[], void>({
      query: () => '/financial/tax-statements/my_statements/',
      providesTags: ['TaxStatements'],
    }),

    getTaxStatement: builder.query<TaxStatement, number>({
      query: (id) => `/financial/tax-statements/${id}/`,
      providesTags: ['TaxStatements'],
    }),

    // Notifications
    getNotifications: builder.query<Notification[], { is_read?: boolean }>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params.is_read !== undefined) {
          searchParams.append('is_read', params.is_read.toString());
        }
        return `/notifications/notifications/my_notifications/?${searchParams.toString()}`;
      },
      providesTags: ['Notifications'],
    }),

    markNotificationAsRead: builder.mutation<Notification, number>({
      query: (id) => ({
        url: `/notifications/notifications/${id}/mark_as_read/`,
        method: 'POST',
      }),
      invalidatesTags: ['Notifications'],
    }),

    markAllNotificationsAsRead: builder.mutation<void, void>({
      query: () => ({
        url: '/notifications/notifications/mark_all_as_read/',
        method: 'POST',
      }),
      invalidatesTags: ['Notifications'],
    }),

    deleteNotification: builder.mutation<void, number>({
      query: (id) => ({
        url: `/notifications/notifications/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Notifications'],
    }),

    // Dependents
    getDependents: builder.query<Beneficiary[], void>({
      query: () => '/beneficiaries/beneficiaries/my_dependents/',
      providesTags: ['Beneficiaries'],
    }),

    addDependent: builder.mutation<Beneficiary, any>({
      query: (data) => ({
        url: '/beneficiaries/beneficiaries/add_dependent/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Beneficiaries'],
    }),

    updateDependent: builder.mutation<Beneficiary, { id: number; data: any }>({
      query: ({ id, data }) => ({
        url: `/beneficiaries/beneficiaries/${id}/update_dependent/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Beneficiaries'],
    }),

    removeDependent: builder.mutation<void, number>({
      query: (id) => ({
        url: `/beneficiaries/beneficiaries/${id}/remove_dependent/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Beneficiaries'],
    }),

    // Password Change
    changePassword: builder.mutation<{ message: string }, { current_password: string; new_password: string }>({
      query: (data) => ({
        url: '/accounts/change-password/',
        method: 'POST',
        body: data,
      }),
    }),

    // Health Records
    getHealthRecords: builder.query({
      query: () => '/health/health-records/my_records/',
      providesTags: ['HealthRecords'],
    }),

    getHealthRecordsSummary: builder.query({
      query: () => '/health/health-records/summary/',
      providesTags: ['HealthRecords'],
    }),

    // Vaccinations
    getVaccinations: builder.query({
      query: () => '/health/vaccinations/my_vaccinations/',
      providesTags: ['Vaccinations'],
    }),

    getUpcomingVaccinations: builder.query({
      query: () => '/health/vaccinations/upcoming/',
      providesTags: ['Vaccinations'],
    }),

    getOverdueVaccinations: builder.query({
      query: () => '/health/vaccinations/overdue/',
      providesTags: ['Vaccinations'],
    }),
  }),
});

export const {
  useLoginMutation,
  useTestLoginMutation,
  useGetBeneficiaryQuery,
  useUpdateBeneficiaryMutation,
  useUpdateProfileMutation,
  useGetDigitalCardQuery,
  useGetProvidersQuery,
  useGetProviderQuery,
  useGetGuidesQuery,
  useGetGuideQuery,
  useCreateGuideMutation,
  useGetReimbursementsQuery,
  useGetReimbursementQuery,
  useGetReimbursementSummaryQuery,
  useCreateReimbursementMutation,
  useGetInvoicesQuery,
  useGetInvoiceQuery,
  useGetTaxStatementsQuery,
  useGetTaxStatementQuery,
  useGetNotificationsQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
  useDeleteNotificationMutation,
  useGetDependentsQuery,
  useAddDependentMutation,
  useUpdateDependentMutation,
  useRemoveDependentMutation,
  useChangePasswordMutation,
  useGetHealthRecordsQuery,
  useGetHealthRecordsSummaryQuery,
  useGetVaccinationsQuery,
  useGetUpcomingVaccinationsQuery,
  useGetOverdueVaccinationsQuery,
} = api;
