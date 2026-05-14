require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') })
const axios = require('axios')
const { GoogleGenerativeAI } = require('@google/generative-ai')

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

const getVideos = async (req, res) => {
  const { topicName, subjectName, examName } = req.body

  if (!topicName) return res.status(400).json({ error: 'Topic name required' })

  const isCustom = !examName || examName === 'College / Custom' || examName === 'Custom'

  try {
    // Step 1: Ask Gemini to generate the best YouTube search query for this topic
    let searchQuery = ''
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
      const prompt = isCustom
        ? `Generate the single best YouTube search query to find a high-quality lecture or tutorial video about "${topicName}" in the context of "${subjectName}". 
The query should be specific enough to find relevant educational content.
Return ONLY the search query string, nothing else. No quotes, no explanation.`
        : `Generate the single best YouTube search query to find a high-quality lecture or tutorial video about "${topicName}" for "${examName}" exam preparation (subject: "${subjectName}").
The query should be specific enough to find relevant educational content for ${examName} students.
Return ONLY the search query string, nothing else. No quotes, no explanation.`

      const result = await model.generateContent(prompt)
      searchQuery = result.response.text().trim().replace(/^["']|["']$/g, '')
      console.log(`Gemini suggested query: "${searchQuery}"`)
    } catch (aiErr) {
      // Fallback to manual query if Gemini fails
      searchQuery = isCustom
        ? `${topicName} ${subjectName} lecture tutorial`
        : `${topicName} ${examName} ${subjectName} lecture`
      console.log(`Gemini failed, using fallback query: "${searchQuery}"`)
    }

    // Step 2: Search YouTube with the AI-generated query
    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        q: searchQuery,
        type: 'video',
        maxResults: 5,
        order: 'relevance',
        relevanceLanguage: 'en',
        videoCategoryId: '27', // Education category
        key: process.env.YOUTUBE_API_KEY
      }
    })

    const items = response.data.items || []
    console.log(`YouTube returned ${items.length} results for: "${searchQuery}"`)

    // Step 3: Filter out clearly irrelevant results by checking title relevance
    const topicWords = topicName.toLowerCase().split(/\s+/).filter(w => w.length > 3)
    const scored = items.map(item => {
      const title = item.snippet.title.toLowerCase()
      const desc = item.snippet.description?.toLowerCase() || ''
      // Count how many topic keywords appear in title/description
      const matches = topicWords.filter(w => title.includes(w) || desc.includes(w)).length
      return { item, score: matches }
    })

    // Sort by relevance score, keep top 4
    scored.sort((a, b) => b.score - a.score)
    const topItems = scored.slice(0, 4)

    const videos = topItems.map(({ item }) => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      channel: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails.medium.url,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`
    }))

    res.json({ videos })
  } catch (err) {
    const ytError = err.response?.data?.error
    console.log('YouTube API error:', JSON.stringify(ytError || err.message, null, 2))
    const message = ytError?.message || err.message
    res.status(500).json({ error: message })
  }
}

module.exports = { getVideos }

module.exports = { getVideos }