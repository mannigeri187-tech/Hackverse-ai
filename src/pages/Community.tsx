import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Plus, MessageSquare, Heart, Share2, 
  TrendingUp, Hash, Filter, MoreHorizontal, Image as ImageIcon, Send, Check
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';

const INITIAL_POSTS = [
  {
    id: 1,
    author: { name: 'Alex Johnson', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100' },
    timeAgo: '2h ago',
    title: 'Looking for a frontend dev for Global Hack',
    content: 'Our team is building an AI-powered accessibility tool. We have a backend dev and a designer, looking for someone who knows React and Three.js!',
    tags: ['Looking for Team', 'React', 'Three.js'],
    likes: 24,
    comments: [
      { id: 1, author: 'Sarah Chen', content: 'I am interested! I have 2 years of experience with React and built a few Three.js projects.', timeAgo: '1h ago' }
    ],
    liked: false
  },
  {
    id: 2,
    author: { name: 'Maria Garcia', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100' },
    timeAgo: '5h ago',
    title: 'How do you handle rate limits with OpenAI API?',
    content: 'Building a conversational agent for my hackathon project but keep hitting the rate limit. Any tips on handling this gracefully during a demo?',
    tags: ['Question', 'OpenAI', 'API'],
    likes: 45,
    comments: [
      { id: 2, author: 'David Kim', content: 'Use a queuing mechanism or implement exponential backoff. Also, ask for a tier upgrade if it\'s a major hackathon!', timeAgo: '4h ago' },
      { id: 3, author: 'John Doe', content: 'Mock the API for the demo to be safe!', timeAgo: '2h ago' }
    ],
    liked: true
  },
  {
    id: 3,
    author: { name: 'Manjunath H Annigeri', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100' },
    timeAgo: '1d ago',
    title: 'HackVerse AI 2.0 Official Platform Release 🚀',
    content: 'We just rolled out Tinder-style AI Matchmaking, Mentorship Ticketing, and Expo QR Rubric Judging! Test out all tools under the Tools tab.',
    tags: ['Showcase', 'Winner', 'AI'],
    likes: 156,
    comments: [],
    liked: true
  }
];

const TRENDING_TAGS = ['React', 'OpenAI', 'Web3', 'Looking for Team', 'Showcase'];
const TABS = ['All Posts', 'Questions', 'Showcases', 'Discussions'];

export default function Community() {
  const [activeTab, setActiveTab] = useState('All Posts');
  
  // Persistent Posts in localStorage
  const [posts, setPosts] = useState(() => {
    try {
      const saved = localStorage.getItem('hv_community_posts');
      return saved ? JSON.parse(saved) : INITIAL_POSTS;
    } catch {
      return INITIAL_POSTS;
    }
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newTags, setNewTags] = useState('');
  const [newCategory, setNewCategory] = useState('Discussion');
  const [expandedComments, setExpandedComments] = useState<number[]>([]);
  const [commentInputs, setCommentInputs] = useState<Record<number, string>>({});
  const [copiedPostId, setCopiedPostId] = useState<number | null>(null);

  const { user } = useAuthStore();

  useEffect(() => {
    try {
      localStorage.setItem('hv_community_posts', JSON.stringify(posts));
    } catch (e) {
      console.error(e);
    }
  }, [posts]);

  const handleLike = (id: number) => {
    setPosts(posts.map((post: any) => {
      if (post.id === id) {
        return { ...post, likes: post.liked ? post.likes - 1 : post.likes + 1, liked: !post.liked };
      }
      return post;
    }));
  };

  const toggleComments = (id: number) => {
    setExpandedComments(prev => 
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const parsedTags = newTags.split(',').map(t => t.trim()).filter(Boolean);
    if (parsedTags.length === 0) parsedTags.push(newCategory);

    const createdPost = {
      id: Date.now(),
      author: {
        name: user?.name || 'Manjunath H Annigeri',
        avatar: user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'
      },
      timeAgo: 'Just now',
      title: newTitle,
      content: newContent,
      tags: parsedTags,
      likes: 1,
      comments: [],
      liked: true
    };

    setPosts([createdPost, ...posts]);
    setNewTitle('');
    setNewContent('');
    setNewTags('');
    setIsCreatingPost(false);
  };

  const handleAddComment = (postId: number) => {
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;

    const newCommentObj = {
      id: Date.now(),
      author: user?.name || 'Manjunath H Annigeri',
      content: text.trim(),
      timeAgo: 'Just now'
    };

    setPosts(posts.map((p: any) => {
      if (p.id === postId) {
        return { ...p, comments: [...p.comments, newCommentObj] };
      }
      return p;
    }));

    setCommentInputs({ ...commentInputs, [postId]: '' });
  };

  const handleShare = (id: number) => {
    const shareUrl = `${window.location.origin}/community#post-${id}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedPostId(id);
    setTimeout(() => setCopiedPostId(null), 2000);
  };

  const filteredPosts = posts.filter((post: any) => {
    const matchesSearch = 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    if (activeTab === 'Questions') return matchesSearch && post.tags.includes('Question');
    if (activeTab === 'Showcases') return matchesSearch && post.tags.includes('Showcase');
    if (activeTab === 'Discussions') return matchesSearch && (post.tags.includes('Discussion') || !post.tags.includes('Question'));
    return matchesSearch;
  });

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-white">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
        
        {/* Main Feed */}
        <div className="flex-1 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">Developer Community</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Connect, ask technical questions, and showcase hackathon projects.</p>
            </div>
            <motion.button 
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setIsCreatingPost(!isCreatingPost)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl flex items-center space-x-2 shadow-lg shadow-indigo-500/20 font-bold text-sm"
            >
              <Plus className="h-5 w-5" />
              <span>Create Post</span>
            </motion.button>
          </div>

          <AnimatePresence>
            {isCreatingPost && (
              <motion.form 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleCreatePost}
                className="bg-white/80 dark:bg-slate-900/90 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-xl overflow-hidden space-y-4"
              >
                <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-white/10">
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">Publish New Community Post</h3>
                  <select 
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="bg-slate-100 dark:bg-slate-800 border border-gray-200 dark:border-white/10 text-xs font-bold rounded-lg px-3 py-1.5 text-slate-700 dark:text-slate-300"
                  >
                    <option value="Discussion">Discussion</option>
                    <option value="Question">Question</option>
                    <option value="Showcase">Showcase</option>
                    <option value="Looking for Team">Looking for Team</option>
                  </select>
                </div>

                <input 
                  type="text" 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Post title (e.g., Looking for Frontend Dev for HackMIT)" 
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                  required
                />
                
                <textarea 
                  rows={4}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="What's on your mind? Share code snippets, questions, or ideas..." 
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  required
                />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <input 
                    type="text" 
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                    placeholder="Add tags separated by commas (React, OpenAI, Web3)" 
                    className="bg-slate-50 dark:bg-slate-950 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-80"
                  />

                  <div className="flex items-center space-x-3 justify-end">
                    <button 
                      type="button" 
                      onClick={() => setIsCreatingPost(false)} 
                      className="px-4 py-2 text-slate-500 hover:text-slate-900 dark:hover:text-white font-semibold text-xs transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl font-bold text-xs shadow-md transition-colors"
                    >
                      Publish Post
                    </button>
                  </div>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-gray-200 dark:border-white/10 p-2 rounded-xl">
            <div className="flex space-x-1 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
              {TABS.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all",
                    activeTab === tab 
                      ? "bg-indigo-600 text-white shadow-sm font-bold" 
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search posts or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 bg-slate-100 dark:bg-slate-950 border border-gray-200 dark:border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-6">
            {filteredPosts.map((post: any) => (
              <motion.div 
                key={post.id}
                id={`post-${post.id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-xl"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <img src={post.author.avatar} alt={post.author.name} className="h-10 w-10 rounded-full border border-indigo-500/30 object-cover" />
                    <div>
                      <h4 className="text-slate-900 dark:text-white font-bold text-sm">{post.author.name}</h4>
                      <span className="text-xs text-slate-500 dark:text-slate-400">{post.timeAgo}</span>
                    </div>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{post.title}</h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-4">{post.content}</p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {post.tags.map((tag: string) => (
                    <span key={tag} className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-xs text-indigo-600 dark:text-indigo-300 font-bold">
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center space-x-6 border-t border-gray-200 dark:border-white/10 pt-4">
                  <button 
                    onClick={() => handleLike(post.id)}
                    className={cn(
                      "flex items-center space-x-2 transition-colors",
                      post.liked ? "text-pink-500 font-bold" : "text-slate-500 dark:text-slate-400 hover:text-pink-500"
                    )}
                  >
                    <motion.div whileTap={{ scale: 0.8 }}>
                      <Heart className={cn("h-5 w-5", post.liked && "fill-current")} />
                    </motion.div>
                    <span className="text-xs font-bold">{post.likes}</span>
                  </button>

                  <button 
                    onClick={() => toggleComments(post.id)}
                    className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 hover:text-indigo-500 transition-colors"
                  >
                    <MessageSquare className="h-5 w-5" />
                    <span className="text-xs font-bold">{post.comments.length} Comments</span>
                  </button>

                  <button 
                    onClick={() => handleShare(post.id)}
                    className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    {copiedPostId === post.id ? <Check className="h-5 w-5 text-emerald-500" /> : <Share2 className="h-5 w-5" />}
                    <span className="text-xs font-bold">{copiedPostId === post.id ? 'Copied Link!' : 'Share'}</span>
                  </button>
                </div>

                <AnimatePresence>
                  {expandedComments.includes(post.id) && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-6 pt-6 border-t border-gray-200 dark:border-white/10 space-y-4"
                    >
                      <h4 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">Comments</h4>
                      
                      {post.comments.map((comment: any) => (
                        <div key={comment.id} className="bg-slate-50 dark:bg-white/5 p-3 rounded-xl border border-gray-200 dark:border-white/5 space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-indigo-500">{comment.author}</span>
                            <span className="text-[10px] text-slate-400">{comment.timeAgo}</span>
                          </div>
                          <p className="text-xs text-slate-700 dark:text-slate-300">{comment.content}</p>
                        </div>
                      ))}

                      {/* Add Comment Input */}
                      <div className="flex gap-2 pt-2">
                        <input 
                          type="text" 
                          placeholder="Write a comment..."
                          value={commentInputs[post.id] || ''}
                          onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                          className="flex-1 bg-slate-100 dark:bg-slate-950 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button 
                          onClick={() => handleAddComment(post.id)}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1 shrink-0"
                        >
                          <Send size={12} /> Post
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-80 space-y-6">
          <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-500" /> Trending Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {TRENDING_TAGS.map(tag => (
                <button 
                  key={tag}
                  onClick={() => setSearchQuery(tag)}
                  className="px-3 py-1 bg-slate-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-xs text-slate-700 dark:text-slate-300 font-bold hover:bg-indigo-500/20 transition-colors"
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
