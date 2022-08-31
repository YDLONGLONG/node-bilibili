const express = require('express')
const fs = require('fs')
const router = express.Router()
const hmac = require('../utils/hmac')
const jsonRes = require('../utils/jsonRes')
const Admin = require('../db/moudle/admin')
const User = require('../db/moudle/userModel')
const Video = require('../db/moudle/videoModel')
const Message = require('../db/moudle/messageModel')
const Comment = require('../db/moudle/commentModel')
const Live = require('../db/moudle/liveModel')
const Notice = require('../db/moudle/noticeModel')
const Danmu = require('../db/moudle/danmuModel')
const Trend = require('../db/moudle/trendModel')
const Ban = require('../db/moudle/banModel')
const Chat = require('../db/moudle/chatModel');
//初始化添加默认管理员账号密码
(async function init () {
  let admins = await Admin.find()
  if (!admins.length) {
    let admin = new Admin({user: 'admin', pass: hmac('smile')})
    await admin.save()
  }
})()
router.post('/login', async (req, res) => {
  let {user, pass} = req.body
  let result = await Admin.findOne({user, pass: hmac(pass)})
  if (result) {
    req.session.login = true
    res.json(jsonRes(0, '登录成功'))
  } else {
    res.json(jsonRes(-1, '用户名或密码错误'))
  }
})
router.get('/logout', async (req, res) => {
  req.session.destroy()
  res.sendStatus(200)
})

//用户相关
async function findAllUsers () {
  return User.find({}, ['email', 'nick', 'sex', 'sign', 'fansCount'])
}

router.get('/users', async (req, res) => {
  let users = await findAllUsers()
  res.json(jsonRes(0, '', users))
})
router.post('/user', async (req, res) => {
  let user = req.body
  if (user._id) {
    let _id = user._id
    delete user._id
    await User.findByIdAndUpdate(_id, user)
  } else {
    user.password = hmac(user.password)
    await User.insertMany(user)
  }
  let result = await findAllUsers()
  res.json(jsonRes(0, '', result))
})
router.post('/user/delete', async (req, res) => {
  let {_id} = req.body
  await User.findByIdAndDelete(_id)
  let result = await findAllUsers()
  res.json(jsonRes(0, '', result))
})

//视频相关
async function findAllVideos () {
  let result = await Video.find({}).populate('author', ['email']).sort('-uploadAt')
  return result.map(item => {
    item = item.toObject()
    item.email = item.author.email
    delete item.author
    item.zanCount = item.zanList.length
    item.collectCount = item.collectList.length
    return item
  })
}

router.get('/videos', async (req, res) => {
  let videos = await findAllVideos()
  res.json(jsonRes(0, '', videos))
})
router.post('/video', async (req, res) => {
  let {_id, title, type, desc, uploadAt, playCount} = req.body
  await Video.findByIdAndUpdate(_id, {title, type, desc, uploadAt, playCount})
  let videos = await findAllVideos()
  res.json(jsonRes(0, '', videos))
})
router.post('/video/delete', async (req, res) => {
  let {_id} = req.body
  let video = await Video.findById(_id)
  //截取文件名
  let imgName = video.imgUrl.split('/').pop()
  let videoName = video.videoUrl.split('/').pop()
  //删除User里收藏的该视频
  await User.updateMany({_id: video.collectList}, {$pull: {collectList: _id}})
  //删除弹幕
  await Danmu.deleteOne({player: _id})
  //删除评论
  await Comment.deleteMany({video: _id})
  //删除该视频相关消息回复提醒
  let comments = await Comment.find({video: _id}, '_id')
  await Message.deleteMany({comment: comments})
  //删除视频
  await Video.deleteOne({_id})
  // 删除文件
  fs.unlinkSync(`./upload/${imgName}`)
  fs.unlinkSync(`./upload/${videoName}`)
  let videos = await findAllVideos()
  res.json(jsonRes(0, '', videos))
})

//直播相关
async function findAllLives () {
  let lives = await Live.find().populate('user', 'email')
  return lives.map(item => {
    item = item.toObject()
    item.email = item.user.email
    delete item.user
    return item
  })
}

router.get('/lives', async (req, res) => {
  let lives = await findAllLives()
  res.json(jsonRes(0, '', lives))
})
router.post('/live', async (req, res) => {
  let {_id, title, onLive} = req.body
  await Live.findByIdAndUpdate(_id, {title, onLive})
  let lives = await findAllLives()
  res.json(jsonRes(0, '', lives))
})
router.post('/live/delete', async (req, res) => {
  let {_id} = req.body
  let live = await Live.findByIdAndDelete({_id})
  let index = live.imgUrl.indexOf('default.jpg')
  if (index === -1) {
    let oldName = live.imgUrl.split('/').pop()
    fs.unlinkSync('upload/img/' + oldName)
  }
  let lives = await findAllLives()
  res.json(jsonRes(0, '', lives))
})
router.get('/notices', async (req, res) => {
  let notices = await Notice.find()
  res.json(jsonRes(0, '', notices))
})
router.post('/notice', async (req, res) => {
  let notice = req.body
  if (notice._id) {
    let _id = notice._id
    delete notice._id
    await Notice.findByIdAndUpdate(_id, notice)
  } else {
    await Notice.insertMany(notice)
  }
  let result = await Notice.find()
  res.json(jsonRes(0, '', result))
})
router.post('/notice/delete', async (req, res) => {
  let {_id} = req.body
  await Notice.findByIdAndDelete(_id)
  let result = await Notice.find()
  res.json(jsonRes(0, '', result))
})

router.post('/isAdoptbyId', async (req, res) => {
  let {_id} = req.body
  await Video.findByIdAndUpdate(_id,{isAdopt:true})
})

//动态相关
async function findAllTrends () {
  return Trend.find({})
}

router.get('/trends', async (req, res) => {
  let trends = await findAllTrends()
  res.json(jsonRes(0, '', trends))
})

router.post('/trend', async (req, res) => {
  let {_id, content, date} = req.body
  await Trend.findByIdAndUpdate(_id, {content,date})
  let trends = await findAllTrends()
  res.json(jsonRes(0, '', trends))
})

router.post('/trend/delete', async (req, res) => {
  let {_id} = req.body
  await Trend.findByIdAndDelete(_id)
  let result = await findAllTrends()
  res.json(jsonRes(0, '', result))
})

//举报相关
async function findAllBans () {
  return Ban.find({})
}

router.get('/bans', async (req, res) => {
  let bans = await findAllBans()
  res.json(jsonRes(0, '', bans))
})

router.get('/trendById', async (req, res) => {
  let {trendid} = req.query
  let result = await Trend.findById(trendid)
  res.json(jsonRes(0, '', result))
})

router.post('/ban/delete', async (req, res) => {
  let {_id, trendid} = req.body
  await Ban.findByIdAndDelete(_id)
  await Trend.findByIdAndDelete(trendid)

  let result1 = await Trend.findById(trendid)

  await Chat.insertMany({userid:"6130d996b11d1d8bc0838e91", friendid:result1.author, msg:"你的动态经审核不符合规范，请重新发表", type:1, time:Date.now()})

  let result = await findAllBans()
  res.json(jsonRes(0, '', result))
})

module.exports = router

