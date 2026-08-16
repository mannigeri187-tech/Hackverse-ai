import { useState, useEffect } from 'react';
import { 
  Award, 
  Plus, 
  Trash2, 
  Edit3, 
  ExternalLink, 
  Calendar, 
  Building2, 
  Loader2, 
  AlertCircle, 
  X,
  Check
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useCertificates } from '../hooks/useCertificates';
import type { Certificate, CreateCertificatePayload } from '../types/certificate';
import type { Hackathon } from '../hooks/useHackathons';

export default function CertificateVaultPage() {
  const { 
    certificates, 
    loading: certsLoading, 
    error: certsError, 
    createCertificate, 
    updateCertificate, 
    deleteCertificate 
  } = useCertificates();

  // Hackathons dropdown list
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [isLoadingHacks, setIsLoadingHacks] = useState<boolean>(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingCert, setEditingCert] = useState<Certificate | null>(null);

  // Form State
  const [formData, setFormData] = useState<CreateCertificatePayload>({
    hackathon_id: '',
    title: '',
    issuer: '',
    certificate_url: '',
    certificate_date: new Date().toISOString().split('T')[0],
    description: '',
  });

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Load Hackathons for the selector
  useEffect(() => {
    async function loadHackathons() {
      setIsLoadingHacks(true);
      try {
        const { data, error } = await supabase
          .from('hackathons')
          .select('*')
          .order('start_date', { ascending: false });

        if (error) throw error;
        setHackathons(data || []);
        if (data && data.length > 0 && !formData.hackathon_id) {
          setFormData(prev => ({ ...prev, hackathon_id: data[0].id }));
        }
      } catch (err) {
        console.error('Error loading hackathons for certificates:', err);
      } finally {
        setIsLoadingHacks(false);
      }
    }

    loadHackathons();
  }, []);

  const openAddModal = () => {
    setEditingCert(null);
    setFormData({
      hackathon_id: hackathons[0]?.id || '',
      title: '',
      issuer: '',
      certificate_url: '',
      certificate_date: new Date().toISOString().split('T')[0],
      description: '',
    });
    setFormError(null);
    setFormSuccess(null);
    setIsModalOpen(true);
  };

  const openEditModal = (cert: Certificate) => {
    setEditingCert(cert);
    setFormData({
      hackathon_id: cert.hackathon_id,
      title: cert.title,
      issuer: cert.issuer || '',
      certificate_url: cert.certificate_url || '',
      certificate_date: cert.certificate_date ? cert.certificate_date.split('T')[0] : new Date().toISOString().split('T')[0],
      description: cert.description || '',
    });
    setFormError(null);
    setFormSuccess(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.hackathon_id) {
      setFormError('Please provide a certificate title and select a hackathon.');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);
    setFormSuccess(null);

    try {
      if (editingCert) {
        const updated = await updateCertificate(editingCert.id, formData);
        if (updated) {
          setFormSuccess('Certificate updated successfully!');
          setTimeout(() => setIsModalOpen(false), 800);
        } else {
          setFormError('Failed to update certificate.');
        }
      } else {
        const created = await createCertificate(formData);
        if (created) {
          setFormSuccess('Certificate added successfully!');
          setTimeout(() => setIsModalOpen(false), 800);
        } else {
          setFormError('Failed to create certificate.');
        }
      }
    } catch (err: any) {
      setFormError(err.message || 'Error saving certificate.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      await deleteCertificate(id);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* 1. HERO HEADER */}
      <div className="bg-theme-trophy text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-purple-900/40 relative overflow-hidden glow-purple">
        <div className="max-w-3xl relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md text-amber-300 border border-amber-500/30">
            <Award className="w-3.5 h-3.5 text-amber-400" /> Verified Credential Vault
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight text-white drop-shadow-sm">
            Store & Showcase Your Hackathon Achievements
          </h1>
          <p className="text-slate-200 text-xs sm:text-sm md:text-base leading-relaxed">
            Archive winner trophies, runner-up accolades, and participation certificates with shareable verification links.
          </p>
        </div>
      </div>

      {/* 2. ACTIONS BAR */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Your Hackathon Credentials ({certificates.length})</h2>
          <p className="text-xs text-slate-500">Track proofs of participation, honorable mentions, and category wins.</p>
        </div>

        <button
          onClick={openAddModal}
          disabled={isLoadingHacks}
          className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2 flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Certificate</span>
        </button>
      </div>

      {/* Error Banner */}
      {certsError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <span>{certsError}</span>
        </div>
      )}

      {/* 3. CERTIFICATES GRID OR EMPTY STATE */}
      {certsLoading ? (
        <div className="p-12 bg-white border border-slate-200 rounded-3xl text-center space-y-3 shadow-sm">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Loading your certificates...</p>
        </div>
      ) : certificates.length === 0 ? (
        <div className="p-12 bg-white border border-slate-200 rounded-3xl text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center mx-auto">
            <Award className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">Your certificate vault is empty.</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Add your first hackathon certificate to build your verified credential history and public showcase.
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add your first hackathon certificate
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2.5">
                {/* Badge / Category */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary-50 text-primary-700 border border-primary-200">
                    {cert.hackathon?.title || 'Hackathon Award'}
                  </span>
                  <div className="flex items-center gap-1 text-slate-400">
                    <button
                      onClick={() => openEditModal(cert)}
                      className="p-1.5 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Edit Certificate"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(cert.id, cert.title)}
                      className="p-1.5 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Certificate"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-base font-bold text-slate-900 leading-snug">{cert.title}</h3>

                {/* Metadata row */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-medium">
                  {cert.issuer && (
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" /> {cert.issuer}
                    </span>
                  )}
                  {cert.certificate_date && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" /> {new Date(cert.certificate_date).toLocaleDateString()}
                    </span>
                  )}
                </div>

                {/* Description */}
                {cert.description && (
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {cert.description}
                  </p>
                )}
              </div>

              {/* View Certificate Action Link */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                {cert.certificate_url ? (
                  <a
                    href={cert.certificate_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold text-primary-600 hover:text-primary-800 inline-flex items-center gap-1.5 transition-colors"
                  >
                    <span>View Certificate</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <span className="text-xs text-slate-400 font-medium">No external link attached</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. ADD / EDIT CERTIFICATE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-primary-600" />
                {editingCert ? 'Edit Certificate' : 'Add New Certificate'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Select Hackathon */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Associated Hackathon *</label>
                <select
                  value={formData.hackathon_id}
                  onChange={(e) => setFormData({ ...formData, hackathon_id: e.target.value })}
                  required
                  className="w-full text-xs font-medium p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500"
                >
                  {hackathons.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.title} ({h.organizer || 'Event'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Certificate Title */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Certificate Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. 1st Place Winner / Certificate of Participation"
                  required
                  className="w-full text-xs font-medium p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Issuer & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Issuer / Organization</label>
                  <input
                    type="text"
                    value={formData.issuer || ''}
                    onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
                    placeholder="e.g. MLH / Devfolio / IEEE"
                    className="w-full text-xs font-medium p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Date Issued</label>
                  <input
                    type="date"
                    value={formData.certificate_date || ''}
                    onChange={(e) => setFormData({ ...formData, certificate_date: e.target.value })}
                    className="w-full text-xs font-medium p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              {/* Certificate URL */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Certificate URL / Verification Link</label>
                <input
                  type="url"
                  value={formData.certificate_url || ''}
                  onChange={(e) => setFormData({ ...formData, certificate_url: e.target.value })}
                  placeholder="https://credentials.org/verify/12345"
                  className="w-full text-xs font-medium p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Description / Track Notes</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. Awarded for best use of Generative AI in Healthcare Track..."
                  rows={3}
                  className="w-full text-xs font-medium p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Feedback messages */}
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {formSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>{formSuccess}</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingCert ? 'Update Certificate' : 'Save Certificate'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
