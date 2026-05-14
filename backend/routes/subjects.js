const express = require('express')
const router = express.Router()
const authMiddleware = require('../middleware/auth')
const { getSubjects, createSubject, getSubjectById, updateTopic, deleteSubject } = require('../controller/subjectController')

router.get('/', authMiddleware, getSubjects)
router.post('/', authMiddleware, createSubject)
router.get('/:id', authMiddleware, getSubjectById)
router.patch('/topic/:topicId', authMiddleware, updateTopic)
router.delete('/:id', authMiddleware, deleteSubject)

module.exports = router