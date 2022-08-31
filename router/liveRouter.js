const fs = require('fs')
const express = require('express')
const router = express.Router()
const jsonRes = require('../utils/jsonRes')
const Live = require('../db/moudle/liveModel')
const User = require('../db/moudle/userModel')
//查询是否已开启
router.get('/getLive', async (req, res) => {
  let {user} = req.query
  if (!user) return res.json(jsonRes(-1, '无ID'))
  let result = await Live.findOne({user})
  res.json(jsonRes(0, '', result))
})
router.get('/_id', async (req, res) => {
  let {_id} = req.query
  if (!_id) return res.json(jsonRes(-1, '无ID'))
  let live = await Live.findById({_id}).populate('user', ['headUrl', 'nick'])
  res.json(jsonRes(0, '', live))
})
//查询正在直播
router.get('/onLive', async (req, res) => {
  let {page} = req.query
  let count = await Live.countDocuments({onLive: true})
  let lives = await Live.find({onLive: true}).populate('user', 'nick').limit().skip((page - 1) * 8)
  res.json(jsonRes(0, '', {lives, count}))
})
//添加
router.get('/add', async (req, res) => {
  let {user} = req.query
  if (!user) return res.json(jsonRes(-1, '无ID'))
  let result = await User.findById(user)
  let nick = result.nick
  try {
    let live = await Live.insertMany({user, publishUrl: `/live/${user}`, playUrl: `/live/${user}.flv`, nick, title: `${nick}的直播间`})
    res.json(jsonRes(0, '成功', live[0]))
  } catch (e) {
    res.json(jsonRes(-2, '已有直播间'))
  }
})
//删除
router.get('/delete', async (req, res) => {
  let {user} = req.query
  if (!user) return res.json(jsonRes(-1, '无ID'))
  let live = await Live.findOneAndDelete({user})
  let index = live.imgUrl.indexOf('default.jpg')
  if (index === -1) {
    let oldName = live.imgUrl.split('/').pop()
    fs.unlinkSync('upload/img/' + oldName)
  }
  res.json(jsonRes(0, '', null))
})
//修改
router.post('/update', async (req, res) => {
  let {_id, imgUrl, title} = req.body
  if (!_id) return res.json(jsonRes(-1, '无ID'))
  if (imgUrl) {
    let imgName = imgUrl.split('/').pop()
    //从临时文件移到img
    const readable = fs.createReadStream('upload/temp/' + imgName);
    const writable = fs.createWriteStream('upload/img/' + imgName);
    readable.pipe(writable);
    fs.unlinkSync('upload/temp/' + imgName)
    let live = await Live.findById(_id)
    let index = live.imgUrl.indexOf('default.jpg')
    if (index === -1) {
      let oldName = live.imgUrl.split('/').pop()
      fs.unlinkSync('upload/img/' + oldName)
    }
    live.imgUrl = '/res/img/' + imgName
    live.title = title
    await live.save()
  } else {
    await Live.findByIdAndUpdate(_id, {title})
  }
  res.json(jsonRes(0, '成功'))
})
module.exports = router
