import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function UserMenu() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)

  const initial = user?.name?.[0]?.toUpperCase() || '?'

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="relative" ref={menuRef}>
      {/* Avatar button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-8 h-8 rounded-full bg-[#5DCAA5]/20 border border-[#5DCAA5]/30 flex items-center justify-center text-xs font-bold text-[#5DCAA5] hover:bg-[#5DCAA5]/30 transition-all"
      >
        {initial}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-10 w-56 bg-[#111118] border border-white/[0.1] rounded-xl shadow-2xl z-50 overflow-hidden">
          {/* User info */}
          <div className="px-4 py-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#5DCAA5]/20 border border-[#5DCAA5]/30 flex items-center justify-center text-sm font-bold text-[#5DCAA5] flex-shrink-0">
                {initial}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                <p className="text-xs text-white/40 truncate">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Menu items */}
          <div className="py-1">
            <button
              onClick={() => { navigate('/dashboard'); setOpen(false) }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/[0.04] transition-all text-left"
            >
              <span className="text-base">🏠</span> Dashboard
            </button>
          </div>

          <div className="border-t border-white/[0.06] py-1">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#D4537E] hover:bg-[#D4537E]/[0.06] transition-all text-left"
            >
              <span className="text-base">🚪</span> Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
