import { baseApiWithAuth } from '@api/baseApi';

export interface WhatsAppTemplateRequest {
  name?: string;
  language?: string;
  category?: string;
  headerType?: string;
  headerText?: string;
  bodyText?: string;
  footerText?: string;
  websiteUrl?: string;
  phoneNumber?: string;
  validityPeriod?: string;
}

export interface WhatsAppTemplateResponse {
  id: number;
  name?: string;
  language?: string;
  category?: string;
  headerType?: string;
  headerText?: string;
  bodyText?: string;
  footerText?: string;
  websiteUrl?: string;
  phoneNumber?: string;
  validityPeriod?: string;
  status?: string;
  reviewNotes?: string;
}

export interface CampaignSendResponse {
  campaignId: string;
  templateName: string;
  recipientCount: number;
  message: string;
  success: boolean;
}

export const whatsappTemplateApi = baseApiWithAuth.injectEndpoints({
  endpoints: (builder) => ({
    createWhatsAppTemplate: builder.mutation<WhatsAppTemplateResponse, WhatsAppTemplateRequest>({
      query: (body) => ({
        url: '/api/admin/whatsapp-templates',
        method: 'POST',
        body,
      }),
    }),
    submitWhatsAppTemplateForReview: builder.mutation<WhatsAppTemplateResponse, number>({
      query: (templateId) => ({
        url: `/api/admin/whatsapp-templates/${templateId}/submit`,
        method: 'POST',
      }),
    }),
    sendWhatsAppCampaign: builder.mutation<CampaignSendResponse, FormData>({
      query: (formData) => ({
        url: '/api/admin/whatsapp-templates/send',
        method: 'POST',
        body: formData,
      }),
    }),
  }),
});

export const {
  useCreateWhatsAppTemplateMutation,
  useSubmitWhatsAppTemplateForReviewMutation,
  useSendWhatsAppCampaignMutation,
} = whatsappTemplateApi;
