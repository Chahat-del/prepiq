import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

const dummySubject = {
  id: 1,
  name: 'DBMS',
  exam: 'GATE CS',
  progress: 65,
  color: '#5DCAA5',
  topics: [
    { id: 1, name: 'ER Model & Diagrams', done: true, weightage: 'High' },
    { id: 2, name: 'Relational Model', done: true, weightage: 'High' },
    { id: 3, name: 'Normalization (1NF-BCNF)', done: true, weightage: 'High' },
    { id: 4, name: 'SQL Queries', done: true, weightage: 'High' },
    { id: 5, name: 'Transactions & ACID', done: false, weightage: 'High' },
    { id: 6, name: 'Concurrency Control', done: false, weightage: 'Medium' },
    { id: 7, name: 'Indexing & Hashing', done: false, weightage: 'Medium' },
    { id: 8, name: 'File Organization', done: false, weightage: 'Low' },
    { id: 9, name: 'Query Processing', done: false, weightage: 'Medium' },
    { id: 10, name: 'Recovery Systems', done: false, weightage: 'Low' },
  ],
  roadmap: [
    { week: 1, topics: ['ER Model & Diagrams', 'Relational Model'], done: true },
    { week: 2, topics: ['Normalization (1NF-BCNF)', 'SQL Queries'], done: true },
    { week: 3, topics: ['Transactions & ACID', 'Concurrency Control'], done: false },
    { week: 4, topics: ['Indexing & Hashing', 'Query Processing'], done: false },
    { week: 5, topics: ['File Organization', 'Recovery Systems'], done: false },
  ]
}

const dummyPYQ = {
  uploaded: true,
  year: '2023',
  examType: 'mcq',
  questions: [
    {
      id: 1,
      question: 'Which of the following normal forms is based on the concept of functional dependency?',
      options: ['1NF', '2NF', '3NF', 'All of the above'],
      answer: 3,
      topic: 'Normalization',
      difficulty: 'Medium',
      marks: 2,
      solution: 'All three normal forms (1NF, 2NF, 3NF) are based on functional dependencies. 1NF eliminates repeating groups, 2NF removes partial dependencies, and 3NF removes transitive dependencies.',
    },
    {
      id: 2,
      question: 'A relation is in BCNF if and only if for every functional dependency X → Y, X is a:',
      options: ['Candidate key', 'Primary key', 'Super key', 'Foreign key'],
      answer: 2,
      topic: 'Normalization',
      difficulty: 'Hard',
      marks: 2,
      solution: 'BCNF requires that for every non-trivial functional dependency X → Y, X must be a superkey. This is a stricter condition than 3NF which only requires that X be a superkey or Y be a prime attribute.',
    },
    {
      id: 3,
      question: 'Which concurrency control protocol uses timestamps to order transactions?',
      options: ['Two-phase locking', 'Timestamp ordering', 'Optimistic concurrency', 'MVCC'],
      answer: 1,
      topic: 'Concurrency Control',
      difficulty: 'Medium',
      marks: 1,
      solution: 'Timestamp ordering protocol assigns a unique timestamp to each transaction and uses these timestamps to determine the serialization order, ensuring conflict serializability.',
    },
    {
      id: 4,
      question: 'Which of the following is NOT a property of a transaction?',
      options: ['Atomicity', 'Consistency', 'Isolation', 'Dependency'],
      answer: 3,
      topic: 'Transactions & ACID',
      difficulty: 'Easy',
      marks: 1,
      solution: 'The four properties of a transaction are ACID — Atomicity, Consistency, Isolation, and Durability. Dependency is not one of them.',
    },
    {
      id: 5,
      question: 'In SQL, which clause is used to filter groups after GROUP BY?',
      options: ['WHERE', 'FILTER', 'HAVING', 'SELECT'],
      answer: 2,
      topic: 'SQL Queries',
      difficulty: 'Easy',
      marks: 1,
      solution: 'HAVING clause is used to filter groups after GROUP BY, similar to how WHERE filters rows. WHERE cannot be used with aggregate functions but HAVING can.',
    },
  ]
}

