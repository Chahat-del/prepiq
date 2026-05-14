import api from '../services/api'
import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import UserMenu from '../components/UserMenu'

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

// ─── FIX 1: RoadmapTab now has a proper return and closing brace ───
function RoadmapTab({ subject, topics }) {
  const roadmap = []
  const chunkSize = 2
  for (let i = 0; i < topics.length; i += chunkSize) {
    roadmap.push({
      week: Math.floor(i / chunkSize) + 1,
      topics: topics.slice(i, i + chunkSize).map(t => t.name),
      done: topics.slice(i, i + chunkSize).every(t => t.done),
    })
  }

  return (
    <div className="space-y-4">
      {roadmap.length === 0 && (
        <p className="text-white/40 text-sm">No topics available to build a roadmap.</p>
      )}
      {roadmap.map((week) => (
        <div
          key={week.week}
          className={`border rounded-xl p-5 transition-all ${
            week.done
              ? 'border-[#5DCAA5]/20 bg-[#5DCAA5]/[0.04]'
              : 'border-white/[0.08] bg-white/[0.02]'
          }`}
        >
          <div className="flex items-center gap-3 mb-3">
            <div
              className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all ${
                week.done
                  ? 'border-[#5DCAA5] bg-[#5DCAA5] text-[#04342C]'
                  : 'border-white/20 text-white/40'
              }`}
            >
              {week.done ? '✓' : week.week}
            </div>
            <span className="text-sm font-semibold text-white">Week {week.week}</span>
            {week.done && (
              <span className="text-xs text-[#5DCAA5] bg-[#5DCAA5]/10 px-2 py-0.5 rounded-full">
                Done
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2 ml-10">
            {week.topics.map((t, i) => (
              <span
                key={i}
                className="text-xs text-white/60 bg-white/[0.04] border border-white/[0.08] px-3 py-1.5 rounded-full"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── FIX 2: TopicsTab is now a top-level function (was nested inside RoadmapTab) ───
// ─── FIX 3: toggle() now has its proper closing brace ───
function TopicsTab({ topics, setTopics }) {
  const toggle = async (topicId) => {
    const topic = topics.find(t => t.id === topicId)
    const updated = topics.map(t => t.id === topicId ? { ...t, done: !t.done } : t)
    setTopics(updated)
    try {
      await api.patch(`/subjects/topic/${topicId}`, { done: !topic.done })
    } catch (err) {
      console.log('Error updating topic:', err)
    }
  } // ← closing brace was missing

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-white/40">
          {topics.filter(t => t.done).length} of {topics.length} topics completed
        </p>
        <div className="h-1.5 w-32 bg-white/[0.06] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#5DCAA5] rounded-full transition-all"
            style={{ width: `${(topics.filter(t => t.done).length / topics.length) * 100}%` }}
          />
        </div>
      </div>
      <div className="space-y-2">
        {topics.map(topic => (
          <div
            key={topic.id}
            onClick={() => toggle(topic.id)}
            className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
              topic.done
                ? 'border-[#5DCAA5]/20 bg-[#5DCAA5]/[0.04]'
                : 'border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                  topic.done ? 'bg-[#5DCAA5] border-[#5DCAA5]' : 'border-white/20'
                }`}
              >
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

// ─── FIX 4: StudyMaterialTab now accepts topics as a prop instead of using undefined dummySubject ───
function StudyMaterialTab({ subject, topics }) {
  const [mode, setMode] = useState(null)
  const [selectedTopic, setSelectedTopic] = useState(null)
  const [videos, setVideos] = useState([])
  const [loadingVideos, setLoadingVideos] = useState(false)
  const [videoError, setVideoError] = useState('')
  const [explanation, setExplanation] = useState('')
  const [loadingExplanation, setLoadingExplanation] = useState(false)

  const fetchVideos = async (topic) => {
    setLoadingVideos(true)
    setVideoError('')
    setVideos([])
    try {
      const res = await api.post('/youtube/videos', {
        topicName: topic.name,
        subjectName: subject.name,
        examName: subject.exam
      })
      setVideos(res.data.videos || [])
    } catch (err) {
      console.log('Video error:', err)
      const msg = err.response?.data?.error || err.message || 'Failed to load videos'
      setVideoError(msg)
    } finally {
      setLoadingVideos(false)
    }
  }

  const fetchExplanation = async (topic) => {
    setLoadingExplanation(true)
    try {
      const res = await api.post('/ai/explain', {
        topicName: topic.name,
        subjectName: subject.name,
        examName: subject.exam
      })
      setExplanation(res.data.explanation || '')
    } catch (err) {
      console.log('Explanation error:', err)
    } finally {
      setLoadingExplanation(false)
    }
  }

  const handleTopicSelect = (topic) => {
    setSelectedTopic(topic)
    setVideos([])
    setVideoError('')
    setExplanation('')
    if (mode === 'video') fetchVideos(topic)
    if (mode === 'written') fetchExplanation(topic)
  }

  if (!mode) return (
    <div>
      <p className="text-white/40 text-sm mb-6">How would you like to study?</p>
      <div className="grid grid-cols-2 gap-4">
        <div onClick={() => setMode('video')}
          className="border border-white/[0.08] rounded-2xl p-6 cursor-pointer hover:border-[#5DCAA5]/40 hover:bg-white/[0.03] transition-all">
          <div className="text-3xl mb-3">🎥</div>
          <h3 className="text-white font-bold mb-1">Video lectures</h3>
          <p className="text-xs text-white/40 leading-relaxed">Top YouTube videos ranked by relevance</p>
        </div>
        <div onClick={() => setMode('written')}
          className="border border-white/[0.08] rounded-2xl p-6 cursor-pointer hover:border-[#7F77DD]/40 hover:bg-white/[0.03] transition-all">
          <div className="text-3xl mb-3">📝</div>
          <h3 className="text-white font-bold mb-1">Written notes</h3>
          <p className="text-xs text-white/40 leading-relaxed">AI-generated notes with key points</p>
        </div>
      </div>
    </div>
  )

  if (!selectedTopic) return (
    <div>
      <button onClick={() => setMode(null)} className="text-xs text-white/40 hover:text-white mb-4 flex items-center gap-1 transition-colors">← Back</button>
      <p className="text-sm text-white/40 mb-4">Select a topic to study via <span className="text-white">{mode === 'video' ? '🎥 Video' : '📝 Written notes'}</span></p>
      <div className="space-y-2">
        {topics.map(t => (
          <div key={t.id} onClick={() => handleTopicSelect(t)}
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
        <p className="text-xs text-white/40 mb-4">{mode === 'video' ? 'Top YouTube videos' : 'AI-generated notes'}</p>

        {mode === 'video' && (
          <div className="space-y-3">
            {loadingVideos && <p className="text-white/40 text-sm">Finding best videos...</p>}
            {!loadingVideos && videoError && (
              <p className="text-[#D4537E] text-sm">⚠️ {videoError}</p>
            )}
            {!loadingVideos && !videoError && videos.map((v, i) => (
              <a key={i} href={v.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-white/[0.03] rounded-lg border border-white/[0.06] hover:border-white/[0.15] cursor-pointer transition-all block">
                <img src={v.thumbnail} alt={v.title} className="w-24 h-16 rounded object-cover flex-shrink-0" />
                <div>
                  <p className="text-sm text-white font-medium line-clamp-2">{v.title}</p>
                  <p className="text-xs text-white/30 mt-1">{v.channel} • YouTube</p>
                </div>
              </a>
            ))}
            {!loadingVideos && !videoError && videos.length === 0 && (
              <p className="text-white/40 text-sm">No videos found.</p>
            )}
          </div>
        )}

        {mode === 'written' && (
          <div>
            {loadingExplanation && <p className="text-white/40 text-sm">AI is writing notes...</p>}
            {!loadingExplanation && explanation && (
              <div className="p-4 bg-white/[0.03] rounded-lg border border-white/[0.06]">
                <p className="text-sm text-white/70 leading-relaxed whitespace-pre-line">{explanation}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── FIX 5: useState → useEffect for the timer ───
function MockTest({ questions, onClose, subjectId, paperId }) {
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(questions.length * 90)

  const score = questions.reduce((acc, q, i) => acc + (answers[i] === q.answer ? q.marks : 0), 0)
  const total = questions.reduce((acc, q) => acc + (q.marks || 1), 0)

  // Save result when submitted
  useEffect(() => {
    if (!submitted || !subjectId) return
    api.post('/ai/mock/result', {
      subjectId,
      paperId: paperId || null,
      score,
      total,
      answers
    }).catch(err => console.log('Save result error:', err))
  }, [submitted])

  useEffect(() => {
    if (submitted) return
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timer)
          setSubmitted(true)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [submitted])

  const mins = String(Math.floor(timeLeft / 60)).padStart(2, '0')
  const secs = String(timeLeft % 60).padStart(2, '0')

  if (submitted) return (
    <div className="fixed inset-0 bg-[#0a0a0f] z-50 flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        <div className="text-6xl mb-4">
          {score / total >= 0.7 ? '🎉' : score / total >= 0.4 ? '📈' : '💪'}
        </div>
        <h2 className="text-3xl font-black mb-2">Test Complete!</h2>
        <p className="text-white/40 text-sm mb-8">Here's how you did</p>
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
            <div className="text-2xl font-black text-[#5DCAA5]">{score}/{total}</div>
            <div className="text-xs text-white/40 mt-1">Score</div>
          </div>
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
            <div className="text-2xl font-black text-white">
              {questions.filter((q, i) => answers[i] === q.answer).length}/{questions.length}
            </div>
            <div className="text-xs text-white/40 mt-1">Correct</div>
          </div>
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
            <div className="text-2xl font-black text-[#EF9F27]">{Math.round((score / total) * 100)}%</div>
            <div className="text-xs text-white/40 mt-1">Accuracy</div>
          </div>
        </div>
        <div className="space-y-3 text-left mb-8">
          {questions.map((q, i) => (
            <div
              key={i}
              className={`p-4 rounded-xl border ${
                answers[i] === q.answer
                  ? 'border-[#5DCAA5]/20 bg-[#5DCAA5]/[0.04]'
                  : 'border-[#D4537E]/20 bg-[#D4537E]/[0.04]'
              }`}
            >
              <div className="flex items-start gap-2 mb-2">
                <span className="text-sm">{answers[i] === q.answer ? '✅' : '❌'}</span>
                <p className="text-sm text-white/80">{q.question}</p>
              </div>
              {answers[i] !== q.answer && (
                <p className="text-xs text-white/40 ml-6">
                  Correct: <span className="text-[#5DCAA5]">{q.options[q.answer]}</span>
                  {answers[i] !== undefined && (
                    <> · Your answer: <span className="text-[#D4537E]">{q.options[answers[i]]}</span></>
                  )}
                </p>
              )}
            </div>
          ))}
        </div>
        <button
          onClick={onClose}
          className="bg-[#5DCAA5] text-[#04342C] font-medium px-8 py-3 rounded-lg hover:brightness-110 transition-all"
        >
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
        <button
          onClick={() => setSubmitted(true)}
          className="bg-[#5DCAA5] text-[#04342C] text-sm font-medium px-4 py-2 rounded-lg"
        >
          Submit test
        </button>
      </div>
      <div className="h-0.5 bg-white/[0.06]">
        <div
          className="h-full bg-[#5DCAA5] transition-all"
          style={{ width: `${((current + 1) / questions.length) * 100}%` }}
        />
      </div>
      <div className="flex-1 flex items-center justify-center px-8">
        <div className="max-w-2xl w-full">
          <div className="flex items-center gap-2 mb-4">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${diffColor[q.difficulty]}`}>
              {q.difficulty}
            </span>
            <span className="text-xs text-white/30">{q.topic}</span>
            <span className="text-xs text-white/30">· {q.marks} mark{q.marks > 1 ? 's' : ''}</span>
          </div>
          <p className="text-lg text-white font-medium leading-relaxed mb-8">{q.question}</p>
          <div className="space-y-3">
            {q.options.map((opt, i) => (
              <div
                key={i}
                onClick={() => setAnswers({ ...answers, [current]: i })}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  answers[current] === i
                    ? 'border-[#5DCAA5] bg-[#5DCAA5]/10 text-white'
                    : 'border-white/[0.08] bg-white/[0.02] text-white/70 hover:bg-white/[0.05]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs transition-all ${
                      answers[current] === i
                        ? 'border-[#5DCAA5] bg-[#5DCAA5] text-[#04342C] font-bold'
                        : 'border-white/20'
                    }`}
                  >
                    {answers[current] === i ? '✓' : String.fromCharCode(65 + i)}
                  </div>
                  <span className="text-sm">{opt}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={() => setCurrent(c => Math.max(0, c - 1))}
              disabled={current === 0}
              className="text-sm text-white/40 hover:text-white disabled:opacity-20 transition-colors"
            >
              ← Previous
            </button>
            <div className="flex gap-1">
              {questions.map((_, i) => (
                <div
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`w-2 h-2 rounded-full cursor-pointer transition-all ${
                    i === current ? 'bg-[#5DCAA5]' : answers[i] !== undefined ? 'bg-white/40' : 'bg-white/10'
                  }`}
                />
              ))}
            </div>
            {current < questions.length - 1 ? (
              <button
                onClick={() => setCurrent(c => c + 1)}
                className="text-sm text-white/40 hover:text-white transition-colors"
              >
                Next →
              </button>
            ) : (
              <button onClick={() => setSubmitted(true)} className="text-sm text-[#5DCAA5] font-medium">
                Finish →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const FAMOUS_EXAM_KEYWORDS = ['JEE', 'NEET', 'GATE', 'UPSC', 'CAT', 'GMAT', 'GRE', 'SAT', 'IELTS', 'TOEFL']

function isFamousExam(examName) {
  if (!examName) return false
  return FAMOUS_EXAM_KEYWORDS.some(k => examName.toUpperCase().includes(k))
}

function PYQTab({ subject, subjectId }) {
  // Use is_famous from DB if set, otherwise derive from exam name
  const famous = subject?.is_famous ?? isFamousExam(subject?.exam)

  return famous
    ? <FamousPYQTab subject={subject} subjectId={subjectId} />
    : <CustomPYQTab subject={subject} subjectId={subjectId} />
}

// ─── Famous exam PYQ: AI generates real past-style questions, no upload ───────
function FamousPYQTab({ subject, subjectId }) {
  const [papers, setPapers] = useState([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [generateError, setGenerateError] = useState('')
  const [activePaper, setActivePaper] = useState(null)
  const [mockActive, setMockActive] = useState(false)
  const [showSolution, setShowSolution] = useState(null)
  const [filterTopic, setFilterTopic] = useState('All')

  useEffect(() => { loadPapers() }, [subjectId])

  const loadPapers = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/ai/pyq/${subjectId}`)
      const fetched = (res.data.papers || []).filter(p => p.source === 'ai_famous')
      setPapers(fetched)
      if (fetched.length > 0) setActivePaper(fetched[0])
    } catch (err) {
      console.log('Load papers error:', err)
    } finally {
      setLoading(false)
    }
  }

  const generateNew = async () => {
    setGenerating(true)
    setGenerateError('')
    try {
      const res = await api.post('/ai/pyq/famous', {
        subjectName: subject.name,
        examName: subject.exam,
        subjectId
      })
      const newPaper = res.data.paper
      setPapers(prev => [newPaper, ...prev])
      setActivePaper(newPaper)
      setFilterTopic('All')
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Generation failed'
      const isQuota = msg.toLowerCase().includes('quota') || msg.toLowerCase().includes('429')
      setGenerateError(isQuota
        ? 'Gemini API quota exceeded. Please wait until tomorrow or add billing at aistudio.google.com.'
        : msg)
      console.log('Generate PYQ error:', msg)
    } finally {
      setGenerating(false)
    }
  }

  if (mockActive && activePaper)
    return <MockTest questions={activePaper.questions} subjectId={subjectId} paperId={activePaper.id} onClose={() => setMockActive(false)} />

  if (loading) return <p className="text-white/40 text-sm">Loading papers...</p>

  const questions = activePaper?.questions || []
  const topicFilters = ['All', ...new Set(questions.map(q => q.topic).filter(Boolean))]
  const filtered = filterTopic === 'All' ? questions : questions.filter(q => q.topic === filterTopic)

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-white font-bold">Previous Year Questions</h3>
          <p className="text-xs text-white/40 mt-0.5">AI-generated based on actual {subject.exam} patterns</p>
        </div>
        <button
          onClick={generateNew}
          disabled={generating}
          className="bg-[#5DCAA5] text-[#04342C] text-sm font-medium px-4 py-2 rounded-lg hover:brightness-110 transition-all disabled:opacity-50 flex items-center gap-2"
        >
          {generating ? (
            <><span className="w-3 h-3 border-2 border-[#04342C] border-t-transparent rounded-full animate-spin" />Generating...</>
          ) : '+ Generate New Set'}
        </button>
      </div>

      {/* Paper selector if multiple */}
      {papers.length > 1 && (
        <div className="flex gap-2 mb-5 flex-wrap">
          {papers.map((p, i) => (
            <button
              key={p.id}
              onClick={() => { setActivePaper(p); setFilterTopic('All') }}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                activePaper?.id === p.id
                  ? 'border-[#5DCAA5]/40 bg-[#5DCAA5]/10 text-[#5DCAA5]'
                  : 'border-white/[0.08] text-white/40 hover:text-white'
              }`}
            >
              Set {papers.length - i}
            </button>
          ))}
        </div>
      )}

      {generateError && (
        <div className="mb-5 p-4 bg-[#D4537E]/[0.06] border border-[#D4537E]/20 rounded-xl">
          <p className="text-sm text-[#D4537E]">⚠️ {generateError}</p>
        </div>
      )}

      {/* No papers yet */}
      {papers.length === 0 && !generating && (
        <div className="border-2 border-dashed border-white/[0.1] rounded-2xl p-10 text-center">
          <div className="text-4xl mb-3">📝</div>
          <h3 className="text-white font-bold mb-2">No PYQs yet</h3>
          <p className="text-white/40 text-sm mb-4">Generate AI-curated previous year style questions for {subject.exam}</p>
          <button
            onClick={generateNew}
            disabled={generating}
            className="bg-[#5DCAA5] text-[#04342C] text-sm font-medium px-6 py-2.5 rounded-lg hover:brightness-110 transition-all"
          >
            Generate PYQs
          </button>
        </div>
      )}

      {generating && papers.length === 0 && (
        <div className="flex items-center gap-3 p-6 border border-white/[0.08] rounded-xl">
          <span className="w-5 h-5 border-2 border-[#5DCAA5] border-t-transparent rounded-full animate-spin" />
          <p className="text-white/60 text-sm">AI is generating {subject.exam} questions for {subject.name}...</p>
        </div>
      )}

      {/* Active paper */}
      {activePaper && (
        <>
          <div className="flex items-center justify-between bg-[#5DCAA5]/[0.06] border border-[#5DCAA5]/20 rounded-xl px-5 py-4 mb-5">
            <div className="flex items-center gap-3">
              <span className="text-xl">📄</span>
              <div>
                <p className="text-sm font-semibold text-white">{activePaper.title}</p>
                <p className="text-xs text-white/40">{questions.length} questions · {subject.exam} style</p>
              </div>
            </div>
            <button
              onClick={() => setMockActive(true)}
              className="bg-[#5DCAA5] text-[#04342C] text-sm font-medium px-4 py-2 rounded-lg hover:brightness-110 transition-all"
            >
              Start Mock Test
            </button>
          </div>

          <div className="flex gap-2 mb-5 flex-wrap">
            {topicFilters.map(t => (
              <button key={t} onClick={() => setFilterTopic(t)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                  filterTopic === t
                    ? 'border-[#5DCAA5]/40 bg-[#5DCAA5]/10 text-[#5DCAA5]'
                    : 'border-white/[0.08] text-white/40 hover:text-white'
                }`}>{t}</button>
            ))}
          </div>

          <div className="space-y-3">
            {filtered.map((q, idx) => (
              <QuestionCard key={idx} q={q} idx={idx} showSolution={showSolution} setShowSolution={setShowSolution} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ─── Custom subject PYQ: upload past paper + generate similar from syllabus ───
function CustomPYQTab({ subject, subjectId }) {
  const [papers, setPapers] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [activePaper, setActivePaper] = useState(null)
  const [mockActive, setMockActive] = useState(false)
  const [showSolution, setShowSolution] = useState(null)
  const [filterTopic, setFilterTopic] = useState('All')
  const [uploadError, setUploadError] = useState('')
  const fileInputRef = useState(null)

  useEffect(() => { loadPapers() }, [subjectId])

  const loadPapers = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/ai/pyq/${subjectId}`)
      const fetched = res.data.papers || []
      setPapers(fetched)
      if (fetched.length > 0) setActivePaper(fetched[0])
    } catch (err) {
      console.log('Load papers error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadError('')
    setUploading(true)

    try {
      const reader = new FileReader()
      reader.onload = async (ev) => {
        const base64 = ev.target.result.split(',')[1]
        const mimeType = file.type || 'application/pdf'
        try {
          const res = await api.post('/ai/pyq/upload', {
            subjectId,
            subjectName: subject.name,
            examName: subject.exam,
            imageBase64: base64,
            mimeType,
            title: `${subject.name} — ${file.name.replace(/\.[^.]+$/, '')}`
          })
          const newPaper = res.data.paper
          setPapers(prev => [newPaper, ...prev])
          setActivePaper(newPaper)
          setFilterTopic('All')
        } catch (err) {
          setUploadError(err.response?.data?.error || 'Upload failed')
        } finally {
          setUploading(false)
        }
      }
      reader.readAsDataURL(file)
    } catch (err) {
      setUploadError('Failed to read file')
      setUploading(false)
    }
  }

  const generateSimilar = async () => {
    setGenerating(true)
    try {
      const res = await api.post('/ai/pyq/generate-similar', {
        subjectId,
        subjectName: subject.name,
        examName: subject.exam
      })
      const newPaper = res.data.paper
      setPapers(prev => [newPaper, ...prev])
      setActivePaper(newPaper)
      setFilterTopic('All')
    } catch (err) {
      console.log('Generate similar error:', err)
    } finally {
      setGenerating(false)
    }
  }

  if (mockActive && activePaper)
    return <MockTest questions={activePaper.questions.filter(q => q.type === 'mcq' || !q.type)} subjectId={subjectId} paperId={activePaper.id} onClose={() => setMockActive(false)} />

  if (loading) return <p className="text-white/40 text-sm">Loading papers...</p>

  const uploadedPapers = papers.filter(p => p.source === 'uploaded')
  const generatedPapers = papers.filter(p => p.source === 'ai_similar')
  const questions = activePaper?.questions || []
  const topicFilters = ['All', ...new Set(questions.map(q => q.topic).filter(Boolean))]
  const filtered = filterTopic === 'All' ? questions : questions.filter(q => q.topic === filterTopic)
  const mcqCount = questions.filter(q => q.type === 'mcq').length

  return (
    <div>
      {/* Action bar */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        {/* Upload past paper */}
        <label className={`flex items-center gap-2 border border-white/[0.12] text-white text-sm font-medium px-4 py-2 rounded-lg cursor-pointer hover:bg-white/[0.04] transition-all ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
          {uploading ? (
            <><span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />Processing...</>
          ) : (
            <><span>📤</span> Upload Past Paper</>
          )}
          <input type="file" accept=".pdf,image/*" className="hidden" onChange={handleUpload} />
        </label>

        {/* Generate similar from syllabus */}
        <button
          onClick={generateSimilar}
          disabled={generating}
          className="flex items-center gap-2 bg-[#5DCAA5] text-[#04342C] text-sm font-medium px-4 py-2 rounded-lg hover:brightness-110 transition-all disabled:opacity-50"
        >
          {generating ? (
            <><span className="w-3 h-3 border-2 border-[#04342C] border-t-transparent rounded-full animate-spin" />Generating...</>
          ) : (
            <><span>✨</span> Generate Similar Paper</>
          )}
        </button>
      </div>

      {uploadError && <p className="text-[#D4537E] text-sm mb-4">⚠️ {uploadError}</p>}

      {(uploading || generating) && papers.length === 0 && (
        <div className="flex items-center gap-3 p-6 border border-white/[0.08] rounded-xl mb-4">
          <span className="w-5 h-5 border-2 border-[#5DCAA5] border-t-transparent rounded-full animate-spin" />
          <p className="text-white/60 text-sm">
            {uploading ? 'AI is reading your paper and generating solutions...' : 'AI is generating a paper based on your syllabus...'}
          </p>
        </div>
      )}

      {/* Empty state */}
      {papers.length === 0 && !uploading && !generating && (
        <div className="border-2 border-dashed border-white/[0.1] rounded-2xl p-10 text-center">
          <div className="text-4xl mb-3">📄</div>
          <h3 className="text-white font-bold mb-2">No papers yet</h3>
          <p className="text-white/40 text-sm">Upload a past paper to get AI-generated solutions, or generate a new paper based on your syllabus.</p>
        </div>
      )}

      {/* Paper tabs */}
      {papers.length > 0 && (
        <>
          <div className="flex gap-2 mb-5 flex-wrap">
            {papers.map((p) => (
              <button
                key={p.id}
                onClick={() => { setActivePaper(p); setFilterTopic('All') }}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all flex items-center gap-1.5 ${
                  activePaper?.id === p.id
                    ? 'border-[#5DCAA5]/40 bg-[#5DCAA5]/10 text-[#5DCAA5]'
                    : 'border-white/[0.08] text-white/40 hover:text-white'
                }`}
              >
                {p.source === 'uploaded' ? '📤' : '✨'} {p.title}
              </button>
            ))}
          </div>

          {activePaper && (
            <>
              <div className="flex items-center justify-between bg-white/[0.03] border border-white/[0.08] rounded-xl px-5 py-4 mb-5">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{activePaper.source === 'uploaded' ? '📤' : '✨'}</span>
                  <div>
                    <p className="text-sm font-semibold text-white">{activePaper.title}</p>
                    <p className="text-xs text-white/40">
                      {questions.length} questions
                      {activePaper.source === 'uploaded' ? ' · AI-solved' : ' · AI-generated from syllabus'}
                      {mcqCount > 0 && ` · ${mcqCount} MCQ`}
                    </p>
                  </div>
                </div>
                {mcqCount > 0 && (
                  <button
                    onClick={() => setMockActive(true)}
                    className="bg-[#5DCAA5] text-[#04342C] text-sm font-medium px-4 py-2 rounded-lg hover:brightness-110 transition-all"
                  >
                    Start Mock Test
                  </button>
                )}
              </div>

              <div className="flex gap-2 mb-5 flex-wrap">
                {topicFilters.map(t => (
                  <button key={t} onClick={() => setFilterTopic(t)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                      filterTopic === t
                        ? 'border-[#5DCAA5]/40 bg-[#5DCAA5]/10 text-[#5DCAA5]'
                        : 'border-white/[0.08] text-white/40 hover:text-white'
                    }`}>{t}</button>
                ))}
              </div>

              <div className="space-y-3">
                {filtered.map((q, idx) => (
                  <QuestionCard key={idx} q={q} idx={idx} showSolution={showSolution} setShowSolution={setShowSolution} />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}

// ─── Shared question card used by both PYQ tabs ───────────────────────────────
function QuestionCard({ q, idx, showSolution, setShowSolution }) {
  const key = `${idx}`
  return (
    <div className="border border-white/[0.08] bg-white/[0.02] rounded-xl overflow-hidden">
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-white/30 font-medium">Q{idx + 1}</span>
          {q.difficulty && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${diffColor[q.difficulty] || 'text-white/40 bg-white/[0.05]'}`}>
              {q.difficulty}
            </span>
          )}
          {q.topic && <span className="text-xs text-white/30">{q.topic}</span>}
          {q.marks && <span className="text-xs text-white/20">· {q.marks}M</span>}
          {q.type === 'subjective' && (
            <span className="text-xs text-[#7F77DD] bg-[#7F77DD]/10 px-2 py-0.5 rounded-full">Subjective</span>
          )}
        </div>
        <p className="text-sm text-white/80 leading-relaxed">{q.question}</p>
        {q.type !== 'subjective' && q.options?.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mt-3">
            {q.options.map((opt, j) => (
              <div key={j} className={`text-xs px-3 py-2 rounded-lg border ${
                j === q.answer
                  ? 'border-[#5DCAA5]/30 bg-[#5DCAA5]/[0.06] text-[#5DCAA5]'
                  : 'border-white/[0.06] text-white/40'
              }`}>
                {String.fromCharCode(65 + j)}. {opt}
              </div>
            ))}
          </div>
        )}
      </div>
      {q.solution && (
        <>
          <div className="border-t border-white/[0.06] px-5 py-3">
            <button
              onClick={() => setShowSolution(showSolution === key ? null : key)}
              className="text-xs text-[#5DCAA5] hover:underline transition-colors"
            >
              {showSolution === key ? 'Hide solution ↑' : 'Show solution ↓'}
            </button>
          </div>
          {showSolution === key && (
            <div className="px-5 pb-5 border-t border-white/[0.04]">
              <div className="bg-white/[0.03] rounded-lg p-4 mt-3">
                <p className="text-xs text-[#5DCAA5] font-semibold mb-2">💡 Solution</p>
                <p className="text-sm text-white/60 leading-relaxed whitespace-pre-line">{q.solution}</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function ProgressTab({ topics, subjectId }) {
  const done = topics.filter(t => t.done).length
  const total = topics.length
  const percent = Math.round((done / total) * 100) || 0

  const [mockResults, setMockResults] = useState([])
  const [loadingResults, setLoadingResults] = useState(true)

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await api.get(`/ai/mock/results/${subjectId}`)
        setMockResults(res.data.results || [])
      } catch (err) {
        console.log('Error fetching mock results:', err)
      } finally {
        setLoadingResults(false)
      }
    }
    fetchResults()
  }, [subjectId])

  const weakTopics = topics.filter(t => !t.done && t.weightage === 'High')
  const strongTopics = topics.filter(t => t.done)

  const testsTaken = mockResults.length
  const avgScore = testsTaken > 0
    ? Math.round(mockResults.reduce((acc, r) => acc + (r.score / r.total) * 100, 0) / testsTaken)
    : 0
  const maxBarScore = mockResults.length > 0 ? Math.max(...mockResults.map(r => r.total)) : 1

  return (
    <div className="space-y-6">
      {/* Stats grid */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Topics done', value: `${done}/${total}`, color: '#5DCAA5' },
          { label: 'Completion', value: `${percent}%`, color: '#7F77DD' },
          { label: 'Tests taken', value: testsTaken, color: '#EF9F27' },
          { label: 'Avg score', value: testsTaken > 0 ? `${avgScore}%` : '—', color: '#D4537E' },
        ].map((s, i) => (
          <div key={i} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
            <div className="text-2xl font-black mb-1" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs text-white/40">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Exam readiness */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-white">Exam readiness</h3>
          <span className="text-sm font-black text-[#EF9F27]">
            {percent >= 80 ? 'Strong 💪' : percent >= 50 ? 'On track 📈' : 'Needs work 📚'}
          </span>
        </div>
        <div className="h-3 bg-white/[0.06] rounded-full overflow-hidden mb-2">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${percent}%`,
              background: percent >= 80 ? '#5DCAA5' : percent >= 50 ? '#EF9F27' : '#D4537E',
            }}
          />
        </div>
        <p className="text-xs text-white/30">Based on topic completion and test performance</p>
      </div>

      {/* Mock test scores chart */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
        <h3 className="text-sm font-bold text-white mb-4">Mock test scores</h3>
        {loadingResults && <p className="text-white/40 text-sm">Loading results...</p>}
        {!loadingResults && mockResults.length === 0 && (
          <p className="text-white/30 text-sm">No mock tests taken yet. Complete a test in the PYQ tab to see your progress here.</p>
        )}
        {!loadingResults && mockResults.length > 0 && (
          <>
            <div className="flex items-end gap-3 h-32">
              {mockResults.map((r, i) => {
                const pct = Math.round((r.score / r.total) * 100)
                const height = Math.max(8, pct)
                return (
                  <div key={r.id || i} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-xs text-white/40">{pct}%</span>
                    <div
                      className="w-full rounded-t-md transition-all duration-700"
                      style={{
                        height: `${height}%`,
                        background: pct >= 70 ? '#5DCAA5' : pct >= 40 ? '#EF9F27' : '#D4537E',
                        opacity: 0.75
                      }}
                    />
                    <span className="text-xs text-white/30">T{i + 1}</span>
                  </div>
                )
              })}
            </div>
            <div className="flex items-center justify-between mt-3">
              <p className="text-xs text-white/20">
                Best: {Math.max(...mockResults.map(r => Math.round((r.score / r.total) * 100)))}% ·
                Latest: {Math.round((mockResults[mockResults.length - 1].score / mockResults[mockResults.length - 1].total) * 100)}%
              </p>
              {mockResults.length >= 2 && (() => {
                const first = mockResults[0].score / mockResults[0].total
                const last = mockResults[mockResults.length - 1].score / mockResults[mockResults.length - 1].total
                const diff = Math.round((last - first) * 100)
                return diff > 0
                  ? <p className="text-xs text-[#5DCAA5]">↑ {diff}% improvement</p>
                  : diff < 0
                  ? <p className="text-xs text-[#D4537E]">↓ {Math.abs(diff)}% from first test</p>
                  : null
              })()}
            </div>
          </>
        )}
      </div>

      {/* Weak areas */}
      {weakTopics.length > 0 && (
        <div className="bg-[#D4537E]/[0.04] border border-[#D4537E]/20 rounded-xl p-5">
          <h3 className="text-sm font-bold text-white mb-3">⚠️ Weak areas — high priority</h3>
          <div className="space-y-2">
            {weakTopics.map(t => (
              <div key={t.id} className="flex items-center justify-between p-3 bg-white/[0.02] rounded-lg border border-white/[0.06]">
                <span className="text-sm text-white/70">{t.name}</span>
                <span className="text-xs text-[#D4537E] bg-[#D4537E]/10 px-2 py-0.5 rounded-full">Not started</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Strong areas */}
      {strongTopics.length > 0 && (
        <div className="bg-[#5DCAA5]/[0.04] border border-[#5DCAA5]/20 rounded-xl p-5">
          <h3 className="text-sm font-bold text-white mb-3">✅ Strong areas</h3>
          <div className="flex flex-wrap gap-2">
            {strongTopics.map(t => (
              <span key={t.id} className="text-xs bg-[#5DCAA5]/10 border border-[#5DCAA5]/20 text-[#5DCAA5] px-3 py-1.5 rounded-full">
                {t.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function Subject() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('topics')
  const [subject, setSubject] = useState(null)
  const [topics, setTopics] = useState([])
  const [loading, setLoading] = useState(true)
  const [generatingTopics, setGeneratingTopics] = useState(false)

  useEffect(() => {
    fetchSubject()
  }, [id])

  const fetchSubject = async () => {
    try {
      const res = await api.get(`/subjects/${id}`)
      const fetchedSubject = res.data.subject
      const fetchedTopics = res.data.topics || []
      setSubject(fetchedSubject)

      // ── KEY FIX: if no topics in DB yet, call AI to generate them ──
      if (fetchedTopics.length === 0) {
        setGeneratingTopics(true)
        try {
          const aiRes = await api.post('/ai/topics', {
            subjectName: fetchedSubject.name,
            examName: fetchedSubject.exam,
            subjectId: id,
          })
          setTopics(aiRes.data.topics || [])
        } catch (aiErr) {
          console.log('AI generation error:', aiErr)
        } finally {
          setGeneratingTopics(false)
        }
      } else {
        setTopics(fetchedTopics)
      }
    } catch (err) {
      console.log('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'roadmap', label: '🗺️ Roadmap' },
    { id: 'topics', label: '✅ Topics' },
    { id: 'material', label: '📚 Study Material' },
    { id: 'pyq', label: '📝 PYQ & Tests' },
    { id: 'progress', label: '📊 Progress' },
  ]

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <p className="text-white/40">Loading subject...</p>
    </div>
  )

  if (!subject) return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <p className="text-white/40">Subject not found</p>
    </div>
  )

  if (generatingTopics) return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 rounded-full border-2 border-[#5DCAA5] border-t-transparent animate-spin" />
      <div className="text-center">
        <p className="text-white font-semibold mb-1">Generating topics with AI...</p>
        <p className="text-white/40 text-sm">Analysing {subject.name} for {subject.exam} exam</p>
      </div>
    </div>
  )

  const progress = topics.length
    ? Math.round((topics.filter(t => t.done).length / topics.length) * 100)
    : 0

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <nav className="flex justify-between items-center px-10 py-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="text-white/40 hover:text-white text-sm transition-colors">
            ← Dashboard
          </button>
          <div className="w-px h-4 bg-white/10" />
          <div className="text-xl font-black tracking-tight">
            Prep<span className="text-[#5DCAA5]">IQ</span>
          </div>
        </div>
        <UserMenu />
      </nav>

      <div className="px-10 py-6 border-b border-white/[0.06]">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-xs text-white/30 bg-white/[0.05] px-2 py-1 rounded-full">{subject.exam}</span>
        </div>
        <h1 className="text-3xl font-black mb-1">{subject.name}</h1>
        <div className="flex items-center gap-2 mt-2">
          <div className="h-1.5 w-40 bg-white/[0.06] rounded-full overflow-hidden">
            <div className="h-full bg-[#5DCAA5] rounded-full" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-xs text-white/40">{progress}% complete</span>
        </div>
      </div>

      <div className="px-10 border-b border-white/[0.06]">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-4 text-sm whitespace-nowrap transition-all border-b-2 ${
                activeTab === tab.id
                  ? 'border-[#5DCAA5] text-white font-medium'
                  : 'border-transparent text-white/40 hover:text-white/70'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-10 py-8 max-w-4xl">
        {activeTab === 'roadmap' && <RoadmapTab topics={topics} subject={subject} />}
        {activeTab === 'topics' && <TopicsTab topics={topics} setTopics={setTopics} />}
        {activeTab === 'material' && <StudyMaterialTab subject={subject} topics={topics} />}
        {activeTab === 'pyq' && <PYQTab subject={subject} subjectId={id} />}
        {activeTab === 'progress' && <ProgressTab topics={topics} subjectId={id} />}
      </div>
    </div>
  )
}

export default Subject