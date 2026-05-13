import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const colors = ['#5DCAA5', '#7F77DD', '#EF9F27', '#D4537E', '#378ADD']

function ProgressRing({ progress, color, size = 64 }) {
  const r = (size - 8) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (progress / 100) * circ
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="4"
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
    </svg>
  )
}

function SubjectCard({ subject, onClick }) {
  const progress = subject.progress || 0
  return (
    <div onClick={onClick}
      className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 cursor-pointer hover:bg-white/[0.06] hover:border-white/[0.15] transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-white font-bold text-base mb-1 group-hover:text-[#5DCAA5] transition-colors">{subject.name}</h3>
          <span className="text-xs text-white/30 bg-white/[0.05] px-2 py-1 rounded-full">{subject.exam}</span>
        </div>
        <div className="relative flex items-center justify-center">
          <ProgressRing progress={progress} color={subject.color || '#5DCAA5'} />
          <span className="absolute text-xs font-bold text-white">{progress}%</span>
        </div>
      </div>
      <div className="mt-3 h-1 bg-white/[0.06] rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${progress}%`, background: subject.color || '#5DCAA5' }} />
      </div>
    </div>
  )
}

function AddSubjectModal({ onClose, onAdd, loading }) {
  const [step, setStep] = useState(1)
  const [selected, setSelected] = useState({ exam: '', subject: '' })

  const exams = ['GATE CS', 'CAT', 'JEE', 'UPSC', 'NEET', 'Custom']
  const subjects = {
    'GATE CS': ['DBMS', 'Operating Systems', 'Computer Networks', 'DSA', 'Algorithms', 'TOC', 'Compiler Design'],
    'CAT': ['Quantitative Aptitude', 'VARC', 'LRDI'],
    'JEE': ['Physics', 'Chemistry', 'Mathematics'],
    'UPSC': ['History', 'Geography', 'Polity', 'Economics', 'Science & Tech'],
    'NEET': ['Physics', 'Chemistry', 'Biology'],
    'Custom': ['Custom Subject'],
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4"
      onClick={onClose}>
      <div className="bg-[#111118] border border-white/[0.1] rounded-2xl p-6 w-full max-w-md"
        onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-white font-bold text-lg">Add a subject</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white text-xl">×</button>
        </div>

        {loading && (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">🤖</div>
            <p className="text-white font-medium mb-1">AI is generating topics...</p>
            <p className="text-white/40 text-sm">This takes a few seconds</p>
          </div>
        )}

        {!loading && step === 1 && (
          <div>
            <p className="text-white/40 text-sm mb-4">Select your exam</p>
            <div className="grid grid-cols-2 gap-2">
              {exams.map(exam => (
                <button key={exam}
                  onClick={() => { setSelected({ ...selected, exam }); setStep(2) }}
                  className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white/70 hover:bg-white/[0.08] hover:text-white hover:border-[#5DCAA5]/40 transition-all text-left">
                  {exam}
                </button>
              ))}
            </div>
          </div>
        )}

        {!loading && step === 2 && (
          <div>
            <button onClick={() => setStep(1)} className="text-xs text-white/40 hover:text-white mb-4 flex items-center gap-1 transition-colors">← Back</button>
            <p className="text-white/40 text-sm mb-4">Select subject under <span className="text-white">{selected.exam}</span></p>
            <div className="flex flex-col gap-2">
              {subjects[selected.exam]?.map(sub => (
                <button key={sub}
                  onClick={() => onAdd({ exam: selected.exam, subject: sub })}
                  className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white/70 hover:bg-white/[0.08] hover:text-white hover:border-[#5DCAA5]/40 transition-all text-left">
                  {sub}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [subjects, setSubjects] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [loadingSubjects, setLoadingSubjects] = useState(true)
  const [addingSubject, setAddingSubject] = useState(false)

  useEffect(() => {
    fetchSubjects()
  }, [])

  const fetchSubjects = async () => {
    try {
      const res = await api.get('/subjects')
      setSubjects(res.data.subjects || [])
    } catch (err) {
      console.log('Error fetching subjects:', err)
    } finally {
      setLoadingSubjects(false)
    }
  }

  const handleAdd = async ({ exam, subject }) => {
  try {
    setAddingSubject(true)
    const color = colors[subjects.length % colors.length]

    // Create subject in DB
    const res = await api.post('/subjects', { name: subject, exam, color })
    const newSubject = res.data.subject

    // AI generates topics
    try {
      await api.post('/ai/topics', {
        subjectName: subject,
        examName: exam,
        subjectId: newSubject.id
      })
    } catch (aiErr) {
      console.log('AI error:', aiErr)
      // continue even if AI fails
    }

    // Refresh subjects
    await fetchSubjects()
    setShowModal(false)

  } catch (err) {
    console.log('Error adding subject:', err)
    alert('Error: ' + (err.response?.data?.error || err.message))
    setAddingSubject(false)
  } finally {
    setAddingSubject(false)
  }
}
  const totalProgress = subjects.length
    ? Math.round(subjects.reduce((a, b) => a + (b.progress || 0), 0) / subjects.length)
    : 0

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <nav className="flex justify-between items-center px-10 py-5 border-b border-white/[0.06]">
        <div className="text-xl font-black tracking-tight">
          Prep<span className="text-[#5DCAA5]">IQ</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-full bg-[#5DCAA5]/20 border border-[#5DCAA5]/30 flex items-center justify-center text-xs font-bold text-[#5DCAA5]">
            {user?.name?.[0]?.toUpperCase()}
          </div>
        </div>
      </nav>

      <div className="px-10 py-8 max-w-6xl mx-auto">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black mb-1">{getGreeting()}, {user?.name?.split(' ')[0]} 👋</h1>
            <p className="text-white/40 text-sm">
              {subjects.length === 0 ? 'Add your first subject to get started' : `You have ${subjects.length} subject${subjects.length > 1 ? 's' : ''} in progress`}
            </p>
          </div>
          <button onClick={() => setShowModal(true)}
            className="bg-[#5DCAA5] text-[#04342C] text-sm font-medium px-5 py-2.5 rounded-lg hover:brightness-110 transition-all">
            + Add subject
          </button>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Overall progress', value: `${totalProgress}%` },
            { label: 'Subjects active', value: subjects.length },
            { label: 'Day streak', value: '🔥 1' },
            { label: 'Topics completed', value: '—' },
          ].map((s, i) => (
            <div key={i} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
              <div className="text-2xl font-black text-white mb-1">{s.value}</div>
              <div className="text-xs text-white/40">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Your subjects</h2>
          <span className="text-xs text-white/30">{subjects.length} subjects</span>
        </div>

        {loadingSubjects ? (
          <div className="text-center py-20 text-white/40">Loading your subjects...</div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {subjects.map(subject => (
              <SubjectCard key={subject.id} subject={subject}
                onClick={() => navigate(`/subject/${subject.id}`)} />
            ))}
            <div onClick={() => setShowModal(true)}
              className="border border-dashed border-white/[0.1] rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-[#5DCAA5]/40 hover:bg-white/[0.02] transition-all group min-h-[140px]">
              <div className="w-10 h-10 rounded-full border border-dashed border-white/20 flex items-center justify-center text-white/30 text-2xl mb-3 group-hover:border-[#5DCAA5]/40 group-hover:text-[#5DCAA5] transition-all">+</div>
              <p className="text-xs text-white/30 group-hover:text-white/50 transition-colors">Add a new subject</p>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <AddSubjectModal
          onClose={() => !addingSubject && setShowModal(false)}
          onAdd={handleAdd}
          loading={addingSubject}
        />
      )}
    </div>
  )
}

export default Dashboard