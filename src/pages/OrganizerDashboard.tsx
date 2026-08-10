import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Users, Calendar, Activity, CheckCircle, Clock, Globe, Award, Sparkles, ExternalLink } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { cn, formatCurrency } from '@/lib/utils';
import { SAMPLE_HACKATHONS, HACKATHON_CATEGORIES } from '@/lib/constants';
import { useAppStore } from '@/store/appStore';

const formSchema = z.object({
  name: z.string().min(3, "Hackathon name must be at least 3 characters"),
  organizer: z.string().min(2, "Organizer name required"),
  description: z.string().min(10, "Detailed description required (min 10 chars)"),
  registrationDate: z.string().min(1, "Registration date required"),
  startDate: z.string().min(1, "Start date required"),
  endDate: z.string().min(1, "End date required"),
  mode: z.enum(['Online', 'Offline', 'Hybrid']),
  prizePool: z.number().min(0, "Prize pool must be >= 0"),
  teamSize: z.string().min(1, "Team size required"),
  category: z.string().min(1, "Category required"),
  image: z.string().optional(),
  website: z.string().optional(),
});

export default function OrganizerDashboard() {
  const { customHackathons, addHackathon, updateHackathon, deleteHackathon, addNotification } = useAppStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Combine default sample hackathons with user's custom created hackathons
  const allEvents = [...customHackathons, ...SAMPLE_HACKATHONS.slice(0, 2)];

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      organizer: 'My Org',
      description: '',
      registrationDate: new Date().toISOString().split('T')[0],
      startDate: '',
      endDate: '',
      mode: 'Online' as const,
      prizePool: 25000,
      teamSize: '1-4',
      category: 'AI / ML',
      image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800',
      website: 'https://hackverse.ai',
    }
  });

  const openCreateModal = () => {
    setEditingId(null);
    reset({
      name: '',
      organizer: 'My Org',
      description: '',
      registrationDate: new Date().toISOString().split('T')[0],
      startDate: '',
      endDate: '',
      mode: 'Online',
      prizePool: 25000,
      teamSize: '1-4',
      category: 'AI / ML',
      image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800',
      website: 'https://hackverse.ai',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (event: any) => {
    setEditingId(event.id);
    setValue('name', event.name || '');
    setValue('organizer', event.organizer || 'My Org');
    setValue('description', event.description || '');
    setValue('registrationDate', event.registrationDate || new Date().toISOString().split('T')[0]);
    setValue('startDate', event.startDate || '');
    setValue('endDate', event.endDate || '');
    setValue('mode', event.mode || 'Online');
    setValue('prizePool', event.prizePool || 25000);
    setValue('teamSize', event.teamSize || '1-4');
    setValue('category', event.category || 'AI / ML');
    setValue('image', event.image || 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800');
    setValue('website', event.website || 'https://hackverse.ai');
    setIsModalOpen(true);
  };

  const onSubmit = (data: any) => {
    const formattedData = {
      ...data,
      prizePool: Number(data.prizePool),
      image: data.image || 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800',
      website: data.website || 'https://hackverse.ai',
      difficulty: 'Intermediate',
      technology: ['React', 'Python', 'Node.js'],
      tags: [data.category, data.mode],
      aiMatchScore: 95,
      bookmarked: false,
    };

    if (editingId) {
      updateHackathon(editingId, formattedData);
      setSuccessToast(`Hackathon "${data.name}" updated successfully!`);
    } else {
      const newHackathon = {
        id: 'custom-hack-' + Date.now(),
        ...formattedData,
        createdAt: new Date().toISOString(),
      };
      addHackathon(newHackathon);
      addNotification({
        title: '🎉 Hackathon Published!',
        message: `Your hackathon "${data.name}" is now live for participants to register.`,
        type: 'hackathon',
      });
      setSuccessToast(`🎉 Hackathon "${data.name}" created & published live!`);
    }

    setIsModalOpen(false);
    reset();
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteHackathon(id);
      setSuccessToast(`Hackathon "${name}" removed.`);
      setTimeout(() => setSuccessToast(null), 3000);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Toast */}
      {successToast && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 font-medium flex items-center justify-between shadow-xl">
          <span className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            {successToast}
          </span>
          <button onClick={() => setSuccessToast(null)} className="text-emerald-400 text-sm font-bold">Dismiss</button>
        </motion.div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Organizer Dashboard</h1>
          <p className="text-slate-500">Create, host, and manage hackathons & participant registrations.</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="px-6 py-3 bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 text-white rounded-xl font-bold flex items-center gap-2 hover:shadow-lg hover:shadow-indigo-500/30 transition-all hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" /> Create Hackathon
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Events Hosted', value: allEvents.length, icon: Calendar, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Total Registrations', value: '4,521', icon: Users, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Active Events', value: allEvents.filter(e => e.mode).length, icon: Activity, color: 'text-purple-400', bg: 'bg-purple-500/10' }
        ].map((stat, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            key={i} className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-xl flex items-center gap-4"
          >
            <div className={`p-4 rounded-xl ${stat.bg} ${stat.color}`}>
              <stat.icon className="w-8 h-8" />
            </div>
            <div>
              <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Event List */}
      <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">My Managed Hackathons</h2>
          <span className="text-xs text-indigo-400 font-semibold">{allEvents.length} Events Listed</span>
        </div>

        <div className="space-y-4">
          {allEvents.map((event: any) => (
            <div key={event.id} className="flex flex-col md:flex-row items-start md:items-center gap-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-gray-100 dark:border-white/5 hover:border-indigo-500/30 transition-all">
              <img src={event.image || 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800'} alt={event.name} className="w-full md:w-36 h-32 md:h-24 rounded-lg object-cover" />
              <div className="flex-1 w-full">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">{event.name}</h3>
                    <p className="text-xs text-indigo-400 font-medium mt-0.5">Organized by: {event.organizer || 'My Org'}</p>
                    <p className="text-sm text-slate-500 mt-1">{event.startDate} to {event.endDate}</p>
                  </div>
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Live & Active
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-300">
                  <span className="flex items-center gap-1 text-xs"><Award className="w-4 h-4 text-amber-500"/> Prize: {formatCurrency(event.prizePool || 25000)}</span>
                  <span className="flex items-center gap-1 text-xs"><Globe className="w-4 h-4 text-cyan-500"/> Mode: {event.mode || 'Online'}</span>
                  <span className="flex items-center gap-1 text-xs"><Users className="w-4 h-4 text-indigo-500"/> Team: {event.teamSize || '1-4'}</span>
                </div>
              </div>
              <div className="flex gap-2 w-full md:w-auto mt-4 md:mt-0">
                <button onClick={() => openEditModal(event)} title="Edit Hackathon" className="flex-1 md:flex-none p-3 text-slate-500 hover:text-indigo-500 bg-white dark:bg-slate-700 rounded-xl shadow-sm hover:shadow transition-all">
                  <Edit2 className="w-5 h-5 mx-auto" />
                </button>
                <button onClick={() => handleDelete(event.id, event.name)} title="Delete Hackathon" className="flex-1 md:flex-none p-3 text-slate-500 hover:text-red-500 bg-white dark:bg-slate-700 rounded-xl shadow-sm hover:shadow transition-all">
                  <Trash2 className="w-5 h-5 mx-auto" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-slate-800">
            <h2 className="text-2xl font-bold mb-6 dark:text-white">
              {editingId ? 'Edit Hackathon Details' : 'Create New Hackathon'}
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium dark:text-slate-300 mb-1">Hackathon Name</label>
                  <input {...register('name')} placeholder="e.g. AI Innovation Summit 2026" className="w-full p-3 rounded-xl border dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500" />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message as string}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium dark:text-slate-300 mb-1">Organizer Name</label>
                  <input {...register('organizer')} placeholder="e.g. Google Developers Club" className="w-full p-3 rounded-xl border dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500" />
                  {errors.organizer && <p className="text-red-500 text-xs mt-1">{errors.organizer.message as string}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium dark:text-slate-300 mb-1">Description</label>
                <textarea {...register('description')} rows={3} placeholder="Describe the hackathon themes, challenge statement, and rules..." className="w-full p-3 rounded-xl border dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500" />
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message as string}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium dark:text-slate-300 mb-1">Registration Deadline</label>
                  <input type="date" {...register('registrationDate')} className="w-full p-3 rounded-xl border dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium dark:text-slate-300 mb-1">Start Date</label>
                  <input type="date" {...register('startDate')} className="w-full p-3 rounded-xl border dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium dark:text-slate-300 mb-1">End Date</label>
                  <input type="date" {...register('endDate')} className="w-full p-3 rounded-xl border dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium dark:text-slate-300 mb-1">Mode</label>
                  <select {...register('mode')} className="w-full p-3 rounded-xl border dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500">
                    <option value="Online">Online</option>
                    <option value="Offline">Offline</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium dark:text-slate-300 mb-1">Prize Pool ($ USD)</label>
                  <input type="number" {...register('prizePool', { valueAsNumber: true })} className="w-full p-3 rounded-xl border dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium dark:text-slate-300 mb-1">Category</label>
                  <select {...register('category')} className="w-full p-3 rounded-xl border dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500">
                    {HACKATHON_CATEGORIES.filter(c => c !== 'All').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium dark:text-slate-300 mb-1">Banner Image URL</label>
                  <input {...register('image')} placeholder="https://images.unsplash.com/..." className="w-full p-3 rounded-xl border dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium dark:text-slate-300 mb-1">Website Link</label>
                  <input {...register('website')} placeholder="https://myhackathon.dev" className="w-full p-3 rounded-xl border dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-4 border-t dark:border-slate-800">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">Cancel</button>
                <button type="submit" className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-indigo-500/30 transition-all">
                  {editingId ? 'Save Changes' : 'Publish Hackathon'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
