require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') })
const { GoogleGenerativeAI } = require('@google/generative-ai')
const { createClient } = require('@supabase/supabase-js')

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

// Famous exams — no syllabus upload needed for these
const FAMOUS_EXAMS = ['JEE', 'NEET', 'GATE CS', 'UPSC', 'CAT']

const isFamousExam = (examName) =>
  FAMOUS_EXAMS.some(e => examName?.toUpperCase().includes(e.toUpperCase()))

const fallbackTopics = {
  'VARC': ['Reading Comprehension', 'Para Jumbles', 'Para Summary', 'Odd Sentence Out', 'Vocabulary', 'Critical Reasoning'],
  'Quantitative Aptitude': ['Arithmetic', 'Algebra', 'Geometry', 'Number System', 'Modern Math', 'Data Interpretation'],
  'LRDI': ['Logical Reasoning', 'Data Interpretation', 'Puzzles', 'Seating Arrangement', 'Blood Relations', 'Syllogisms'],
  'DBMS': ['ER Model', 'Normalization', 'SQL', 'Transactions', 'Concurrency Control', 'Indexing'],
  'Operating Systems': ['Process Management', 'Memory Management', 'File Systems', 'Deadlocks', 'Scheduling', 'Synchronization'],
  'Computer Networks': ['OSI Model', 'TCP/IP', 'Routing', 'DNS', 'HTTP', 'Network Security'],
  'DSA': ['Arrays', 'Linked Lists', 'Trees', 'Graphs', 'Dynamic Programming', 'Sorting & Searching'],
  'Mathematics': ['Calculus', 'Linear Algebra', 'Probability', 'Differential Equations', 'Complex Numbers'],
  'Physics': ['Mechanics', 'Thermodynamics', 'Electromagnetism', 'Optics', 'Modern Physics'],
  'Chemistry': ['Physical Chemistry', 'Organic Chemistry', 'Inorganic Chemistry', 'Electrochemistry'],
  'Biology': ['Cell Biology', 'Genetics', 'Human Physiology', 'Ecology', 'Evolution'],
}

// ─── 1. Generate topics (from AI or syllabus text) ───────────────────────────
const generateTopics = async (req, res) => {
  const { subjectName, examName, subjectId, syllabusText } = req.body

  if (!subjectName || !examName || !subjectId)
    return res.status(400).json({ error: 'Missing required fields' })

  try {
    let topics = []

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' })

      // If syllabus text was uploaded, extract topics from it
      // Otherwise generate from knowledge of the exam
      const prompt = syllabusText
        ? `You are an expert educator. Extract all topics from this syllabus for "${subjectName}".

Syllabus content:
${syllabusText.slice(0, 4000)}

Return ONLY a valid JSON array like this:
[
  {"name": "Topic Name", "weightage": "High"},
  {"name": "Topic Name", "weightage": "Medium"}
]
Weightage: High/Medium/Low based on how much content is dedicated to each topic.
Return only the JSON array, nothing else.`
        : `You are an expert educator. Generate a comprehensive list of topics for "${subjectName}" for the "${examName}" exam.

Return ONLY a valid JSON array like this:
[
  {"name": "Topic Name", "weightage": "High"},
  {"name": "Topic Name", "weightage": "Medium"}
]
Weightage: High/Medium/Low based on how frequently this topic appears in ${examName} exams.
Generate 10-15 topics. Return only the JSON array, nothing else.`

      const result = await model.generateContent(prompt)
      const text = result.response.text()
      const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim()
      topics = JSON.parse(cleaned)
    } catch (aiErr) {
      console.log('AI failed, using fallback:', aiErr.message)
      const fallback = fallbackTopics[subjectName] || ['Introduction', 'Core Concepts', 'Advanced Topics', 'Practice Problems', 'Revision']
      topics = fallback.map((name, i) => ({
        name,
        weightage: i < 2 ? 'High' : i < 4 ? 'Medium' : 'Low'
      }))
    }

    const topicsToInsert = topics.map(t => ({
      subject_id: subjectId,
      name: t.name,
      weightage: t.weightage,
      done: false
    }))

    const { data, error } = await supabase
      .from('topics')
      .insert(topicsToInsert)
      .select()

    if (error) throw error

    // Mark subject as famous or not
    await supabase
      .from('subjects')
      .update({ is_famous: isFamousExam(examName) })
      .eq('id', subjectId)

    res.json({ topics: data })

  } catch (err) {
    console.log('Topics Error:', err.message)
    res.status(500).json({ error: err.message })
  }
}

// ─── 2. Generate roadmap ──────────────────────────────────────────────────────
const generateRoadmap = async (req, res) => {
  const { subjectName, examName, topics } = req.body

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' })

    const prompt = `You are an expert educator. Create a week-by-week study roadmap for "${subjectName}" for "${examName}" exam.

Topics available: ${topics.map(t => t.name).join(', ')}

Return ONLY a valid JSON array like this:
[
  {"week": 1, "topics": ["Topic 1", "Topic 2"], "done": false},
  {"week": 2, "topics": ["Topic 3"], "done": false}
]

Prioritize high weightage topics first. Group logically related topics together. Return only the JSON array, nothing else.`

    const result = await model.generateContent(prompt)
    const text = result.response.text()
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim()
    const roadmap = JSON.parse(cleaned)

    res.json({ roadmap })

  } catch (err) {
    console.log('Roadmap Error:', err.message)
    res.status(500).json({ error: err.message })
  }
}

