require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') })
const axios = require('axios')

const getVideos = async (req, res) => {
  const { topicName, subjectName, examName } = req.body

  if (!topicName) return res.status(400).json({ error: 'Topic name required' })

  try {
    const safeExam = examName === 'College / Custom' ? '' : examName || ''
    const query = `${topicName} ${subjectName} ${safeExam} lecture tutorial`.trim()
    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        q: query,
        type: 'video',
        maxResults: 4,
        order: 'relevance',
        relevanceLanguage: 'en',
        key: process.env.YOUTUBE_API_KEY
      }
    })

    const videos = response.data.items.map(item => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      channel: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails.medium.url,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`
    }))

    res.json({ videos })
  } catch (err) {
    console.log('YouTube error:', err.response?.data || err.message)
    res.status(500).json({ error: err.message })
  }
}

module.exports = { getVideos }