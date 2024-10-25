const express = require('express')
const { sendChatsToBackend, fetchChat } = require('../controllers/user.controller')
const router = express.Router()

router.post('/sendMessagesToBackend', sendChatsToBackend)
router.post('/fetchChat', fetchChat)

module.exports = router