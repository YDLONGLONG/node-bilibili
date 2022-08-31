const express = require('express')
const router = express.Router()
const jsonRes = require('../utils/jsonRes')
const Notice = require('../db/moudle/noticeModel')
//新增
router.post('/add', async (req, res) => {
  let {title, content, url} = req.body
  if (title && content) {
    await Notice.insertMany({title, date: Date.now(), content, url})
    res.json(jsonRes(0, '成功'))
  } else {
    res.json(jsonRes(-1, '缺少标题和内容'))
  }
})
//获取通知
router.get('/get', async (req, res) => {
  let result = await Notice.find().sort('-date')
  res.json(jsonRes(0, '', result))
})
module.exports = router
