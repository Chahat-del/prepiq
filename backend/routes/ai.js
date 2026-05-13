const express = require('express')
const router = express.Router()
const { generateTopics, generateRoadmap, explainTopic } = require('../controller/aiController')

router.post('/topics', generateTopics)
router.post('/roadmap', generateRoadmap)
router.post('/explain', explainTopic)

module.exports = router