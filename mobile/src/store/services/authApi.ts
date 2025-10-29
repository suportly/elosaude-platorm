import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_URL } from '../../config/api';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({ baseUrl: API_URL }),
  endpoints: (builder) => ({
    testLogin: builder.mutation<
      {
        access: string;
        refresh: string;
        user: any;
        beneficiary: any;
      },
      { cpf: string; password: string }
    >({
      query: (credentials) => ({
        url: '/accounts/test-login/',
        method: 'POST',
        body: credentials,
      }),
    }),
  }),
});

export const { useTestLoginMutation } = authApi;