// ─── 3. Explain a topic ───────────────────────────────────────────────────────
const explainTopic = async (req, res) => {
  const { topicName, subjectName, examName } = req.body

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' })

    const prompt = `You are an expert teacher explaining "${topicName}" from ${subjectName} for ${examName} exam.

Provide a clear, concise explanation with:
1. Core concept definition
2. Key points to remember (3-5 points)
3. Common exam question patterns
4. A simple example if applicable

Keep it focused and exam-oriented. Use plain text with line breaks, no markdown headers.`

    const result = await model.generateContent(prompt)
    const explanation = result.response.text()

    res.json({ explanation })

  } catch (err) {
    console.log('Explain Error:', err.message)
    res.status(500).json({ error: err.message })
  }
}

// ─── 4. Generate PYQ questions for famous exams ───────────────────────────────
const generateFamousPYQ = async (req, res) => {
  const { subjectName, examName, subjectId } = req.body

  if (!subjectName || !examName || !subjectId)
    return res.status(400).json({ error: 'Missing required fields' })

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' })

    const prompt = `You are an expert educator for ${examName}. Generate 10 realistic previous year style MCQ questions for "${subjectName}" in ${examName}.

Return ONLY a valid JSON array like this:
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answer": 0,
    "topic": "Topic name",
    "difficulty": "Medium",
    "marks": 2,
    "solution": "Detailed solution explanation here."
  }
]

answer is the 0-based index of the correct option.
difficulty: Easy / Medium / Hard
marks: 1 or 2
Generate 10 questions spanning different topics. Return only the JSON array, nothing else.`

    const result = await model.generateContent(prompt)
    const text = result.response.text()
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim()
    const questions = JSON.parse(cleaned)

    // Save to pyq_papers table
    const { data, error } = await supabase
      .from('pyq_papers')
      .insert([{
        subject_id: subjectId,
        title: `${examName} — ${subjectName} (AI Generated)`,
        questions,
        source: 'ai_famous'
      }])
      .select()
      .single()

    if (error) throw error

    res.json({ paper: data })

  } catch (err) {
    console.log('Famous PYQ Error:', err.message)
    res.status(500).json({ error: err.message })
  }
}

// ─── 5. Process uploaded question paper image/PDF → generate answers ─────────
const processUploadedPaper = async (req, res) => {
  const { subjectId, subjectName, examName, imageBase64, mimeType, title } = req.body

  if (!subjectId || !imageBase64)
    return res.status(400).json({ error: 'Missing subjectId or image data' })

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' })

    // Send image to Gemini and extract + answer questions
    const prompt = `You are an expert educator. Look at this question paper image carefully.

Extract ALL questions from it and provide detailed answers.

Return ONLY a valid JSON array like this:
[
  {
    "question": "Full question text here",
    "type": "mcq",
    "options": ["A", "B", "C", "D"],
    "answer": 1,
    "solution": "Detailed step-by-step solution here",
    "topic": "Topic name",
    "marks": 2
  }
]

For subjective questions, set type to "subjective", options to [], answer to 0.
For MCQ, set type to "mcq" and answer as 0-based index.
Extract every question you can see. Return only the JSON array, nothing else.`

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: mimeType || 'image/jpeg',
          data: imageBase64
        }
      }
    ])

    const text = result.response.text()
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim()
    const questions = JSON.parse(cleaned)

    // Save permanently to DB
    const { data, error } = await supabase
      .from('pyq_papers')
      .insert([{
        subject_id: subjectId,
        title: title || `${subjectName} — Uploaded Paper`,
        questions,
        source: 'uploaded'
      }])
      .select()
      .single()

    if (error) throw error

    res.json({ paper: data })

  } catch (err) {
    console.log('Process Paper Error:', err.message)
    res.status(500).json({ error: err.message })
  }
}

// ─── 6. Get all saved PYQ papers for a subject ────────────────────────────────
const getPapers = async (req, res) => {
  const { subjectId } = req.params

  try {
    const { data, error } = await supabase
      .from('pyq_papers')
      .select('*')
      .eq('subject_id', subjectId)
      .order('created_at', { ascending: false })

    if (error) throw error

    res.json({ papers: data || [] })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// ─── 7. Save mock test result ─────────────────────────────────────────────────
const saveMockResult = async (req, res) => {
  const { subjectId, paperId, score, total, answers, userId } = req.body

  try {
    const { data, error } = await supabase
      .from('mock_results')
      .insert([{ subject_id: subjectId, paper_id: paperId, score, total, answers, user_id: userId }])
      .select()
      .single()

    if (error) throw error
    res.json({ result: data })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// ─── 8. Get mock results for progress tab ────────────────────────────────────
const getMockResults = async (req, res) => {
  const { subjectId } = req.params

  try {
    const { data, error } = await supabase
      .from('mock_results')
      .select('*')
      .eq('subject_id', subjectId)
      .order('created_at', { ascending: true })

    if (error) throw error
    res.json({ results: data || [] })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

module.exports = {
  generateTopics,
  generateRoadmap,
  explainTopic,
  generateFamousPYQ,
  processUploadedPaper,
  getPapers,
  saveMockResult,
  getMockResults,
}