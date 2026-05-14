const express = require('express')
const router = express.Router()
const authMiddleware = require('../middleware/auth')
const {
  generateTopics,
  generateRoadmap,
  explainTopic,
  generateFamousPYQ,
  processUploadedPaper,
  getPapers,
  saveMockResult,
  getMockResults,
  generateSimilarPaper,
} = require('../controller/aiController')

router.post('/topics', generateTopics)
router.post('/roadmap', generateRoadmap)
router.post('/explain', explainTopic)
router.post('/pyq/famous', authMiddleware, generateFamousPYQ)
router.post('/pyq/upload', authMiddleware, processUploadedPaper)
router.post('/pyq/generate-similar', authMiddleware, generateSimilarPaper)
router.get('/pyq/:subjectId', authMiddleware, getPapers)
router.post('/mock/result', authMiddleware, saveMockResult)
router.get('/mock/results/:subjectId', authMiddleware, getMockResults)

module.exports = router