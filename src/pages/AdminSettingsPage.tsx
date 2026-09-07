import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { ShieldAlert, Save } from 'lucide-react';

export default function AdminSettingsPage() {
  const [limits, setLimits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchLimits();
  }, []);

  const fetchLimits = async () => {
    try {
      const session = await supabase.auth.getSession();
      if (!session.data.session) throw new Error('Not authenticated');

      const res = await fetch('/api/admin/limits', {
        headers: {
          'Authorization': `Bearer ${session.data.session.access_token}`
        }
      });

      if (!res.ok) {
        if (res.status === 403) throw new Error('Forbidden. Admin access required.');
        throw new Error('Failed to load limits');
      }

      const data = await res.json();
      setLimits(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateLimit = (index: number, field: string, value: string) => {
    const num = parseInt(value, 10);
    const newLimits = [...limits];
    newLimits[index] = {
      ...newLimits[index],
      [field]: isNaN(num) ? 0 : Math.max(0, num)
    };
    setLimits(newLimits);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const session = await supabase.auth.getSession();
      const updates = limits.map(l => ({
        feature: l.feature,
        free_limit: l.free_limit,
        pro_limit: l.pro_limit,
        premium_limit: l.premium_limit
      }));

      const res = await fetch('/api/admin/limits', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.data.session?.access_token}`
        },
        body: JSON.stringify(updates)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to save');
      }

      setSuccess('Limits updated successfully.');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading Admin Config...</div>;
  }

  if (error && error.includes('Forbidden')) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h2>
        <p className="text-slate-500">You must be an administrator to view this page.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Admin System Limits</h1>
        <p className="text-slate-500 mt-2">Configure usage limits and quotas globally across all plans.</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 text-green-700 rounded-lg border border-green-200">
          {success}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 font-semibold text-slate-700">Feature</th>
                <th className="p-4 font-semibold text-slate-700">Type / Window</th>
                <th className="p-4 font-semibold text-slate-700">Free Limit</th>
                <th className="p-4 font-semibold text-slate-700">Pro Limit</th>
                <th className="p-4 font-semibold text-slate-700">Premium Limit</th>
              </tr>
            </thead>
            <tbody>
              {limits.map((l, i) => (
                <tr key={l.feature} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <span className="font-medium text-slate-900 block">{l.feature}</span>
                    <span className="text-xs text-slate-400 font-mono block mt-1">DB: {l.table_name || 'N/A'}</span>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
                      {l.type.toUpperCase()}
                    </span>
                    {l.window && <span className="block text-xs text-slate-500 mt-1">Window: {l.window}</span>}
                  </td>
                  <td className="p-4">
                    <input
                      type="number"
                      min="0"
                      value={l.free_limit}
                      onChange={(e) => handleUpdateLimit(i, 'free_limit', e.target.value)}
                      className="w-24 px-3 py-1.5 border border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </td>
                  <td className="p-4">
                    <input
                      type="number"
                      min="0"
                      value={l.pro_limit}
                      onChange={(e) => handleUpdateLimit(i, 'pro_limit', e.target.value)}
                      className="w-24 px-3 py-1.5 border border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </td>
                  <td className="p-4">
                    <input
                      type="number"
                      min="0"
                      value={l.premium_limit}
                      onChange={(e) => handleUpdateLimit(i, 'premium_limit', e.target.value)}
                      className="w-24 px-3 py-1.5 border border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-100 disabled:opacity-50 transition-colors"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>
    </div>
  );
}
