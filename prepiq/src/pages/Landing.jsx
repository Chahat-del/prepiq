import { useNavigate } from 'react-router-dom'

function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white font-sans relative overflow-hidden">
      
      {/* Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full pointer-events-none"
        style={{background: 'radial-gradient(circle, rgba(93,202,165,0.08) 0%, transparent 70%)'}} />

      {/* Nav */}
      <nav className="flex justify-between items-center px-10 py-6 border-b border-white/8">
        <div className="text-2xl font-black tracking-tight">
          Prep<span className="text-[#5DCAA5]">IQ</span>
        </div>
        <div className="flex items-center gap-8">
          <a href="#" className="text-sm text-white/50 hover:text-white transition-colors">How it works</a>
          <a href="#" className="text-sm text-white/50 hover:text-white transition-colors">Exams</a>
          <a href="#" className="text-sm text-white/50 hover:text-white transition-colors">Features</a>
          <button
            onClick={() => navigate('/register')}
            className="bg-[#5DCAA5] text-[#04342C] text-sm font-medium px-5 py-2 rounded-full hover:brightness-110 transition-all">
            Get started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div className="px-10 pt-20 pb-10 max-w-3xl">
        <div className="inline-flex items-center gap-2 bg-[#5DCAA5]/10 border border-[#5DCAA5]/30 text-[#5DCAA5] text-xs px-3 py-1.5 rounded-full mb-6">
          <div className="w-1.5 h-1.5 rounded-full bg-[#5DCAA5]" />
          AI-powered exam prep
        </div>
        <h1 className="text-6xl font-black leading-none tracking-tight mb-5">
          Study smarter,<br />not <span className="text-[#5DCAA5]">harder.</span>
        </h1>
        <p className="text-lg text-white/50 leading-relaxed max-w-lg mb-8 font-light">
          Upload your syllabus and previous year papers. PrepIQ builds a personalized roadmap, explains every topic, and generates PYQ-style tests — for any exam.
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/register')}
            className="bg-[#5DCAA5] text-[#04342C] text-sm font-medium px-6 py-3 rounded-lg hover:brightness-110 transition-all">
            Start for free
          </button>
          <button className="text-sm text-white/60 px-6 py-3 rounded-lg border border-white/15 hover:border-white/30 transition-all">
            See how it works
          </button>
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-3 gap-3 px-10 mt-4">
        {[
          { icon: '📋', title: 'Upload & analyze', desc: 'Drop your syllabus and PYQ. AI extracts topics and ranks them by exam importance.', color: 'rgba(93,202,165,0.12)' },
          { icon: '🗺️', title: 'Priority roadmap', desc: 'Get a weekly study plan built around what actually appears in your exam every year.', color: 'rgba(83,74,183,0.15)' },
          { icon: '📝', title: 'PYQ solutions', desc: 'Every question from your uploaded paper gets a step-by-step AI solution instantly.', color: 'rgba(186,117,23,0.15)' },
          { icon: '🎯', title: 'Adaptive mock tests', desc: 'Auto-generated tests in your exam style. Wrong answers retested automatically.', color: 'rgba(210,83,126,0.15)' },
          { icon: '🎥', title: 'Video or written', desc: 'Choose how you learn — top YouTube lectures or clean AI-written notes, per topic.', color: 'rgba(93,202,165,0.12)' },
          { icon: '📊', title: 'Progress tracking', desc: 'See completion per subject, weak areas, test scores, and readiness — all in one place.', color: 'rgba(83,74,183,0.15)' },
        ].map((f, i) => (
          <div key={i} className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm mb-3" style={{background: f.color}}>
              {f.icon}
            </div>
            <h3 className="text-sm font-bold mb-1.5">{f.title}</h3>
            <p className="text-xs text-white/40 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="flex gap-10 px-10 py-6 mt-4 border-t border-white/[0.06]">
        {[
          { num: 'Any exam', label: 'CAT, GATE, JEE, UPSC & more' },
          { num: '0 cost', label: 'Free to use, no paywalls' },
          { num: '1 upload', label: 'Syllabus in, full plan out' },
        ].map((s, i) => (
          <div key={i}>
            <div className="text-3xl font-black">{s.num}</div>
            <div className="text-xs text-white/40 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

    </div>
  )
}

export default Landing