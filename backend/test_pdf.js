require('dotenv').config()
const { GoogleGenerativeAI } = require('@google/generative-ai')

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

async function testPDF() {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
    const syllabusBase64 = 'JVBERi0xLjAKMSAwIG9iaiA8PC9UeXBlL0NhdGFsb2cvUGFnZXMgMiAwIFI+PiBlbmRvYmogMiAwIG9iaiA8PC9UeXBlL01hZ2VzL0NvdW50IDEvS2lkc1szIDAgUl0+PiBlbmRvYmogMyAwIG9iaiA8PC9UeXBlL1BhZ2UvUGFyZW50IDIgMCBSL01lZGlhQm94WzAgMCA2MTIgNzkyXT4+IGVuZG9iagp4cmVmCjAgNAowMDAwMDAwMDAwIDY1NTM1IGYKMDAwMDAwMDAwOSAwMDAwMCBuCjAwMDAwMDAwNTIgMDAwMDAgbgowMDAwMDAwMTAxIDAwMDAwIG4KdHJhaWxlcjw8L1NpemUgNC9Sb290IDEgMCBSPj4Kc3RhcnR4cmVmCjE2OQolJUVPRgo='
    
    const promptParts = [
      `You are an expert educator. Extract ALL specific, detailed topics from the attached syllabus document for "DSA". Do not be vague or skip topics; read the syllabus thoroughly and extract every single granular topic mentioned.

Return ONLY a valid JSON array like this:
[
  {"name": "Topic Name", "weightage": "High"}
]`,
      {
        inlineData: {
          data: syllabusBase64,
          mimeType: 'application/pdf'
        }
      }
    ]

    const result = await model.generateContent(promptParts)
    console.log('SUCCESS:', result.response.text())
  } catch (err) {
    console.log('ERROR:', err.message)
  }
}

testPDF()
