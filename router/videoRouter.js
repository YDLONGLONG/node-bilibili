const express = require('express')
const fs = require('fs')
const router = express.Router()
const jsonRes = require('../utils/jsonRes')
const Video = require('../db/moudle/videoModel')
const Danmu = require('../db/moudle/danmuModel')
const Comment = require('../db/moudle/commentModel')
const Message = require('../db/moudle/messageModel')
const User = require('../db/moudle/userModel')
const Trend = require('../db/moudle/trendModel')
/*const http = require('http')
const iconv = require('iconv-lite')
const BufferHelper = require('bufferhelper')*/
//增加播放次数
router.get('/play', async (req, res) => {
  let _id = req.query._id
  let video = await Video.findOne({_id})
  let playCount = ++video.playCount
  await Video.updateOne({_id}, {playCount})
  res.json(jsonRes(0, '成功'))
})
router.get('/page', async (req, res) => {
  let {page, type} = req.query
  let videos, count
  if (!type) {
    videos = await Video.find({isAdopt:true}).populate('author', 'nick').limit(9).skip((page - 1) * 9)
    count = await Video.estimatedDocumentCount()
  } else {
    videos = await Video.find({type,isAdopt:true}).populate('author', 'nick').limit(9).skip((page - 1) * 9)
    count = await Video.countDocuments({type})
  }
  res.json(jsonRes(0, '查询成功', {videos, count}))
})
router.get('/hot', async (req, res) => {
  let data = await Video.find(null, ['title', 'imgUrl','isAdopt']).sort('-playCount').limit(4)
  res.json(jsonRes(0, '查询成功', data))
})
router.get('/byId', async (req, res) => {
  //根据IP获取用户的位置
  /*let url = require('url').parse('http://whois.pconline.com.cn/ipJson.jsp?ip=39.188.231.219&json=true')
  http.get(url, function (res) {
    let bufferHelper = new BufferHelper()
    res.on('data', function (chunk) {
      bufferHelper.concat(chunk)
    })
    res.on('end', function () {
      let resultJson = iconv.decode(bufferHelper.toBuffer(), 'GBK')
      let addr = JSON.parse(resultJson).addr
      console.log(addr)
    })
  })*/
  let _id = req.query._id
  let result = await Danmu.findOne({player: _id})
  let danmuCount = result ? result.danmuList.length : 0
  let count = await Video.estimatedDocumentCount()
  let video = await Video.findById(_id).populate('author', ['nick', 'headUrl', 'sign'])
  let skip = parseInt(Math.random() * (count - 3) + '')
  let otherVideos = await Video.find({isAdopt:true}).populate('author', 'nick').limit(4).skip(skip)
  res.json(jsonRes(0, '查询成功', {video: video, otherVideos, danmuCount}))
})
router.get('/top', async (req, res) => {
  let data = await Video.find().sort('-playCount').limit(20).populate('author', ['nick', 'headUrl', 'sign'])
  res.json(jsonRes(0, '', data))
})
router.post('/zan', async (req, res) => {
  let {_id, author} = req.body
  let video = await Video.findById(_id)
  let index = video.zanList.indexOf(author)
  if (index === -1) {
    video.zanList.push(author)
    res.json(jsonRes(0, '点赞成功', video.zanList))
  } else {
    video.zanList.splice(index, 1)
    res.json(jsonRes(0, '取消点赞', video.zanList))
  }
  await video.save()
})
//收藏
router.post('/collect', async (req, res) => {
  let {_id, author} = req.body
  let video = await Video.findById(_id)
  let user = await User.findById(author)
  let index = video.collectList.indexOf(author)
  let userIndex = user.collectList.indexOf(_id)
  if (index === -1) {
    video.collectList.push(author)
    user.collectList.push(_id)
    res.json(jsonRes(0, '收藏成功', video.collectList))
  } else {
    video.collectList.splice(index, 1)
    user.collectList.splice(userIndex, 1)
    res.json(jsonRes(0, '取消收藏', video.collectList))
  }
  await video.save()
  await user.save()
})
//搜索视频
router.get('/search', async (req, res) => {
  let {keyWord, page, sortBy} = req.query
  let reg = new RegExp(keyWord)
  let count = await Video.countDocuments({title: reg})
  let videos
  if (sortBy) {
    videos = await Video.find({title: reg}).sort('-' + sortBy).limit(8).skip((page - 1) * 8).populate('author', 'nick')
  } else {
    videos = await Video.find({title: reg}).limit(8).skip((page - 1) * 8).populate('author', 'nick')
  }
  res.json(jsonRes(0, '搜索成功', {videos, count}))
})
//搜索用户
router.get('/searchuser', async (req, res) => {
  let {keyWord} = req.query
  let reg = new RegExp(keyWord)
  let users = await User.find({nick: reg})
  res.json(jsonRes(0, '搜索成功', {users}))
})
//搜索动态
router.get('/searchtrend', async (req, res) => {
  let {keyWord} = req.query
  let reg = new RegExp(keyWord)
  let trends = await Trend.find({content: reg})
  res.json(jsonRes(0, '搜索成功', {trends}))
})
router.get('/userId', async (req, res) => {
  let {author, page, keyWord, sortBy} = req.query
  if (!author) return res.json(jsonRes(-1, '无用户id'))
  let reg = new RegExp(keyWord)
  let count = await Video.countDocuments({author, title: reg})
  let videos
  if (sortBy) {
    videos = await Video.find({author, title: reg,isAdopt:true}, ['title', 'imgUrl', 'playCount', 'uploadAt', 'collectList', 'zanList', 'isAdopt']).sort('-' + sortBy).limit(9).skip((page - 1) * 9)
  } else {
    videos = await Video.find({author, title: reg,isAdopt:true}, ['title', 'imgUrl', 'playCount', 'uploadAt', 'collectList', 'zanList', 'isAdopt']).sort('-uploadAt').limit(9).skip((page - 1) * 9)
  }
  res.json(jsonRes(0, '', {videos, count}))
})
router.post('/delete', async (req, res) => {
  let {_id} = req.body
  if (!_id) return res.json(jsonRes(-1, '无id'))
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
  res.json(jsonRes(0, '删除成功'))
})

//修改用户详情信息
router.post('/editInfo', async (req, res) => {
  let {_id, title, type, desc} = req.body
  if (!_id) return res.json(jsonRes(-1, '无id'))
  if (_id) {
    await Video.updateMany({_id}, {title, type, desc})
    res.json(jsonRes(0, '修改成功'))
  } else {
    res.json(jsonRes(-1, '缺少关键字段'))
  }
})

router.get('/random', async (req, res) => {
  let {page} = req.query
  let videos = await Video.find({isAdopt:true}).populate('author', 'nick').limit(8).skip((page - 1) * 8)
  res.json(jsonRes(0, '查询成功', videos))
})
module.exports = router
