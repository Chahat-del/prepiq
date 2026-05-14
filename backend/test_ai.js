require('dotenv').config()
const { GoogleGenerativeAI } = require('@google/generative-ai')

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

async function test() {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' })
    const prompt = 'Explain Newton laws simply.'
    const result = await model.generateContent(prompt)
    console.log(result.response.text())
  } catch (err) {
    console.error('Error with gemini-2.0-flash-lite:', err.message)
  }
}
test()