const weightageColor = {
  High: 'text-[#5DCAA5] bg-[#5DCAA5]/10',
  Medium: 'text-[#EF9F27] bg-[#EF9F27]/10',
  Low: 'text-white/40 bg-white/[0.05]',
}

const diffColor = {
  Easy: 'text-[#5DCAA5] bg-[#5DCAA5]/10',
  Medium: 'text-[#EF9F27] bg-[#EF9F27]/10',
  Hard: 'text-[#D4537E] bg-[#D4537E]/10',
}

function RoadmapTab({ subject }) {
  return (
    <div className="space-y-3">
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 mb-6">
        <p className="text-sm text-white/50 leading-relaxed">
          📍 Your roadmap is generated based on your syllabus and PYQ analysis. High weightage topics are prioritized first.
        </p>
      </div>
      {subject.roadmap.map((week) => (
        <div key={week.week}
          className={`border rounded-xl p-5 transition-all ${week.done ? 'border-[#5DCAA5]/20 bg-[#5DCAA5]/[0.04]' : 'border-white/[0.08] bg-white/[0.02]'}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${week.done ? 'bg-[#5DCAA5] text-[#04342C]' : 'bg-white/[0.08] text-white/40'}`}>
                {week.done ? '✓' : week.week}
              </div>
              <span className="text-sm font-semibold text-white">Week {week.week}</span>
            </div>
            {week.done && <span className="text-xs text-[#5DCAA5]">Completed</span>}
            {!week.done && week.week === 3 && <span className="text-xs text-[#EF9F27] bg-[#EF9F27]/10 px-2 py-0.5 rounded-full">Current</span>}
          </div>
          <div className="flex flex-wrap gap-2 ml-10">
            {week.topics.map(t => (
              <span key={t} className="text-xs bg-white/[0.05] border border-white/[0.08] text-white/60 px-3 py-1 rounded-full">{t}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function TopicsTab({ topics, setTopics }) {
  const toggle = (id) => {
    setTopics(topics.map(t => t.id === id ? { ...t, done: !t.done } : t))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-white/40">{topics.filter(t => t.done).length} of {topics.length} topics completed</p>
        <div className="h-1.5 w-32 bg-white/[0.06] rounded-full overflow-hidden">
          <div className="h-full bg-[#5DCAA5] rounded-full transition-all"
            style={{ width: `${(topics.filter(t => t.done).length / topics.length) * 100}%` }} />
        </div>
      </div>
      <div className="space-y-2">
        {topics.map(topic => (
          <div key={topic.id}
            onClick={() => toggle(topic.id)}
            className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${topic.done ? 'border-[#5DCAA5]/20 bg-[#5DCAA5]/[0.04]' : 'border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04]'}`}>
            <div className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${topic.done ? 'bg-[#5DCAA5] border-[#5DCAA5]' : 'border-white/20'}`}>
                {topic.done && <span className="text-[#04342C] text-xs">✓</span>}
              </div>
              <span className={`text-sm transition-all ${topic.done ? 'text-white/40 line-through' : 'text-white'}`}>
                {topic.name}
              </span>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${weightageColor[topic.weightage]}`}>
              {topic.weightage}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function StudyMaterialTab() {
  const [mode, setMode] = useState(null)
  const [selectedTopic, setSelectedTopic] = useState(null)

  if (!mode) return (
    <div>
      <p className="text-white/40 text-sm mb-6">How would you like to study?</p>
      <div className="grid grid-cols-2 gap-4">
        <div onClick={() => setMode('video')}
          className="border border-white/[0.08] rounded-2xl p-6 cursor-pointer hover:border-[#5DCAA5]/40 hover:bg-white/[0.03] transition-all">
          <div className="text-3xl mb-3">🎥</div>
          <h3 className="text-white font-bold mb-1">Video lectures</h3>
          <p className="text-xs text-white/40 leading-relaxed">Top YouTube videos ranked by views and student reviews</p>
        </div>
        <div onClick={() => setMode('written')}
          className="border border-white/[0.08] rounded-2xl p-6 cursor-pointer hover:border-[#7F77DD]/40 hover:bg-white/[0.03] transition-all">
          <div className="text-3xl mb-3">📝</div>
          <h3 className="text-white font-bold mb-1">Written notes</h3>
          <p className="text-xs text-white/40 leading-relaxed">AI-generated clean notes with examples and key points</p>
        </div>
      </div>
    </div>
  )

  if (!selectedTopic) return (
    <div>
      <button onClick={() => setMode(null)} className="text-xs text-white/40 hover:text-white mb-4 flex items-center gap-1 transition-colors">← Back</button>
      <p className="text-sm text-white/40 mb-4">Select a topic to study via <span className="text-white">{mode === 'video' ? '🎥 Video' : '📝 Written notes'}</span></p>
      <div className="space-y-2">
        {dummySubject.topics.map(t => (
          <div key={t.id} onClick={() => setSelectedTopic(t)}
            className="flex items-center justify-between p-4 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04] cursor-pointer transition-all">
            <span className="text-sm text-white">{t.name}</span>
            <span className="text-white/30 text-xs">→</span>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div>
      <button onClick={() => setSelectedTopic(null)} className="text-xs text-white/40 hover:text-white mb-4 flex items-center gap-1 transition-colors">← Back</button>
      <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-5">
        <h3 className="text-white font-bold mb-1">{selectedTopic.name}</h3>
        <p className="text-xs text-white/40 mb-4">{mode === 'video' ? 'Top recommended videos' : 'AI-generated notes'}</p>
        {mode === 'video' ? (
          <div className="space-y-3">
            {['Gate Smashers — DBMS Full Lecture', 'Abdul Bari — Database Concepts', 'Neso Academy — Complete DBMS'].map((v, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-white/[0.03] rounded-lg border border-white/[0.06] hover:border-white/[0.12] cursor-pointer transition-all">
                <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center text-sm">▶</div>
                <div>
                  <p className="text-sm text-white font-medium">{v}</p>
                  <p className="text-xs text-white/30">YouTube • Highly rated</p>
                </div>
              </div>
            ))}
            <p className="text-xs text-white/20 mt-2">* Real videos will load via YouTube API</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="p-4 bg-white/[0.03] rounded-lg border border-white/[0.06]">
              <p className="text-sm text-white/70 leading-relaxed">
                <span className="text-white font-semibold">📌 Key concept:</span> {selectedTopic.name} is a fundamental topic in DBMS with high exam weightage. It covers core principles that appear frequently in GATE and university exams.
              </p>
            </div>
            <div className="p-4 bg-white/[0.03] rounded-lg border border-white/[0.06]">
              <p className="text-xs text-white/40 mb-2 font-semibold uppercase tracking-wider">Key points</p>
              {['Core definition and purpose', 'Important properties to remember', 'Common exam question patterns', 'Quick revision formula'].map((point, i) => (
                <p key={i} className="text-sm text-white/60 py-1">• {point}</p>
              ))}
            </div>
            <p className="text-xs text-white/20">* Full AI-generated notes will load via Claude API</p>
          </div>
        )}
      </div>
    </div>
  )
}

function MockTest({ questions, onClose }) {
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(questions.length * 90)

  useState(() => {
    if (submitted) return
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timer); setSubmitted(true); return 0 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [submitted])

  const mins = String(Math.floor(timeLeft / 60)).padStart(2, '0')
  const secs = String(timeLeft % 60).padStart(2, '0')
  const score = questions.reduce((acc, q, i) => acc + (answers[i] === q.answer ? q.marks : 0), 0)
  const total = questions.reduce((acc, q) => acc + q.marks, 0)

  if (submitted) return (
    <div className="fixed inset-0 bg-[#0a0a0f] z-50 flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        <div className="text-6xl mb-4">{score / total >= 0.7 ? '🎉' : score / total >= 0.4 ? '📈' : '💪'}</div>
        <h2 className="text-3xl font-black mb-2">Test Complete!</h2>
        <p className="text-white/40 text-sm mb-8">Here's how you did</p>
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
            <div className="text-2xl font-black text-[#5DCAA5]">{score}/{total}</div>
            <div className="text-xs text-white/40 mt-1">Score</div>
          </div>
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
            <div className="text-2xl font-black text-white">{questions.filter((q, i) => answers[i] === q.answer).length}/{questions.length}</div>
            <div className="text-xs text-white/40 mt-1">Correct</div>
          </div>
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
            <div className="text-2xl font-black text-[#EF9F27]">{Math.round((score / total) * 100)}%</div>
            <div className="text-xs text-white/40 mt-1">Accuracy</div>
          </div>
        </div>
        <div className="space-y-3 text-left mb-8">
          {questions.map((q, i) => (
            <div key={i} className={`p-4 rounded-xl border ${answers[i] === q.answer ? 'border-[#5DCAA5]/20 bg-[#5DCAA5]/[0.04]' : 'border-[#D4537E]/20 bg-[#D4537E]/[0.04]'}`}>
              <div className="flex items-start gap-2 mb-2">
                <span className="text-sm">{answers[i] === q.answer ? '✅' : '❌'}</span>
                <p className="text-sm text-white/80">{q.question}</p>
              </div>
              {answers[i] !== q.answer && (
                <p className="text-xs text-white/40 ml-6">
                  Correct: <span className="text-[#5DCAA5]">{q.options[q.answer]}</span>
                  {answers[i] !== undefined && <> · Your answer: <span className="text-[#D4537E]">{q.options[answers[i]]}</span></>}
                </p>
              )}
            </div>
          ))}
        </div>
        <button onClick={onClose}
          className="bg-[#5DCAA5] text-[#04342C] font-medium px-8 py-3 rounded-lg hover:brightness-110 transition-all">
          Back to PYQ
        </button>
      </div>
    </div>
  )

  const q = questions[current]

  return (
    <div className="fixed inset-0 bg-[#0a0a0f] z-50 flex flex-col">
      <div className="flex items-center justify-between px-8 py-4 border-b border-white/[0.06]">
        <div>
          <span className="text-sm font-bold text-white">Mock Test</span>
          <span className="text-xs text-white/40 ml-2">Q{current + 1} of {questions.length}</span>
        </div>
        <div className={`font-mono text-lg font-bold ${timeLeft < 60 ? 'text-[#D4537E]' : 'text-[#5DCAA5]'}`}>
          {mins}:{secs}
        </div>
        <button onClick={() => setSubmitted(true)}
          className="bg-[#5DCAA5] text-[#04342C] text-sm font-medium px-4 py-2 rounded-lg">
          Submit test
        </button>
      </div>
      <div className="h-0.5 bg-white/[0.06]">
        <div className="h-full bg-[#5DCAA5] transition-all"
          style={{ width: `${((current + 1) / questions.length) * 100}%` }} />
      </div>
      <div className="flex-1 flex items-center justify-center px-8">
        <div className="max-w-2xl w-full">
          <div className="flex items-center gap-2 mb-4">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${diffColor[q.difficulty]}`}>{q.difficulty}</span>
            <span className="text-xs text-white/30">{q.topic}</span>
            <span className="text-xs text-white/30">· {q.marks} mark{q.marks > 1 ? 's' : ''}</span>
          </div>
          <p className="text-lg text-white font-medium leading-relaxed mb-8">{q.question}</p>
          <div className="space-y-3">
            {q.options.map((opt, i) => (
              <div key={i} onClick={() => setAnswers({ ...answers, [current]: i })}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${answers[current] === i ? 'border-[#5DCAA5] bg-[#5DCAA5]/10 text-white' : 'border-white/[0.08] bg-white/[0.02] text-white/70 hover:bg-white/[0.05]'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs transition-all ${answers[current] === i ? 'border-[#5DCAA5] bg-[#5DCAA5] text-[#04342C] font-bold' : 'border-white/20'}`}>
                    {answers[current] === i ? '✓' : String.fromCharCode(65 + i)}
                  </div>
                  <span className="text-sm">{opt}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-8">
            <button onClick={() => setCurrent(c => Math.max(0, c - 1))}
              disabled={current === 0}
              className="text-sm text-white/40 hover:text-white disabled:opacity-20 transition-colors">
              ← Previous
            </button>
            <div className="flex gap-1">
              {questions.map((_, i) => (
                <div key={i} onClick={() => setCurrent(i)}
                  className={`w-2 h-2 rounded-full cursor-pointer transition-all ${i === current ? 'bg-[#5DCAA5]' : answers[i] !== undefined ? 'bg-white/40' : 'bg-white/10'}`} />
              ))}
            </div>
            {current < questions.length - 1 ? (
              <button onClick={() => setCurrent(c => c + 1)}
                className="text-sm text-white/40 hover:text-white transition-colors">
                Next →
              </button>
            ) : (
              <button onClick={() => setSubmitted(true)}
                className="text-sm text-[#5DCAA5] font-medium">
                Finish →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function PYQTab() {
  const [showSolution, setShowSolution] = useState(null)
  const [mockActive, setMockActive] = useState(false)
  const [filterTopic, setFilterTopic] = useState('All')
  const pyq = dummyPYQ
  const topics = ['All', ...new Set(pyq.questions.map(q => q.topic))]
  const filtered = filterTopic === 'All' ? pyq.questions : pyq.questions.filter(q => q.topic === filterTopic)

  if (mockActive) return <MockTest questions={pyq.questions} onClose={() => setMockActive(false)} />

  return (
    <div>
      {!pyq.uploaded ? (
        <div className="border-2 border-dashed border-white/[0.1] rounded-2xl p-10 text-center mb-6">
          <div className="text-4xl mb-3">📄</div>
          <h3 className="text-white font-bold mb-2">Upload your PYQ paper</h3>
          <p className="text-white/40 text-sm mb-4">Upload a PDF of your previous year question paper to unlock solutions and mock tests</p>
          <button className="bg-[#5DCAA5] text-[#04342C] text-sm font-medium px-6 py-2.5 rounded-lg hover:brightness-110 transition-all">
            Upload PDF
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between bg-[#5DCAA5]/[0.06] border border-[#5DCAA5]/20 rounded-xl px-5 py-4 mb-6">
          <div className="flex items-center gap-3">
            <span className="text-xl">📄</span>
            <div>
              <p className="text-sm font-semibold text-white">GATE CS {pyq.year} — Question Paper</p>
              <p className="text-xs text-white/40">{pyq.questions.length} questions · MCQ format</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setMockActive(true)}
              className="bg-[#5DCAA5] text-[#04342C] text-sm font-medium px-4 py-2 rounded-lg hover:brightness-110 transition-all">
              Start mock test
            </button>
            <button className="text-xs text-white/40 hover:text-white border border-white/[0.1] px-3 py-2 rounded-lg transition-colors">
              Replace PDF
            </button>
          </div>
        </div>
      )}
      <div className="flex gap-2 mb-5 flex-wrap">
        {topics.map(t => (
          <button key={t} onClick={() => setFilterTopic(t)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-all ${filterTopic === t ? 'border-[#5DCAA5]/40 bg-[#5DCAA5]/10 text-[#5DCAA5]' : 'border-white/[0.08] text-white/40 hover:text-white'}`}>
            {t}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {filtered.map((q) => (
          <div key={q.id} className="border border-white/[0.08] bg-white/[0.02] rounded-xl overflow-hidden">
            <div className="p-5">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-white/30 font-medium">Q{q.id}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${diffColor[q.difficulty]}`}>{q.difficulty}</span>
                    <span className="text-xs text-white/30">{q.topic}</span>
                    <span className="text-xs text-white/20">· {q.marks}M</span>
                  </div>
                  <p className="text-sm text-white/80 leading-relaxed">{q.question}</p>
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    {q.options.map((opt, j) => (
                      <div key={j} className={`text-xs px-3 py-2 rounded-lg border ${j === q.answer ? 'border-[#5DCAA5]/30 bg-[#5DCAA5]/[0.06] text-[#5DCAA5]' : 'border-white/[0.06] text-white/40'}`}>
                        {String.fromCharCode(65 + j)}. {opt}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="border-t border-white/[0.06] px-5 py-3">
              <button onClick={() => setShowSolution(showSolution === q.id ? null : q.id)}
                className="text-xs text-[#5DCAA5] hover:underline transition-colors">
                {showSolution === q.id ? 'Hide solution ↑' : 'Show solution ↓'}
              </button>
            </div>
            {showSolution === q.id && (
              <div className="px-5 pb-5 border-t border-white/[0.04]">
                <div className="bg-white/[0.03] rounded-lg p-4 mt-3">
                  <p className="text-xs text-[#5DCAA5] font-semibold mb-2">💡 Solution</p>
                  <p className="text-sm text-white/60 leading-relaxed">{q.solution}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function Subject() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('roadmap')
  const [topics, setTopics] = useState(dummySubject.topics)

  const tabs = [
    { id: 'roadmap', label: '🗺️ Roadmap' },
    { id: 'topics', label: '✅ Topics' },
    { id: 'material', label: '📚 Study Material' },
    { id: 'pyq', label: '📝 PYQ & Tests' },
    { id: 'progress', label: '📊 Progress' },
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <nav className="flex justify-between items-center px-10 py-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="text-white/40 hover:text-white text-sm transition-colors">← Dashboard</button>
          <div className="w-px h-4 bg-white/10" />
          <div className="text-xl font-black tracking-tight">Prep<span className="text-[#5DCAA5]">IQ</span></div>
        </div>
        <div className="w-8 h-8 rounded-full bg-[#5DCAA5]/20 border border-[#5DCAA5]/30 flex items-center justify-center text-xs font-bold text-[#5DCAA5]">R</div>
      </nav>

      <div className="px-10 py-6 border-b border-white/[0.06]">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-xs text-white/30 bg-white/[0.05] px-2 py-1 rounded-full">{dummySubject.exam}</span>
        </div>
        <h1 className="text-3xl font-black mb-1">{dummySubject.name}</h1>
        <div className="flex items-center gap-2 mt-2">
          <div className="h-1.5 w-40 bg-white/[0.06] rounded-full overflow-hidden">
            <div className="h-full bg-[#5DCAA5] rounded-full" style={{ width: `${dummySubject.progress}%` }} />
          </div>
          <span className="text-xs text-white/40">{dummySubject.progress}% complete</span>
        </div>
      </div>

      <div className="px-10 border-b border-white/[0.06]">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-4 text-sm whitespace-nowrap transition-all border-b-2 ${activeTab === tab.id ? 'border-[#5DCAA5] text-white font-medium' : 'border-transparent text-white/40 hover:text-white/70'}`}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-10 py-8 max-w-4xl">
        {activeTab === 'roadmap' && <RoadmapTab subject={dummySubject} />}
        {activeTab === 'topics' && <TopicsTab topics={topics} setTopics={setTopics} />}
        {activeTab === 'material' && <StudyMaterialTab />}
        {activeTab === 'pyq' && <PYQTab />}
        {activeTab === 'progress' && (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-white font-bold mb-2">Progress Analytics</h3>
            <p className="text-white/40 text-sm">Coming next!</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Subject