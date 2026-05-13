const express = require('express')
const router = express.Router()
const { getVideos } = require('../controller/youtubeController')

router.post('/videos', getVideos)

module.exports = router