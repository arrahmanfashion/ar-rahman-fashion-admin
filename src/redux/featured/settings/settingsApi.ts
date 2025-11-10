import { baseApi } from "@/redux/api/baseApi";

// ==========================
// ✅ TYPE DECLARATIONS
// ==========================
export interface IMobileMfsItem {
  bKash: { bKashLogo: string; bKashNumber: string };
  nagad: { nagadLogo: string; nagadNumber: string };
  rocket: { rocketLogo: string; rocketNumber: string };
  upay: { upayLogo: string; upayNumber: string };
}

export interface IPrivacyPolicy {
  title: string;
  description: string;
}

export interface IReturnPolicy {
  title: string;
  description: string;
}

export interface IContactAndSocial {
  address: string;
  email: string;
  phone: string;
  facebookUrl?: string[];
  instagramUrl?: string[];
  whatsappLink?: string[];
  youtubeUrl?: string[];
}

export type TSliderImage = {
  image: string;
  url?: string;
};

export interface ISettings {
  _id?: string;
  logo?: string;
  popupImage?: string;
  enableHomepagePopup?: boolean;
  popupTitle?: string;
  popupDescription?: string;
  popupDelay?: number;
  privacyPolicy: IPrivacyPolicy;
  returnPolicy: IReturnPolicy;
  contactAndSocial: IContactAndSocial;
  mobileMfs?: IMobileMfsItem;
  sliderImages?: TSliderImage[] | string[]; // Support both old and new format
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
  deliveryCharge:number;
}

export interface ISettingsResponse {
  success: boolean;
  message: string;
  data: ISettings;
}

// ==========================
// ✅ SETTINGS API
// ==========================
export const settingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // -------- GET SETTINGS --------
    getSettings: builder.query<ISettings, void>({
      query: () => ({
        url: "/settings",
        method: "GET",
      }),
      transformResponse: (response: ISettingsResponse) => response.data,

    }),

    // -------- CREATE SETTINGS --------
    createSettings: builder.mutation<ISettingsResponse, FormData>({
      query: (formData) => ({
        url: "/settings",
        method: "POST",
        body: formData,
      }),

    }),

    // -------- UPDATE SETTINGS --------
    updateSettings: builder.mutation<ISettingsResponse, FormData>({
      query: (formData) => ({
        url: "/settings",
        method: "PATCH",
        body: formData,
      }),

    }),

    // -------- DELETE BANNER SLIDER --------
    deleteBannerSlider: builder.mutation<ISettingsResponse, { imageUrl: string }>({
      query: (data) => ({
        url: "/settings/banner-slider",
        method: "DELETE",
        body: data,
      }),

    }),
  }),
});

export const {
  useGetSettingsQuery,
  useCreateSettingsMutation,
  useUpdateSettingsMutation,
  useDeleteBannerSliderMutation,
} = settingsApi;
