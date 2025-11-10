// ==========================
// STEADFAST API (Fixed Simple Version)
// ==========================

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Key } from "readline";
import { RootState } from "@/redux/store";

// Separate base query for Steadfast API
const steadfastBaseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_BASE_API || 'http://localhost:5000/api/v1',
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) {
      headers.set("authorization", `${token}`);
    }
    return headers;
  },
});

// ==========================
// TYPES
// ==========================
export interface ISteadfastBalance {
  current_balance: number;
  currency: string;
}

export interface ISteadfastOrder {
  invoice: string;
  recipient_name: string;
  recipient_phone: string;
  recipient_address: string;
  cod_amount: number;
  // note: string;
}

export interface ISteadfastOrderResponse {
  status: number;
  message: string;
  consignment: {
    consignment_id: string;
    tracking_code: string;
    status: string;
    invoice: string;
    recipient_name: string;
    recipient_phone: string;
    recipient_address: string;
    cod_amount: number;
    item_description: string;
    total_lot: number;
    created_at: string;
    updated_at: string;
    alternative_phone?: string | null;
    recipient_email?: string | null;
    note?: string;
  };
}

export interface ISteadfastReturnRequest {
  _id: Key | null | undefined;
  id: string;
  consignment_id: string;
  invoice?: string;
  tracking_code?: string;
  reason: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ISteadfastTracking {
  consignment_id: string;
  invoice: string;
  tracking_code: string;
  status: string;
  updated_at: string;
}

export interface ISteadfastBulkOrderResponse {
  success_count: number;
  failed_count: number;
  successful_orders: ISteadfastOrderResponse[];
  failed_orders: Array<{
    invoice: string;
    error: string;
  }>;
}

// Standard API response wrapper
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// ==========================
// RTK QUERY
// ==========================
export const steadfastApi = createApi({
  reducerPath: "steadfastApi",
  baseQuery: steadfastBaseQuery,
  tagTypes: [],
  endpoints: (builder) => ({
    // 💰 Get Balance
    getBalance: builder.query<ISteadfastBalance, void>({
      query: () => ({
        url: "/steadfast/balance",
        method: "GET",
      }),
      transformResponse: (response: any) => response.data || response,
    }),

    // 📦 Create Order
    createOrder: builder.mutation<ISteadfastOrderResponse, ISteadfastOrder>({
      query: (orderData) => ({
        url: "/steadfast/create-order",
        method: "POST",
        body: orderData,
      }),
      transformResponse: (response: ISteadfastOrderResponse) => response,
    }),

    // 📦 Bulk Create Orders
    bulkCreateOrders: builder.mutation<ISteadfastBulkOrderResponse, ISteadfastOrder[]>({
      query: (orders) => ({
        url: "/steadfast/bulk-order",
        method: "POST",
        body: { data: orders },
      }),
      transformResponse: (response: ApiResponse<ISteadfastBulkOrderResponse>) => response.data,
    }),

    // 📍 Get Status by Invoice
    getStatusByInvoice: builder.query<ISteadfastTracking, string>({
      query: (invoice) => `/steadfast/status/invoice/${invoice}`,
      transformResponse: (response: ApiResponse<ISteadfastTracking>) => response.data,
    }),

    // 📍 Get Status by Consignment ID
    getStatusByConsignmentId: builder.query<ISteadfastTracking, string>({
      query: (id) => `/steadfast/status/consignment/${id}`,
      transformResponse: (response: ApiResponse<ISteadfastTracking>) => response.data,
    }),

    // 📍 Get Status by Tracking Code
    getStatusByTrackingCode: builder.query<ISteadfastTracking, string>({
      query: (trackingCode) => `/steadfast/status/tracking/${trackingCode}`,
      transformResponse: (response: ApiResponse<ISteadfastTracking>) => response.data,
    }),

    // 🔄 Create Return Request
    createReturnRequest: builder.mutation<ISteadfastReturnRequest, Partial<ISteadfastReturnRequest>>({
      query: (payload) => ({
        url: "/steadfast/return-request",
        method: "POST",
        body: payload,
      }),
      transformResponse: (response: ApiResponse<ISteadfastReturnRequest>) => response.data,
    }),

    // 🔄 Get Single Return Request
    getReturnRequest: builder.query<ISteadfastReturnRequest, string>({
      query: (id) => `/steadfast/return-request/${id}`,
      transformResponse: (response: ApiResponse<ISteadfastReturnRequest>) => response.data,
    }),

    // 🔄 Get All Return Requests
    getReturnRequests: builder.query<ISteadfastReturnRequest[], void>({
      query: () => "/steadfast/return-requests",
      transformResponse: (response: ApiResponse<ISteadfastReturnRequest[]>) => response.data,
    }),
  }),
});

// ==========================
// EXPORT HOOKS
// ==========================
export const {
  useGetBalanceQuery,
  useCreateOrderMutation,
  useBulkCreateOrdersMutation,
  useGetStatusByInvoiceQuery,
  useGetStatusByConsignmentIdQuery,
  useGetStatusByTrackingCodeQuery,
  useCreateReturnRequestMutation,
  useGetReturnRequestQuery,
  useGetReturnRequestsQuery,
  
  // Lazy queries for on-demand fetching
  useLazyGetStatusByInvoiceQuery,
  useLazyGetStatusByConsignmentIdQuery,
  useLazyGetStatusByTrackingCodeQuery,
} = steadfastApi;