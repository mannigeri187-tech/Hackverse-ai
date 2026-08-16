import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { 
  Certificate, 
  CreateCertificatePayload, 
  UpdateCertificatePayload 
} from '../types/certificate';

export function useCertificates() {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * 1. Fetch all certificates for the authenticated user
   */
  const fetchCertificates = useCallback(async () => {
    if (!user) {
      setCertificates([]);
      setLoading(false);
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('certificates')
        .select(`
          id,
          user_id,
          hackathon_id,
          title,
          issuer,
          certificate_url,
          certificate_date,
          description,
          created_at,
          updated_at,
          hackathon:hackathons (
            id,
            title,
            organizer,
            start_date,
            end_date,
            mode,
            image_url
          )
        `)
        .eq('user_id', user.id)
        .order('certificate_date', { ascending: false, nullsFirst: false });

      if (fetchError) {
        // Table might not exist yet if user hasn't run the migration
        if (fetchError.code === '42P01' || fetchError.message?.includes('does not exist')) {
          setCertificates([]);
          return [];
        }
        throw fetchError;
      }

      const certs = (data || []) as unknown as Certificate[];
      setCertificates(certs);
      return certs;
    } catch (err: any) {
      console.error('Error fetching certificates:', err.message);
      setError(err.message || 'Failed to fetch certificates');
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * 2. Fetch single certificate by ID
   */
  const fetchCertificateById = useCallback(async (id: string): Promise<Certificate | null> => {
    if (!user || !id) return null;

    try {
      const { data, error: fetchError } = await supabase
        .from('certificates')
        .select(`
          id,
          user_id,
          hackathon_id,
          title,
          issuer,
          certificate_url,
          certificate_date,
          description,
          created_at,
          updated_at,
          hackathon:hackathons (
            id,
            title,
            organizer,
            start_date,
            end_date,
            mode,
            image_url
          )
        `)
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (fetchError) throw fetchError;
      return data as unknown as Certificate;
    } catch (err: any) {
      console.error(`Error fetching certificate ${id}:`, err.message);
      return null;
    }
  }, [user]);

  /**
   * 3. Create a new certificate record
   */
  const createCertificate = useCallback(async (payload: CreateCertificatePayload): Promise<Certificate | null> => {
    if (!user) {
      setError('User not authenticated');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: insertError } = await supabase
        .from('certificates')
        .insert([
          {
            user_id: user.id,
            hackathon_id: payload.hackathon_id,
            title: payload.title,
            issuer: payload.issuer || null,
            certificate_url: payload.certificate_url || null,
            certificate_date: payload.certificate_date || new Date().toISOString(),
            description: payload.description || null,
          }
        ])
        .select(`
          id,
          user_id,
          hackathon_id,
          title,
          issuer,
          certificate_url,
          certificate_date,
          description,
          created_at,
          updated_at,
          hackathon:hackathons (
            id,
            title,
            organizer,
            start_date,
            end_date,
            mode,
            image_url
          )
        `)
        .single();

      if (insertError) throw insertError;

      const created = data as unknown as Certificate;
      setCertificates((prev) => [created, ...prev]);
      return created;
    } catch (err: any) {
      console.error('Error creating certificate:', err.message);
      setError(err.message || 'Failed to create certificate');
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * 4. Update an existing certificate
   */
  const updateCertificate = useCallback(async (id: string, payload: UpdateCertificatePayload): Promise<Certificate | null> => {
    if (!user || !id) return null;

    setLoading(true);
    setError(null);

    try {
      const { data, error: updateError } = await supabase
        .from('certificates')
        .update({
          ...payload,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select(`
          id,
          user_id,
          hackathon_id,
          title,
          issuer,
          certificate_url,
          certificate_date,
          description,
          created_at,
          updated_at,
          hackathon:hackathons (
            id,
            title,
            organizer,
            start_date,
            end_date,
            mode,
            image_url
          )
        `)
        .single();

      if (updateError) throw updateError;

      const updated = data as unknown as Certificate;
      setCertificates((prev) => prev.map((c) => (c.id === id ? updated : c)));
      return updated;
    } catch (err: any) {
      console.error(`Error updating certificate ${id}:`, err.message);
      setError(err.message || 'Failed to update certificate');
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * 5. Delete a certificate
   */
  const deleteCertificate = useCallback(async (id: string): Promise<boolean> => {
    if (!user || !id) return false;

    setLoading(true);
    setError(null);

    try {
      const { error: deleteError } = await supabase
        .from('certificates')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      setCertificates((prev) => prev.filter((c) => c.id !== id));
      return true;
    } catch (err: any) {
      console.error(`Error deleting certificate ${id}:`, err.message);
      setError(err.message || 'Failed to delete certificate');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCertificates();
  }, [fetchCertificates]);

  return {
    certificates,
    loading,
    error,
    fetchCertificates,
    fetchCertificateById,
    createCertificate,
    updateCertificate,
    deleteCertificate,
  };
}
