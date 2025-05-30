// Shared contact types
export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface Contact extends ContactFormData {
  id_contact: number;
  contact_date: string;
  status: 'unread' | 'read' | 'replied';
  reply?: string;
  reply_date?: string;
  id_staff?: number | null;
  staff_name?: string;
  staff_email?: string;
  staff_phone?: string;
}

export interface ContactFilters {
  status: string;
  search: string;
}

export interface ContactPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ContactApiResponse {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
}
