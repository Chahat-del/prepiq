require('dotenv').config()
const axios = require('axios')
const { GoogleGenerativeAI } = require('@google/generative-ai')

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

async function testYouTube() {
  try {
    const query = `Algorithm Analysis and Asymptotic Notations (Big-O, Omega, Theta) DSA GATE lecture explanation`
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
    console.log('YouTube test success:', response.data.items.length, 'videos found')
  } catch (err) {
    console.log('YouTube error:', err.response?.data || err.message)
  }
}

async function testExplain() {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
    const prompt = `You are an expert teacher explaining "Algorithm Analysis and Asymptotic Notations (Big-O, Omega, Theta)" from DSA for GATE exam.

Provide a clear, concise explanation with:
1. Core concept definition
2. Key points to remember (3-5 points)
3. Common exam question patterns
4. A simple example if applicable

Keep it focused and exam-oriented. Use plain text with line breaks, no markdown headers.`
    const result = await model.generateContent(prompt)
    console.log('Explain test success! output length:', result.response.text().length)
  } catch (err) {
    console.log('Explain error:', err.message)
  }
}

testYouTube()
testExplain()
