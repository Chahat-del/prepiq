import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = () => {
    if (!form.name || !form.email || !form.password) return
    // auth logic will go here later
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
      
      {/* Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full pointer-events-none"
        style={{background: 'radial-gradient(circle, rgba(93,202,165,0.07) 0%, transparent 70%)'}} />

      <div className="w-full max-w-md relative">
        
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-3xl font-black tracking-tight text-white mb-2">
            Prep<span className="text-[#5DCAA5]">IQ</span>
          </div>
          <p className="text-white/40 text-sm">Create your account and start preparing smarter</p>
        </div>

        {/* Card */}
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8">
          
          <h2 className="text-xl font-bold text-white mb-6">Get started for free</h2>

          <div className="flex flex-col gap-4">

            <div>
              <label className="text-xs text-white/50 mb-1.5 block">Full name</label>
              <input
                type="text"
                name="name"
                placeholder="Rahul Sharma"
                value={form.name}
                onChange={handleChange}
                className="w-full bg-white/[0.05] border border-white/[0.1] rounded-lg px-4 py-3 text-sm text-white placeholder-white/25 outline-none focus:border-[#5DCAA5]/50 transition-colors"
              />
            </div>

            <div>
              <label className="text-xs text-white/50 mb-1.5 block">Email address</label>
              <input
                type="email"
                name="email"
                placeholder="rahul@email.com"
                value={form.email}
                onChange={handleChange}
                className="w-full bg-white/[0.05] border border-white/[0.1] rounded-lg px-4 py-3 text-sm text-white placeholder-white/25 outline-none focus:border-[#5DCAA5]/50 transition-colors"
              />
            </div>

            <div>
              <label className="text-xs text-white/50 mb-1.5 block">Password</label>
              <input
                type="password"
                name="password"
                placeholder="Min. 8 characters"
                value={form.password}
                onChange={handleChange}
                className="w-full bg-white/[0.05] border border-white/[0.1] rounded-lg px-4 py-3 text-sm text-white placeholder-white/25 outline-none focus:border-[#5DCAA5]/50 transition-colors"
              />
            </div>

            <button
              onClick={handleSubmit}
              className="w-full bg-[#5DCAA5] text-[#04342C] font-medium text-sm py-3 rounded-lg hover:brightness-110 transition-all mt-2">
              Create account
            </button>

          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-white/[0.08]" />
            <span className="text-xs text-white/30">or</span>
            <div className="flex-1 h-px bg-white/[0.08]" />
          </div>

          {/* Google */}
          <button className="w-full bg-white/[0.05] border border-white/[0.1] rounded-lg py-3 text-sm text-white/70 hover:bg-white/[0.08] transition-all flex items-center justify-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <p className="text-center text-xs text-white/30 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-[#5DCAA5] hover:underline">Sign in</Link>
          </p>

        </div>

        <p className="text-center text-xs text-white/20 mt-4">
          By signing up you agree to our Terms & Privacy Policy
        </p>

      </div>
    </div>
  )
}

export default Register