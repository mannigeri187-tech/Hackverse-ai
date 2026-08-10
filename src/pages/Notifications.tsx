import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Trophy, Calendar, MessageSquare, AlertCircle, Trash2, CheckCheck } from 'lucide-react';
import { cn, getTimeAgo } from '@/lib/utils';
import { useAppStore } from '@/store/appStore';

const TABS = ['All', 'Hackathons', 'Deadlines', 'Achievements', 'Learning', 'System'];

const getIconForType = (type: string) => {
  switch(type) {
    case 'hackathon': return <Calendar className="h-5 w-5 text-indigo-400" />;
    case 'achievement': return <Trophy className="h-5 w-5 text-yellow-400" />;
    case 'message': return <MessageSquare className="h-5 w-5 text-emerald-400" />;
    case 'system': return <AlertCircle className="h-5 w-5 text-red-400" />;
    default: return <Bell className="h-5 w-5 text-blue-400" />;
  }
};

export default function Notifications() {
  const { notifications, markAsRead, markAllRead, clearNotifications } = useAppStore();
  const [activeTab, setActiveTab] = useState('All');

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Hackathons') return n.type === 'hackathon';
    if (activeTab === 'Achievements') return n.type === 'achievement';
    if (activeTab === 'System') return n.type === 'system';
    if (activeTab === 'Learning') return n.type === 'learning';
    if (activeTab === 'Deadlines') return n.title.toLowerCase().includes('deadline');
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div className="flex items-center space-x-3">
            <h1 className="text-3xl font-bold text-white">Notifications</h1>
            {unreadCount > 0 && (
              <span className="bg-indigo-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            <button 
              onClick={markAllRead}
              className="flex items-center space-x-2 text-sm text-slate-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl border border-white/5"
            >
              <CheckCheck className="h-4 w-4" />
              <span>Mark all read</span>
            </button>
            <button 
              onClick={clearNotifications}
              className="flex items-center space-x-2 text-sm text-red-400 hover:text-red-300 transition-colors bg-red-400/5 hover:bg-red-400/10 px-4 py-2 rounded-xl border border-red-500/10"
            >
              <Trash2 className="h-4 w-4" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          </div>
        </div>

        <div className="bg-white/5 dark:bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl overflow-hidden">
          
          {/* Tabs */}
          <div className="flex overflow-x-auto border-b border-white/10 hide-scrollbar">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors relative",
                  activeTab === tab ? "text-indigo-400" : "text-slate-400 hover:text-slate-200"
                )}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div layoutId="notif-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" />
                )}
              </button>
            ))}
          </div>

          {/* List */}
          <div className="divide-y divide-white/5 max-h-[70vh] overflow-y-auto">
            <AnimatePresence initial={false}>
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, background: "rgba(255,255,255,0)" }}
                    animate={{ opacity: 1, background: notification.read ? "rgba(255,255,255,0)" : "rgba(99, 102, 241, 0.05)" }}
                    exit={{ opacity: 0, height: 0 }}
                    onClick={() => !notification.read && markAsRead(notification.id)}
                    className={cn(
                      "p-5 flex items-start space-x-4 cursor-pointer hover:bg-white/5 transition-colors group relative",
                      !notification.read && "border-l-4 border-l-indigo-500 pl-4"
                    )}
                  >
                    <div className="bg-white/5 p-2 rounded-xl shrink-0">
                      {getIconForType(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className={cn("text-sm truncate pr-4", notification.read ? "text-slate-300 font-medium" : "text-white font-bold")}>
                          {notification.title}
                        </h4>
                        <span className="text-xs text-slate-500 whitespace-nowrap">
                          {getTimeAgo(new Date(notification.createdAt).getTime())}
                        </span>
                      </div>
                      <p className="text-sm text-slate-400 line-clamp-2">
                        {notification.message}
                      </p>
                    </div>

                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-4 top-1/2 -translate-y-1/2 flex space-x-2">
                      <button className="p-2 bg-slate-800 text-slate-300 rounded-lg hover:text-red-400 hover:bg-slate-700 transition-colors shadow-lg">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="py-20 text-center flex flex-col items-center">
                  <div className="bg-white/5 p-4 rounded-full mb-4">
                    <Bell className="h-8 w-8 text-slate-500" />
                  </div>
                  <h3 className="text-lg font-medium text-white mb-1">All Caught Up!</h3>
                  <p className="text-slate-400">You don't have any notifications here.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </div>
  );
}
