const express = require('express')
const router = express.Router()
const jsonRes = require('../utils/jsonRes')
const Danmu = require('../db/moudle/danmuModel')
router.get('/', async (req, res) => {
  let player = req.query
  let danmu = await Danmu.findOne(player)
  if (!danmu) {
    return res.json(jsonRes(-1, '没有弹幕'))
  }
  let danmuList = danmu.danmuList
  //封装弹幕数据
  let data = danmuList.map(item => [item.time, item.type, item.color, item.author, item.text])
  res.json(jsonRes(0, '', data))
})
router.post('/', async (req, res) => {
  if (!req.session.login) return res.json(jsonRes(-1, '请先登录'))
  let body = req.body
  let danmu = await Danmu.findOne({player: body.player})
  if (body.type === 'right') body.type = 0
  if (body.type === 'top') body.type = 1
  if (body.type === 'bottom') body.type = 2
  if (!danmu) {
    danmu = new Danmu({player: body.player})
  }
  delete body.player
  danmu.danmuList.push(body)
  await danmu.save()
  res.json(jsonRes(0, '发送成功'))
})
module.exports = router
