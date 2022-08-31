const express = require('express')
const router = express.Router()
const jsonRes = require('../utils/jsonRes')
const Ban = require('../db/moudle/banModel')

// 新增举报
router.post('/addBan', async (req, res) => {
    let { trendid, radio, textarea, submitid} = req.body
    await Ban.insertMany({ trendid, radio, textarea, submitid})
    return res.json(jsonRes(0, '举报成功'))
})

module.exports = router