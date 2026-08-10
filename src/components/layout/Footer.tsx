import { Link } from 'react-router-dom'
import { Sparkles, Github, Twitter, Linkedin, Heart } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-white/10 text-gray-400 py-12 px-4 md:px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-xl font-bold text-white">HackVerse AI</span>
          </div>
          <p className="text-sm leading-relaxed">
            The ultimate AI-powered hackathon preparation & discovery platform for college students and developers worldwide.
          </p>
          <div className="flex items-center gap-3 pt-2">
            <a href="#" className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors">
              <Github className="w-4 h-4" />
            </a>
            <a href="#" className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors">
              <Twitter className="w-4 h-4" />
            </a>
            <a href="#" className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors">
              <Linkedin className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4">Platform</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/hackathons" className="hover:text-white transition-colors">Hackathon Discovery</Link></li>
            <li><Link to="/ai-mentor" className="hover:text-white transition-colors">AI Coach & Mentor</Link></li>
            <li><Link to="/learning" className="hover:text-white transition-colors">AI Learning Tracks</Link></li>
            <li><Link to="/mock-hackathon" className="hover:text-white transition-colors">Mock Hackathons</Link></li>
            <li><Link to="/skill-analysis" className="hover:text-white transition-colors">Skill Gap Analyzer</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4">Tools & Community</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/resume-builder" className="hover:text-white transition-colors">ATS Resume Builder</Link></li>
            <li><Link to="/resume-review" className="hover:text-white transition-colors">AI Resume Reviewer</Link></li>
            <li><Link to="/project-generator" className="hover:text-white transition-colors">AI Project Generator</Link></li>
            <li><Link to="/team-finder" className="hover:text-white transition-colors">Team Finder</Link></li>
            <li><Link to="/community" className="hover:text-white transition-colors">Student Community</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4">Organizers & Admins</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/organizer" className="hover:text-white transition-colors">Post a Hackathon</Link></li>
            <li><Link to="/organizer" className="hover:text-white transition-colors">Organizer Dashboard</Link></li>
            <li><Link to="/admin" className="hover:text-white transition-colors">Admin Panel</Link></li>
            <li><a href="#faq" className="hover:text-white transition-colors">FAQ & Support</a></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-white/10 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs gap-4">
        <p>© 2026 HackVerse AI. Built with <Heart className="w-3.5 h-3.5 text-red-500 inline mx-0.5 fill-red-500" /> for hackers & creators worldwide.</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-white transition-colors">Security</a>
        </div>
      </div>
    </footer>
  )
}
