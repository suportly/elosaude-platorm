#!/bin/bash

# Script para atualizar mobile para usar APIs reais

# Atualizar api.ts com endpoints corretos do backend
cat > /home/alairjt/workspace/elosaude-platform/mobile/src/store/services/api.ts << 'API_EOF'
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
  tagTypes: ['Beneficiary', 'DigitalCard', 'Providers', 'Guides', 'Reimbursements'],
  endpoints: (builder) => ({
    // Auth
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
  }),
});

export const {
  useTestLoginMutation,
  useGetBeneficiaryQuery,
  useUpdateBeneficiaryMutation,
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
} = api;
API_EOF

echo "✅ Updated mobile/src/store/services/api.ts"
