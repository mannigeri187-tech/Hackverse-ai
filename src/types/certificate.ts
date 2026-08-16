export interface Certificate {
  id: string;
  user_id: string;
  hackathon_id: string;
  title: string;
  issuer: string | null;
  certificate_url: string | null;
  certificate_date: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
  hackathon?: {
    id: string;
    title: string;
    organizer?: string;
    start_date?: string;
    end_date?: string;
    mode?: string;
    image_url?: string;
  };
}

export interface CreateCertificatePayload {
  hackathon_id: string;
  title: string;
  issuer?: string;
  certificate_url?: string;
  certificate_date?: string;
  description?: string;
}

export interface UpdateCertificatePayload {
  hackathon_id?: string;
  title?: string;
  issuer?: string | null;
  certificate_url?: string | null;
  certificate_date?: string | null;
  description?: string | null;
}
