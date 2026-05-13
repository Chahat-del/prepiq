require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') })
const { GoogleGenerativeAI } = require('@google/generative-ai')
const { createClient } = require('@supabase/supabase-js')

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
const supabase = createClient(
  'https://kogyeyicqqlwgvxjdbvf.supabase.co',
  'sb_publishable_UEpApqjOzSTd6eCuvi7lAA_gzf-f6wo'
)

const generateTopics = async (req, res) => {
  const { subjectName, examName, subjectId } = req.body

  if (!subjectName || !examName || !subjectId)
    return res.status(400).json({ error: 'Missing required fields' })

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

    const prompt = `You are an expert educator. Generate a comprehensive list of topics for the subject "${subjectName}" for the exam "${examName}".

Return ONLY a valid JSON array with no markdown, no backticks, no explanation. Just the raw JSON array like this:
[
  {"name": "Topic Name", "weightage": "High"},
  {"name": "Topic Name", "weightage": "Medium"},
  {"name": "Topic Name", "weightage": "Low"}
]

Weightage should be High/Medium/Low based on how frequently this topic appears in ${examName} exams.
Generate 10-15 topics. Return only the JSON array, nothing else.`

    const result = await model.generateContent(prompt)
    const text = result.response.text()

    // Clean response
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim()
    const topics = JSON.parse(cleaned)

    // Save topics to database
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

    res.json({ topics: data })

  } catch (err) {
    console.log('AI Error:', err.message)
    res.status(500).json({ error: err.message })
  }
}

const generateRoadmap = async (req, res) => {
  const { subjectName, examName, topics } = req.body

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

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

const explainTopic = async (req, res) => {
  const { topicName, subjectName, examName } = req.body

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
    const prompt = `You are an expert teacher explaining "${topicName}" from ${subjectName} for ${examName} exam.

Provide a clear, concise explanation with:
1. Core concept definition
2. Key points to remember (3-5 points)
3. Common exam question patterns
4. A simple example if applicable

Keep it focused and exam-oriented. Format it nicely but don't use markdown headers, just plain text with line breaks.`

    const result = await model.generateContent(prompt)
    const explanation = result.response.text()

    res.json({ explanation })

  } catch (err) {
    console.log('Explain Error:', err.message)
    res.status(500).json({ error: err.message })
  }
}

module.exports = { generateTopics, generateRoadmap, explainTopic }