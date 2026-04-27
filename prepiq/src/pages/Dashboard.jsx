import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const dummySubjects = [
  { id: 1, name: 'DBMS', exam: 'GATE CS', progress: 65, topics: 12, completed: 8, lastStudied: '2 hours ago', color: '#5DCAA5' },
  { id: 2, name: 'Data Structures & Algorithms', exam: 'GATE CS', progress: 40, topics: 20, completed: 8, lastStudied: 'Yesterday', color: '#7F77DD' },
  { id: 3, name: 'Operating Systems', exam: 'GATE CS', progress: 80, topics: 15, completed: 12, lastStudied: '3 days ago', color: '#EF9F27' },
  { id: 4, name: 'Computer Networks', exam: 'GATE CS', progress: 20, topics: 18, completed: 4, lastStudied: '1 week ago', color: '#D4537E' },
]

function ProgressRing({ progress, color, size = 64 }) {
  const r = (size - 8) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (progress / 100) * circ

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="4"
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
    </svg>
  )
}

function SubjectCard({ subject, onClick }) {
  return (
    <div onClick={onClick}
      className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 cursor-pointer hover:bg-white/[0.06] hover:border-white/[0.15] transition-all group">
      
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-white font-bold text-base mb-1 group-hover:text-[#5DCAA5] transition-colors">{subject.name}</h3>
          <span className="text-xs text-white/30 bg-white/[0.05] px-2 py-1 rounded-full">{subject.exam}</span>
        </div>
        <div className="relative flex items-center justify-center">
          <ProgressRing progress={subject.progress} color={subject.color} />
          <span className="absolute text-xs font-bold text-white">{subject.progress}%</span>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/[0.06]">
        <div className="text-xs text-white/40">
          <span className="text-white font-medium">{subject.completed}</span>/{subject.topics} topics
        </div>
        <div className="text-xs text-white/30">
          {subject.lastStudied}
        </div>
      </div>

      <div className="mt-3 h-1 bg-white/[0.06] rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${subject.progress}%`, background: subject.color }} />
      </div>

    </div>
  )
}

function AddSubjectModal({ onClose, onAdd }) {
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
          <button onClick={onClose} className="text-white/40 hover:text-white text-xl leading-none">×</button>
        </div>

        {step === 1 && (
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

        {step === 2 && (
          <div>
            <button onClick={() => setStep(1)} className="text-xs text-white/40 hover:text-white mb-4 flex items-center gap-1 transition-colors">
              ← Back
            </button>
            <p className="text-white/40 text-sm mb-4">Select subject under <span className="text-white">{selected.exam}</span></p>
            <div className="flex flex-col gap-2">
              {subjects[selected.exam]?.map(sub => (
                <button key={sub}
                  onClick={() => { onAdd({ exam: selected.exam, subject: sub }); onClose() }}
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
  const navigate = useNavigate()
  const [subjects, setSubjects] = useState(dummySubjects)
  const [showModal, setShowModal] = useState(false)

  const handleAdd = ({ exam, subject }) => {
    const colors = ['#5DCAA5', '#7F77DD', '#EF9F27', '#D4537E', '#378ADD']
    const newSubject = {
      id: subjects.length + 1,
      name: subject,
      exam,
      progress: 0,
      topics: 0,
      completed: 0,
      lastStudied: 'Just added',
      color: colors[subjects.length % colors.length],
    }
    setSubjects([...subjects, newSubject])
  }

  const totalProgress = Math.round(subjects.reduce((a, b) => a + b.progress, 0) / subjects.length)

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">

      {/* Nav */}
      <nav className="flex justify-between items-center px-10 py-5 border-b border-white/[0.06]">
        <div className="text-xl font-black tracking-tight">
          Prep<span className="text-[#5DCAA5]">IQ</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-full bg-[#5DCAA5]/20 border border-[#5DCAA5]/30 flex items-center justify-center text-xs font-bold text-[#5DCAA5]">
            R
          </div>
        </div>
      </nav>

      <div className="px-10 py-8 max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black mb-1">Good morning, Rahul 👋</h1>
            <p className="text-white/40 text-sm">You have {subjects.length} subjects in progress</p>
          </div>
          <button onClick={() => setShowModal(true)}
            className="bg-[#5DCAA5] text-[#04342C] text-sm font-medium px-5 py-2.5 rounded-lg hover:brightness-110 transition-all flex items-center gap-2">
            + Add subject
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Overall progress', value: `${totalProgress}%` },
            { label: 'Subjects active', value: subjects.length },
            { label: 'Day streak', value: '7 🔥' },
            { label: 'Topics completed', value: subjects.reduce((a, b) => a + b.completed, 0) },
          ].map((s, i) => (
            <div key={i} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
              <div className="text-2xl font-black text-white mb-1">{s.value}</div>
              <div className="text-xs text-white/40">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Subjects */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Your subjects</h2>
          <span className="text-xs text-white/30">{subjects.length} subjects</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {subjects.map(subject => (
            <SubjectCard
              key={subject.id}
              subject={subject}
              onClick={() => navigate(`/subject/${subject.id}`)}
            />
          ))}

          {/* Add card */}
          <div onClick={() => setShowModal(true)}
            className="border border-dashed border-white/[0.1] rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-[#5DCAA5]/40 hover:bg-white/[0.02] transition-all group min-h-[160px]">
            <div className="w-10 h-10 rounded-full border border-dashed border-white/20 flex items-center justify-center text-white/30 text-2xl mb-3 group-hover:border-[#5DCAA5]/40 group-hover:text-[#5DCAA5] transition-all">+</div>
            <p className="text-xs text-white/30 group-hover:text-white/50 transition-colors">Add a new subject</p>
          </div>
        </div>

      </div>

      {showModal && <AddSubjectModal onClose={() => setShowModal(false)} onAdd={handleAdd} />}

    </div>
  )
}

export default Dashboard